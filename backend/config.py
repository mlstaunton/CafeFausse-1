import os
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from dotenv import load_dotenv

load_dotenv()


def env_bool(name, default):
  return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def normalize_database_url(raw_url):
  if not raw_url:
    return raw_url

  normalized = raw_url.strip()

  # SQLAlchemy needs an explicit driver. Supabase often provides postgres:// URLs.
  if normalized.startswith("postgres://"):
    normalized = "postgresql+psycopg://" + normalized[len("postgres://") :]
  elif normalized.startswith("postgresql://") and not normalized.startswith("postgresql+"):
    normalized = "postgresql+psycopg://" + normalized[len("postgresql://") :]

  parts = urlsplit(normalized)
  query = dict(parse_qsl(parts.query, keep_blank_values=True))

  # Supabase Postgres requires SSL on remote connections.
  if parts.hostname and parts.hostname.endswith(".supabase.co") and "sslmode" not in query:
    query["sslmode"] = "require"

  return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


class Config:
  SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
  ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "manager")
  ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "quantic")
  SUPABASE_URL = os.getenv("SUPABASE_URL", "")
  SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
  DB_AUTO_CREATE = env_bool("DB_AUTO_CREATE", True)
  SQLALCHEMY_DATABASE_URI = (
      normalize_database_url(os.getenv("DATABASE_URL"))
      or normalize_database_url(os.getenv("SUPABASE_DB_URL"))
      or "postgresql+psycopg://manager:quantic@localhost:5432/fausse_db"
  )
  SQLALCHEMY_TRACK_MODIFICATIONS = False
