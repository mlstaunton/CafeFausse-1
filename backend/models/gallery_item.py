from db import db


class GalleryItem(db.Model):
  __tablename__ = "gallery_items"

  gallery_item_id = db.Column(db.Integer, primary_key=True)
  title = db.Column(db.String(120), nullable=False)
  image_path = db.Column(db.String(255), nullable=False)
  category = db.Column(db.String(64), nullable=False)
