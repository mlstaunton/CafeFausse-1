from flask import Blueprint, jsonify, request

from db import db
from models import Customer

newsletter_bp = Blueprint("newsletter", __name__)


@newsletter_bp.post("")
def subscribe_newsletter():
  payload = request.get_json() or {}
  email_address = (payload.get("email_address") or "").strip().lower()
  if not email_address or "@" not in email_address:
    return jsonify({"error": "A valid email address is required."}), 400

  customer = Customer.query.filter_by(email_address=email_address).first()
  if customer:
    customer.newsletter_signup = True
  else:
    customer = Customer(
        customer_name=email_address.split("@")[0],
        email_address=email_address,
        phone_number=None,
        newsletter_signup=True,
    )
    db.session.add(customer)

  db.session.commit()
  return jsonify({"message": "Email subscribed."}), 201
