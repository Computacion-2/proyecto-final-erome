#!/bin/bash
# Script para actualizar .env con valores de recursos AWS creados

set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ENV_FILE="../.env"

echo "=== Actualizando .env desde recursos AWS ==="
echo ""

# Verificar que existe .env
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠${NC} Archivo .env no existe, creándolo..."
    touch "$ENV_FILE"
fi

# Leer valores de archivos temporales si existen
if [ -f /tmp/s3-bucket-name.txt ]; then
    S3_BUCKET_NAME=$(cat /tmp/s3-bucket-name.txt)
    echo -e "${GREEN}✓${NC} S3 Bucket: $S3_BUCKET_NAME"
    
    # Actualizar o agregar S3_BUCKET_NAME
    if grep -q "^S3_BUCKET_NAME=" "$ENV_FILE"; then
        sed -i "s|^S3_BUCKET_NAME=.*|S3_BUCKET_NAME=$S3_BUCKET_NAME|" "$ENV_FILE"
    else
        echo "S3_BUCKET_NAME=$S3_BUCKET_NAME" >> "$ENV_FILE"
    fi
else
    echo -e "${YELLOW}⚠${NC} No se encontró nombre de bucket S3 en archivos temporales"
fi

# Intentar obtener endpoint de archivo temporal o directamente de AWS
if [ -f /tmp/rds-endpoint.txt ]; then
    DB_HOST=$(cat /tmp/rds-endpoint.txt)
elif [ -f /tmp/rds-setup3.log ]; then
    # Intentar extraer del log
    DB_HOST=$(grep -oP 'Endpoint\.Address["\s:]+[^"]+' /tmp/rds-setup3.log | tail -1 | awk '{print $NF}' || echo "")
fi

# Si aún no tenemos el endpoint, intentar obtenerlo directamente de AWS
if [ -z "$DB_HOST" ] || [ "$DB_HOST" == "None" ]; then
    echo "Obteniendo endpoint de RDS desde AWS..."
    DB_HOST=$(aws rds describe-db-instances \
        --db-instance-identifier pensamiento-computacional-db \
        --region us-east-1 \
        --query "DBInstances[0].Endpoint.Address" \
        --output text 2>/dev/null || echo "")
fi

if [ -n "$DB_HOST" ] && [ "$DB_HOST" != "None" ] && [ "$DB_HOST" != "" ]; then
    echo -e "${GREEN}✓${NC} RDS Endpoint: $DB_HOST"
    
    # Actualizar o agregar DB_HOST
    if grep -q "^DB_HOST=" "$ENV_FILE"; then
        sed -i "s|^DB_HOST=.*|DB_HOST=$DB_HOST|" "$ENV_FILE"
    else
        echo "DB_HOST=$DB_HOST" >> "$ENV_FILE"
    fi
else
    echo -e "${YELLOW}⚠${NC} No se encontró endpoint de RDS (la instancia puede estar aún creándose)"
fi

# Intentar obtener nombre de DB de archivo temporal o directamente de AWS
if [ -f /tmp/rds-dbname.txt ]; then
    DB_NAME=$(cat /tmp/rds-dbname.txt)
else
    DB_NAME=$(aws rds describe-db-instances \
        --db-instance-identifier pensamiento-computacional-db \
        --region us-east-1 \
        --query "DBInstances[0].DBName" \
        --output text 2>/dev/null || echo "pensamiento_computacional")
fi

if [ -n "$DB_NAME" ] && [ "$DB_NAME" != "None" ] && [ "$DB_NAME" != "" ]; then
    echo -e "${GREEN}✓${NC} Database Name: $DB_NAME"
    
    # Actualizar o agregar DB_NAME
    if grep -q "^DB_NAME=" "$ENV_FILE"; then
        sed -i "s|^DB_NAME=.*|DB_NAME=$DB_NAME|" "$ENV_FILE"
    else
        echo "DB_NAME=$DB_NAME" >> "$ENV_FILE"
    fi
else
    echo -e "${YELLOW}⚠${NC} No se encontró nombre de base de datos"
fi

if [ -f /tmp/rds-password.txt ]; then
    DB_PASSWORD=$(cat /tmp/rds-password.txt)
    echo -e "${GREEN}✓${NC} Database Password: ${DB_PASSWORD:0:5}..."
    
    # Actualizar o agregar DB_PASSWORD
    if grep -q "^DB_PASSWORD=" "$ENV_FILE"; then
        sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|" "$ENV_FILE"
    else
        echo "DB_PASSWORD=$DB_PASSWORD" >> "$ENV_FILE"
    fi
else
    echo -e "${YELLOW}⚠${NC} No se encontró password de RDS en archivos temporales"
fi

# Asegurar que DB_PORT está configurado
if ! grep -q "^DB_PORT=" "$ENV_FILE"; then
    echo "DB_PORT=5432" >> "$ENV_FILE"
    echo -e "${GREEN}✓${NC} DB_PORT agregado"
fi

# Asegurar que DB_USER está configurado
if ! grep -q "^DB_USER=" "$ENV_FILE"; then
    echo "DB_USER=postgres" >> "$ENV_FILE"
    echo -e "${GREEN}✓${NC} DB_USER agregado"
fi

# Validar que todas las variables están configuradas
echo ""
echo "=== Validación de variables ==="
MISSING_VARS=()

if ! grep -q "^S3_BUCKET_NAME=" "$ENV_FILE" || [ -z "$(grep "^S3_BUCKET_NAME=" "$ENV_FILE" | cut -d'=' -f2)" ]; then
    MISSING_VARS+=("S3_BUCKET_NAME")
fi

if ! grep -q "^DB_HOST=" "$ENV_FILE" || [ -z "$(grep "^DB_HOST=" "$ENV_FILE" | cut -d'=' -f2)" ]; then
    MISSING_VARS+=("DB_HOST")
fi

if ! grep -q "^DB_NAME=" "$ENV_FILE" || [ -z "$(grep "^DB_NAME=" "$ENV_FILE" | cut -d'=' -f2)" ]; then
    MISSING_VARS+=("DB_NAME")
fi

if ! grep -q "^DB_PASSWORD=" "$ENV_FILE" || [ -z "$(grep "^DB_PASSWORD=" "$ENV_FILE" | cut -d'=' -f2)" ]; then
    MISSING_VARS+=("DB_PASSWORD")
fi

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Todas las variables están configuradas"
else
    echo -e "${YELLOW}⚠${NC} Variables faltantes: ${MISSING_VARS[*]}"
    echo "Ejecuta los scripts de creación de recursos primero"
fi

echo ""
echo -e "${GREEN}=== .env actualizado ===${NC}"
echo "Archivo: $ENV_FILE"

