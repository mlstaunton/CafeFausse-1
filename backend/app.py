from pathlib import Path
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from sqlalchemy import text
from urllib.parse import urlsplit

from config import Config
from db import db
from routes import admin_bp, newsletter_bp, reservations_bp


def create_app(config_override=None):
  frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
  app = Flask(__name__, static_folder=str(frontend_dist), static_url_path="/")
  app.config.from_object(Config)
  if config_override:
    app.config.update(config_override)
  CORS(app, supports_credentials=True)

  db_init_error = None
  db.init_app(app)
  with app.app_context():
    if app.config.get("DB_AUTO_CREATE", True):
      try:
        db.create_all()
      except Exception as exc:
        db_init_error = str(exc)
        app.logger.exception("Database initialization failed.")

  @app.get("/api/health")
  def health():
    db_status = "ok"
    db_error = None

    try:
      db.session.execute(text("SELECT 1"))
    except Exception as exc:
      db_status = "error"
      db_error = str(exc)

    payload = {
      "status": "ok" if db_status == "ok" else "degraded",
      "database": db_status,
      "db_source": app.config.get("DATABASE_URL_SOURCE", "unknown"),
      "db_host": urlsplit(app.config.get("SQLALCHEMY_DATABASE_URI", "")).hostname,
    }
    if db_init_error:
      payload["db_init"] = "failed"
    if db_error:
      payload["db_error"] = db_error

    return jsonify(payload), 200

  app.register_blueprint(reservations_bp, url_prefix="/api/reservations")
  app.register_blueprint(newsletter_bp, url_prefix="/api/newsletter")
  app.register_blueprint(admin_bp, url_prefix="/api/admin")

  @app.get("/")
  def spa_index():
    index_file = Path(app.static_folder) / "index.html"
    if index_file.exists():
      return send_from_directory(app.static_folder, "index.html")
    return jsonify({"message": "Frontend build not found. Run frontend build."}), 503

  @app.get("/<path:path>")
  def spa_static(path):
    if path.startswith("api/"):
      return jsonify({"error": "Not found"}), 404
    file_path = Path(app.static_folder) / path
    if file_path.exists() and file_path.is_file():
      return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

  return app


if __name__ == "__main__":
  create_app().run(host="0.0.0.0", port=5000, debug=True)
