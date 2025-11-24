#!/bin/bash
# Script para eliminar recursos AWS creados (CUIDADO: Destructivo)

set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║  ADVERTENCIA: ELIMINACIÓN DE RECURSOS AWS               ║${NC}"
echo -e "${RED}║  Esta acción es IRREVERSIBLE                             ║${NC}"
echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Este script eliminará:"
echo "  - Bucket S3 y todo su contenido"
echo "  - Instancia RDS (se perderán todos los datos)"
echo "  - Security Groups relacionados"
echo "  - Subnet Groups relacionados"
echo ""
read -p "¿Estás seguro de que quieres continuar? (escribe 'ELIMINAR' para confirmar): " CONFIRM

if [ "$CONFIRM" != "ELIMINAR" ]; then
    echo -e "${YELLOW}Operación cancelada${NC}"
    exit 0
fi

# Cargar variables de entorno
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

REGION=${AWS_REGION:-us-east-1}

echo ""
echo "=== Eliminando Recursos ==="
echo ""

# Eliminar bucket S3
if [ -f /tmp/s3-bucket-name.txt ]; then
    BUCKET_NAME=$(cat /tmp/s3-bucket-name.txt)
    echo "Eliminando bucket S3: $BUCKET_NAME"
    
    # Vaciar bucket primero
    if aws s3 ls "s3://$BUCKET_NAME" 2>/dev/null; then
        echo "Vaciando bucket..."
        aws s3 rm "s3://$BUCKET_NAME" --recursive --region "$REGION" 2>/dev/null || true
    fi
    
    # Eliminar bucket
    if aws s3api delete-bucket --bucket "$BUCKET_NAME" --region "$REGION" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Bucket S3 eliminado"
    else
        echo -e "${YELLOW}⚠${NC} Error al eliminar bucket (puede no existir)"
    fi
else
    echo -e "${YELLOW}⚠${NC} No se encontró información del bucket S3"
fi

# Eliminar instancia RDS
DB_INSTANCE_ID="pensamiento-computacional-db"
echo "Eliminando instancia RDS: $DB_INSTANCE_ID"

# Verificar si existe
EXISTS=$(aws rds describe-db-instances \
    --db-instance-identifier "$DB_INSTANCE_ID" \
    --region "$REGION" \
    --query "DBInstances[0].DBInstanceStatus" \
    --output text 2>/dev/null || echo "None")

if [ "$EXISTS" != "None" ] && [ -n "$EXISTS" ]; then
    echo "La instancia existe con estado: $EXISTS"
    
    # Eliminar snapshot final (opcional)
    read -p "¿Crear snapshot final antes de eliminar? (s/N): " CREATE_SNAPSHOT
    if [ "$CREATE_SNAPSHOT" = "s" ] || [ "$CREATE_SNAPSHOT" = "S" ]; then
        SNAPSHOT_ID="${DB_INSTANCE_ID}-final-$(date +%s)"
        echo "Creando snapshot: $SNAPSHOT_ID"
        aws rds create-db-snapshot \
            --db-instance-identifier "$DB_INSTANCE_ID" \
            --db-snapshot-identifier "$SNAPSHOT_ID" \
            --region "$REGION" 2>/dev/null || echo -e "${YELLOW}⚠${NC} Error al crear snapshot"
    fi
    
    # Eliminar instancia (sin snapshot final automático)
    echo "Eliminando instancia RDS (esto puede tomar varios minutos)..."
    aws rds delete-db-instance \
        --db-instance-identifier "$DB_INSTANCE_ID" \
        --skip-final-snapshot \
        --region "$REGION" 2>/dev/null && {
        echo -e "${GREEN}✓${NC} Instancia RDS eliminada"
        echo "Esperando a que la eliminación se complete..."
        aws rds wait db-instance-deleted \
            --db-instance-identifier "$DB_INSTANCE_ID" \
            --region "$REGION" 2>/dev/null || echo -e "${YELLOW}⚠${NC} La instancia se está eliminando en segundo plano"
    } || {
        echo -e "${YELLOW}⚠${NC} Error al eliminar instancia (puede no existir o estar en proceso)"
    }
else
    echo -e "${YELLOW}⚠${NC} La instancia RDS no existe"
fi

# Eliminar Subnet Group
SUBNET_GROUP_NAME="pensamiento-computacional-subnet-group"
echo "Eliminando DB Subnet Group: $SUBNET_GROUP_NAME"
if aws rds delete-db-subnet-group \
    --db-subnet-group-name "$SUBNET_GROUP_NAME" \
    --region "$REGION" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Subnet Group eliminado"
else
    echo -e "${YELLOW}⚠${NC} Subnet Group no existe o ya fue eliminado"
fi

# Eliminar Security Group (solo si no está en uso)
SG_NAME="pensamiento-computacional-rds-sg"
echo "Verificando Security Group: $SG_NAME"
SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=$SG_NAME" \
    --query "SecurityGroups[0].GroupId" \
    --output text \
    --region "$REGION" 2>/dev/null || echo "")

if [ -n "$SG_ID" ] && [ "$SG_ID" != "None" ]; then
    read -p "¿Eliminar Security Group $SG_NAME? (s/N): " DELETE_SG
    if [ "$DELETE_SG" = "s" ] || [ "$DELETE_SG" = "S" ]; then
        # Eliminar reglas primero
        aws ec2 describe-security-groups \
            --group-ids "$SG_ID" \
            --region "$REGION" \
            --query "SecurityGroups[0].IpPermissions" \
            --output json > /tmp/sg-rules.json 2>/dev/null || true
        
        if [ -s /tmp/sg-rules.json ] && [ "$(cat /tmp/sg-rules.json)" != "[]" ]; then
            echo "Eliminando reglas del Security Group..."
            aws ec2 revoke-security-group-ingress \
                --group-id "$SG_ID" \
                --ip-permissions file:///tmp/sg-rules.json \
                --region "$REGION" 2>/dev/null || true
        fi
        
        # Eliminar Security Group
        if aws ec2 delete-security-group --group-id "$SG_ID" --region "$REGION" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Security Group eliminado"
        else
            echo -e "${YELLOW}⚠${NC} No se pudo eliminar Security Group (puede estar en uso)"
        fi
        
        rm -f /tmp/sg-rules.json
    fi
fi

# Limpiar archivos temporales
rm -f /tmp/s3-bucket-name.txt
rm -f /tmp/rds-endpoint.txt
rm -f /tmp/rds-dbname.txt
rm -f /tmp/rds-password.txt

echo ""
echo -e "${GREEN}=== Limpieza completada ===${NC}"
echo ""
echo "Recursos eliminados. Los datos NO se pueden recuperar."
echo ""
echo "Nota: Algunos recursos pueden tardar varios minutos en eliminarse completamente."

