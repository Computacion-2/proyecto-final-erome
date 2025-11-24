#!/bin/bash
# Script principal para crear toda la infraestructura AWS

set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Setup de Infraestructura AWS                          ║${NC}"
echo -e "${BLUE}║  Pensamiento Computacional                             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}✗${NC} AWS CLI no está instalado"
    echo "Instala AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Verificar credenciales
echo "Verificando credenciales de AWS..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}✗${NC} No se pueden verificar las credenciales de AWS"
    echo "Configura tus credenciales con: aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region || echo "us-east-1")
echo -e "${GREEN}✓${NC} Credenciales verificadas"
echo "   Account ID: $ACCOUNT_ID"
echo "   Región: $REGION"
echo ""

# Cargar variables de entorno
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
    echo -e "${GREEN}✓${NC} Variables de entorno cargadas desde .env"
else
    echo -e "${YELLOW}⚠${NC} Archivo .env no encontrado, usando valores por defecto"
fi

export AWS_REGION=${AWS_REGION:-$REGION}

# Menú de opciones
echo "Selecciona qué recursos crear:"
echo "1) Solo S3 Bucket"
echo "2) Solo RDS Instance"
echo "3) Ambos (S3 + RDS)"
echo "4) Solo actualizar .env desde recursos existentes"
read -p "Opción [3]: " OPTION
OPTION=${OPTION:-3}

case $OPTION in
    1)
        echo ""
        echo "=== Creando S3 Bucket ==="
        ./create-s3-bucket.sh
        echo ""
        echo "=== Actualizando .env ==="
        ./update-env-from-aws.sh
        ;;
    2)
        echo ""
        echo "=== Creando RDS Instance ==="
        ./create-rds-instance.sh
        echo ""
        echo "=== Actualizando .env ==="
        ./update-env-from-aws.sh
        ;;
    3)
        echo ""
        echo "=== Creando S3 Bucket ==="
        ./create-s3-bucket.sh
        echo ""
        echo "=== Creando RDS Instance ==="
        ./create-rds-instance.sh
        echo ""
        echo "=== Actualizando .env ==="
        ./update-env-from-aws.sh
        ;;
    4)
        echo ""
        echo "=== Actualizando .env ==="
        ./update-env-from-aws.sh
        ;;
    *)
        echo -e "${RED}✗${NC} Opción inválida"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Resumen de Recursos Creados                            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Mostrar resumen
if [ -f /tmp/s3-bucket-name.txt ]; then
    S3_BUCKET=$(cat /tmp/s3-bucket-name.txt)
    echo -e "${GREEN}✓${NC} S3 Bucket: $S3_BUCKET"
    echo "   URL: https://s3.console.aws.amazon.com/s3/buckets/$S3_BUCKET"
fi

if [ -f /tmp/rds-endpoint.txt ]; then
    RDS_ENDPOINT=$(cat /tmp/rds-endpoint.txt)
    RDS_DBNAME=$(cat /tmp/rds-dbname.txt 2>/dev/null || echo "pensamiento_computacional")
    echo -e "${GREEN}✓${NC} RDS Instance: $RDS_ENDPOINT"
    echo "   Database: $RDS_DBNAME"
    echo "   URL: https://console.aws.amazon.com/rds/home?region=$REGION#database:id=$RDS_ENDPOINT"
fi

echo ""
echo -e "${GREEN}=== Infraestructura configurada exitosamente ===${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Revisa el archivo .env para verificar las configuraciones"
echo "2. Activa los perfiles de Spring Boot:"
echo "   export SPRING_PROFILES_ACTIVE=prod,aws"
echo "3. Inicia la aplicación para probar la conexión"
echo ""
echo "Para más información, consulta DEPLOY-AWS.md"

