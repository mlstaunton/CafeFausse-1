from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from db import db
from routes import admin_bp, newsletter_bp, reservations_bp


def create_app(config_override=None):
  app = Flask(__name__)
  app.config.from_object(Config)
  if config_override:
    app.config.update(config_override)
  CORS(app, supports_credentials=True)

  db.init_app(app)
  with app.app_context():
    db.create_all()

  @app.get("/api/health")
  def health():
    return jsonify({"status": "ok"}), 200

  app.register_blueprint(reservations_bp, url_prefix="/api/reservations")
  app.register_blueprint(newsletter_bp, url_prefix="/api/newsletter")
  app.register_blueprint(admin_bp, url_prefix="/api/admin")

  return app


if __name__ == "__main__":
  create_app().run(host="0.0.0.0", port=5000, debug=True)
