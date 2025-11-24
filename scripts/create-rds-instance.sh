#!/bin/bash
# Script para crear instancia RDS PostgreSQL

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
DB_INSTANCE_ID="pensamiento-computacional-db"
DB_NAME="pensamiento_computacional"
DB_USER="postgres"
DB_INSTANCE_CLASS=${DB_INSTANCE_CLASS:-db.t3.micro}
ENGINE_VERSION=${ENGINE_VERSION:-15.7}
STORAGE_SIZE=20
STORAGE_TYPE="gp3"

echo "=== Creando Instancia RDS PostgreSQL ==="
echo "Región: $REGION"
echo "ID de instancia: $DB_INSTANCE_ID"
echo "Tipo de instancia: $DB_INSTANCE_CLASS"
echo "Versión PostgreSQL: $ENGINE_VERSION"
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

# Obtener VPC por defecto
echo "Obteniendo VPC por defecto..."
VPC_ID=$(aws ec2 describe-vpcs \
    --filters "Name=isDefault,Values=true" \
    --query "Vpcs[0].VpcId" \
    --output text \
    --region "$REGION" 2>/dev/null || echo "")

if [ -z "$VPC_ID" ] || [ "$VPC_ID" == "None" ]; then
    echo -e "${YELLOW}⚠${NC} No se encontró VPC por defecto, obteniendo el primero disponible..."
    VPC_ID=$(aws ec2 describe-vpcs \
        --query "Vpcs[0].VpcId" \
        --output text \
        --region "$REGION" 2>/dev/null || echo "")
fi

if [ -z "$VPC_ID" ] || [ "$VPC_ID" == "None" ]; then
    echo -e "${RED}✗${NC} No se pudo encontrar un VPC"
    exit 1
fi

echo -e "${GREEN}✓${NC} VPC encontrado: $VPC_ID"

# Obtener subnets del VPC en diferentes Availability Zones
echo "Obteniendo subnets en diferentes AZs..."
# Obtener todas las subnets con sus AZs
ALL_SUBNETS=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query "Subnets[*].[SubnetId,AvailabilityZone]" \
    --output text \
    --region "$REGION" 2>/dev/null)

if [ -z "$ALL_SUBNETS" ]; then
    echo -e "${RED}✗${NC} No se encontraron subnets en el VPC"
    exit 1
fi

# Agrupar subnets por AZ
declare -A AZ_SUBNETS
while IFS=$'\t' read -r subnet_id az; do
    if [ -n "$subnet_id" ] && [ -n "$az" ]; then
        if [ -z "${AZ_SUBNETS[$az]}" ]; then
            AZ_SUBNETS[$az]=$subnet_id
        else
            AZ_SUBNETS[$az]="${AZ_SUBNETS[$az]} $subnet_id"
        fi
    fi
done <<< "$ALL_SUBNETS"

# Seleccionar una subnet de cada AZ (RDS requiere al menos 2 en diferentes AZs)
SUBNET_IDS=""
COUNT=0
for az in "${!AZ_SUBNETS[@]}"; do
    # Tomar la primera subnet de cada AZ
    FIRST_SUBNET=$(echo ${AZ_SUBNETS[$az]} | awk '{print $1}')
    if [ -n "$FIRST_SUBNET" ]; then
        if [ -z "$SUBNET_IDS" ]; then
            SUBNET_IDS="$FIRST_SUBNET"
        else
            SUBNET_IDS="$SUBNET_IDS,$FIRST_SUBNET"
        fi
        COUNT=$((COUNT + 1))
        if [ $COUNT -ge 2 ]; then
            break
        fi
    fi
done

if [ -z "$SUBNET_IDS" ] || [ $COUNT -lt 2 ]; then
    echo -e "${RED}✗${NC} Se requieren al menos 2 subnets en diferentes Availability Zones"
    echo "Subnets encontradas por AZ:"
    for az in "${!AZ_SUBNETS[@]}"; do
        echo "  $az: ${AZ_SUBNETS[$az]}"
    done
    exit 1
fi

echo -e "${GREEN}✓${NC} Subnets seleccionadas (en diferentes AZs): $SUBNET_IDS"

# Crear o obtener Security Group
echo "Configurando Security Group..."
SG_NAME="pensamiento-computacional-rds-sg"
SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=$SG_NAME" "Name=vpc-id,Values=$VPC_ID" \
    --query "SecurityGroups[0].GroupId" \
    --output text \
    --region "$REGION" 2>/dev/null || echo "")

