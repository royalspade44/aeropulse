import uuid
from datetime import datetime, timezone

from auth import require_auth, require_role
from models import AuditLog

from database import get_db
from quart import Blueprint, g, jsonify, request

audit_bp = Blueprint('audit_bp', __name__, url_prefix='/audit-logs')


def _utcnow_iso() -> str:
    """
    Return the current UTC timestamp as a millisecond-precision ISO 8601 string (e.g. '2025-01-01T12:00:00.000Z').
    Used within this module wherever a consistent, database-ready timestamp is required.
    """
    return (
        datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]
        + 'Z'
    )


# ---------------------------------------------------------------------------
# GET /audit-logs  — super_admin only
# ---------------------------------------------------------------------------


@audit_bp.route('', methods=['GET'])
@require_auth
@require_role('super_admin')
async def list_audit_logs():
    """
    GET /audit-logs — return all audit log entries ordered by timestamp descending.
    Restricted to super_admin; used by the admin dashboard in the mobile app to review the full activity history of the system.
    """
    try:
        async with get_db() as db:
            async with db.execute(
                'SELECT * FROM audit_logs ORDER BY timestamp DESC'
            ) as cursor:
                rows = await cursor.fetchall()

        logs = [AuditLog.from_row(r).to_dict() for r in rows]
        return jsonify({'audit_logs': logs}), 200

    except Exception as exc:
        return jsonify({
            'error': f'Failed to fetch audit logs: {str(exc)}'
        }), 500


# ---------------------------------------------------------------------------
# POST /audit-logs  — any authenticated user can write a log entry
# ---------------------------------------------------------------------------


@audit_bp.route('', methods=['POST'])
@require_auth
async def create_audit_log():
    """
    POST /audit-logs — allow any authenticated user to write a custom audit log entry.
    Requires at minimum an `action` field; optionally accepts `target_id` and `details`. Used by the mobile app to log client-side events.
    """
    try:
        data = await request.get_json(silent=True) or {}
        action = (data.get('action') or '').strip()
        target_id = data.get('target_id')
        details = (data.get('details') or '').strip()

        if not action:
            return jsonify({'error': 'action is required'}), 400

        caller = g.current_user
        log_id = str(uuid.uuid4())
        now = _utcnow_iso()
        actor_name = f'{caller.get("name_first", "")} {caller.get("name_last", "")}'.strip()

        async with get_db() as db:
            await db.execute(
                """
                INSERT INTO audit_logs
                    (id, timestamp, actor_id, actor_name, actor_email,
                     action, target_id, details)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    log_id,
                    now,
                    caller['id'],
                    actor_name,
                    caller.get('email'),
                    action,
                    target_id,
                    details,
                ),
            )
            await db.commit()

        return jsonify({'id': log_id}), 201

    except Exception as exc:
        return jsonify({
            'error': f'Failed to create audit log: {str(exc)}'
        }), 500
