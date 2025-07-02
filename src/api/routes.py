"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Item, Ticket
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from datetime import datetime, timedelta
import jwt
from flask import current_app
from werkzeug.security import check_password_hash, generate_password_hash
import pytz
import pandas as pd
from flask import send_file
from io import BytesIO

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

# Puedes mover esto a una variable de entorno si lo deseas
SECRET_KEY = "super-secret-key"


# Usuarios permitidos (ejemplo, deberías migrar a la base de datos)
valid_users = {
    "Levi": {"password": generate_password_hash("BM56Oi3QdUxtFoAWrJMK"), "role": "admin"},
    "Inrra": {"password": generate_password_hash("qlII7kBWDR8pHwfEZrwM"), "role": "tecnico"},
    "JRQ": {"password": generate_password_hash("i1hOHoz7YHwb6WTZfMgI"), "role": "usuario"},
    "sccs": {"password": generate_password_hash("NXxwhV9xKrkPQTbJtAKC"), "role": "usuario"}
}


def generate_token(username, role):
    payload = {
        "sub": username,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=8)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


@api.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    user = valid_users.get(username)
    if user and check_password_hash(user["password"], password):
        token = generate_token(username, user["role"])
        return jsonify({"token": token, "role": user["role"]}), 200
    return jsonify({"msg": "Credenciales inválidas"}), 401


def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["sub"], payload["role"]
    except Exception:
        return None, None


def jwt_required(fn):
    from functools import wraps

    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", None)
        if not auth or not auth.startswith("Bearer "):
            return jsonify({"msg": "Token requerido"}), 401
        token = auth.split(" ")[1]
        user, role = verify_token(token)
        if not user:
            return jsonify({"msg": "Token inválido o expirado"}), 401
        return fn(*args, **kwargs)
    return wrapper


def jwt_required_role(roles):
    def decorator(fn):
        from functools import wraps

        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth = request.headers.get("Authorization", None)
            if not auth or not auth.startswith("Bearer "):
                return jsonify({"msg": "Token requerido"}), 401
            token = auth.split(" ")[1]
            user, role = verify_token(token)
            if not user or role not in roles:
                return jsonify({"msg": "Token inválido, expirado o sin permisos"}), 401
            return fn(*args, **kwargs)
        return wrapper
    return decorator


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


# --- Endpoints protegidos ---
@api.route('/items', methods=['GET'])
@jwt_required
def get_items():
    items = Item.query.all()
    return jsonify([item.serialize() for item in items]), 200


@api.route('/items/<int:item_id>', methods=['GET'])
@jwt_required
def get_item(item_id):
    item = Item.query.get(item_id)
    if not item:
        return jsonify({"msg": "Item not found"}), 404
    return jsonify(item.serialize()), 200


@api.route('/items', methods=['POST'])
@jwt_required
def create_item():
    data = request.json
    item = Item(
        name=data.get("name"),
        description=data.get("description"),
        category=data.get("category"),
        type=data.get("type"),
        brand=data.get("brand"),
        model=data.get("model"),
        color=data.get("color"),
        features=data.get("features"),
        warranty_date=data.get("warranty_date"),
        manual=data.get("manual", False),
        status=data.get("status", "stock"),
        assigned_to=data.get("assigned_to")
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.serialize()), 201


@api.route('/items/<int:item_id>', methods=['PUT'])
@jwt_required_role(["admin"])
def update_item(item_id):
    item = Item.query.get(item_id)
    if not item:
        return jsonify({"msg": "Item not found"}), 404
    data = request.json
    item.name = data.get("name", item.name)
    item.description = data.get("description", item.description)
    item.category = data.get("category", item.category)
    item.type = data.get("type", item.type)
    item.brand = data.get("brand", item.brand)
    item.model = data.get("model", item.model)
    item.color = data.get("color", item.color)
    item.features = data.get("features", item.features)
    item.warranty_date = data.get("warranty_date", item.warranty_date)
    item.manual = data.get("manual", item.manual)
    item.status = data.get("status", item.status)
    item.assigned_to = data.get("assigned_to", item.assigned_to)
    db.session.commit()
    return jsonify(item.serialize()), 200


@api.route('/items/<int:item_id>', methods=['DELETE'])
@jwt_required
def delete_item(item_id):
    item = Item.query.get(item_id)
    if not item:
        return jsonify({"msg": "Item not found"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"msg": "Item deleted"}), 200


@api.route('/tickets', methods=['GET'])
@jwt_required
def get_tickets():
    tickets = Ticket.query.all()
    return jsonify([ticket.serialize() for ticket in tickets]), 200


