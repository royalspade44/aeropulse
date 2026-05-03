from contextlib import asynccontextmanager

import aiosqlite
from config import Config


USER_COLUMN_DEFINITIONS = {
    'alias': "TEXT NOT NULL DEFAULT ''",
    'suffix': "TEXT NOT NULL DEFAULT ''",
    'contact_method': "TEXT NOT NULL DEFAULT ''",
    'messenger_handle': "TEXT NOT NULL DEFAULT ''",
    'municipality': "TEXT NOT NULL DEFAULT ''",
    'municipality_code': "TEXT NOT NULL DEFAULT ''",
    'submunicipality': "TEXT NOT NULL DEFAULT ''",
    'submunicipality_code': "TEXT NOT NULL DEFAULT ''",
    'thoroughfare': "TEXT NOT NULL DEFAULT ''",
    'property_block_lot': "TEXT NOT NULL DEFAULT ''",
    'apartment_unit': "TEXT NOT NULL DEFAULT ''",
    'customer_onboarded_at': "TEXT",
    'technician_onboarded_at': "TEXT",
}


async def init_db(app):
    """
    Create all required database tables (users, sessions, audit_logs, login_attempts, otps) if they do not already exist.
    Called once from the Quart before_serving hook in app.py to ensure the schema is ready before the first request.
    """
    async with aiosqlite.connect(Config.DB_PATH) as db:
        await db.executescript("""
            PRAGMA journal_mode=WAL;
            PRAGMA foreign_keys=ON;

            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name_first TEXT NOT NULL DEFAULT '',
                name_last TEXT NOT NULL DEFAULT '',
                email TEXT NOT NULL UNIQUE,
                phone TEXT NOT NULL DEFAULT '',
                password_hash TEXT NOT NULL DEFAULT '',
                salt TEXT NOT NULL DEFAULT '',
                role TEXT NOT NULL DEFAULT 'customer',
                status TEXT NOT NULL DEFAULT 'active',
                profile_photo TEXT,
                address TEXT NOT NULL DEFAULT '',
                landmark TEXT NOT NULL DEFAULT '',
                plus_code TEXT NOT NULL DEFAULT '',
                latitude REAL,
                longitude REAL,
                delivery_instructions TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                actor_id TEXT,
                actor_name TEXT NOT NULL DEFAULT '',
                actor_email TEXT,
                action TEXT NOT NULL,
                target_id TEXT,
                details TEXT NOT NULL DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS login_attempts (
                email TEXT PRIMARY KEY,
                attempts INTEGER NOT NULL DEFAULT 0,
                locked_until TEXT
            );

            CREATE TABLE IF NOT EXISTS otps (
                email TEXT PRIMARY KEY,
                code TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'customer'
            );

            CREATE TABLE IF NOT EXISTS technician_tasks (
                id TEXT PRIMARY KEY,
                request_id TEXT NOT NULL DEFAULT '',
                customer_id TEXT NOT NULL DEFAULT '',
                assigned_technician_id TEXT NOT NULL DEFAULT '',
                unit_id TEXT,
                status TEXT NOT NULL DEFAULT 'Pending',
                payload TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS user_recovery_codes (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                code TEXT NOT NULL,
                used INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                used_at TEXT,
                UNIQUE(user_id, code),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS user_totp_secrets (
                user_id TEXT PRIMARY KEY,
                secret TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        """)
        async with db.execute('PRAGMA table_info(users)') as cursor:
            existing_columns = {row[1] for row in await cursor.fetchall()}

        for column_name, definition in USER_COLUMN_DEFINITIONS.items():
            if column_name not in existing_columns:
                await db.execute(
                    f'ALTER TABLE users ADD COLUMN {column_name} {definition}'
                )

        await db.execute("""
            CREATE UNIQUE INDEX IF NOT EXISTS idx_users_alias_unique
            ON users(alias COLLATE NOCASE)
            WHERE alias <> ''
        """)
        await db.commit()


@asynccontextmanager
async def get_db():
    """
    Async context manager that opens an aiosqlite connection, enables foreign keys, and sets row_factory to aiosqlite.Row.
    Used throughout routes and auth helpers wherever a database connection is needed; automatically commits or closes on exit.
    """
    async with aiosqlite.connect(Config.DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        await db.execute('PRAGMA foreign_keys=ON')
        yield db
