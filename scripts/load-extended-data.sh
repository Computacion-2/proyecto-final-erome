#!/bin/bash

# Script para cargar datos extendidos en RDS
# Este script ejecuta el archivo data-extended.sql en la base de datos RDS

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Cargar Datos Extendidos en RDS ===${NC}"

# Cargar variables de entorno
if [ -f .env ]; then
    echo "Cargando variables de entorno desde .env..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}Error: Archivo .env no encontrado${NC}"
    exit 1
fi

# Verificar variables necesarias
if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}Error: Variables de base de datos no configuradas en .env${NC}"
    echo "Se requieren: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD"
    exit 1
fi

# Ruta al archivo SQL
SQL_FILE="pensamientoComputacional/src/main/resources/data-extended.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}Error: Archivo SQL no encontrado: $SQL_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}Conectando a RDS: $DB_HOST/$DB_NAME${NC}"
echo -e "${YELLOW}Usuario: $DB_USER${NC}"

# Intentar ejecutar con psql si está disponible
if command -v psql &> /dev/null; then
    echo -e "${YELLOW}Usando psql...${NC}"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Datos extendidos cargados exitosamente${NC}"
    else
        echo -e "${RED}✗ Error al cargar datos extendidos${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}psql no está instalado. Intentando con Python...${NC}"
    # Intentar usar el script Python alternativo
    if command -v python3 &> /dev/null; then
        python3 "$(dirname "$0")/load-extended-data.py"
        if [ $? -eq 0 ]; then
            exit 0
        fi
    fi
    
    # Si Python falló, intentar con Java
    echo -e "${YELLOW}Intentando con Java...${NC}"
    if command -v java &> /dev/null && command -v javac &> /dev/null; then
        "$(dirname "$0")/load-extended-data-java.sh"
        exit $?
    else
        echo -e "${RED}Error: psql no está instalado y no hay alternativas disponibles${NC}"
        echo -e "${YELLOW}Opciones:${NC}"
        echo -e "  1. Instalar psql: sudo pacman -S postgresql (Arch) o sudo apt install postgresql-client (Ubuntu)"
        echo -e "  2. Instalar psycopg2: pip install psycopg2-binary"
        echo -e "  3. Usar el script Java directamente: ./scripts/load-extended-data-java.sh"
        exit 1
    fi
fi

echo -e "${GREEN}=== Proceso completado ===${NC}"

