import secrets
import uuid
from datetime import datetime, timezone

from auth import require_auth, write_audit_log
from database import get_db
from quart import Blueprint, g, jsonify, request

security_bp = Blueprint('security_bp', __name__, url_prefix='/security')


def _utcnow_iso() -> str:
    return (
        datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]
        + 'Z'
    )


def _random_code(length: int = 12) -> str:
    alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def _random_totp_secret() -> str:
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    return ''.join(secrets.choice(alphabet) for _ in range(16))


async def _ensure_recovery_codes(db, user_id: str) -> list[dict]:
    async with db.execute(
        """
        SELECT code, used
        FROM user_recovery_codes
        WHERE user_id = ?
        ORDER BY created_at ASC
        """,
        (user_id,),
    ) as cursor:
        rows = await cursor.fetchall()

    if len(rows) == 6:
        return [{'code': row['code'], 'used': bool(row['used'])} for row in rows]

    await db.execute('DELETE FROM user_recovery_codes WHERE user_id = ?', (user_id,))
    now = _utcnow_iso()
    codes = []
    for _ in range(6):
        code = _random_code()
        codes.append({'code': code, 'used': False})
        await db.execute(
            """
            INSERT INTO user_recovery_codes (id, user_id, code, used, created_at)
            VALUES (?, ?, ?, 0, ?)
            """,
            (str(uuid.uuid4()), user_id, code, now),
        )
    return codes


async def _regenerate_recovery_codes(db, user_id: str) -> list[dict]:
    await db.execute('DELETE FROM user_recovery_codes WHERE user_id = ?', (user_id,))
    return await _ensure_recovery_codes(db, user_id)


@security_bp.route('/recovery-codes', methods=['GET'])
@require_auth
async def get_recovery_codes():
    async with get_db() as db:
        codes = await _ensure_recovery_codes(db, g.current_user['id'])
        await db.commit()
    return jsonify({'codes': codes}), 200


@security_bp.route('/recovery-codes/regenerate', methods=['POST'])
@require_auth
async def regenerate_recovery_codes():
    async with get_db() as db:
        codes = await _regenerate_recovery_codes(db, g.current_user['id'])
        await db.commit()
    await write_audit_log('REGENERATE_RECOVERY_CODES', g.current_user, g.current_user['id'])
    return jsonify({'codes': codes}), 200


@security_bp.route('/recovery-codes/consume', methods=['POST'])
async def consume_recovery_code():
    data = await request.get_json(silent=True) or {}
    identifier = (data.get('email') or data.get('identifier') or data.get('user_id') or '').strip()
    code = (data.get('code') or '').strip().upper()

    if not identifier or not code:
        return jsonify({'error': 'identifier and code are required'}), 400

    async with get_db() as db:
        async with db.execute(
            """
            SELECT id FROM users
            WHERE id = ? OR LOWER(email) = LOWER(?) OR LOWER(alias) = LOWER(?)
            """,
            (identifier, identifier, identifier),
        ) as cursor:
            user_row = await cursor.fetchone()

        if user_row is None:
            return jsonify({'success': False}), 404

        async with db.execute(
            """
            SELECT id FROM user_recovery_codes
            WHERE user_id = ? AND code = ? AND used = 0
            """,
            (user_row['id'], code),
        ) as cursor:
            code_row = await cursor.fetchone()

        if code_row is None:
            return jsonify({'success': False}), 400

        await db.execute(
            """
            UPDATE user_recovery_codes
            SET used = 1, used_at = ?
            WHERE id = ?
            """,
            (_utcnow_iso(), code_row['id']),
        )
        await db.commit()

    return jsonify({'success': True}), 200


@security_bp.route('/totp-secret', methods=['GET'])
@require_auth
async def get_totp_secret():
    user_id = g.current_user['id']
    now = _utcnow_iso()
    async with get_db() as db:
        async with db.execute(
            'SELECT secret FROM user_totp_secrets WHERE user_id = ?', (user_id,)
        ) as cursor:
            row = await cursor.fetchone()

        if row is None:
            secret = _random_totp_secret()
            await db.execute(
                """
                INSERT INTO user_totp_secrets (user_id, secret, created_at, updated_at)
                VALUES (?, ?, ?, ?)
                """,
                (user_id, secret, now, now),
            )
            await db.commit()
        else:
            secret = row['secret']

    return jsonify({'secret': secret}), 200


@security_bp.route('/totp-secret/regenerate', methods=['POST'])
@require_auth
async def regenerate_totp_secret():
    user_id = g.current_user['id']
    now = _utcnow_iso()
    secret = _random_totp_secret()
    async with get_db() as db:
        await db.execute(
            """
            INSERT INTO user_totp_secrets (user_id, secret, created_at, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                secret = excluded.secret,
                updated_at = excluded.updated_at
            """,
            (user_id, secret, now, now),
        )
        await db.commit()

    await write_audit_log('REGENERATE_TOTP_SECRET', g.current_user, user_id)
    return jsonify({'secret': secret}), 200
