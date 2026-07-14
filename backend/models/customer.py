from datetime import datetime

from db import db


class Customer(db.Model):
  __tablename__ = "customers"

  customer_id = db.Column(db.Integer, primary_key=True)
  customer_name = db.Column(db.String(120), nullable=False)
  email_address = db.Column(db.String(255), nullable=False, unique=True)
  phone_number = db.Column(db.String(40), nullable=True)
  newsletter_signup = db.Column(db.Boolean, default=False, nullable=False)
  created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

  reservations = db.relationship("Reservation", backref="customer", lazy=True)
