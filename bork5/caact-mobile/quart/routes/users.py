import uuid
from datetime import datetime, timezone

from auth import hash_password, require_auth, require_role, write_audit_log
from models import User

from database import get_db
from quart import Blueprint, g, jsonify, request

users_bp = Blueprint('users_bp', __name__, url_prefix='/users')


def _utcnow_iso() -> str:
    """
    Return the current UTC timestamp as a millisecond-precision ISO 8601 string (e.g. '2025-01-01T12:00:00.000Z').
    Used within this module wherever a consistent, database-ready timestamp is required.
    """
    return (
        datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]
        + 'Z'
    )


# Allowed fields for general update (non-role/status)
_UPDATABLE_FIELDS = {
    'name_first',
    'name_last',
    'suffix',
    'alias',
    'phone',
    'address',
    'municipality',
    'municipality_code',
    'submunicipality',
    'submunicipality_code',
    'thoroughfare',
    'property_block_lot',
    'apartment_unit',
    'landmark',
    'plus_code',
    'contact_method',
    'messenger_handle',
    'latitude',
    'longitude',
    'delivery_instructions',
    'customer_onboarded_at',
    'technician_onboarded_at',
}


# ---------------------------------------------------------------------------
# GET /users  — list all users (admin / super_admin)
# ---------------------------------------------------------------------------


@users_bp.route('', methods=['GET'])
@require_auth
@require_role('admin', 'super_admin')
async def list_users():
    """
    GET /users — return all user accounts ordered by creation date, newest first.
    Restricted to admin and super_admin roles; used by the management dashboard in the mobile app to display the full user list.
    """
    try:
        async with get_db() as db:
            async with db.execute(
                """
                SELECT id, name_first, name_last, suffix, alias, email, phone,
                       role, status, profile_photo,
                       address, municipality, municipality_code,
                       submunicipality, submunicipality_code, thoroughfare,
                       property_block_lot, apartment_unit,
                       landmark, plus_code, contact_method,
                       messenger_handle,
                       latitude, longitude, delivery_instructions,
                       customer_onboarded_at, technician_onboarded_at,
                       created_at, updated_at
                FROM users
                ORDER BY created_at DESC
                """
            ) as cursor:
                rows = await cursor.fetchall()

        users = [User.from_row(r).to_dict() for r in rows]
        return jsonify({'users': users}), 200

    except Exception as exc:
        return jsonify({'error': f'Failed to fetch users: {str(exc)}'}), 500


# ---------------------------------------------------------------------------
# POST /users  — create user (admin / super_admin)
# ---------------------------------------------------------------------------


