from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "A4 Helpdesk"
    app_env: str = "development"
    database_url: str = "mysql+pymysql://a4_user:change_me@localhost:3306/a4_helpdesk"
    secret_key: str = "development-only-change-this-secret"
    access_token_expire_minutes: int = 30
    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