if [ -z "$SG_ID" ] || [ "$SG_ID" == "None" ]; then
    echo "Creando Security Group..."
    SG_ID=$(aws ec2 create-security-group \
        --group-name "$SG_NAME" \
        --description "Security group for Pensamiento Computacional RDS" \
        --vpc-id "$VPC_ID" \
        --region "$REGION" \
        --query "GroupId" \
        --output text 2>/dev/null)
    
    if [ -z "$SG_ID" ]; then
        echo -e "${RED}✗${NC} Error al crear Security Group"
        exit 1
    fi
    
    echo -e "${GREEN}✓${NC} Security Group creado: $SG_ID"
    
    # Permitir tráfico PostgreSQL desde cualquier IP (para desarrollo)
    # En producción, restringir a IPs específicas o VPC
    echo "Configurando reglas de Security Group..."
    aws ec2 authorize-security-group-ingress \
        --group-id "$SG_ID" \
        --protocol tcp \
        --port 5432 \
        --cidr 0.0.0.0/0 \
        --region "$REGION" 2>/dev/null || echo -e "${YELLOW}⚠${NC} Regla ya existe o error al crear"
    
    echo -e "${GREEN}✓${NC} Reglas de Security Group configuradas"
else
    echo -e "${GREEN}✓${NC} Security Group existente: $SG_ID"
fi

# Generar password aleatorio
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo "Password generado: ${DB_PASSWORD:0:5}..."
# Guardar password inmediatamente para que esté disponible incluso si el script se ejecuta en background
echo "$DB_PASSWORD" > /tmp/rds-password.txt
echo "Password guardado en /tmp/rds-password.txt"

