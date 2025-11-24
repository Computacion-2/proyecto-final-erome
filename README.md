# Pensamiento Computacional - Plataforma Web

Plataforma web para gestión de ejercicios de programación con gamificación, desarrollada con Spring Boot (Backend) y React (Frontend), utilizando AWS RDS (PostgreSQL) y AWS S3 para almacenamiento.

### Video link
https://youtu.be/bQTgy6Sn2Uo

## Quick Start

### Prerequisites
- Java 21 (OpenJDK 21)
- Maven (included with Maven Wrapper)
- Node.js 18+ y pnpm
- AWS CLI configurado (para recursos AWS)
- PostgreSQL (o AWS RDS)

### Configuración Inicial

#### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key

# S3 Bucket Name
S3_BUCKET_NAME=pensamiento-computacional-images-xxxxx

# PostgreSQL (RDS) Configuration
DB_HOST=tu-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=pensamiento_computacional
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT Configuration (opcional, tiene valores por defecto)
JWT_SECRET=mySecretKey123456789012345678901234567890
```

#### 2. Crear Recursos AWS (Opcional)

Si aún no tienes los recursos AWS creados, puedes usar los scripts automatizados:

```bash
# Crear bucket S3 y instancia RDS
cd scripts
./setup-aws-infrastructure.sh
# Selecciona la opción 3 para crear ambos recursos

# Actualizar .env con los valores de los recursos creados
echo "4" | ./setup-aws-infrastructure.sh
```

#### 3. Validar Configuración

```bash
# Validar que todas las variables estén configuradas
./validate-config.sh
```

### Ejecutar la Aplicación

#### Opción 1: Usando Scripts (Recomendado)

**Backend:**
```bash
# Desde la raíz del proyecto
./start-backend.sh
```

**Frontend:**
```bash
# En otra terminal, desde la raíz del proyecto
cd front
pnpm install
pnpm run dev
```

#### Opción 2: Manual

**Backend:**
```bash
# 1. Activar perfiles de Spring Boot
export SPRING_PROFILES_ACTIVE=prod,aws

# 2. Cargar variables de entorno
source load-env.sh

# 3. Configurar JAVA_HOME
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk

# 4. Iniciar backend
cd pensamientoComputacional
./mvnw spring-boot:run -DskipTests
```

**Frontend:**
```bash
# En otra terminal
cd front
pnpm install
pnpm run dev
```

### Acceso a la Aplicación

Una vez iniciada, la aplicación estará disponible en:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/swagger-ui
- **API Docs**: http://localhost:8080/api-docs

### Estructura del Proyecto

```
proyecto-final-erome/
├── pensamientoComputacional/    # Backend (Spring Boot)
│   ├── src/
│   └── pom.xml
├── front/                        # Frontend (React + Vite)
│   ├── src/
│   └── package.json
├── scripts/                      # Scripts de automatización
│   ├── setup-aws-infrastructure.sh
│   ├── create-s3-bucket.sh
│   ├── create-rds-instance.sh
│   └── update-env-from-aws.sh
├── .env                          # Variables de entorno (no commitear)
├── load-env.sh                   # Script para cargar variables
├── start-backend.sh              # Script para iniciar backend
└── validate-config.sh            # Script de validación
```

## Comandos Adicionales

### Compilar el Proyecto

**Backend:**
```bash
cd pensamientoComputacional
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
./mvnw clean compile
```

**Frontend:**
```bash
cd front
pnpm install
pnpm run build
```

### Ejecutar Tests

**Backend:**
```bash
cd pensamientoComputacional
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
./mvnw test
```

**Backend con coverage:**
```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
./mvnw clean test jacoco:report
```

### Empaquetar la Aplicación

**Backend:**
```bash
cd pensamientoComputacional
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
./mvnw clean package -DskipTests
```

**Frontend:**
```bash
cd front
pnpm run build
# Los archivos se generan en front/build/
```

## Troubleshooting

### Problemas Comunes

#### Error de Versión de Java
Si obtienes el error "release version 21 not supported":
```bash
# Verificar versión de Java
java -version

# Configurar JAVA_HOME explícitamente
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk

