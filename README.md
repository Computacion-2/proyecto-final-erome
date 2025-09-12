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
```bash
# Build Docker image
docker build -t spring-boot-jpa-workshop .

# Run container
docker run -p 8080:8080 spring-boot-jpa-workshop
```

