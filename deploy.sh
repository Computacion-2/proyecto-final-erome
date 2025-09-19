#!/bin/bash

# Deployment script for Pensamiento Computacional Application
# This script should be run on the server (swarch@x104m10)
# No sudo access required - uses user directory

echo "Starting deployment of Pensamiento Computacional Application..."

# Check Java version
echo "Checking Java installation..."
java -version

# Set up Tomcat in user directory
TOMCAT_HOME="$HOME/tomcat"
WEBAPPS_DIR="$TOMCAT_HOME/webapps"
LOGS_DIR="$TOMCAT_HOME/logs"

# Create directories
echo "Creating application directories..."
mkdir -p "$TOMCAT_HOME"
mkdir -p "$WEBAPPS_DIR"
mkdir -p "$LOGS_DIR"
mkdir -p "$TOMCAT_HOME/bin"
mkdir -p "$TOMCAT_HOME/conf"
mkdir -p "$TOMCAT_HOME/lib"
mkdir -p "$TOMCAT_HOME/temp"

# Download and setup Tomcat if not exists
if [ ! -f "$TOMCAT_HOME/bin/catalina.sh" ]; then
    echo "Setting up Tomcat in user directory..."
    cd /tmp
    if [ ! -f "apache-tomcat-10.1.0.tar.gz" ]; then
        echo "Downloading Tomcat 10..."
        wget https://archive.apache.org/dist/tomcat/tomcat-10/v10.1.0/bin/apache-tomcat-10.1.0.tar.gz
    fi
    tar -xzf apache-tomcat-10.1.0.tar.gz
    cp -r apache-tomcat-10.1.0/* "$TOMCAT_HOME/"
    rm -rf apache-tomcat-10.1.0
fi

# Copy WAR file to webapps directory
echo "Copying WAR file to webapps directory..."
cp /tmp/pensamientoComputacional-0.0.1-SNAPSHOT.war "$WEBAPPS_DIR/"

# Set up environment variables
echo "Setting up environment variables..."
cat > "$TOMCAT_HOME/bin/setenv.sh" << 'EOF'
#!/bin/bash
export JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
export CATALINA_HOME=/home/swarch/tomcat
export CATALINA_BASE=/home/swarch/tomcat
export JAVA_OPTS="-Xms512m -Xmx1024m -Dspring.profiles.active=production"
EOF

chmod +x "$TOMCAT_HOME/bin/setenv.sh"

# Create startup script
echo "Creating startup script..."
cat > "$HOME/start-app.sh" << 'EOF'
#!/bin/bash
export JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
export CATALINA_HOME=/home/swarch/tomcat
export CATALINA_BASE=/home/swarch/tomcat
export JAVA_OPTS="-Xms512m -Xmx1024m -Dspring.profiles.active=production"

cd /home/swarch/tomcat
./bin/catalina.sh run
EOF

chmod +x "$HOME/start-app.sh"

# Create stop script
echo "Creating stop script..."
cat > "$HOME/stop-app.sh" << 'EOF'
#!/bin/bash
export CATALINA_HOME=/home/swarch/tomcat
cd /home/swarch/tomcat
./bin/catalina.sh stop
EOF

chmod +x "$HOME/stop-app.sh"

# Start the application
echo "Starting the application..."
cd "$TOMCAT_HOME"
export JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
export CATALINA_HOME="$TOMCAT_HOME"
export CATALINA_BASE="$TOMCAT_HOME"
export JAVA_OPTS="-Xms512m -Xmx1024m -Dspring.profiles.active=production"

# Start Tomcat in background
nohup ./bin/catalina.sh start > "$LOGS_DIR/startup.log" 2>&1 &

# Wait for application to start
echo "Waiting for application to start..."
sleep 30

# Check if application is running
if curl -f http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT/ > /dev/null 2>&1; then
    echo " Application deployed successfully!"
    echo "Application is accessible at: http://$(hostname -I | awk '{print $1}'):8080/pensamientoComputacional-0.0.1-SNAPSHOT/"
    echo "To start the application manually, run: $HOME/start-app.sh"
    echo "To stop the application, run: $HOME/stop-app.sh"
else
    echo " Application deployment failed. Checking logs..."
    cat "$LOGS_DIR/startup.log"
fi

echo "Deployment completed!"
