from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./data/esg.db"
    upload_dir: Path = Path("data/uploads")
    cache_dir: Path = Path("data/cache")
    reports_dir: Path = Path("data/reports")
    max_upload_size_mb: int = 50
    claude_model: str = "claude-sonnet-4-6"

    class Config:
        env_file = ".env"


settings = Settings()

for d in [settings.upload_dir, settings.cache_dir, settings.reports_dir]:
    d.mkdir(parents=True, exist_ok=True)