# Verificar que Maven usa la versión correcta
cd pensamientoComputacional
./mvnw -version
```

#### Error de Compilación
Si la compilación falla:
```bash
# Limpiar y recompilar
cd pensamientoComputacional
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
./mvnw clean compile

# Ver errores detallados
./mvnw compile -X
```

#### Error de Conexión a Base de Datos
Si hay problemas conectando a RDS:
```bash
# Verificar variables de entorno
source load-env.sh
echo $DB_HOST
echo $DB_PASSWORD

# Validar configuración
./validate-config.sh

# Verificar conectividad a RDS
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

#### Error de CORS
Si hay errores de CORS en el frontend:
- Verificar que el backend esté corriendo en `http://localhost:8080`
- Verificar que el frontend esté en `http://localhost:3000`
- Revisar la configuración de CORS en `SecurityConfig.java`

#### Puerto en Uso
Si el puerto 8080 o 3000 está en uso:
```bash
# Verificar procesos en puerto 8080
lsof -i :8080

# Verificar procesos en puerto 3000
lsof -i :3000

# Matar proceso si es necesario
kill -9 <PID>
```

#### Variables de Entorno No Cargadas
```bash
# Asegurarse de cargar variables antes de iniciar
source load-env.sh

# Verificar que estén cargadas
env | grep DB_
env | grep AWS_
```

### Acceso a Base de Datos

**PostgreSQL (RDS):**
```bash
# Conectar usando psql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# O usando variables de entorno cargadas
source load-env.sh
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```


## Testing

### Running Tests

```bash
# Run all tests
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk && ./mvnw test

# Run tests with coverage report
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk && ./mvnw clean test jacoco:report

# Run specific test class
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk && ./mvnw test -Dtest=UserServiceTest

# Run tests with detailed output
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk && ./mvnw test -Dspring.profiles.active=test
```

### Test Results
- **Total Tests**: 116 tests
- **Status**: All tests passing
- **Coverage**: Available in `target/site/jacoco/index.html`

### Test Coverage

The project includes comprehensive unit tests for all services:

- **UserServiceTest**: 20+ test methods covering all CRUD operations
- **RoleServiceTest**: 20+ test methods covering role management
- **PermissionServiceTest**: 15+ test methods covering permission management

### Code Coverage Report

After running tests with JaCoCo, the coverage report is available at:
```
target/site/jacoco/index.html
```

## API Testing with Postman

### Prerequisites
- Node.js (for Newman)
- Application running (local or server)

### Setup
```bash
# Install Newman and dependencies
npm install

# Ensure application is running
# Local: http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT/
# Server: http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT/
```

### Running API Tests

```bash
# Test against local environment
npm run api:test

# Test against server environment
npm run api:test:server

# Test with verbose output
npm run api:test:verbose
```

### Test Collection Structure

The Postman collection (`postman/pc-api.postman_collection.json`) includes:

- **Auth**: Login, Register, Refresh Token, Get Current User, Logout
- **Test**: API Health Check
- **Users**: Full CRUD operations for user management
- **Roles**: Full CRUD operations for role management
- **Students**: Full CRUD operations for student management
- **Permissions**: Read operations for permission management
- **Semesters**: Read operations for semester management

### Test Coverage

- **Total Requests**: 25
- **Total Tests**: 75
- **Coverage**: 100% of REST endpoints
- **Validation**: Status codes, response times, schema validation, environment variables

### Test Report

After running tests, a detailed HTML report is generated at:
```
postman/report.html
```

### Environment Variables

The collection uses environment variables for:
- `baseUrl`: API base URL
- `accessToken`/`refreshToken`: JWT tokens
- `userId`, `roleId`, `studentId`, etc.: Runtime IDs
- Credentials: Admin, Professor, Student credentials

### Manual Testing

You can also import the collection into Postman:
1. Import `postman/pc-api.postman_collection.json`
2. Import `postman/local.postman_environment.json` or `postman/server.postman_environment.json`
3. Run the collection manually

## API Documentation (Swagger)

### Swagger UI

The application provides interactive API documentation through Swagger UI:

- **Local**: http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT/swagger-ui
- **Server**: http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT/swagger-ui

### OpenAPI Contract

The OpenAPI specification is available at:

