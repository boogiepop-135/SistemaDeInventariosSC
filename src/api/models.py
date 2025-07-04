from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
import pytz
import os

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)
    role: Mapped[str] = mapped_column(
        # admin, tecnico, usuario
        String(20), nullable=False, default="usuario")

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role,
            # do not serialize the password, its a security breach
        }


class Item(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(
        String(120), nullable=False)  # Quita unique=True
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    # Ej: 'PC', 'Impresora', 'Switch', 'CCTV', 'POS', 'Software', 'Correo'
    category: Mapped[str] = mapped_column(String(80), nullable=False)
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
    physical_status: Mapped[str] = mapped_column(
        String(80), nullable=True)  # Bueno, Regular, Malo
    # Ej: Ventas, Soporte, etc.
    area: Mapped[str] = mapped_column(String(80), nullable=True)
    recurring_issues: Mapped[str] = mapped_column(String(255), nullable=True)
    knowledge_level: Mapped[str] = mapped_column(
        String(80), nullable=True)  # Básico, Intermedio, Avanzado
    support_person: Mapped[str] = mapped_column(String(120), nullable=True)
    # Ej: 2h, 1d, etc.
    support_time: Mapped[str] = mapped_column(String(80), nullable=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        db.DateTime, nullable=True, default=datetime.utcnow)
    serial: Mapped[str] = mapped_column(String(50), unique=True, nullable=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not getattr(self, 'serial', None):
            import uuid
            self.serial = f"INV-{str(uuid.uuid4())[:8].upper()}"

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
            "warranty_date": self.warranty_date if self.warranty_date else None,
            "manual": self.manual,
            "status": self.status,
            "assigned_to": self.assigned_to,
            "physical_status": self.physical_status,
            "area": self.area,
            "image_url": self.image_url,
            "serial": self.serial,
            "created_at": self.created_at.isoformat() if isinstance(self.created_at, datetime) and self.created_at else None
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
    description: Mapped[str] = mapped_column(String(255), nullable=False)
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
    created_at: Mapped[str] = mapped_column(String(30), nullable=False, default=lambda: datetime.now(
        pytz.timezone("America/Mexico_City")).strftime("%Y-%m-%d %H:%M:%S"))
    # punto de venta, celular, laptop, etc.
    incident_type: Mapped[str] = mapped_column(String(50), nullable=True)

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
            "comments": self.comments,
            "incident_type": self.incident_type,
            "created_at": self.created_at
        }


class Requisition(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    requested_by = db.Column(db.String(120))
    department = db.Column(db.String(120))
    status = db.Column(db.String(50), default="pendiente")
    priority = db.Column(db.String(50), default="normal")
    comments = db.Column(db.Text)
    created_at = db.Column(db.String(120))
    items = db.Column(db.Text)  # JSON string con los items solicitados
    approval_by = db.Column(db.String(120))
    expected_date = db.Column(db.String(120))

    def __repr__(self):
        return f'<Requisition {self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "requested_by": self.requested_by,
            "department": self.department,
            "status": self.status,
            "priority": self.priority,
            "comments": self.comments,
            "created_at": self.created_at,
            "items": self.items,
            "approval_by": self.approval_by,
            "expected_date": self.expected_date
        }

# En tu app principal (ejemplo src/app.py):
# app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")

        # En tu app principal (ejemplo src/app.py):
        # app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
