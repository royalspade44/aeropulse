import os


class Config:
    """Central configuration for the Quart server; all values can be overridden via environment variables."""

    SECRET_KEY: str = os.getenv('SECRET_KEY', 'dev-secret-coldair-2025')
    DB_PATH: str = os.getenv('DB_PATH', 'coldair.db')
    DEBUG: bool = os.getenv('DEBUG', 'true').lower() == 'true'
    PORT: int = int(os.getenv('PORT', '5050'))
    SESSION_HOURS: int = 24
