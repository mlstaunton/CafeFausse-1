import os
from dotenv import load_dotenv

load_dotenv()


class Config:
  SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
  ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "manager")
  ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "quantic")
  SUPABASE_URL = os.getenv("SUPABASE_URL", "")
  SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
  SQLALCHEMY_DATABASE_URI = (
      os.getenv("DATABASE_URL")
      or os.getenv("SUPABASE_DB_URL")
      or "postgresql+psycopg://manager:quantic@localhost:5432/fausse_db"
  )
  SQLALCHEMY_TRACK_MODIFICATIONS = False
