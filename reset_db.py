from sqlalchemy import inspect
from app import app
from api.models import db, Requisition
import os
import sys

# Añadir el directorio src al path de Python
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

# Importar las dependencias

with app.app_context():
    # Crear todas las tablas (esto conservará las tablas existentes y añadirá las nuevas)
    db.create_all()
    print("Base de datos actualizada exitosamente.")

    # Verificar si la tabla requisition se creó correctamente
    inspector = inspect(db.engine)
    if 'requisition' in inspector.get_table_names():
        print("Tabla 'requisition' creada correctamente.")
    else:
        print("Error: La tabla 'requisition' no se creó.")
