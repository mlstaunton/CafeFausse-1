from decimal import Decimal, InvalidOperation
from datetime import datetime
from datetime import time as time_obj
from functools import wraps
import random

from flask import Blueprint, current_app, jsonify, request, session

from db import db
from models import Customer, MenuItem, Reservation

admin_bp = Blueprint("admin", __name__)


def admin_required(handler):
  @wraps(handler)
  def wrapped(*args, **kwargs):
    if not session.get("is_admin"):
      return jsonify({"error": "Authentication required."}), 401
    return handler(*args, **kwargs)

  return wrapped


def parse_service_datetime(date_value, time_value):
  if not date_value or not time_value:
    return None
  try:
    return datetime.fromisoformat(f"{date_value}T{time_value}")
  except ValueError:
    return None


def is_within_open_hours(slot):
  service_time = slot.time()
  opens_at = time_obj(17, 0)
  closes_at = time_obj(21, 0) if slot.weekday() == 6 else time_obj(23, 0)
  return opens_at <= service_time <= closes_at


@admin_bp.post("/login")
def admin_login():
  payload = request.get_json() or {}
  username = (payload.get("username") or "").strip()
  password = payload.get("password") or ""

  if (
      username == current_app.config["ADMIN_USERNAME"]
      and password == current_app.config["ADMIN_PASSWORD"]
  ):
    session.clear()
    session["is_admin"] = True
    session["admin_username"] = username
    return jsonify({"message": "Login successful.", "username": username}), 200

  return jsonify({"error": "Invalid admin credentials."}), 401


@admin_bp.post("/logout")
def admin_logout():
  session.clear()
  return jsonify({"message": "Logged out."}), 200


@admin_bp.get("/me")
def admin_me():
  if not session.get("is_admin"):
    return jsonify({"authenticated": False}), 200
  return jsonify({"authenticated": True, "username": session.get("admin_username")}), 200


@admin_bp.post("/menu-items")
@admin_required
def create_menu_item():
  payload = request.get_json() or {}

  required = ["category", "name", "description", "price"]
  if any(not payload.get(field) for field in required):
    return jsonify({"error": "All menu item fields are required."}), 400

  try:
    price = Decimal(str(payload["price"]))
  except (InvalidOperation, ValueError):
    return jsonify({"error": "Price must be numeric."}), 400

  item = MenuItem(
      category=payload["category"].strip(),
      name=payload["name"].strip(),
      description=payload["description"].strip(),
      price=price,
  )
  db.session.add(item)
  db.session.commit()
  return jsonify({"message": "Menu item created.", "menu_item_id": item.menu_item_id}), 201


@admin_bp.get("/menu-items")
@admin_required
def list_menu_items():
  rows = MenuItem.query.order_by(MenuItem.category.asc(), MenuItem.name.asc()).all()
  return (
      jsonify(
          {
              "data": [
                  {
                      "menu_item_id": row.menu_item_id,
                      "category": row.category,
                      "name": row.name,
                      "description": row.description,
                      "price": float(row.price),
                  }
                  for row in rows
              ]
          }
      ),
      200,
  )


@admin_bp.delete("/menu-items/<int:menu_item_id>")
@admin_required
def delete_menu_item(menu_item_id):
  row = MenuItem.query.get(menu_item_id)
  if not row:
    return jsonify({"error": "Menu item not found."}), 404

  db.session.delete(row)
  db.session.commit()
  return jsonify({"message": "Menu item deleted."}), 200


@admin_bp.get("/newsletter")
@admin_required
def get_newsletter():
  subscribers = (
      Customer.query.filter_by(newsletter_signup=True)
      .order_by(Customer.created_at.desc())
      .all()
  )
  return (
      jsonify(
          {
              "data": [
                  {
                      "customer_id": row.customer_id,
                      "customer_name": row.customer_name,
                      "email_address": row.email_address,
                  }
                  for row in subscribers
              ]
          }
      ),
      200,
  )


