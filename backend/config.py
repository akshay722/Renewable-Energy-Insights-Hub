from datetime import timedelta
from functools import lru_cache
import secrets
import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Default to local development if no env var is set
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "mysql+pymysql://root:Qywter%40123@localhost:3306/renewable_energy_db"
    )
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Renewable Energy Insights Hub"
    
    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # CORS settings
    CORS_ORIGINS: list = [
        "http://localhost:3000", 
        "http://localhost:8080", 
        "http://localhost:5173",
        "http://frontend:5173",  # Allow frontend service in Docker network
    ]

    model_config = SettingsConfigDict(env_file=".env")

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()