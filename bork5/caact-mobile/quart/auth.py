import functools
import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from config import Config

from database import get_db
from quart import g, jsonify, request

# ---------------------------------------------------------------------------
# Password helpers
# ---------------------------------------------------------------------------


def hash_password(password: str) -> tuple[str, str]:
    """
    Hash a plaintext password with PBKDF2-HMAC-SHA256 using a freshly generated random salt.
    Returns a (hash_hex, salt) tuple stored in the `users` table; called during registration and password reset.
    """
    salt = secrets.token_hex(16)
    hash_bytes = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100_000,
    )
    return hash_bytes.hex(), salt


def verify_password(password: str, hash_hex: str, salt: str) -> bool:
    """
    Re-derive the PBKDF2 hash for the supplied plaintext and compare it to the stored hash in constant time.
    Returns True if the credentials match; called during login to authenticate the user.
    """
    candidate = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100_000,
    )
    return candidate.hex() == hash_hex


# ---------------------------------------------------------------------------
# Session management
# ---------------------------------------------------------------------------


def _utcnow_iso() -> str:
    """
    Return the current UTC timestamp as a millisecond-precision ISO 8601 string (e.g. '2025-01-01T12:00:00.000Z').
    Used throughout auth.py wherever a consistent, database-ready timestamp is needed.
    """
    return (
        datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]
        + 'Z'
    )


async def create_session(user_id: str) -> str:
    """
    Generate a cryptographically random 64-character bearer token, persist it in the `sessions` table with a 24-hour expiry, and return it.
    Called after successful login or registration in routes/auth.py to issue a token that the mobile app sends with every subsequent request.
    """
    token = secrets.token_hex(32)
    now = datetime.now(timezone.utc)
    created_at = now.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
    expires_at = (now + timedelta(hours=Config.SESSION_HOURS)).strftime(
        '%Y-%m-%dT%H:%M:%S.%f'
    )[:-3] + 'Z'

    async with get_db() as db:
        await db.execute(
            'INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
            (token, user_id, created_at, expires_at),
        )
        await db.commit()

    return token


async def get_session_user(token: str) -> dict | None:
    """
    Validate the token and return the associated user row as a dict.
    Returns None if the token is missing, expired, or the user no longer exists.
    """
    now_iso = _utcnow_iso()

    async with get_db() as db:
        async with db.execute(
            'SELECT * FROM sessions WHERE token = ? AND expires_at > ?',
            (token, now_iso),
        ) as cursor:
            session_row = await cursor.fetchone()

        if session_row is None:
            return None

        async with db.execute(
            "SELECT * FROM users WHERE id = ? AND status = 'active'",
            (session_row['user_id'],),
        ) as cursor:
            user_row = await cursor.fetchone()

        if user_row is None:
            return None

        return dict(user_row)


async def delete_session(token: str) -> None:
    """
    Delete the specified session row from the `sessions` table, effectively invalidating the bearer token.
    Called by the logout route in routes/auth.py to end the authenticated session.
    """
    async with get_db() as db:
        await db.execute('DELETE FROM sessions WHERE token = ?', (token,))
        await db.commit()


# ---------------------------------------------------------------------------
# Auth decorators
# ---------------------------------------------------------------------------


def require_auth(f):
    """
    Decorator that validates the Bearer token from the Authorization header.
    Populates g.current_user (dict) and g.token on success.
    Short-circuits OPTIONS preflight requests without checking auth.
    """

    @functools.wraps(f)
    async def decorated(*args, **kwargs):
        # Allow CORS preflight through without auth
        if request.method == 'OPTIONS':
            return await f(*args, **kwargs)

        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({
                'error': 'Missing or invalid Authorization header'
            }), 401

        token = auth_header[len('Bearer ') :]
        user = await get_session_user(token)
        if user is None:
            return jsonify({'error': 'Invalid or expired token'}), 401

        g.current_user = user
        g.token = token
        return await f(*args, **kwargs)

    return decorated


