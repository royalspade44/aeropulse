# debug_seed.py — DEVELOPMENT ONLY
# Seeds dummy accounts for each role if they don't already exist.

import uuid
from datetime import datetime, timezone

from auth import hash_password
from database import get_db

SEED_ACCOUNTS = [
    {
        'name_first': 'Debug',
        'name_last': 'Customer',
        'email': 'c@coldair-act.online',
        'phone': '09000000000',
        'password': 'c@coldair-act.online',
        'role': 'customer',
    },
    {
        'name_first': 'Debug',
        'name_last': 'Technician',
        'email': 't@coldair-act.online',
        'phone': '09000000000',
        'password': 't@coldair-act.online',
        'role': 'technician',
    },
    {
        'name_first': 'Debug',
        'name_last': 'Manager',
        'email': 'm@coldair-act.online',
        'phone': '09000000000',
        'password': 'm@coldair-act.online',
        'role': 'admin',
    },
    {
        'name_first': 'Debug',
        'name_last': 'Owner',
        'email': 'o@coldair-act.online',
        'phone': '09000000000',
        'password': 'o@coldair-act.online',
        'role': 'super_admin',
    },
]


async def seed_debug_accounts() -> None:
    """
    Insert the predefined SEED_ACCOUNTS into the `users` table so every role has a ready-made login for local development.
    Idempotent — skips any account whose email already exists; called from the before_serving hook in app.py only when DEBUG=true.
    """
    now = (
        datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]
        + 'Z'
    )

    async with get_db() as db:
        for account in SEED_ACCOUNTS:
            email_lower = account['email'].lower()

            # Skip if already seeded
            async with db.execute(
                'SELECT id FROM users WHERE LOWER(email) = ?', (email_lower,)
            ) as cursor:
                existing = await cursor.fetchone()

            if existing:
                continue

            user_id = str(uuid.uuid4())
            hash_hex, salt = hash_password(account['password'])

            await db.execute(
                """
                INSERT INTO users
                    (id, name_first, name_last, email, phone,
                     password_hash, salt, role, status,
                     address, landmark, plus_code, delivery_instructions,
                     created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', '', '', '', '', ?, ?)
                """,
                (
                    user_id,
                    account['name_first'],
                    account['name_last'],
                    account['email'],
                    account['phone'],
                    hash_hex,
                    salt,
                    account['role'],
                    now,
                    now,
                ),
            )
            print(
                f'[SEED] Created {account["role"]}: {account["email"]} '
                f'/ {account["password"]}'
            )

        await db.commit()
