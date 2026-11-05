from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = (
        "mssql+pyodbc:///?odbc_connect=DRIVER%3D%7BODBC+Driver+18+for+SQL+Server%7D%3B"
        "SERVER%3Dlocalhost%5CSQLEXPRESS02%3BDATABASE%3DA4Helpdesk%3B"
        "Trusted_Connection%3Dyes%3BTrustServerCertificate%3Dyes"
    )
    JWT_SECRET: str = "dev-secret-change-me-please-0123456789"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480
    CORS_ORIGINS: str = "http://localhost:5173"
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_MB: int = 5
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "Admin@12345"
    ADMIN_EMAIL: str = "admin@a4.edu.vn"
    ADMIN_NAME: str = "Quản trị viên"
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "helpdesk@a4.edu.vn"
    AUTO_CREATE_TABLES: bool = False

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
