# Guía de Deploy en AWS

Esta guía explica cómo desplegar la aplicación Pensamiento Computacional en AWS usando Amplify o EC2.

## Prerequisitos

1. Cuenta de AWS con credenciales configuradas
2. AWS CLI instalado y configurado (`aws configure`)
3. Acceso SSH a instancias EC2 (si usas EC2)
4. Recursos AWS creados (S3 bucket y RDS instance)

## Crear Infraestructura AWS

### Opción 1: Script Automático (Recomendado)

Ejecuta el script principal que crea todos los recursos:

```bash
cd scripts
./setup-aws-infrastructure.sh
```

Este script:
- Crea el bucket S3 con CORS y políticas configuradas
- Crea la instancia RDS PostgreSQL
- Actualiza el archivo `.env` con los valores reales

### Opción 2: Scripts Individuales

Si prefieres crear los recursos por separado:

```bash
# Crear S3 bucket
./scripts/create-s3-bucket.sh

# Crear RDS instance
./scripts/create-rds-instance.sh

# Actualizar .env
./scripts/update-env-from-aws.sh
```

## Deploy en AWS Amplify

### 1. Preparar el Proyecto

Asegúrate de que el archivo `amplify.yml` está en la raíz del proyecto.

### 2. Conectar Repositorio

