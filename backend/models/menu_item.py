from db import db


class MenuItem(db.Model):
  __tablename__ = "menu_items"

  menu_item_id = db.Column(db.Integer, primary_key=True)
  category = db.Column(db.String(64), nullable=False)
  name = db.Column(db.String(120), nullable=False)
  description = db.Column(db.Text, nullable=False)
  price = db.Column(db.Numeric(8, 2), nullable=False)
