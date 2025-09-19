###deployed in

http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT/

# Spring Boot JPA 

cd /home/santiago/Documents/compunet2/proyecto-final-erome/pensamientoComputacional && ./mvnw clean spring-boot:run

1. **Step in the project**
   ```bash
   cd tallerSpringBootJPA
   ```

2. **Build the project**
   ```bash
   mvn clean install
   ```

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

The application will start on `http://localhost:8080`

### Database Access

- **H2 Console**: `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:mem:testdb`
- **Username**: `sa`
- **Password**: `password`


## Testing

### Running Tests

```bash
# Run all tests
cd /home/santiago/Documents/compunet2/proyecto-final-erome/pensamientoComputacional && ./mvnw test

# Run tests with coverage report
mvn clean test jacoco:report

# Run specific test class
mvn test -Dtest=UserServiceTest

# Run tests with detailed output
mvn test -Dspring.profiles.active=test
```

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
mvn spring-boot:run
```

### Production Build
```bash
mvn clean package
java -jar target/spring-boot-jpa-workshop-1.0.0.jar
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

