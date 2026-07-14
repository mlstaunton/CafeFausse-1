from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import text

from config import Config
from db import db
from routes import admin_bp, newsletter_bp, reservations_bp


def create_app(config_override=None):
  app = Flask(__name__)
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
    }
    if db_init_error:
      payload["db_init"] = "failed"
    if db_error:
      payload["db_error"] = db_error

    return jsonify(payload), 200

  app.register_blueprint(reservations_bp, url_prefix="/api/reservations")
  app.register_blueprint(newsletter_bp, url_prefix="/api/newsletter")
  app.register_blueprint(admin_bp, url_prefix="/api/admin")

  return app


if __name__ == "__main__":
  create_app().run(host="0.0.0.0", port=5000, debug=True)
