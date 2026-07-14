import random
from datetime import datetime

from flask import Blueprint, jsonify, request

from db import db
from models import Customer, Reservation

reservations_bp = Blueprint("reservations", __name__)

TOTAL_TABLES = 30


def parse_slot(raw_slot):
  if not raw_slot:
    return None
  try:
    return datetime.fromisoformat(raw_slot)
  except ValueError:
    return None


@reservations_bp.get("/availability")
def check_availability():
  time_slot = parse_slot(request.args.get("time_slot"))
  if not time_slot:
    return jsonify({"error": "Invalid time slot format."}), 400

  reserved = (
      db.session.query(Reservation.table_number)
      .filter(Reservation.time_slot == time_slot)
      .all()
  )
  taken_tables = {row[0] for row in reserved}
  available = TOTAL_TABLES - len(taken_tables)
  return jsonify({"available_tables": available, "is_available": available > 0}), 200


@reservations_bp.post("")
def create_reservation():
  payload = request.get_json() or {}
  slot = parse_slot(payload.get("time_slot"))
  guests = payload.get("guests")
  customer_name = payload.get("customer_name", "").strip()
  email_address = payload.get("email_address", "").strip().lower()
  phone_number = (payload.get("phone_number") or "").strip() or None

  if not slot or not customer_name or not email_address:
    return jsonify({"error": "Missing required reservation fields."}), 400

  try:
    guests_int = int(guests)
  except (TypeError, ValueError):
    return jsonify({"error": "Guest count must be a number."}), 400
  if guests_int < 1:
    return jsonify({"error": "Guest count must be at least 1."}), 400

  reserved = (
      db.session.query(Reservation.table_number)
      .filter(Reservation.time_slot == slot)
      .all()
  )
  taken_tables = {row[0] for row in reserved}
  available_tables = [table for table in range(1, TOTAL_TABLES + 1) if table not in taken_tables]
  if not available_tables:
    return jsonify({"error": "Selected time slot is fully booked."}), 409

  customer = Customer.query.filter_by(email_address=email_address).first()
  if not customer:
    customer = Customer(
        customer_name=customer_name,
        email_address=email_address,
        phone_number=phone_number,
        newsletter_signup=False,
    )
    db.session.add(customer)
    db.session.flush()
  else:
    customer.customer_name = customer_name
    customer.phone_number = phone_number

  reservation = Reservation(
      customer_id=customer.customer_id,
      time_slot=slot,
      table_number=random.choice(available_tables),
      guests=guests_int,
  )
  db.session.add(reservation)
  db.session.commit()

  return (
      jsonify(
          {
              "message": "Reservation confirmed.",
              "reservation_id": reservation.reservation_id,
              "table_number": reservation.table_number,
              "time_slot": slot.isoformat(timespec="minutes"),
          }
      ),
      201,
  )
