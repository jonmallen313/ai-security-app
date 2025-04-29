from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = "sqlite:///./security_alerts.db"
    
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Security Operations Platform"
    
    # Security settings
    SECRET_KEY: str = "your-secret-key-here"  # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Slack settings
    SLACK_WEBHOOK_URL: str
    SLACK_DEFAULT_CHANNEL: str = "security-alerts"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings() 