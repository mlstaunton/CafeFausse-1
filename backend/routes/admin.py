from decimal import Decimal, InvalidOperation
from functools import wraps

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