1. Ve a [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click en "New app" > "Host web app"
3. Conecta tu repositorio (GitHub, GitLab, Bitbucket, etc.)
4. Selecciona la rama principal

### 3. Configurar Build Settings

Amplify detectará automáticamente el archivo `amplify.yml`. Si necesitas ajustar:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd front && npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: front/dist
    files:
      - '**/*'
```

### 4. Configurar Variables de Entorno

En Amplify Console, ve a "App settings" > "Environment variables" y agrega:

```
SPRING_PROFILES_ACTIVE=prod,aws
DB_HOST=tu-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=pensamiento_computacional
DB_USER=postgres
DB_PASSWORD=tu-password
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu-access-key
AWS_SECRET_ACCESS_KEY=tu-secret-key
S3_BUCKET_NAME=tu-bucket-name
```

### 5. Configurar Backend (Opcional)

Si quieres desplegar el backend en Amplify:

1. Crea una función Lambda o usa un servicio separado
2. O despliega el backend en EC2/ECS y apunta el frontend a esa URL

### 6. Deploy

Amplify desplegará automáticamente cuando hagas push a la rama conectada.

## Deploy en EC2

### 1. Crear Instancia EC2

1. Ve a [EC2 Console](https://console.aws.amazon.com/ec2/)
2. Launch Instance
3. Selecciona:
   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: t3.micro o t3.small
   - Security Group: Permite puertos 22 (SSH), 80 (HTTP), 443 (HTTPS)
   - Key Pair: Crea o selecciona una key pair

### 2. Configurar Security Group

Asegúrate de que el Security Group de tu EC2 permite:
- Puerto 22 (SSH) desde tu IP
- Puerto 80 (HTTP) desde 0.0.0.0/0
- Puerto 443 (HTTPS) desde 0.0.0.0/0

### 3. Configurar RDS Security Group

El Security Group de RDS debe permitir:
- Puerto 5432 (PostgreSQL) desde el Security Group de EC2

```bash
# Obtener Security Group ID de EC2
EC2_SG_ID=$(aws ec2 describe-instances \
    --filters "Name=instance-id,Values=i-xxxxx" \
    --query "Reservations[0].Instances[0].SecurityGroups[0].GroupId" \
    --output text)

# Obtener Security Group ID de RDS
RDS_SG_ID=$(aws rds describe-db-instances \
    --db-instance-identifier pensamiento-computacional-db \
    --query "DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId" \
    --output text)

# Permitir acceso desde EC2
aws ec2 authorize-security-group-ingress \
    --group-id $RDS_SG_ID \
    --protocol tcp \
    --port 5432 \
    --source-group $EC2_SG_ID
```

### 4. Deploy Automático

Usa el script de deploy:

```bash
./scripts/deploy-ec2.sh <ec2-ip-or-hostname> [user]
```

Ejemplo:
```bash
./scripts/deploy-ec2.sh ec2-54-123-456-789.compute-1.amazonaws.com ubuntu
```

El script:
- Instala dependencias (Java, Nginx, Node.js)
- Compila el backend
- Copia la aplicación a EC2
- Configura systemd service
- Configura Nginx como reverse proxy

### 5. Deploy Manual

Si prefieres hacerlo manualmente:

```bash
# 1. Conectar a EC2
ssh -i tu-key.pem ubuntu@ec2-ip

# 2. Instalar dependencias
sudo apt-get update
sudo apt-get install -y openjdk-21-jdk nginx

# 3. Copiar aplicación
scp -i tu-key.pem target/app.jar ubuntu@ec2-ip:~/app/

# 4. Crear systemd service
sudo nano /etc/systemd/system/pensamiento-computacional.service
# (Ver contenido en scripts/deploy-ec2.sh)

# 5. Iniciar servicio
sudo systemctl daemon-reload
sudo systemctl enable pensamiento-computacional
sudo systemctl start pensamiento-computacional

# 6. Configurar Nginx
sudo nano /etc/nginx/sites-available/pensamiento-computacional
# (Ver contenido en scripts/deploy-ec2.sh)

sudo ln -s /etc/nginx/sites-available/pensamiento-computacional /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

## Configuración de Dominio y SSL

### Con Amplify

Amplify proporciona SSL automático a través de CloudFront. Solo necesitas:
1. Ir a "Domain management" en Amplify Console
2. Agregar tu dominio
3. Seguir las instrucciones para verificar el dominio

### Con EC2

Usa Certbot para obtener certificados SSL gratuitos:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

Certbot configurará automáticamente Nginx con SSL.

## Troubleshooting

### La aplicación no se conecta a RDS

1. Verifica que el Security Group de RDS permite tráfico desde EC2/Amplify
2. Verifica que la instancia RDS está en el mismo VPC o tiene acceso público
3. Verifica las credenciales en `.env`

### Error al subir imágenes a S3

1. Verifica que las credenciales AWS están correctas
2. Verifica que el bucket existe y tiene las políticas correctas
3. Verifica que CORS está configurado

### La aplicación no inicia

```bash
# Ver logs del servicio
sudo journalctl -u pensamiento-computacional -f

# Verificar estado
sudo systemctl status pensamiento-computacional

# Verificar variables de entorno
sudo systemctl show pensamiento-computacional --property=Environment
```

### Nginx no sirve el frontend

1. Verifica que el build del frontend está en `/home/ubuntu/pensamiento-computacional/front/dist`
2. Verifica permisos: `sudo chown -R www-data:www-data /home/ubuntu/pensamiento-computacional/front/dist`
3. Verifica configuración de Nginx: `sudo nginx -t`

## Monitoreo y Mantenimiento

### Logs

- **Backend**: `sudo journalctl -u pensamiento-computacional -f`
- **Nginx**: `sudo tail -f /var/log/nginx/error.log`
- **Sistema**: `sudo dmesg | tail`

### Actualizar Aplicación

```bash
# En tu máquina local
cd pensamientoComputacional
./mvnw clean package -DskipTests

# Copiar a EC2
scp target/app.jar ubuntu@ec2-ip:~/pensamiento-computacional/app/

# Reiniciar servicio
ssh ubuntu@ec2-ip 'sudo systemctl restart pensamiento-computacional'
```

### Backups

- **RDS**: Los backups automáticos están configurados (7 días de retención)
- **S3**: El versionado está habilitado
- **Código**: Usa Git para versionado

## Costos Estimados

- **RDS db.t3.micro**: ~$15/mes (o gratis en Free Tier)
- **S3**: ~$0.023/GB/mes (muy económico)
- **EC2 t3.micro**: ~$7.50/mes (o gratis en Free Tier)
- **Amplify**: Primeros 1000 builds/mes gratis

## Seguridad

1. **Nunca commitees** el archivo `.env` con credenciales reales
2. **Rota credenciales** regularmente
3. **Usa AWS Secrets Manager** para producción
4. **Configura backups** automáticos
5. **Monitorea** el acceso y uso de recursos

## Recursos Adicionales

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [RDS User Guide](https://docs.aws.amazon.com/rds/)
- [S3 User Guide](https://docs.aws.amazon.com/s3/)