@users_bp.route('', methods=['POST'])
@require_auth
@require_role('admin', 'super_admin')
async def create_user():
    """
    POST /users — create a new user account with the specified role, validated against the caller's own permissions.
    Admins may create customers and technicians; super_admins may create any role. Writes a CREATE_USER audit log entry.
    Called by the admin panel in the mobile app when adding a new staff member or customer.
    """
    try:
        data = await request.get_json(silent=True) or {}
        name_first = (data.get('name_first') or '').strip()
        name_last = (data.get('name_last') or '').strip()
        suffix = (data.get('suffix') or '').strip()
        alias = (data.get('alias') or '').strip()
        email = (data.get('email') or '').strip()
        phone = (data.get('phone') or '').strip()
        password = data.get('password') or ''
        role = (data.get('role') or 'customer').strip().replace('-', '_')

        if not name_first or not alias or not email or not password:
            return jsonify({
                'error': 'name_first, alias, email, and password are required'
            }), 400

        caller_role = str(g.current_user['role']).replace('-', '_')
        allowed_roles_by_caller = {
            'admin': {'customer', 'technician'},
            'super_admin': {
                'customer',
                'technician',
                'admin',
                'super_admin',
            },
        }
        if role not in allowed_roles_by_caller.get(caller_role, set()):
            return jsonify({
                'error': f"You are not allowed to create a '{role}' account"
            }), 403

        now = _utcnow_iso()
        user_id = str(uuid.uuid4())
        hash_hex, salt = hash_password(password)

        async with get_db() as db:
            async with db.execute(
                'SELECT id FROM users WHERE LOWER(email) = LOWER(?)',
                (email,),
            ) as cursor:
                existing = await cursor.fetchone()

            if existing:
                return jsonify({'error': 'Email already registered'}), 409

            async with db.execute(
                'SELECT id FROM users WHERE LOWER(alias) = LOWER(?)',
                (alias,),
            ) as cursor:
                existing_alias = await cursor.fetchone()

            if existing_alias:
                return jsonify({'error': 'Alias already registered'}), 409

            await db.execute(
                """
                INSERT INTO users
                    (id, name_first, name_last, suffix, alias, email, phone,
                     password_hash, salt, role, status,
                     address, landmark, plus_code, contact_method,
                     messenger_handle, delivery_instructions,
                     created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active',
                        '', '', '', '', '', ?, ?)
                """,
                (
                    user_id,
                    name_first,
                    name_last,
                    suffix,
                    alias,
                    email,
                    phone,
                    hash_hex,
                    salt,
                    role,
                    now,
                    now,
                ),
            )
            await db.commit()

            async with db.execute(
                'SELECT * FROM users WHERE id = ?', (user_id,)
            ) as cursor:
                row = await cursor.fetchone()

        user_obj = User.from_row(row)
        await write_audit_log(
            action='CREATE_USER',
            actor=g.current_user,
            target_id=user_id,
            details=f'Created user {email} with role {role}',
        )

        return jsonify({'user': user_obj.to_dict()}), 201

    except Exception as exc:
        return jsonify({'error': f'Failed to create user: {str(exc)}'}), 500


# ---------------------------------------------------------------------------
# PATCH /users/<user_id>  — update user fields
# ---------------------------------------------------------------------------


@users_bp.route('/<user_id>', methods=['PATCH'])
@require_auth
@require_role('admin', 'super_admin')
async def update_user(user_id: str):
    """
    PATCH /users/<user_id> — update one or more allowed fields on an existing user account.
    Role changes are restricted to super_admin and cannot target the caller's own account; writes an UPDATE_USER audit log entry.
    Called by the admin panel in the mobile app when editing a user's details or role.
    """
    try:
        caller = g.current_user
        caller_role = str(caller['role']).replace('-', '_')
        data = await request.get_json(silent=True) or {}

        async with get_db() as db:
            async with db.execute(
                'SELECT * FROM users WHERE id = ?', (user_id,)
            ) as cursor:
                row = await cursor.fetchone()

            if row is None:
                return jsonify({'error': 'User not found'}), 404

            target = dict(row)

            # Build SET clause from allowed fields
            updates: dict = {}
            for field in _UPDATABLE_FIELDS:
                if field in data:
                    updates[field] = data[field]

            # Role change: super_admin only, cannot change own role
            if 'role' in data:
                if caller_role != 'super_admin':
                    return jsonify({
                        'error': 'Only super_admin can change roles'
                    }), 403
                if user_id == caller['id']:
                    return jsonify({
                        'error': 'Cannot change your own role'
                    }), 403
                updates['role'] = data['role']

            if not updates:
                return jsonify({'error': 'No valid fields to update'}), 400

            now = _utcnow_iso()
            updates['updated_at'] = now

            set_clause = ', '.join(f'{k} = ?' for k in updates)
            values = list(updates.values()) + [user_id]

            await db.execute(
                f'UPDATE users SET {set_clause} WHERE id = ?',
                values,
            )
            await db.commit()

            async with db.execute(
                'SELECT * FROM users WHERE id = ?', (user_id,)
            ) as cursor:
                updated_row = await cursor.fetchone()

        user_obj = User.from_row(updated_row)
        await write_audit_log(
            action='UPDATE_USER',
            actor=caller,
            target_id=user_id,
            details=f'Updated fields: {list(updates.keys())}',
        )

        return jsonify({'user': user_obj.to_dict()}), 200

    except Exception as exc:
        return jsonify({'error': f'Failed to update user: {str(exc)}'}), 500


