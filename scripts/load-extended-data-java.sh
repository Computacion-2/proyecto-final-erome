#!/bin/bash

# Script para cargar datos extendidos en RDS usando Java
# Alternativa cuando psql no está disponible

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Cargar Datos Extendidos en RDS (Java) ===${NC}"

# Verificar que Java esté disponible
if ! command -v java &> /dev/null; then
    echo -e "${RED}Error: Java no está instalado${NC}"
    exit 1
fi

# Verificar que Maven esté disponible
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}Error: Maven no está instalado${NC}"
    exit 1
fi

# Obtener directorio del script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Ruta al script Java
JAVA_SCRIPT="$SCRIPT_DIR/LoadExtendedData.java"
SQL_FILE="$PROJECT_ROOT/pensamientoComputacional/src/main/resources/data-extended.sql"

if [ ! -f "$JAVA_SCRIPT" ]; then
    echo -e "${RED}Error: Archivo Java no encontrado: $JAVA_SCRIPT${NC}"
    exit 1
fi

if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}Error: Archivo SQL no encontrado: $SQL_FILE${NC}"
    exit 1
fi

# Buscar el driver de PostgreSQL en el repositorio Maven local
POSTGRES_DRIVER=$(find ~/.m2/repository/org/postgresql/postgresql -name "postgresql-*.jar" 2>/dev/null | head -1)

if [ -z "$POSTGRES_DRIVER" ]; then
    echo -e "${YELLOW}Driver PostgreSQL no encontrado. Descargando dependencias Maven...${NC}"
    cd "$PROJECT_ROOT/pensamientoComputacional"
    mvn dependency:copy-dependencies -DincludeArtifactIds=postgresql -q 2>/dev/null
    POSTGRES_DRIVER=$(find target/dependency -name "postgresql-*.jar" 2>/dev/null | head -1)
    cd "$PROJECT_ROOT"
fi

if [ -z "$POSTGRES_DRIVER" ]; then
    echo -e "${YELLOW}Descargando dependencias Maven completas...${NC}"
    cd "$PROJECT_ROOT/pensamientoComputacional"
    mvn dependency:copy-dependencies -q 2>/dev/null
    POSTGRES_DRIVER=$(find target/dependency -name "postgresql-*.jar" 2>/dev/null | head -1)
    cd "$PROJECT_ROOT"
fi

if [ -z "$POSTGRES_DRIVER" ]; then
    echo -e "${RED}Error: No se pudo encontrar el driver de PostgreSQL${NC}"
    echo -e "${YELLOW}Intenta ejecutar: cd pensamientoComputacional && mvn dependency:resolve${NC}"
    exit 1
fi

echo -e "${GREEN}Driver encontrado: $POSTGRES_DRIVER${NC}"

echo -e "${YELLOW}Compilando script Java...${NC}"

# Compilar el script Java
javac -cp "$POSTGRES_DRIVER" "$JAVA_SCRIPT" -d "$SCRIPT_DIR/"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error al compilar el script Java${NC}"
    exit 1
fi

echo -e "${YELLOW}Ejecutando script...${NC}\n"

# Cambiar al directorio del proyecto para que el script encuentre .env y el SQL
cd "$PROJECT_ROOT"

# Ejecutar el script Java
java -cp "$SCRIPT_DIR/:$POSTGRES_DRIVER" LoadExtendedData

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}=== Proceso completado ===${NC}"
else
    echo -e "\n${RED}✗ Error al ejecutar el script${NC}"
    exit 1
fi

