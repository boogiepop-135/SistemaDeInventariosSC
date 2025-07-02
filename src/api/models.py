from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }


class Item(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    category: Mapped[str] = mapped_column(String(80), nullable=True)
    # laptop, pc, monitor, etc.
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    brand: Mapped[str] = mapped_column(String(50), nullable=True)
    model: Mapped[str] = mapped_column(String(80), nullable=True)
    color: Mapped[str] = mapped_column(String(30), nullable=True)
    features: Mapped[str] = mapped_column(String(255), nullable=True)
    warranty_date: Mapped[str] = mapped_column(
        String(20), nullable=True)  # formato YYYY-MM-DD
    manual: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=False)
    # stock, asignado, etc.
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="stock")
    assigned_to: Mapped[str] = mapped_column(
        String(120), nullable=True)  # nombre de usuario o null

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "type": self.type,
            "brand": self.brand,
            "model": self.model,
            "color": self.color,
            "features": self.features,
            "warranty_date": self.warranty_date,
            "manual": self.manual,
            "status": self.status,
            "assigned_to": self.assigned_to
        }


class Inventory(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    item_id: Mapped[int] = mapped_column(nullable=False)
    quantity: Mapped[int] = mapped_column(nullable=False)
    location: Mapped[str] = mapped_column(String(120), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "item_id": self.item_id,
            "quantity": self.quantity,
            "location": self.location
        }


class Ticket(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    item_id: Mapped[int] = mapped_column(nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="pendiente")  # pendiente, solucionado
    created_by: Mapped[str] = mapped_column(String(120), nullable=True)
    branch: Mapped[str] = mapped_column(
        String(50), nullable=False)  # matriz, juriquilla, centro sur
    department: Mapped[str] = mapped_column(
        String(50), nullable=False)  # cedis, cepro, piso
    priority: Mapped[str] = mapped_column(
        # urgente, critico, normal
        String(20), nullable=False, default="normal")
    comments: Mapped[str] = mapped_column(String(255), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "item_id": self.item_id,
            "status": self.status,
            "created_by": self.created_by,
            "branch": self.branch,
            "department": self.department,
            "priority": self.priority,
            "comments": self.comments
        }
