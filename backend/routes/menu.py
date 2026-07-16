from flask import Blueprint, jsonify

from models import MenuItem

menu_bp = Blueprint("menu", __name__)


@menu_bp.get("")
def list_menu_items():
  rows = MenuItem.query.order_by(MenuItem.category.asc(), MenuItem.name.asc()).all()

  grouped = {}
  for row in rows:
    grouped.setdefault(row.category, []).append(
        {
            "name": row.name,
            "description": row.description,
            "price": float(row.price),
        }
    )

  return jsonify({"data": grouped}), 200
