#!/bin/bash
# Script para iniciar el backend con la configuración correcta

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Iniciando Backend ===${NC}"
echo ""

# Configurar JAVA_HOME para usar Java 21
if [ -d "/usr/lib/jvm/java-21-openjdk" ]; then
    OLD_JAVA_HOME="$JAVA_HOME"
    export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
    export PATH=$JAVA_HOME/bin:$PATH
    if [ -n "$OLD_JAVA_HOME" ] && [ "$OLD_JAVA_HOME" != "$JAVA_HOME" ]; then
        echo -e "${YELLOW}⚠${NC} JAVA_HOME estaba configurado a otra versión ($OLD_JAVA_HOME), actualizando a: $JAVA_HOME"
    else
        echo "Usando Java 21: $JAVA_HOME"
    fi
else
    echo -e "${YELLOW}⚠${NC} Java 21 no encontrado en /usr/lib/jvm/java-21-openjdk"
    exit 1
fi

# Activar perfiles de Spring Boot
export SPRING_PROFILES_ACTIVE=prod,aws
echo "Perfiles activos: $SPRING_PROFILES_ACTIVE"

# Cargar variables de entorno
if [ -f "load-env.sh" ]; then
    source load-env.sh
    echo "Variables de entorno cargadas"
else
    echo -e "${YELLOW}⚠${NC} Archivo load-env.sh no encontrado"
fi

# Cambiar al directorio del backend
cd pensamientoComputacional

# Verificar si el puerto 8080 está en uso
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠${NC} Puerto 8080 ya está en uso"
    echo "¿Deseas detener el proceso existente? (s/n)"
    read -r response
    if [[ "$response" =~ ^[Ss]$ ]]; then
        echo "Deteniendo proceso en puerto 8080..."
        lsof -ti:8080 | xargs kill -9 2>/dev/null || true
        sleep 2
    else
        echo "Saliendo..."
        exit 1
    fi
fi

# Iniciar el backend
echo ""
echo -e "${GREEN}Iniciando Spring Boot...${NC}"
echo ""

mvn spring-boot:run -DskipTests