- **Local**: http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT/api-docs
- **Server**: http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT/api-docs

### Generated Contract

A static OpenAPI contract is generated during build and available at:
```
docs/openapi.json
```

### Features

- **Interactive Documentation**: Test API endpoints directly from the browser
- **JWT Authentication**: Authorize requests using Bearer tokens
- **Complete Coverage**: All REST endpoints documented with request/response schemas
- **Error Documentation**: Comprehensive error response documentation
- **Security Documentation**: JWT authentication flow documented

### Usage

1. **Access Swagger UI**: Navigate to the Swagger UI URL
2. **Authorize**: Click "Authorize" and enter your JWT token (obtained from `/api/auth/login`)
3. **Test Endpoints**: Use the "Try it out" feature to test API endpoints
4. **View Schemas**: Explore request/response schemas for all endpoints

### API Endpoints Documented

- **Authentication**: Login, Register, Refresh Token, Logout, Get Current User
- **Users**: Full CRUD operations with role-based access
- **Roles**: Role management with permissions
- **Students**: Student management and enrollment
- **Permissions**: Permission management
- **Semesters**: Semester management
- **Test**: Health check endpoint

## Ejecución de Pruebas API - Punto 3

### Prerrequisitos
```bash
# Instalar Node.js y npm (si no están instalados)
# Descargar desde: https://nodejs.org/

# Verificar instalación
node --version
npm --version
```

### Instalación de Dependencias
```bash
# Instalar Newman y reporter HTML
npm install
```

### Ejecutar Pruebas Postman

**Opción 1: Pruebas contra servidor desplegado**
```bash
npm run api:test:server
```

**Opción 2: Pruebas contra aplicación local**
```bash
# Primero iniciar la aplicación (ver sección siguiente)
npm run api:test
```

**Opción 3: Pruebas con salida detallada**
```bash
npm run api:test:verbose
```

### Verificar Resultados
```bash
# El reporte se genera en:
# postman/report.html

# Abrir en navegador
start postman/report.html
```

### Resultados Esperados - Punto 3
- Colección ejecutada con Newman
- Reporte HTML generado en `postman/report.html`
- Tests ejecutados (pueden fallar si el servidor no está disponible)

## Documentación API Swagger - Punto 5

### Iniciar la Aplicación
```bash
# Navegar al directorio del proyecto
cd pensamientoComputacional

# Opción 1: Usar Maven Wrapper (recomendado)
./mvnw spring-boot:run

# Opción 2: Usar Maven directamente (si está instalado)
mvn spring-boot:run
```

### Acceder a Swagger UI
Una vez que la aplicación esté corriendo, abrir en el navegador:

**Local:**
```
http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT/swagger-ui
```

**Servidor:**
```
http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT/swagger-ui
```

### Verificar API Docs (JSON)
```
http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT/api-docs
```

### Generar Contrato OpenAPI Estático
```bash
# Con la aplicación corriendo
mvn springdoc:generate

# El contrato se genera en:
# docs/openapi.json
```

### Verificar Archivos Generados
```bash
# Verificar que existe el contrato
ls docs/openapi.json

# Ver contenido del contrato
cat docs/openapi.json
```

### Resultados Esperados - Punto 5
- Aplicación iniciada en puerto 8080
- Swagger UI accesible en `/swagger-ui`
- API Docs accesible en `/api-docs`
- Contrato generado en `docs/openapi.json`

## Comandos de Verificación Rápida

### Verificar que la aplicación está corriendo
```bash
# Test endpoint
curl http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT/api/test

# Respuesta esperada: "REST API is working!"
```

### Verificar Swagger UI
```bash
# Verificar que Swagger UI responde
curl -I http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT/swagger-ui

# Respuesta esperada: HTTP 200
```

### Verificar API Docs
```bash
# Verificar que API docs responde
curl http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT/api-docs

# Respuesta esperada: JSON con especificación OpenAPI
```

## Troubleshooting

### Error: "No plugin found for prefix 'spring-boot'"
```bash
# Usar Maven Wrapper en lugar de Maven
./mvnw spring-boot:run
```

