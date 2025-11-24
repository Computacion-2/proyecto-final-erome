#!/bin/bash
# Script de validación de configuración RDS y S3

echo "=== Validación de Configuración RDS y S3 ==="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar variable
check_var() {
    if [ -z "${!1}" ]; then
        echo -e "${RED}✗${NC} $1 no está configurada"
        return 1
    else
        echo -e "${GREEN}✓${NC} $1 está configurada"
        return 0
    fi
}

# Cargar variables de entorno si existe .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✓${NC} Archivo .env encontrado y cargado"
else
    echo -e "${YELLOW}⚠${NC} Archivo .env no encontrado, usando variables del sistema"
fi

echo ""
echo "=== Variables de RDS ==="
RDS_OK=true
check_var "DB_HOST" || RDS_OK=false
check_var "DB_PORT" || RDS_OK=false
check_var "DB_NAME" || RDS_OK=false
check_var "DB_USER" || RDS_OK=false
check_var "DB_PASSWORD" || RDS_OK=false

echo ""
echo "=== Variables de AWS/S3 ==="
S3_OK=true
check_var "AWS_REGION" || S3_OK=false
check_var "AWS_ACCESS_KEY_ID" || S3_OK=false
check_var "AWS_SECRET_ACCESS_KEY" || S3_OK=false
check_var "S3_BUCKET_NAME" || S3_OK=false

echo ""
echo "=== Archivos de Configuración ==="
if [ -f "pensamientoComputacional/src/main/resources/application-prod.properties" ]; then
    echo -e "${GREEN}✓${NC} application-prod.properties existe"
else
    echo -e "${RED}✗${NC} application-prod.properties no existe"
    RDS_OK=false
fi

if [ -f "pensamientoComputacional/src/main/resources/application-aws.properties" ]; then
    echo -e "${GREEN}✓${NC} application-aws.properties existe"
else
    echo -e "${RED}✗${NC} application-aws.properties no existe"
    S3_OK=false
fi

echo ""
echo "=== Dependencias ==="
if grep -q "postgresql" pensamientoComputacional/pom.xml; then
    echo -e "${GREEN}✓${NC} PostgreSQL dependency encontrada"
else
    echo -e "${RED}✗${NC} PostgreSQL dependency no encontrada"
    RDS_OK=false
fi

if grep -q "s3" pensamientoComputacional/pom.xml; then
    echo -e "${GREEN}✓${NC} AWS S3 SDK dependency encontrada"
else
    echo -e "${RED}✗${NC} AWS S3 SDK dependency no encontrada"
    S3_OK=false
fi

echo ""
echo "=== Servicios ==="
if [ -f "pensamientoComputacional/src/main/java/com/example/pensamientoComputacional/service/S3Service.java" ]; then
    echo -e "${GREEN}✓${NC} S3Service implementado"
else
    echo -e "${RED}✗${NC} S3Service no encontrado"
    S3_OK=false
fi

if [ -f "pensamientoComputacional/src/main/java/com/example/pensamientoComputacional/controller/rest/ImageUploadRestController.java" ]; then
    echo -e "${GREEN}✓${NC} ImageUploadRestController implementado"
else
    echo -e "${RED}✗${NC} ImageUploadRestController no encontrado"
    S3_OK=false
fi

echo ""
echo "=== Resumen ==="
if [ "$RDS_OK" = true ]; then
    echo -e "${GREEN}✓${NC} Configuración RDS: COMPLETA"
else
    echo -e "${RED}✗${NC} Configuración RDS: INCOMPLETA"
fi

if [ "$S3_OK" = true ]; then
    echo -e "${GREEN}✓${NC} Configuración S3: COMPLETA"
else
    echo -e "${RED}✗${NC} Configuración S3: INCOMPLETA"
fi

echo ""
echo "=== Validación de Recursos AWS ==="
if command -v aws &> /dev/null && aws sts get-caller-identity &> /dev/null; then
    REGION=${AWS_REGION:-us-east-1}
    
    # Validar S3 Bucket
    if [ -n "$S3_BUCKET_NAME" ] && [ "$S3_BUCKET_NAME" != "" ]; then
        if aws s3api head-bucket --bucket "$S3_BUCKET_NAME" --region "$REGION" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Bucket S3 existe y es accesible: $S3_BUCKET_NAME"
            
            # Verificar CORS
            CORS=$(aws s3api get-bucket-cors --bucket "$S3_BUCKET_NAME" --region "$REGION" 2>/dev/null || echo "")
            if [ -n "$CORS" ]; then
                echo -e "${GREEN}✓${NC} CORS configurado en S3"
            else
                echo -e "${YELLOW}⚠${NC} CORS no configurado en S3"
            fi
        else
            echo -e "${RED}✗${NC} Bucket S3 no existe o no es accesible: $S3_BUCKET_NAME"
        fi
    else
        echo -e "${YELLOW}⚠${NC} S3_BUCKET_NAME no está configurado"
    fi
    
    # Validar RDS
    if [ -n "$DB_HOST" ] && [ "$DB_HOST" != "" ]; then
        DB_INSTANCE_ID="pensamiento-computacional-db"
        RDS_STATUS=$(aws rds describe-db-instances \
            --db-instance-identifier "$DB_INSTANCE_ID" \
            --region "$REGION" \
            --query "DBInstances[0].DBInstanceStatus" \
            --output text 2>/dev/null || echo "None")
        
        if [ "$RDS_STATUS" != "None" ] && [ -n "$RDS_STATUS" ]; then
            echo -e "${GREEN}✓${NC} Instancia RDS existe con estado: $RDS_STATUS"
            echo "   Endpoint: $DB_HOST"
            
            # Intentar conexión (requiere psql)
            if command -v psql &> /dev/null && [ -n "$DB_PASSWORD" ]; then
                if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &>/dev/null; then
                    echo -e "${GREEN}✓${NC} Conexión a RDS exitosa"
                else
                    echo -e "${YELLOW}⚠${NC} No se pudo conectar a RDS (puede ser normal si psql no está instalado)"
                fi
            fi
        else
            echo -e "${YELLOW}⚠${NC} Instancia RDS no encontrada o no accesible"
        fi
    else
        echo -e "${YELLOW}⚠${NC} DB_HOST no está configurado"
    fi
else
    echo -e "${YELLOW}⚠${NC} AWS CLI no configurado, omitiendo validación de recursos AWS"
fi

echo ""
echo "=== Instrucciones ==="
echo "1. Completa las variables faltantes en el archivo .env"
echo "2. Activa los perfiles de Spring Boot:"
echo "   export SPRING_PROFILES_ACTIVE=prod,aws"
echo "3. Reinicia la aplicación"
echo ""
echo "Para crear recursos AWS, ejecuta:"
echo "   ./scripts/setup-aws-infrastructure.sh"
echo ""
echo "Para más información, consulta CONFIGURACION.md y DEPLOY-AWS.md"