def require_role(*roles):
    """
    Decorator that enforces role-based access.
    Must be applied *after* (i.e. closer to the function than) @require_auth.
    """

    def decorator(f):
        @functools.wraps(f)
        async def decorated(*args, **kwargs):
            # OPTIONS bypass
            if request.method == 'OPTIONS':
                return await f(*args, **kwargs)

            current_role = str(g.current_user.get('role', '')).replace('-', '_')
            normalized_roles = {str(role).replace('-', '_') for role in roles}
            if current_role not in normalized_roles:
                return jsonify({
                    'error': 'Forbidden: insufficient role'
                }), 403
            return await f(*args, **kwargs)

        return decorated

    return decorator


# ---------------------------------------------------------------------------
# Audit log helper
# ---------------------------------------------------------------------------


async def write_audit_log(
    action: str,
    actor: dict | None = None,
    target_id: str | None = None,
    details: str = '',
) -> str:
    """
    Insert a structured audit log entry into the `audit_logs` table and return the new entry's UUID.
    Called after every significant user action (login, register, CRUD operations) across all route blueprints.
    """
    log_id = str(uuid.uuid4())
    now = _utcnow_iso()

    actor_id = actor['id'] if actor else None
    actor_name = (
        f'{actor.get("name_first", "")} {actor.get("name_last", "")}'.strip()
        if actor
        else ''
    )
    actor_email = actor.get('email') if actor else None

    async with get_db() as db:
        await db.execute(
            """
            INSERT INTO audit_logs
                (id, timestamp, actor_id, actor_name, actor_email, action, target_id, details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                log_id,
                now,
                actor_id,
                actor_name,
                actor_email,
                action,
                target_id,
                details,
            ),
        )
        await db.commit()

    return log_id


# ---------------------------------------------------------------------------
# Lockout helpers
# ---------------------------------------------------------------------------


async def check_lockout(email: str) -> dict:
    """
    Query the `login_attempts` table to determine whether the given email address is currently locked out.
    Returns a dict with keys `locked` (bool) and `seconds_left` (int); called at the start of the login route before any credential check.
    """
    now_iso = _utcnow_iso()

    async with get_db() as db:
        async with db.execute(
            'SELECT attempts, locked_until FROM login_attempts WHERE email = ?',
            (email.lower(),),
        ) as cursor:
            row = await cursor.fetchone()

    if row is None or row['locked_until'] is None:
        return {'locked': False, 'seconds_left': 0}

    locked_until = row['locked_until']
    if locked_until > now_iso:
        # Still locked — compute seconds left
        try:
            lu_dt = datetime.fromisoformat(
                locked_until.replace('Z', '+00:00')
            )
            now_dt = datetime.now(timezone.utc)
            seconds_left = max(0, int((lu_dt - now_dt).total_seconds()))
        except Exception:
            seconds_left = 60
        return {'locked': True, 'seconds_left': seconds_left}

    return {'locked': False, 'seconds_left': 0}


async def record_failed_attempt(email: str) -> dict:
    """
    Increment the failed attempt counter for an email.
    Locks the account for 60 s once attempts reach 3.
    Returns {"locked": bool, "attempts": int, "seconds_left": int}.
    """
    email_lower = email.lower()
    now = datetime.now(timezone.utc)

    async with get_db() as db:
        async with db.execute(
            'SELECT attempts, locked_until FROM login_attempts WHERE email = ?',
            (email_lower,),
        ) as cursor:
            row = await cursor.fetchone()

        if row is None:
            new_attempts = 1
            locked_until = None
        else:
            new_attempts = (row['attempts'] or 0) + 1
            locked_until = row['locked_until']

        seconds_left = 0
        locked = False

        if new_attempts >= 3:
            locked = True
            lock_dt = now + timedelta(seconds=60)
            locked_until = (
                lock_dt.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
            )
            seconds_left = 60

        await db.execute(
            """
            INSERT INTO login_attempts (email, attempts, locked_until)
            VALUES (?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET attempts = excluded.attempts,
                                             locked_until = excluded.locked_until
            """,
            (email_lower, new_attempts, locked_until),
        )
        await db.commit()

    return {
        'locked': locked,
        'attempts': new_attempts,
        'seconds_left': seconds_left,
    }


async def clear_attempts(email: str) -> None:
    """Reset failed login attempts for an email after a successful login."""
    async with get_db() as db:
        await db.execute(
            'DELETE FROM login_attempts WHERE email = ?',
            (email.lower(),),
        )
        await db.commit()