### Error: "Cannot connect to server"
```bash
# Verificar que la aplicación esté corriendo
netstat -an | findstr :8080

# Verificar procesos Java
jps -l
```

### Error: "Newman not found"
```bash
# Instalar dependencias
npm install

# Verificar instalación
npx newman --version
```

## API Examples

### Create a User
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "password123",
    "firstName": "New",
    "lastName": "User",
    "role": {
      "id": 1
    }
  }'
```

### Create a Role
```bash
curl -X POST http://localhost:8080/api/roles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MODERATOR",
    "description": "Moderator role",
    "permissions": [
      {"id": 1},
      {"id": 2}
    ]
  }'
```

### Get Users by Role
```bash
curl -X GET http://localhost:8080/api/users/role/1
```

## Deployment

### Local Development
```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk && ./mvnw spring-boot:run
```

### Production Build
```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk && ./mvnw clean package
java -jar target/pensamientoComputacional-0.0.1-SNAPSHOT.war
```

### Docker

#### Prerequisites
Make sure Docker is running on your system. If using Docker Desktop, ensure it's started.

#### Build and Run with Docker

1. **Navigate to the project directory**
   ```bash
   cd proyecto-final-erome/pensamientoComputacional
   ```

2. **Build the Docker image**
   ```bash
   docker build -t pensamiento-computacional:local .
   ```

3. **Run the container**
   ```bash
   docker run -d --rm -p 8080:8080 --name pc-app pensamiento-computacional:local
   ```

4. **Verify the application is running**
   ```bash
   curl http://localhost:8080/health
   # Should return: OK
   ```

5. **Access the application**
   - Main application: `http://localhost:8080`
   - H2 Console: `http://localhost:8080/h2-console`
   - Health check: `http://localhost:8080/health`

#### Stop the Container

When you're done testing or no longer need the container running:

```bash
# Stop the container (it will be automatically removed due to --rm flag)
docker stop pc-app
```

#### Alternative: Run in foreground (for debugging)
```bash
# Run without -d flag to see logs in real-time
docker run --rm -p 8080:8080 --name pc-app pensamiento-computacional:local

# Press Ctrl+C to stop
```

#### Docker Environment Variables
You can customize the application behavior using environment variables:

```bash
# Run with custom Spring profile
docker run -d --rm -p 8080:8080 -e SPRING_PROFILES_ACTIVE=production --name pc-app pensamiento-computacional:local

# Run with custom JVM options
docker run -d --rm -p 8080:8080 -e JAVA_OPTS="-Xmx1g -Xms512m" --name pc-app pensamiento-computacional:local









## Deployment on x104m30

### Prerequisites on x104m30

- Java 11 (OpenJDK 11.0.26)
- SSH access with user: `computacion2`
- Password: `computacion2`

### Deployment Steps

1. **Build the project locally** (if not already done):
   ```bash
   mvn clean package -DskipTests
   ```

2. **Copy the .war file to x104m30**:
   ```bash
   scp target/IntroSpringboot-0.0.1-SNAPSHOT.war computacion2@x104m30:~/
   ```

3. **Connect to x104m30**:
   ```bash
   ssh computacion2@x104m30
   ```

4. **Deploy the application**:
   ```bash
   cd ~
   nohup java -jar IntroSpringboot-0.0.1-SNAPSHOT.war --server.port=8080 > app.log 2>&1 &
   ```

5. **Verify deployment**:
   ```bash
   # Check if the application is running
   ps aux | grep java
   
   # Check application logs
   tail -f app.log
   
   # Test the API (from your local machine)
   curl http://x104m30:8080/students
   ```

### Accessing the Application

Once deployed, the application will be available at:
- **Main Application**: `http://x104m30:8080`
- **H2 Database Console**: `http://x104m30:8080/h2`
- **API Endpoints**:
  - Students: `http://x104m30:8080/students`
  - Courses: `http://x104m30:8080/courses`
  - Professors: `http://x104m30:8080/professors`
  - Accounts: `http://x104m30:8080/accounts`

### Stopping the Application

To stop the application on x104m30:

```bash
# Connect to x104m30
ssh computacion2@x104m30

# Kill the Java process
pkill -f java

# Or find and kill the specific process
ps aux | grep java
kill <PID>
```
```

