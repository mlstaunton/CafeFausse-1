import os
from dotenv import load_dotenv

load_dotenv()


def env_bool(name, default):
  return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


class Config:
  SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
  ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "manager")
  ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "quantic")
  SUPABASE_URL = os.getenv("SUPABASE_URL", "")
  SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
  DB_AUTO_CREATE = env_bool("DB_AUTO_CREATE", True)
  SQLALCHEMY_DATABASE_URI = (
      os.getenv("DATABASE_URL")
      or os.getenv("SUPABASE_DB_URL")
      or "postgresql+psycopg://manager:quantic@localhost:5432/fausse_db"
  )
  SQLALCHEMY_TRACK_MODIFICATIONS = False
