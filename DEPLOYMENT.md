# Pensamiento Computacional Application - Deployment Documentation

## Overview
This document describes the deployment process for the Pensamiento Computacional Spring Boot application on the server `swarch@x104m10`.

## Application Details
- **Application Name**: Pensamiento Computacional
- **Technology Stack**: Spring Boot 3.5.5, Java 11, H2 Database
- **Server**: swarch@x104m10
- **Deployment Type**: WAR file deployment on Apache Tomcat 10
- **Access URL**: http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT/

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Server: swarch@x104m10                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │   Apache Tomcat │    │     Spring Boot Application     │ │
│  │   Port: 8080    │────│  pensamientoComputacional.war   │ │
│  │                 │    │                                 │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
│           │                                               │
│           └─── Java 11 Runtime Environment                 │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Steps Completed

### 1. Application Build
- **Location**: `/home/santiago/Documents/compunet2/proyecto-final-erome/pensamientoComputacional/`
- **Build Command**: `mvn clean package -DskipTests`
- **Output**: `pensamientoComputacional-0.0.1-SNAPSHOT.war` (55.5 MB)
- **Build Date**: September 18, 2025

### 2. Server Setup
- **Server**: swarch@x104m10
- **Java Version**: OpenJDK 21 
- **Tomcat Version**: Apache Tomcat 10.1.0
- **Installation Directory**: `/home/swarch/tomcat/`

### 3. Deployment Process
1. **WAR File Transfer**: Successfully uploaded to `/tmp/pensamientoComputacional-0.0.1-SNAPSHOT.war`
2. **Tomcat Installation**: Downloaded and extracted to user directory
3. **Application Deployment**: WAR file copied to `/home/swarch/tomcat/webapps/`
4. **Configuration**: Environment variables and startup scripts created
5. **Service Start**: Application started and running

## File Structure on Server

```
/home/swarch/
├── tomcat/                          # Tomcat installation directory
│   ├── webapps/
│   │   └── pensamientoComputacional-0.0.1-SNAPSHOT.war
│   ├── logs/
│   │   └── startup.log              # Application startup logs
│   ├── bin/
│   │   ├── catalina.sh             # Tomcat startup script
│   │   └── setenv.sh               # Environment configuration
│   └── conf/                        # Tomcat configuration
├── start-app.sh                     # Application startup script
└── stop-app.sh                      # Application stop script
```

## Environment Configuration

### Java Environment Variables
```bash
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
CATALINA_HOME=/home/swarch/tomcat
CATALINA_BASE=/home/swarch/tomcat
JAVA_OPTS="-Xms512m -Xmx1024m -Dspring.profiles.active=production"
```

### Application Configuration
- **Database**: H2 in-memory database
- **Port**: 8080
- **Context Path**: `/pensamientoComputacional-0.0.1-SNAPSHOT/`
- **Profile**: production

## Application Management

### Starting the Application
```bash
# Method 1: Using the startup script
ssh swarch@x104m10 "~/start-app.sh"

# Method 2: Direct command
ssh swarch@x104m10 "cd ~/tomcat && ./bin/catalina.sh start"
```

### Stopping the Application
```bash
# Method 1: Using the stop script
ssh swarch@x104m10 "~/stop-app.sh"

# Method 2: Direct command
ssh swarch@x104m10 "cd ~/tomcat && ./bin/catalina.sh stop"
```

### Checking Application Status
```bash
# Check if Java process is running
ssh swarch@x104m10 "ps aux | grep java"

# Check application accessibility
ssh swarch@x104m10 "curl -I http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT/"
```

## Application Features

### Core Functionality
- **User Management**: Complete user registration and authentication system
- **Role-Based Access Control**: Permission and role management
- **Educational Platform**: Pensamiento Computacional learning system
- **Database Integration**: H2 database with schema and data initialization

### API Endpoints
- **Base URL**: `http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT/`
- **H2 Console**: `http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT/h2-console`
- **REST API**: Available under the application context

### Database Configuration
- **Database Type**: H2 in-memory database
- **Connection URL**: `jdbc:h2:mem:testdb`
- **Username**: `sa`
- **Password**: `password`
- **Console Path**: `/h2-console`

## Monitoring and Logs

### Log Files Location
- **Startup Logs**: `/home/swarch/tomcat/logs/startup.log`
- **Tomcat Logs**: `/home/swarch/tomcat/logs/`
- **Application Logs**: Available through Spring Boot logging configuration

### Health Checks
```bash
# Check application health
curl http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT/actuator/health

# Check database console
curl http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT/h2-console
```

## Security Considerations

### Access Control
- Application runs under user account `swarch` (no sudo privileges)
- Tomcat runs on port 8080 (ensure firewall allows access)
- H2 console is accessible (consider securing in production)

### Network Access
- **Internal Access**: `http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT/`
- **External Access**: `http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT/`

## Troubleshooting

### Common Issues

1. **Application Not Starting**
   ```bash
   # Check logs
   ssh swarch@x104m10 "cat ~/tomcat/logs/startup.log"
   
   # Check Java process
   ssh swarch@x104m10 "ps aux | grep java"
   ```

2. **Port Already in Use**
   ```bash
   # Check port usage
   ssh swarch@x104m10 "netstat -tlnp | grep 8080"
   
   # Kill existing process
   ssh swarch@x104m10 "pkill -f tomcat"
   ```

3. **Memory Issues**
   ```bash
   # Check memory usage
   ssh swarch@x104m10 "free -h"
   
   # Adjust JAVA_OPTS in start-app.sh
   ```

### Log Analysis
```bash
# View startup logs
ssh swarch@x104m10 "tail -f ~/tomcat/logs/startup.log"

# View Tomcat logs
ssh swarch@x104m10 "tail -f ~/tomcat/logs/catalina.out"
```

## Maintenance

### Regular Tasks
1. **Monitor Application Status**: Check if Java process is running
2. **Review Logs**: Monitor startup and application logs
3. **Database Backup**: H2 in-memory database (data lost on restart)
4. **Update Application**: Redeploy WAR file for updates

### Update Process
1. Build new WAR file locally
2. Transfer to server: `scp new-app.war swarch@x104m10:/tmp/`
3. Stop application: `ssh swarch@x104m10 "~/stop-app.sh"`
4. Replace WAR file: `ssh swarch@x104m10 "cp /tmp/new-app.war ~/tomcat/webapps/"`
5. Start application: `ssh swarch@x104m10 "~/start-app.sh"`

## Deployment Summary

✅ **Deployment Status**: SUCCESSFUL
- Application is running on swarch@x104m10
- Accessible at: http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT/
- Response: "PensamientoComputacional API is running"
- H2 Console: http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT/h2-console/
- Java 21 process is active and operational
- All required components are configured and operational

## Contact Information
- **Deployment Date**: September 18, 2025
- **Deployed By**: Santiago
- **Server**: swarch@x104m10
- **Application Version**: 0.0.1-SNAPSHOT

---
*This documentation was generated as part of the deployment process for the Pensamiento Computacional application.*
