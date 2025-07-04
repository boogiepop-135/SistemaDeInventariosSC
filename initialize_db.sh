#!/bin/bash

cd /workspaces/SistemaDeInventariosSC

echo "Activando entorno virtual..."
source /home/vscode/.local/share/virtualenvs/SistemaDeInventariosSC-*/bin/activate

echo "Configurando variables de entorno..."
export FLASK_APP=src/app.py
export FLASK_DEBUG=1

echo "Eliminando migraciones anteriores..."
rm -rf migrations/
[ -f src/dev.db ] && rm src/dev.db

echo "Inicializando migraciones..."
flask db init

echo "Creando migración inicial..."
flask db migrate -m "initial schema"

echo "Aplicando migración..."
flask db upgrade

echo "Base de datos inicializada correctamente"