@admin_bp.get("/reservations")
@admin_required
def list_reservations():
  query = Reservation.query.order_by(Reservation.time_slot.asc(), Reservation.table_number.asc())
  date_filter = (request.args.get("date") or "").strip()
  if date_filter:
    query = query.filter(db.func.date(Reservation.time_slot) == date_filter)

  rows = query.all()
  return (
      jsonify(
          {
              "data": [
                  {
                      "reservation_id": row.reservation_id,
                      "customer_id": row.customer_id,
                      "customer_name": row.customer.customer_name,
                      "email_address": row.customer.email_address,
                      "phone_number": row.customer.phone_number,
                      "time_slot": row.time_slot.isoformat(timespec="minutes"),
                      "table_number": row.table_number,
                      "guests": row.guests,
                  }
                  for row in rows
              ]
          }
      ),
      200,
  )


@admin_bp.delete("/reservations/<int:reservation_id>")
@admin_required
def cancel_reservation(reservation_id):
  reservation = Reservation.query.get(reservation_id)
  if not reservation:
    return jsonify({"error": "Reservation not found."}), 404

  db.session.delete(reservation)
  db.session.commit()
  return jsonify({"message": "Reservation canceled."}), 200


@admin_bp.delete("/reservations/by-date")
@admin_required
def clear_reservations_for_date():
  service_date = (request.args.get("date") or "").strip()
  if not service_date:
    return jsonify({"error": "A date query parameter is required."}), 400

  deleted = Reservation.query.filter(db.func.date(Reservation.time_slot) == service_date).delete()
  db.session.commit()
  return jsonify({"message": "Reservations cleared.", "deleted_count": deleted}), 200


@admin_bp.post("/dev/book-batch")
@admin_required
def dev_book_batch():
  payload = request.get_json() or {}
  date_value = (payload.get("date") or "").strip()
  time_value = (payload.get("time") or "").strip()
  quantity = payload.get("quantity", 1)

  slot = parse_service_datetime(date_value, time_value)
  if not slot:
    return jsonify({"error": "Valid date and time are required."}), 400
  if not is_within_open_hours(slot):
    return jsonify({"error": "Selected time is outside opening hours."}), 400

  try:
    qty = int(quantity)
  except (TypeError, ValueError):
    return jsonify({"error": "Quantity must be a whole number."}), 400
  if qty < 1:
    return jsonify({"error": "Quantity must be at least 1."}), 400

  service_date = slot.date().isoformat()
  taken_rows = (
      db.session.query(Reservation.table_number)
      .filter(db.func.date(Reservation.time_slot) == service_date)
      .all()
  )
  taken_tables = {row[0] for row in taken_rows}
  available_tables = [table for table in range(1, 31) if table not in taken_tables]
  if not available_tables:
    return jsonify({"error": "All 30 tables are already booked for that evening."}), 409

  to_book = min(qty, len(available_tables))
  booked_tables = []
  created_ids = []
  timestamp_tag = datetime.utcnow().strftime("%Y%m%d%H%M%S")

  for table_number in random.sample(available_tables, to_book):
    email = f"dev-{date_value}-{table_number}-{timestamp_tag}@cafefausse.local".lower()
    customer = Customer.query.filter_by(email_address=email).first()
    if not customer:
      customer = Customer(
          customer_name=f"Dev Booking {table_number}",
          email_address=email,
          phone_number=None,
          newsletter_signup=False,
      )
      db.session.add(customer)
      db.session.flush()

    reservation = Reservation(
        customer_id=customer.customer_id,
        time_slot=slot,
        table_number=table_number,
        guests=2,
    )
    db.session.add(reservation)
    db.session.flush()
    booked_tables.append(table_number)
    created_ids.append(reservation.reservation_id)

  db.session.commit()
  return (
      jsonify(
          {
              "message": "Batch booking complete.",
              "service_date": service_date,
              "requested": qty,
              "created": to_book,
              "booked_tables": sorted(booked_tables),
              "reservation_ids": created_ids,
          }
      ),
      201,
  )