# Verificar si la instancia ya existe
echo "Verificando si la instancia RDS ya existe..."
EXISTING_INSTANCE=$(aws rds describe-db-instances \
    --db-instance-identifier "$DB_INSTANCE_ID" \
    --region "$REGION" \
    --query "DBInstances[0].DBInstanceStatus" \
    --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_INSTANCE" ] && [ "$EXISTING_INSTANCE" != "None" ]; then
    echo -e "${YELLOW}⚠${NC} La instancia RDS ya existe con estado: $EXISTING_INSTANCE"
    if [ "$EXISTING_INSTANCE" == "available" ]; then
        echo -e "${GREEN}✓${NC} Usando instancia existente"
        DB_ENDPOINT=$(aws rds describe-db-instances \
            --db-instance-identifier "$DB_INSTANCE_ID" \
            --region "$REGION" \
            --query "DBInstances[0].Endpoint.Address" \
            --output text 2>/dev/null)
        echo "Endpoint: $DB_ENDPOINT"
        echo "$DB_ENDPOINT" > /tmp/rds-endpoint.txt
        echo "$DB_PASSWORD" > /tmp/rds-password.txt
        exit 0
    else
        echo -e "${YELLOW}⚠${NC} Esperando a que la instancia esté disponible..."
        aws rds wait db-instance-available \
            --db-instance-identifier "$DB_INSTANCE_ID" \
            --region "$REGION" 2>/dev/null || true
    fi
else
    # Usar Subnet Group "default" o crear uno nuevo
    echo "Configurando DB Subnet Group..."
    SUBNET_GROUP_NAME="pensamiento-computacional-subnet-group"
    
    # Verificar si ya existe nuestro Subnet Group
    EXISTING_SG=$(aws rds describe-db-subnet-groups \
        --db-subnet-group-name "$SUBNET_GROUP_NAME" \
        --region "$REGION" \
        --query "DBSubnetGroups[0].DBSubnetGroupName" \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$EXISTING_SG" ] || [ "$EXISTING_SG" == "None" ]; then
        # Intentar usar el subnet group "default" primero
        DEFAULT_SG=$(aws rds describe-db-subnet-groups \
            --db-subnet-group-name "default" \
            --region "$REGION" \
            --query "DBSubnetGroups[0].DBSubnetGroupName" \
            --output text 2>/dev/null || echo "")
        
        if [ -n "$DEFAULT_SG" ] && [ "$DEFAULT_SG" != "None" ]; then
            echo "Usando DB Subnet Group 'default' existente"
            SUBNET_GROUP_NAME="default"
        else
            # Obtener subnets del subnet group default si existe
            DEFAULT_SUBNETS=$(aws rds describe-db-subnet-groups \
                --region "$REGION" \
                --query "DBSubnetGroups[?VpcId=='$VPC_ID'] | [0].Subnets[*].SubnetIdentifier" \
                --output text 2>/dev/null | tr '\t' ',' || echo "")
            
            if [ -n "$DEFAULT_SUBNETS" ] && [ "$DEFAULT_SUBNETS" != "None" ]; then
                echo "Usando subnets del subnet group existente: $DEFAULT_SUBNETS"
                SUBNET_IDS=$DEFAULT_SUBNETS
            fi
            
            echo "Creando nuevo Subnet Group..."
            if aws rds create-db-subnet-group \
                --db-subnet-group-name "$SUBNET_GROUP_NAME" \
                --db-subnet-group-description "Subnet group for Pensamiento Computacional RDS" \
                --subnet-ids $SUBNET_IDS \
                --region "$REGION" 2>&1; then
                echo -e "${GREEN}✓${NC} Subnet Group creado"
            else
                echo -e "${YELLOW}⚠${NC} Error al crear Subnet Group, intentando usar 'default'..."
                # Intentar usar default directamente
                if aws rds describe-db-subnet-groups \
                    --db-subnet-group-name "default" \
                    --region "$REGION" \
                    --query "DBSubnetGroups[0].VpcId" \
                    --output text 2>/dev/null | grep -q "$VPC_ID"; then
                    SUBNET_GROUP_NAME="default"
                    echo -e "${GREEN}✓${NC} Usando subnet group 'default'"
                else
                    echo -e "${RED}✗${NC} No se pudo crear o encontrar un Subnet Group válido"
                    echo "Intenta crear un DB Subnet Group manualmente en la consola de AWS"
                    exit 1
                fi
            fi
        fi
    else
        echo -e "${GREEN}✓${NC} Subnet Group ya existe"
    fi
    
    echo "Creando instancia RDS..."
    aws rds create-db-instance \
        --db-instance-identifier "$DB_INSTANCE_ID" \
        --db-instance-class "$DB_INSTANCE_CLASS" \
        --engine postgres \
        --engine-version "$ENGINE_VERSION" \
        --master-username "$DB_USER" \
        --master-user-password "$DB_PASSWORD" \
        --allocated-storage "$STORAGE_SIZE" \
        --storage-type "$STORAGE_TYPE" \
        --db-name "$DB_NAME" \
        --vpc-security-group-ids "$SG_ID" \
        --db-subnet-group-name "$SUBNET_GROUP_NAME" \
        --backup-retention-period 7 \
        --no-multi-az \
        --publicly-accessible \
        --region "$REGION" \
        --no-enable-performance-insights \
        --no-auto-minor-version-upgrade || {
        echo -e "${RED}✗${NC} Error al crear la instancia RDS"
        exit 1
    }
    
    echo -e "${GREEN}✓${NC} Instancia RDS creada, esperando a que esté disponible..."
    echo "Esto puede tomar 5-10 minutos..."
    
    # Esperar a que la instancia esté disponible
    aws rds wait db-instance-available \
        --db-instance-identifier "$DB_INSTANCE_ID" \
        --region "$REGION" || {
        echo -e "${YELLOW}⚠${NC} Timeout esperando instancia, pero puede estar creándose..."
    }
fi

# Obtener endpoint
echo "Obteniendo endpoint..."
DB_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier "$DB_INSTANCE_ID" \
    --region "$REGION" \
    --query "DBInstances[0].Endpoint.Address" \
    --output text 2>/dev/null)

if [ -z "$DB_ENDPOINT" ] || [ "$DB_ENDPOINT" == "None" ]; then
    echo -e "${RED}✗${NC} No se pudo obtener el endpoint de RDS"
    exit 1
fi

echo ""
echo -e "${GREEN}=== Instancia RDS creada exitosamente ===${NC}"
echo "ID de instancia: $DB_INSTANCE_ID"
echo "Endpoint: $DB_ENDPOINT"
echo "Database name: $DB_NAME"
echo "Username: $DB_USER"
echo "Password: $DB_PASSWORD"
echo ""
echo "IMPORTANTE: Guarda el password de forma segura!"
echo ""
echo "Para actualizar el .env, ejecuta:"
echo "  export DB_HOST=$DB_ENDPOINT"
echo "  export DB_NAME=$DB_NAME"
echo "  export DB_PASSWORD=$DB_PASSWORD"
echo "  echo \"DB_HOST=$DB_ENDPOINT\" >> ../.env"
echo "  echo \"DB_NAME=$DB_NAME\" >> ../.env"
echo "  echo \"DB_PASSWORD=$DB_PASSWORD\" >> ../.env"

# Guardar valores en archivos temporales
echo "$DB_ENDPOINT" > /tmp/rds-endpoint.txt
echo "$DB_NAME" > /tmp/rds-dbname.txt
echo "$DB_PASSWORD" > /tmp/rds-password.txt