# ---------------------------------------------------------------------------
# PATCH /users/<user_id>/status  — toggle active/disabled (super_admin only)
# ---------------------------------------------------------------------------


@users_bp.route('/<user_id>/status', methods=['PATCH'])
@require_auth
@require_role('super_admin')
async def toggle_user_status(user_id: str):
    """
    PATCH /users/<user_id>/status — set a user's status to 'active' or 'disabled'.
    Restricted to super_admin; cannot target the caller's own account or another super_admin. Writes a TOGGLE_USER_STATUS audit log entry.
    Called by the admin panel to enable or disable access for a specific user.
    """
    try:
        caller = g.current_user
        data = await request.get_json(silent=True) or {}
        new_status = data.get('status', '')

        if new_status not in ('active', 'disabled'):
            return jsonify({
                'error': "status must be 'active' or 'disabled'"
            }), 400

        if user_id == caller['id']:
            return jsonify({
                'error': 'Cannot change your own account status'
            }), 403

        async with get_db() as db:
            async with db.execute(
                'SELECT * FROM users WHERE id = ?', (user_id,)
            ) as cursor:
                row = await cursor.fetchone()

            if row is None:
                return jsonify({'error': 'User not found'}), 404

            target = dict(row)

            if target['role'] == 'super_admin':
                return jsonify({
                    'error': 'Cannot disable another super_admin account'
                }), 403

            now = _utcnow_iso()
            await db.execute(
                'UPDATE users SET status = ?, updated_at = ? WHERE id = ?',
                (new_status, now, user_id),
            )
            await db.commit()

            async with db.execute(
                'SELECT * FROM users WHERE id = ?', (user_id,)
            ) as cursor:
                updated_row = await cursor.fetchone()

        user_obj = User.from_row(updated_row)
        await write_audit_log(
            action='TOGGLE_USER_STATUS',
            actor=caller,
            target_id=user_id,
            details=f'Status changed to {new_status}',
        )

        return jsonify({'user': user_obj.to_dict()}), 200

    except Exception as exc:
        return jsonify({
            'error': f'Failed to update status: {str(exc)}'
        }), 500


# ---------------------------------------------------------------------------
# DELETE /users/<user_id>  — delete user (super_admin only)
# ---------------------------------------------------------------------------


@users_bp.route('/<user_id>', methods=['DELETE'])
@require_auth
@require_role('super_admin')
async def delete_user(user_id: str):
    """
    DELETE /users/<user_id> — permanently remove a user account and cascade-delete their sessions.
    Restricted to super_admin; cannot delete the caller's own account or another super_admin. Writes a DELETE_USER audit log entry.
    Called by the admin panel when a user account must be fully removed from the system.
    """
    try:
        caller = g.current_user

        if user_id == caller['id']:
            return jsonify({'error': 'Cannot delete your own account'}), 403

        async with get_db() as db:
            async with db.execute(
                'SELECT * FROM users WHERE id = ?', (user_id,)
            ) as cursor:
                row = await cursor.fetchone()

            if row is None:
                return jsonify({'error': 'User not found'}), 404

            target = dict(row)

            if target['role'] == 'super_admin':
                return jsonify({
                    'error': 'Cannot delete a super_admin account'
                }), 403

            await db.execute('DELETE FROM users WHERE id = ?', (user_id,))
            await db.commit()

        await write_audit_log(
            action='DELETE_USER',
            actor=caller,
            target_id=user_id,
            details=f'Deleted user {target["email"]} (role: {target["role"]})',
        )

        return jsonify({'message': 'User deleted'}), 200

    except Exception as exc:
        return jsonify({'error': f'Failed to delete user: {str(exc)}'}), 500
