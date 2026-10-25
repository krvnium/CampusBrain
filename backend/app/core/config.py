from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CampusBrain API"
    environment: str = "development"
    frontend_url: str = "http://localhost:5173"
    database_url: str = "sqlite:///./campusbrain.db"

    model_config = SettingsConfigDict(env_file=".env", env_prefix="CAMPUSBRAIN_")


@lru_cache
def get_settings() -> Settings:
    return Settings()