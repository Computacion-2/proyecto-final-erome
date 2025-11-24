#!/bin/bash
# Script para cargar variables de entorno desde .env

if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "Variables de entorno cargadas desde .env"
else
    echo "Error: Archivo .env no encontrado"
    exit 1
fi

