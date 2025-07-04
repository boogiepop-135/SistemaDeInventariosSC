#!/bin/bash
# Este script inicia el backend en segundo plano

# Detiene cualquier proceso de Flask anterior
pkill -f "python -m flask run" || true
sleep 1

# Inicia el backend en segundo plano
nohup ./run_backend.sh > backend.log 2>&1 &

# Imprime información útil
echo "Backend iniciado en segundo plano con PID: $!"
echo "Para ver los logs: tail -f backend.log"
echo "Para detener: pkill -f 'python -m flask run'"
if grep -q "Running on http://0.0.0.0:5001" backend.log; then
    echo "Backend iniciado en segundo plano con PID: $pid en puerto 5001"
    echo "URL: https://$(gp url 5001 | cut -d/ -f3)"
else
    echo "Backend iniciado en segundo plano con PID: $pid en puerto 5000"
    echo "URL: https://$(gp url 5000 | cut -d/ -f3)"
fi

echo "Para ver los logs en tiempo real: tail -f backend.log"
echo "Para detener el servidor: kill \$(pgrep -f 'python -m flask run')"
