import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*"
    ]
    MAX_SOURCE_LENGTH: int = 50000
    REQUEST_TIMEOUT_SECONDS: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="allow"
    )

settings = Settings()
