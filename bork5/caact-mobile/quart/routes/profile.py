from datetime import datetime, timezone

from auth import hash_password, require_auth, write_audit_log
from models import User

from database import get_db
from quart import Blueprint, g, jsonify, request

profile_bp = Blueprint('profile_bp', __name__, url_prefix='/profile')


def _utcnow_iso() -> str:
    """
    Return the current UTC timestamp as a millisecond-precision ISO 8601 string (e.g. '2025-01-01T12:00:00.000Z').
    Used within this module wherever a consistent, database-ready timestamp is required.
    """
    return (
        datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]
        + 'Z'
    )


# Fields the user may update on their own profile
_PROFILE_UPDATABLE = {
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
    'profile_photo',
    'customer_onboarded_at',
    'technician_onboarded_at',
}


# ---------------------------------------------------------------------------
# GET /profile
# ---------------------------------------------------------------------------


@profile_bp.route('', methods=['GET'])
@require_auth
async def get_profile():
    """
    GET /profile — return the authenticated user's own profile, excluding password_hash and salt.
    Reads directly from g.current_user set by @require_auth; called by the mobile app's profile screen on load.
    """
    user = {
        k: v
        for k, v in g.current_user.items()
        if k not in ('password_hash', 'salt')
    }
    return jsonify({'user': user}), 200


# ---------------------------------------------------------------------------
# PATCH /profile
# ---------------------------------------------------------------------------


@profile_bp.route('', methods=['PATCH'])
@require_auth
async def update_profile():
    """
    PATCH /profile — allow the authenticated user to update their own editable profile fields.
    Accepts any subset of _PROFILE_UPDATABLE fields (name, phone, address, location, photo, etc.) and writes an UPDATE_PROFILE audit log entry.
    Called by the mobile app's edit-profile screen when the user saves changes.
    """
    try:
        data = await request.get_json(silent=True) or {}
        caller = g.current_user

        updates: dict = {}
        for field in _PROFILE_UPDATABLE:
            if field in data:
                updates[field] = data[field]

        if data.get('password'):
            hash_hex, salt = hash_password(data['password'])
            updates['password_hash'] = hash_hex
            updates['salt'] = salt

        if not updates:
            return jsonify({'error': 'No valid fields to update'}), 400

        now = _utcnow_iso()
        updates['updated_at'] = now

        set_clause = ', '.join(f'{k} = ?' for k in updates)
        values = list(updates.values()) + [caller['id']]

        async with get_db() as db:
            await db.execute(
                f'UPDATE users SET {set_clause} WHERE id = ?',
                values,
            )
            await db.commit()

            async with db.execute(
                'SELECT * FROM users WHERE id = ?', (caller['id'],)
            ) as cursor:
                row = await cursor.fetchone()

        user_obj = User.from_row(row)
        await write_audit_log(
            action='UPDATE_PROFILE',
            actor=caller,
            target_id=caller['id'],
            details=f'Updated profile fields: {list(updates.keys())}',
        )

        return jsonify({'user': user_obj.to_dict()}), 200

    except Exception as exc:
        return jsonify({
            'error': f'Failed to update profile: {str(exc)}'
        }), 500
