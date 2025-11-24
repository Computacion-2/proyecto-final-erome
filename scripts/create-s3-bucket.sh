#!/bin/bash
# Script para crear bucket S3 para imágenes del proyecto

set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Cargar variables de entorno
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

REGION=${AWS_REGION:-us-east-1}
TIMESTAMP=$(date +%s)
BUCKET_NAME="pensamiento-computacional-images-${TIMESTAMP}"

echo "=== Creando Bucket S3 ==="
echo "Región: $REGION"
echo "Nombre del bucket: $BUCKET_NAME"
echo ""

# Verificar si AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo -e "${RED}✗${NC} AWS CLI no está instalado"
    exit 1
fi

# Verificar credenciales
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}✗${NC} No se pueden verificar las credenciales de AWS"
    exit 1
fi

# Crear bucket
echo "Creando bucket S3..."
if aws s3api create-bucket \
    --bucket "$BUCKET_NAME" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Bucket creado exitosamente"
else
    # Si falla, puede ser porque el bucket ya existe o es una región sin LocationConstraint
    if aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --region "$REGION" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Bucket creado exitosamente (sin LocationConstraint)"
    else
        echo -e "${YELLOW}⚠${NC} Intentando verificar si el bucket ya existe..."
        if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
            echo -e "${YELLOW}⚠${NC} El bucket ya existe, usando el existente"
        else
            echo -e "${RED}✗${NC} Error al crear el bucket"
            exit 1
        fi
    fi
fi

# Configurar CORS
echo "Configurando CORS..."
CORS_CONFIG='{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}'

aws s3api put-bucket-cors \
    --bucket "$BUCKET_NAME" \
    --cors-configuration "$CORS_CONFIG" \
    --region "$REGION"

echo -e "${GREEN}✓${NC} CORS configurado"

# Deshabilitar Block Public Access para permitir acceso público a imágenes
echo "Configurando Block Public Access..."
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
    --region "$REGION" 2>/dev/null || {
    echo -e "${YELLOW}⚠${NC} No se pudo deshabilitar Block Public Access (puede requerir permisos adicionales)"
}

# Configurar política de bucket para acceso público a imágenes de perfil
echo "Configurando política de bucket..."
BUCKET_POLICY='{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::'"$BUCKET_NAME"'/profile-photos/*"
        }
    ]
}'

echo "$BUCKET_POLICY" > /tmp/bucket-policy.json
if aws s3api put-bucket-policy \
    --bucket "$BUCKET_NAME" \
    --policy file:///tmp/bucket-policy.json \
    --region "$REGION" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Política de bucket configurada"
else
    echo -e "${YELLOW}⚠${NC} No se pudo configurar la política pública (Block Public Access puede estar habilitado)"
    echo "   Las imágenes se accederán mediante URLs presignadas en lugar de acceso público directo"
fi

rm /tmp/bucket-policy.json

# Configurar versionado (opcional)
echo "Configurando versionado..."
aws s3api put-bucket-versioning \
    --bucket "$BUCKET_NAME" \
    --versioning-configuration Status=Enabled \
    --region "$REGION"

echo -e "${GREEN}✓${NC} Versionado habilitado"

# Configurar encriptación
echo "Configurando encriptación..."
aws s3api put-bucket-encryption \
    --bucket "$BUCKET_NAME" \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }]
    }' \
    --region "$REGION"

echo -e "${GREEN}✓${NC} Encriptación configurada"

# Validar que el bucket existe
echo ""
echo "Validando bucket..."
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Bucket validado exitosamente"
else
    echo -e "${RED}✗${NC} Error al validar el bucket"
    exit 1
fi

# Probar upload de archivo de prueba
echo "Probando upload..."
echo "test" > /tmp/test-upload.txt
if aws s3 cp /tmp/test-upload.txt "s3://$BUCKET_NAME/test-upload.txt" --region "$REGION" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Upload de prueba exitoso"
    aws s3 rm "s3://$BUCKET_NAME/test-upload.txt" --region "$REGION" 2>/dev/null
    rm /tmp/test-upload.txt
else
    echo -e "${YELLOW}⚠${NC} No se pudo probar el upload (puede ser normal)"
    rm /tmp/test-upload.txt
fi

echo ""
echo -e "${GREEN}=== Bucket S3 creado exitosamente ===${NC}"
echo "Nombre del bucket: $BUCKET_NAME"
echo "Región: $REGION"
echo ""
echo "Para actualizar el .env, ejecuta:"
echo "  export S3_BUCKET_NAME=$BUCKET_NAME"
echo "  echo \"S3_BUCKET_NAME=$BUCKET_NAME\" >> ../.env"

# Guardar nombre del bucket en archivo temporal para uso en otros scripts
echo "$BUCKET_NAME" > /tmp/s3-bucket-name.txt

