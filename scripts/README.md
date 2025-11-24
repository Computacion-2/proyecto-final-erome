# Scripts de Infraestructura AWS

Este directorio contiene scripts para gestionar la infraestructura AWS del proyecto Pensamiento Computacional.

## Scripts Disponibles

### setup-aws-infrastructure.sh
Script principal que orquesta la creación de todos los recursos AWS.

**Uso:**
```bash
./setup-aws-infrastructure.sh
```

Opciones:
- 1) Solo S3 Bucket
- 2) Solo RDS Instance
- 3) Ambos (S3 + RDS) - Recomendado
- 4) Solo actualizar .env desde recursos existentes

### create-s3-bucket.sh
Crea un bucket S3 con:
- CORS configurado para acceso desde frontend
- Política de bucket para acceso público a imágenes de perfil
- Versionado habilitado
- Encriptación AES256

**Uso:**
```bash
./create-s3-bucket.sh
```

### create-rds-instance.sh
Crea una instancia RDS PostgreSQL con:
- Tipo: db.t3.micro (Free Tier) por defecto
- Versión: PostgreSQL 15.4
- Storage: 20GB gp3
- Security Group configurado
- Acceso público habilitado

**Uso:**
```bash
./create-rds-instance.sh
```

**Variables de entorno opcionales:**
- `DB_INSTANCE_CLASS`: Tipo de instancia (default: db.t3.micro)
- `ENGINE_VERSION`: Versión de PostgreSQL (default: 15.4)

### update-env-from-aws.sh
Actualiza el archivo `.env` con los valores de los recursos AWS creados.

**Uso:**
```bash
./update-env-from-aws.sh
```

Lee los valores de archivos temporales creados por los scripts de creación.

### deploy-ec2.sh
Script para deployar la aplicación en una instancia EC2.

**Uso:**
```bash
./deploy-ec2.sh <ec2-ip-or-hostname> [user]
```

Ejemplo:
```bash
./deploy-ec2.sh ec2-54-123-456-789.compute-1.amazonaws.com ubuntu
```

El script:
- Instala dependencias (Java, Nginx, Node.js)
- Compila el backend
- Copia la aplicación a EC2
- Configura systemd service
- Configura Nginx como reverse proxy

### destroy-aws-infrastructure.sh
**ADVERTENCIA**: Script destructivo que elimina todos los recursos AWS creados.

**Uso:**
```bash
./destroy-aws-infrastructure.sh
```

Elimina:
- Bucket S3 y todo su contenido
- Instancia RDS (se pierden todos los datos)
- Security Groups relacionados
- Subnet Groups relacionados

Requiere confirmación escribiendo "ELIMINAR".

## Requisitos

1. AWS CLI instalado y configurado
2. Credenciales AWS configuradas (`aws configure`)
3. Permisos IAM suficientes para crear recursos
4. Variables de entorno en `.env` (algunas opcionales)

## Permisos IAM Requeridos

El usuario/rol de AWS necesita los siguientes permisos:

- `s3:CreateBucket`
- `s3:PutBucketCors`
- `s3:PutBucketPolicy`
- `s3:PutBucketVersioning`
- `s3:PutBucketEncryption`
- `s3:ListBucket`
- `s3:GetObject`
- `s3:PutObject`
- `s3:DeleteObject`
- `rds:CreateDBInstance`
- `rds:DescribeDBInstances`
- `rds:DeleteDBInstance`
- `rds:CreateDBSubnetGroup`
- `rds:DeleteDBSubnetGroup`
- `ec2:DescribeVpcs`
- `ec2:DescribeSubnets`
- `ec2:CreateSecurityGroup`
- `ec2:AuthorizeSecurityGroupIngress`
- `ec2:DeleteSecurityGroup`

## Flujo de Trabajo Recomendado

1. **Crear infraestructura:**
   ```bash
   ./setup-aws-infrastructure.sh
   # Seleccionar opción 3 (Ambos)
   ```

2. **Validar configuración:**
   ```bash
   cd ..
   ./validate-config.sh
   ```

3. **Activar perfiles de Spring Boot:**
   ```bash
   export SPRING_PROFILES_ACTIVE=prod,aws
   ```

4. **Iniciar aplicación:**
   ```bash
   cd pensamientoComputacional
   ./mvnw spring-boot:run
   ```

5. **Deploy (cuando esté listo):**
   - **Amplify**: Ver `DEPLOY-AWS.md`
   - **EC2**: `./deploy-ec2.sh <ec2-hostname>`

## Troubleshooting

### Error: "Bucket already exists"
Los nombres de bucket S3 deben ser únicos globalmente. El script usa un timestamp para hacerlo único.

### Error: "VPC not found"
Asegúrate de tener al menos un VPC en la región configurada.

### Error: "Insufficient permissions"
Verifica que tu usuario/rol de AWS tiene los permisos necesarios.

### RDS tarda mucho en crearse
Es normal, puede tomar 5-10 minutos. El script espera automáticamente.

## Notas

- Los scripts guardan información temporal en `/tmp/` para compartir datos entre scripts
- Los passwords de RDS se generan automáticamente y se guardan en archivos temporales
- **IMPORTANTE**: Guarda el password de RDS de forma segura después de la creación
- Los recursos creados pueden generar costos en AWS (aunque db.t3.micro está en Free Tier)
