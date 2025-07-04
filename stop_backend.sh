#!/bin/bash
# Este script detiene el backend que se ejecuta en segundo plano

# Busca y detiene el proceso de Flask
pkill -f "python -m flask run"
echo "Backend detenido."