@api.route('/tickets/<int:ticket_id>', methods=['GET'])
@jwt_required
def get_ticket(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"msg": "Ticket not found"}), 404
    return jsonify(ticket.serialize()), 200


@api.route('/tickets', methods=['POST'])
@jwt_required
def create_ticket():
    data = request.json
    ticket = Ticket(
        title=data.get("title"),
        description=data.get("description"),
        item_id=data.get("item_id"),
        status=data.get("status", "pendiente"),
        created_by=data.get("created_by"),
        branch=data.get("branch"),
        department=data.get("department"),
        priority=data.get("priority", "normal"),
        comments=data.get("comments"),
        created_at=datetime.now(pytz.timezone(
            "America/Mexico_City")).strftime("%Y-%m-%d %H:%M:%S")
    )
    db.session.add(ticket)
    db.session.commit()
    return jsonify(ticket.serialize()), 201


@api.route('/tickets/<int:ticket_id>', methods=['PUT'])
@jwt_required_role(["admin"])
def update_ticket(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"msg": "Ticket not found"}), 404
    data = request.json
    ticket.title = data.get("title", ticket.title)
    ticket.description = data.get("description", ticket.description)
    ticket.item_id = data.get("item_id", ticket.item_id)
    ticket.status = data.get("status", ticket.status)
    ticket.created_by = data.get("created_by", ticket.created_by)
    ticket.branch = data.get("branch", ticket.branch)
    ticket.department = data.get("department", ticket.department)
    ticket.priority = data.get("priority", ticket.priority)
    ticket.comments = data.get("comments", ticket.comments)
    db.session.commit()
    return jsonify(ticket.serialize()), 200


@api.route('/tickets/<int:ticket_id>', methods=['DELETE'])
@jwt_required
def delete_ticket(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"msg": "Ticket not found"}), 404
    db.session.delete(ticket)
    db.session.commit()
    return jsonify({"msg": "Ticket deleted"}), 200


@api.route('/users', methods=['POST'])
@jwt_required_role(["admin"])
def create_user():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "usuario")
    if not username or not password:
        return jsonify({"msg": "Usuario y contraseña requeridos"}), 400
    if username in valid_users:
        return jsonify({"msg": "El usuario ya existe"}), 400
    valid_users[username] = {
        "password": generate_password_hash(password),
        "role": role
    }
    return jsonify({"msg": "Usuario creado", "username": username, "role": role}), 201


@api.route('/users/<username>', methods=['DELETE'])
@jwt_required_role(["admin"])
def delete_user(username):
    if username not in valid_users:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    if username == "Levi":
        return jsonify({"msg": "No puedes borrar al administrador principal"}), 403
    del valid_users[username]
    return jsonify({"msg": f"Usuario {username} eliminado"}), 200


@api.route('/users', methods=['GET'])
@jwt_required_role(["admin"])
def list_users():
    # Devuelve los usuarios del diccionario en memoria
    return jsonify([
        {"username": k, "role": v["role"]}
        for k, v in valid_users.items()
    ]), 200


@api.route('/users/<username>', methods=['PUT'])
@jwt_required_role(["admin"])
def edit_user(username):
    data = request.json
    if username not in valid_users:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    if username == "Levi" and data.get("role") and data.get("role") != "admin":
        return jsonify({"msg": "No puedes cambiar el rol del administrador principal"}), 403
    if data.get("password"):
        valid_users[username]["password"] = generate_password_hash(
            data["password"])
    if data.get("role"):
        valid_users[username]["role"] = data["role"]
    return jsonify({"msg": f"Usuario {username} actualizado"}), 200


# Ejemplo de uso:
@api.route('/admin-only', methods=['GET'])
@jwt_required_role(["admin"])
def admin_only():
    return jsonify({"msg": "Solo admins pueden ver esto"}), 200


@api.route('/items/export', methods=['GET'])
@jwt_required
def export_items_excel():
    items = Item.query.all()
    data = [item.serialize() for item in items]
    df = pd.DataFrame(data)
    output = BytesIO()
    df.to_excel(output, index=False, engine='openpyxl')
    output.seek(0)
    return send_file(output, download_name="inventario.xlsx", as_attachment=True, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


@api.route('/tickets/export', methods=['GET'])
@jwt_required
def export_tickets_excel():
    tickets = Ticket.query.all()
    data = [ticket.serialize() for ticket in tickets]
    df = pd.DataFrame(data)
    output = BytesIO()
    df.to_excel(output, index=False, engine='openpyxl')
    output.seek(0)
    return send_file(output, download_name="tickets.xlsx", as_attachment=True, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
