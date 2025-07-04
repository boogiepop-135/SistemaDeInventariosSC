#!/bin/bash
# Script para mantener el backend ejecutándose en segundo plano

cd /workspaces/SistemaDeInventariosSC

# Matar cualquier proceso que esté usando el puerto 5000
echo "Verificando si el puerto 5000 está en uso..."
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Liberando puerto 5000..."
    sudo kill -9 $(lsof -t -i:5000) || true
    sleep 1
fi

# Activar entorno virtual
source /home/vscode/.local/share/virtualenvs/SistemaDeInventariosSC-*/bin/activate
export FLASK_APP=src/app.py
export FLASK_DEBUG=1

# Ejecutar en puerto 5000
echo "Iniciando backend en puerto 5000..."
python -m flask run --host=0.0.0.0 --port=5000
