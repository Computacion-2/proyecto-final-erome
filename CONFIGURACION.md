# Configuración de RDS y S3

## Variables de Entorno

El proyecto utiliza variables de entorno para configurar RDS (PostgreSQL) y S3 (AWS).

### Archivo .env

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu-access-key-id
AWS_SECRET_ACCESS_KEY=tu-secret-access-key

# S3 Bucket Name
S3_BUCKET_NAME=tu-bucket-name

# PostgreSQL (RDS) Configuration
DB_HOST=tu-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=tu-database-name
DB_USER=postgres
DB_PASSWORD=tu-database-password
```

### Cargar Variables de Entorno

#### Opción 1: Usar el script proporcionado
```bash
source load-env.sh
```

#### Opción 2: Cargar manualmente
```bash
export $(cat .env | grep -v '^#' | xargs)
```

#### Opción 3: En el sistema operativo
- Linux/Mac: Agregar al `~/.bashrc` o `~/.zshrc`
- Windows: Configurar en Variables de Entorno del Sistema

### Activar Perfiles de Spring Boot

Para usar RDS y S3, activa los perfiles correspondientes:

```bash
# Activar solo RDS
export SPRING_PROFILES_ACTIVE=prod

# Activar solo S3
export SPRING_PROFILES_ACTIVE=aws

# Activar ambos
export SPRING_PROFILES_ACTIVE=prod,aws
```

O al iniciar la aplicación:
```bash
java -jar app.jar --spring.profiles.active=prod,aws
```

### Configuración de RDS

1. **Crear instancia RDS PostgreSQL** en AWS
2. **Obtener el endpoint** de la instancia RDS
3. **Configurar las variables** en `.env`:
   - `DB_HOST`: Endpoint de RDS (ej: `mydb.123456789.us-east-1.rds.amazonaws.com`)
   - `DB_NAME`: Nombre de la base de datos
   - `DB_USER`: Usuario de la base de datos
   - `DB_PASSWORD`: Contraseña de la base de datos

### Configuración de S3

1. **Crear bucket S3** en AWS
2. **Configurar CORS** en el bucket:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

3. **Configurar políticas** del bucket para permitir acceso público a las imágenes de perfil
4. **Configurar las variables** en `.env`:
   - `S3_BUCKET_NAME`: Nombre del bucket
   - `AWS_ACCESS_KEY_ID`: Access Key ID de AWS
   - `AWS_SECRET_ACCESS_KEY`: Secret Access Key de AWS
   - `AWS_REGION`: Región donde está el bucket

### Validación

Para validar que todo esté configurado correctamente:

1. **Verificar conexión a RDS**:
   - La aplicación debería iniciar sin errores de conexión
   - Revisar logs para confirmar conexión exitosa

2. **Verificar S3**:
   - Intentar subir una imagen de perfil
   - Verificar que se genere la URL presignada correctamente

### Crear Recursos AWS Automáticamente

Para crear los recursos AWS (S3 bucket y RDS) automáticamente:

```bash
cd scripts
./setup-aws-infrastructure.sh
```

Este script creará:
- Bucket S3 con CORS y políticas configuradas
- Instancia RDS PostgreSQL
- Security Groups necesarios
- Actualizará el archivo `.env` automáticamente

### Deploy

Para información detallada sobre cómo desplegar la aplicación en AWS Amplify o EC2, consulta [DEPLOY-AWS.md](DEPLOY-AWS.md).

### Notas Importantes

- El archivo `.env` NO debe ser commiteado al repositorio (debe estar en `.gitignore`)
- Usa `.env.example` como plantilla para otros desarrolladores
- En producción, usa variables de entorno del sistema o un gestor de secretos (AWS Secrets Manager, etc.)
- Los scripts de creación de recursos AWS requieren AWS CLI configurado

