import json
import uuid
from datetime import datetime, timezone

from auth import require_auth, write_audit_log
from database import get_db
from quart import Blueprint, g, jsonify, request

tasks_bp = Blueprint('tasks_bp', __name__, url_prefix='/tasks')


def _utcnow_iso() -> str:
    return (
        datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]
        + 'Z'
    )


def _normalize_task(payload: dict) -> dict:
    now = _utcnow_iso()
    created_at = payload.get('createdAt') or payload.get('created_at') or now
    labor_cost = float(payload.get('laborCost') or 0)
    parts_cost = float(payload.get('partsCost') or 0)
    additional_cost = float(payload.get('additionalCost') or 0)
    total_service_cost = payload.get('totalServiceCost')

    task = {
        **payload,
        'id': payload.get('id') or str(uuid.uuid4()),
        'requestId': payload.get('requestId') or payload.get('request_id') or '',
        'title': payload.get('title') or payload.get('issueType') or 'Service Task',
        'description': payload.get('description') or payload.get('concern') or payload.get('issueDescription') or '',
        'customerId': payload.get('customerId') or payload.get('customer_id') or payload.get('userId') or '',
        'customerName': payload.get('customerName') or '',
        'customerEmail': payload.get('customerEmail') or '',
        'customerPhone': payload.get('customerPhone') or '',
        'unitId': payload.get('unitId') or payload.get('unit_id') or None,
        'unitName': payload.get('unitName') or payload.get('unitType') or '',
        'unitType': payload.get('unitType') or payload.get('unitName') or '',
        'address': payload.get('address') or '',
        'plusCode': payload.get('plusCode') or '',
        'assignedTechnicianId': payload.get('assignedTechnicianId') or payload.get('assigned_technician_id') or '',
        'assignedTechnicianName': payload.get('assignedTechnicianName') or '',
        'priority': payload.get('priority') or 'Normal',
        'scheduledDate': payload.get('scheduledDate') or payload.get('preferredDate') or payload.get('preferredSchedule') or '',
        'status': payload.get('status') or 'Pending',
        'laborCost': labor_cost,
        'partsCost': parts_cost,
        'additionalCost': additional_cost,
        'totalServiceCost': float(total_service_cost) if total_service_cost not in (None, '') else labor_cost + parts_cost + additional_cost,
        'timeline': payload.get('timeline') if isinstance(payload.get('timeline'), list) else [],
        'createdAt': created_at,
        'updatedAt': payload.get('updatedAt') or payload.get('updated_at') or created_at,
    }

    return task


def _can_see_task(task: dict) -> bool:
    role = str(g.current_user.get('role', '')).replace('-', '_')
    if role in {'admin', 'super_admin'}:
        return True
    if role == 'technician':
        return str(task.get('assignedTechnicianId') or '') == str(g.current_user['id'])
    if role == 'customer':
        return str(task.get('customerId') or '') == str(g.current_user['id'])
    return False


async def _save_task(db, task: dict) -> None:
    now = _utcnow_iso()
    task['updatedAt'] = now
    payload = json.dumps(task)
    await db.execute(
        """
        INSERT INTO technician_tasks
            (id, request_id, customer_id, assigned_technician_id, unit_id,
             status, payload, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            request_id = excluded.request_id,
            customer_id = excluded.customer_id,
            assigned_technician_id = excluded.assigned_technician_id,
            unit_id = excluded.unit_id,
            status = excluded.status,
            payload = excluded.payload,
            updated_at = excluded.updated_at
        """,
        (
            task['id'],
            task.get('requestId') or '',
            task.get('customerId') or '',
            task.get('assignedTechnicianId') or '',
            task.get('unitId') or None,
            task.get('status') or 'Pending',
            payload,
            task.get('createdAt') or now,
            task.get('updatedAt') or now,
        ),
    )


@tasks_bp.route('', methods=['GET'])
@require_auth
async def list_tasks():
    technician_id = request.args.get('technician_id')
    async with get_db() as db:
      query = 'SELECT payload FROM technician_tasks'
      values = []
      if technician_id:
          query += ' WHERE assigned_technician_id = ?'
          values.append(technician_id)
      query += ' ORDER BY updated_at DESC'
      async with db.execute(query, values) as cursor:
          rows = await cursor.fetchall()

    tasks = [json.loads(row['payload']) for row in rows]
    tasks = [task for task in tasks if _can_see_task(task)]
    return jsonify({'tasks': tasks}), 200


@tasks_bp.route('/<task_id>', methods=['GET'])
@require_auth
async def get_task(task_id: str):
    async with get_db() as db:
        async with db.execute(
            'SELECT payload FROM technician_tasks WHERE id = ?', (task_id,)
        ) as cursor:
            row = await cursor.fetchone()

    if row is None:
        return jsonify({'error': 'Task not found'}), 404

    task = json.loads(row['payload'])
    if not _can_see_task(task):
        return jsonify({'error': 'Forbidden'}), 403
    return jsonify({'task': task}), 200


@tasks_bp.route('', methods=['POST'])
@require_auth
async def create_task():
    role = str(g.current_user.get('role', '')).replace('-', '_')
    if role not in {'admin', 'super_admin'}:
        return jsonify({'error': 'Forbidden'}), 403

    data = await request.get_json(silent=True) or {}
    task = _normalize_task(data)
    async with get_db() as db:
        await _save_task(db, task)
        await db.commit()

    await write_audit_log('CREATE_TASK', g.current_user, task['id'])
    return jsonify({'task': task}), 201


@tasks_bp.route('/<task_id>', methods=['PATCH'])
@require_auth
async def update_task(task_id: str):
    data = await request.get_json(silent=True) or {}
    async with get_db() as db:
        async with db.execute(
            'SELECT payload FROM technician_tasks WHERE id = ?', (task_id,)
        ) as cursor:
            row = await cursor.fetchone()

        if row is None:
            return jsonify({'error': 'Task not found'}), 404

        existing = json.loads(row['payload'])
        if not _can_see_task(existing):
            return jsonify({'error': 'Forbidden'}), 403

        updated = _normalize_task({**existing, **data, 'id': task_id})
        await _save_task(db, updated)
        await db.commit()

    await write_audit_log('UPDATE_TASK', g.current_user, task_id)
    return jsonify({'task': updated}), 200
