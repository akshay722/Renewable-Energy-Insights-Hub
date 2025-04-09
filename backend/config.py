from datetime import timedelta
from functools import lru_cache
import secrets
import os
from urllib.parse import quote_plus
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "Qywter@123")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_NAME: str = os.getenv("DB_NAME", "renewable_energy_db_sql")
    
    # Construct DATABASE_URL from components or use provided URL
    @property
    def DATABASE_URL(self) -> str:
        if os.getenv("DATABASE_URL"):
            return os.getenv("DATABASE_URL")
        
        password = quote_plus(self.DB_PASSWORD)
        return f"mysql+pymysql://{self.DB_USER}:{password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Wattwize"
    
    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # CORS settings
    CORS_ORIGINS: list = [
        "http://localhost:3000", 
        "http://localhost:8080", 
        "http://localhost:5173",
        "http://frontend:5173",
    ]
    
    def get_cors_origins(self):
        origins = self.CORS_ORIGINS.copy()
        if os.getenv("FRONTEND_URL"):
            origins.append(os.getenv("FRONTEND_URL"))
        if self.ENVIRONMENT == "production":
            origins.extend([
                "https://*.amazonaws.com",
                "https://*.cloudfront.net"
            ])
        return origins

    model_config = SettingsConfigDict(env_file=".env")

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()