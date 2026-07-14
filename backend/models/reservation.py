from datetime import datetime

from db import db


class Reservation(db.Model):
  __tablename__ = "reservations"

  reservation_id = db.Column(db.Integer, primary_key=True)
  customer_id = db.Column(
      db.Integer, db.ForeignKey("customers.customer_id"), nullable=False
  )
  time_slot = db.Column(db.DateTime, nullable=False)
  table_number = db.Column(db.Integer, nullable=False)
  guests = db.Column(db.Integer, nullable=False)
  created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

  __table_args__ = (
      db.UniqueConstraint("time_slot", "table_number", name="uq_time_slot_table"),
  )
