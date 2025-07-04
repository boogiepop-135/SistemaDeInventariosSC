"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, send_file
from api.models import db, User, Item, Ticket, Requisition
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
import pytz
import pandas as pd
from io import BytesIO
import os
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
import base64
import requests

api = Blueprint('api', __name__)

# Permitir CORS solo para Netlify y tu dominio personalizado
CORS(api, resources={r"/api/*": {"origins": [
    "https://soporteches.online",
    "https://soporteches.netlify.app"
]}})

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
@api.route("/items", methods=["GET"])
@jwt_required
def get_items():
    try:
        items = Item.query.all()
        for item in items:
            # Esto mostrará en consola si hay error en algún item
            print(item.serialize())
        return jsonify([item.serialize() for item in items]), 200
    except Exception as e:
        import traceback
        print("Error en /api/items:", traceback.format_exc())
        return jsonify({"message": str(e)}), 500

    return jsonify(item.serialize()), 200


@api.route("/items", methods=["POST"])
@jwt_required
def create_item():
    try:
        data = request.get_json()
        image_data = data.pop('image', None)

        # Crear el item primero
        item = Item(**data)

        # Si hay imagen, subirla a GitHub
        if image_data and image_data.startswith('data:image'):
            try:
                # Extraer base64 de la imagen
                base64_content = image_data.split(',')[1]
                image_bytes = base64.b64decode(base64_content)

                # Configurar GitHub
                github_token = os.getenv('GITHUB_TOKEN')
                repo = os.getenv('GITHUB_REPO')
                image_name = f"item_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
                path = f"images/{image_name}"

                # Subir a GitHub
                url = f"https://api.github.com/repos/{repo}/contents/{path}"
                headers = {
                    "Authorization": f"token {github_token}",
                    "Accept": "application/vnd.github.v3+json"
                }

                payload = {
                    "message": f"Add image for item {item.name}",
                    "content": base64.b64encode(image_bytes).decode('utf-8')
                }

                response = requests.put(url, json=payload, headers=headers)
                if response.status_code in [201, 200]:
                    item.image_url = f"https://raw.githubusercontent.com/{repo}/main/{path}"

            except Exception as e:
                print(f"Error subiendo imagen: {str(e)}")

        db.session.add(item)
        db.session.commit()
        return jsonify(item.serialize()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 400


@api.route('/items/<int:item_id>', methods=['GET'])
@jwt_required
def get_item(item_id):
    item = Item.query.get(item_id)
    if not item:
        return jsonify({"msg": "Item not found"}), 404
    return jsonify(item.serialize()), 200


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
    try:
        tickets = Ticket.query.order_by(Ticket.created_at.desc()).all()
        return jsonify([ticket.serialize() for ticket in tickets]), 200
    except Exception as e:
        import traceback
        print("Error en /api/tickets:", traceback.format_exc())
        return jsonify({"message": str(e)}), 500


@api.route('/tickets/<int:ticket_id>', methods=['GET'])
@jwt_required
def get_ticket(ticket_id):
    try:
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return jsonify({"msg": "Ticket no encontrado"}), 404
        return jsonify(ticket.serialize()), 200
    except Exception as e:
        return jsonify({"msg": str(e)}), 500


@api.route('/tickets', methods=['POST'])
@jwt_required
def create_ticket():
    try:
        if not request.is_json:
            return jsonify({"msg": "El Content-Type debe ser application/json"}), 415
        data = request.json

        # Debug: imprimir los datos recibidos
        print("Datos recibidos para crear ticket:", data)

        # Validar campos requeridos con menos restricciones
        description = data.get("description")
        if description is None:
            return jsonify({"msg": "La descripción es requerida"}), 400

        # Convertir a string y limpiar espacios
        description = str(description).strip(
        ) if description is not None else ""
        if description == "":
            return jsonify({"msg": "La descripción no puede estar vacía"}), 400

        # Si no se recibe 'title', genera uno automático
        title = data.get("title")
        if not title or str(title).strip() == "":
            title = f"Ticket {datetime.now(pytz.timezone('America/Mexico_City')).strftime('%Y-%m-%d %H:%M:%S')}"

        ticket = Ticket(
            title=str(title).strip(),
            description=description,
            item_id=data.get("item_id"),
            status=data.get("status", "pendiente"),
            created_by=data.get("created_by"),
            branch=data.get("branch"),
            department=data.get("department"),
            priority=data.get("priority", "normal"),
            comments=data.get("comments"),
            incident_type=data.get("incident_type"),
            created_at=datetime.now(pytz.timezone(
                "America/Mexico_City")).strftime("%Y-%m-%d %H:%M:%S")
        )
        db.session.add(ticket)
        db.session.commit()
        return jsonify(ticket.serialize()), 201
    except Exception as e:
        db.session.rollback()
        print("Error completo al crear ticket:", str(e))
        import traceback
        print("Traceback:", traceback.format_exc())
        return jsonify({"msg": str(e)}), 400


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
    ticket.incident_type = data.get("incident_type", ticket.incident_type)
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


# Ejemplo de uso: != "admin":
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


# Rutas para requisiciones
@api.route('/requisitions', methods=['GET'])
@jwt_required
def get_requisitions():
    try:
        requisitions = Requisition.query.order_by(
            Requisition.created_at.desc()).all()
        return jsonify([req.serialize() for req in requisitions]), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@api.route('/requisitions/<int:requisition_id>', methods=['GET'])
@jwt_required
def get_requisition(requisition_id):
    try:
        requisition = Requisition.query.get(requisition_id)
        if not requisition:
            return jsonify({"msg": "Requisición no encontrada"}), 404
        return jsonify(requisition.serialize()), 200
    except Exception as e:
        return jsonify({"msg": str(e)}), 500


@api.route('/requisitions', methods=['POST'])
@jwt_required
def create_requisition():
    try:
        if not request.is_json:
            return jsonify({"msg": "El Content-Type debe ser application/json"}), 415
        data = request.json

        # Validar campos requeridos
        description = data.get("description")
        if description is None or str(description).strip() == "":
            return jsonify({"msg": "La descripción es requerida"}), 400

        # Generar título automático si no se proporciona
        title = data.get("title")
        if not title or str(title).strip() == "":
            title = f"Requisición {datetime.now(pytz.timezone('America/Mexico_City')).strftime('%Y-%m-%d %H:%M:%S')}"

        requisition = Requisition(
            title=str(title).strip(),
            description=str(description).strip(),
            requested_by=data.get("requested_by"),
            department=data.get("department"),
            status=data.get("status", "pendiente"),
            priority=data.get("priority", "normal"),
            comments=data.get("comments"),
            items=data.get("items"),
            approval_by=data.get("approval_by"),
            expected_date=data.get("expected_date"),
            created_at=datetime.now(pytz.timezone(
                "America/Mexico_City")).strftime("%Y-%m-%d %H:%M:%S")
        )
        db.session.add(requisition)
        db.session.commit()
        return jsonify(requisition.serialize()), 201
    except Exception as e:
        db.session.rollback()
        print("Error completo al crear requisición:", str(e))
        import traceback
        print("Traceback:", traceback.format_exc())
        return jsonify({"msg": str(e)}), 400


@api.route('/requisitions/<int:requisition_id>', methods=['PUT'])
@jwt_required_role(["admin"])
def update_requisition(requisition_id):
    requisition = Requisition.query.get(requisition_id)
    if not requisition:
        return jsonify({"msg": "Requisición no encontrada"}), 404
    data = request.json
    requisition.title = data.get("title", requisition.title)
    requisition.description = data.get("description", requisition.description)
    requisition.requested_by = data.get(
        "requested_by", requisition.requested_by)
    requisition.department = data.get("department", requisition.department)
    requisition.status = data.get("status", requisition.status)
    requisition.priority = data.get("priority", requisition.priority)
    requisition.comments = data.get("comments", requisition.comments)
    requisition.items = data.get("items", requisition.items)
    requisition.approval_by = data.get("approval_by", requisition.approval_by)
    requisition.expected_date = data.get(
        "expected_date", requisition.expected_date)
    db.session.commit()
    return jsonify(requisition.serialize()), 200


@api.route('/requisitions/<int:requisition_id>', methods=['DELETE'])
@jwt_required_role(["admin"])
def delete_requisition(requisition_id):
    requisition = Requisition.query.get(requisition_id)
    if not requisition:
        return jsonify({"msg": "Requisición no encontrada"}), 404
    db.session.delete(requisition)
    db.session.commit()
    return jsonify({"msg": "Requisición eliminada"}), 200
    return jsonify({"msg": "Requisición no encontrada"}), 404
    db.session.delete(requisition)
    db.session.commit()
    return jsonify({"msg": "Requisición eliminada"}), 200
