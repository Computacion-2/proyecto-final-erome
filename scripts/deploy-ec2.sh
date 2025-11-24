#!/bin/bash
# Script para deploy en EC2

set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Deploy en EC2 ===${NC}"
echo ""

# Verificar que se proporciona la IP o hostname de EC2
if [ -z "$1" ]; then
    echo "Uso: $0 <ec2-ip-or-hostname> [user]"
    echo "Ejemplo: $0 ec2-54-123-456-789.compute-1.amazonaws.com ubuntu"
    exit 1
fi

EC2_HOST=$1
EC2_USER=${2:-ubuntu}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Host: $EC2_HOST"
echo "User: $EC2_USER"
echo ""

# Verificar conexión SSH
echo "Verificando conexión SSH..."
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes "$EC2_USER@$EC2_HOST" exit 2>/dev/null; then
    echo -e "${RED}✗${NC} No se puede conectar a $EC2_HOST"
    echo "Asegúrate de que:"
    echo "1. La instancia EC2 está corriendo"
    echo "2. El Security Group permite SSH (puerto 22) desde tu IP"
    echo "3. Tienes las claves SSH configuradas"
    exit 1
fi

echo -e "${GREEN}✓${NC} Conexión SSH exitosa"

# Crear estructura de directorios en EC2
echo "Creando estructura de directorios..."
ssh "$EC2_USER@$EC2_HOST" "mkdir -p ~/pensamiento-computacional/{app,logs,config}"

# Copiar archivos de configuración
echo "Copiando archivos de configuración..."
scp "$PROJECT_DIR/.env" "$EC2_USER@$EC2_HOST:~/pensamiento-computacional/config/.env" 2>/dev/null || {
    echo -e "${YELLOW}⚠${NC} No se pudo copiar .env (puede no existir)"
}

# Instalar dependencias en EC2
echo "Instalando dependencias en EC2..."
ssh "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    # Actualizar sistema
    sudo apt-get update -qq
    
    # Instalar Java 21
    if ! command -v java &> /dev/null || ! java -version 2>&1 | grep -q "21"; then
        sudo apt-get install -y openjdk-21-jdk
    fi
    
    # Instalar Nginx
    if ! command -v nginx &> /dev/null; then
        sudo apt-get install -y nginx
    fi
    
    # Instalar Node.js y npm (para frontend si es necesario)
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
ENDSSH

echo -e "${GREEN}✓${NC} Dependencias instaladas"

# Compilar backend
echo "Compilando backend..."
cd "$PROJECT_DIR/pensamientoComputacional"
chmod +x ./mvnw
./mvnw clean package -DskipTests

# Copiar JAR/WAR a EC2
echo "Copiando aplicación a EC2..."
JAR_FILE=$(find target -name "*.jar" -not -name "*-sources.jar" | head -1)
if [ -n "$JAR_FILE" ]; then
    scp "$JAR_FILE" "$EC2_USER@$EC2_HOST:~/pensamiento-computacional/app/app.jar"
    echo -e "${GREEN}✓${NC} Aplicación copiada"
else
    echo -e "${RED}✗${NC} No se encontró archivo JAR"
    exit 1
fi

# Crear systemd service
echo "Configurando systemd service..."
ssh "$EC2_USER@$EC2_HOST" << ENDSSH
sudo tee /etc/systemd/system/pensamiento-computacional.service > /dev/null << 'EOFSERVICE'
[Unit]
Description=Pensamiento Computacional Application
After=network.target

[Service]
Type=simple
User=$EC2_USER
WorkingDirectory=/home/$EC2_USER/pensamiento-computacional/app
EnvironmentFile=/home/$EC2_USER/pensamiento-computacional/config/.env
Environment="SPRING_PROFILES_ACTIVE=prod,aws"
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod,aws /home/$EC2_USER/pensamiento-computacional/app/app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOFSERVICE

sudo systemctl daemon-reload
sudo systemctl enable pensamiento-computacional
sudo systemctl restart pensamiento-computacional
ENDSSH

echo -e "${GREEN}✓${NC} Systemd service configurado"

# Configurar Nginx como reverse proxy
echo "Configurando Nginx..."
ssh "$EC2_USER@$EC2_HOST" << 'ENDSSH'
sudo tee /etc/nginx/sites-available/pensamiento-computacional > /dev/null << 'EOFCONF'
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /home/ubuntu/pensamiento-computacional/front/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOFCONF

sudo ln -sf /etc/nginx/sites-available/pensamiento-computacional /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
ENDSSH

echo -e "${GREEN}✓${NC} Nginx configurado"

# Verificar estado
echo ""
echo "Verificando estado del servicio..."
sleep 3
ssh "$EC2_USER@$EC2_HOST" "sudo systemctl status pensamiento-computacional --no-pager -l | head -20"

echo ""
echo -e "${GREEN}=== Deploy completado ===${NC}"
echo ""
echo "La aplicación está disponible en: http://$EC2_HOST"
echo ""
echo "Comandos útiles:"
echo "  Ver logs: ssh $EC2_USER@$EC2_HOST 'sudo journalctl -u pensamiento-computacional -f'"
echo "  Reiniciar: ssh $EC2_USER@$EC2_HOST 'sudo systemctl restart pensamiento-computacional'"
echo "  Estado: ssh $EC2_USER@$EC2_HOST 'sudo systemctl status pensamiento-computacional'"

