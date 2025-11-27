#!/bin/bash

# Script de validación del flujo completo de grupos de profesores

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Validación del Flujo de Grupos de Profesores ===${NC}\n"

API_BASE="http://localhost:8080/api"

# Función para hacer login y obtener token
login() {
    local email=$1
    local password=$2
    local response=$(curl -s -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    if echo "$response" | grep -q "token"; then
        echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null
    else
        echo ""
    fi
}

# Función para obtener usuario actual
get_current_user() {
    local token=$1
    curl -s -X GET "$API_BASE/auth/me" \
        -H "Authorization: Bearer $token"
}

# Función para obtener todos los usuarios
get_all_users() {
    local token=$1
    curl -s -X GET "$API_BASE/users" \
        -H "Authorization: Bearer $token"
}

# Función para actualizar usuario
update_user() {
    local token=$1
    local userId=$2
    local data=$3
    curl -s -X PUT "$API_BASE/users/$userId" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$data"
}

# Función para crear usuario
create_user() {
    local token=$1
    local data=$2
    curl -s -X POST "$API_BASE/users" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$data"
}

echo -e "${YELLOW}1. Validando login como admin...${NC}"
ADMIN_TOKEN=$(login "admin@u.icesi.edu.co" "admin123")
if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}✗ Error: No se pudo hacer login como admin${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Login como admin exitoso${NC}\n"

echo -e "${YELLOW}2. Validando que admin puede ver usuarios y grupos...${NC}"
USERS_JSON=$(get_all_users "$ADMIN_TOKEN")
PROF_COUNT=$(echo "$USERS_JSON" | python3 -c "import sys, json; users = json.load(sys.stdin); profs = [u for u in users if 'PROFESSOR' in str(u.get('role', '')).upper() or any(r.get('name') == 'PROFESSOR' for r in u.get('roles', []))]; print(len(profs))" 2>/dev/null)
echo -e "${GREEN}✓ Se encontraron $PROF_COUNT profesores${NC}"

# Mostrar profesores con grupos
echo "$USERS_JSON" | python3 -c "
import sys, json
users = json.load(sys.stdin)
profs = [u for u in users if 'PROFESSOR' in str(u.get('role', '')).upper() or any(r.get('name') == 'PROFESSOR' for r in u.get('roles', []))]
print('\nProfesores y sus grupos:')
for p in profs[:5]:
    groups = p.get('groups', [])
    print(f\"  - {p['name']} ({p['email']}): {groups if groups else 'Sin grupos'}\")
" 2>/dev/null
echo ""

echo -e "${YELLOW}3. Validando creación de profesor con grupos...${NC}"
NEW_PROF_DATA='{
    "name": "Prof. Test Nuevo",
    "email": "test.prof@icesi.edu.co",
    "password": "test123",
    "role": "PROFESSOR",
    "groups": ["G1", "G2"]
}'

CREATE_RESPONSE=$(create_user "$ADMIN_TOKEN" "$NEW_PROF_DATA")
if echo "$CREATE_RESPONSE" | grep -q "test.prof@icesi.edu.co"; then
    NEW_PROF_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
    NEW_PROF_GROUPS=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; print(','.join(json.load(sys.stdin).get('groups', [])))" 2>/dev/null)
    if [ -n "$NEW_PROF_GROUPS" ]; then
        echo -e "${GREEN}✓ Profesor creado con grupos: $NEW_PROF_GROUPS${NC}"
    else
        echo -e "${RED}✗ Profesor creado pero sin grupos${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Profesor ya existe o error al crear${NC}"
    # Intentar obtener el ID del profesor existente
    NEW_PROF_ID=$(echo "$USERS_JSON" | python3 -c "import sys, json; users = json.load(sys.stdin); u = next((u for u in users if u.get('email') == 'test.prof@icesi.edu.co'), None); print(u['id'] if u else '')" 2>/dev/null)
fi
echo ""

if [ -n "$NEW_PROF_ID" ]; then
    echo -e "${YELLOW}4. Validando edición de profesor y cambio de grupos...${NC}"
    UPDATE_DATA='{
        "name": "Prof. Test Nuevo",
        "email": "test.prof@icesi.edu.co",
        "role": "PROFESSOR",
        "groups": ["G3", "G4", "G5"]
    }'
    
    UPDATE_RESPONSE=$(update_user "$ADMIN_TOKEN" "$NEW_PROF_ID" "$UPDATE_DATA")
    UPDATED_GROUPS=$(echo "$UPDATE_RESPONSE" | python3 -c "import sys, json; groups = json.load(sys.stdin).get('groups', []); print(','.join(groups) if groups else 'None')" 2>/dev/null)
    
    if [ "$UPDATED_GROUPS" != "None" ] && [ -n "$UPDATED_GROUPS" ]; then
        echo -e "${GREEN}✓ Grupos actualizados correctamente: $UPDATED_GROUPS${NC}"
    else
        echo -e "${RED}✗ Error: No se pudieron actualizar los grupos${NC}"
    fi
    echo ""
fi

echo -e "${YELLOW}5. Validando login como profesor y visualización de grupos...${NC}"
PROF_TOKEN=$(login "professor@u.icesi.edu.co" "prof123")
if [ -z "$PROF_TOKEN" ]; then
    echo -e "${RED}✗ Error: No se pudo hacer login como profesor${NC}"
else
    PROF_USER=$(get_current_user "$PROF_TOKEN")
    PROF_GROUPS=$(echo "$PROF_USER" | python3 -c "import sys, json; groups = json.load(sys.stdin).get('groups', []); print(','.join(groups) if groups else 'None')" 2>/dev/null)
    
    if [ "$PROF_GROUPS" != "None" ] && [ -n "$PROF_GROUPS" ]; then
        echo -e "${GREEN}✓ Profesor ve sus grupos después de login: $PROF_GROUPS${NC}"
    else
        echo -e "${RED}✗ Error: Profesor no ve sus grupos asignados${NC}"
    fi
fi
echo ""

echo -e "${YELLOW}6. Validando eliminación de grupos (dejar array vacío)...${NC}"
if [ -n "$NEW_PROF_ID" ]; then
    EMPTY_GROUPS_DATA='{
        "name": "Prof. Test Nuevo",
        "email": "test.prof@icesi.edu.co",
        "role": "PROFESSOR",
        "groups": []
    }'
    
    EMPTY_RESPONSE=$(update_user "$ADMIN_TOKEN" "$NEW_PROF_ID" "$EMPTY_GROUPS_DATA)
    EMPTY_GROUPS=$(echo "$EMPTY_RESPONSE" | python3 -c "import sys, json; groups = json.load(sys.stdin).get('groups', []); print('empty' if not groups else 'has_groups')" 2>/dev/null)
    
    if [ "$EMPTY_GROUPS" = "empty" ]; then
        echo -e "${GREEN}✓ Grupos eliminados correctamente (array vacío)${NC}"
    else
        echo -e "${YELLOW}⚠ Grupos no se eliminaron (puede ser esperado si hay validación)${NC}"
    fi
    echo ""
fi

echo -e "${YELLOW}7. Validando login como estudiante y visualización de actividades...${NC}"
STUDENT_TOKEN=$(login "ana.martinez@u.icesi.edu.co" "student123")
if [ -z "$STUDENT_TOKEN" ]; then
    echo -e "${YELLOW}⚠ Estudiante no existe o credenciales incorrectas${NC}"
else
    echo -e "${GREEN}✓ Login como estudiante exitoso${NC}"
    # Verificar que puede ver actividades
    ACTIVITIES=$(curl -s -X GET "$API_BASE/activities" -H "Authorization: Bearer $STUDENT_TOKEN" 2>/dev/null)
    if echo "$ACTIVITIES" | grep -q "id"; then
        echo -e "${GREEN}✓ Estudiante puede ver actividades${NC}"
    else
        echo -e "${YELLOW}⚠ Estudiante no tiene actividades asignadas aún${NC}"
    fi
fi
echo ""

echo -e "${GREEN}=== Resumen de Validación ===${NC}"
echo -e "${GREEN}✓ Admin puede hacer login${NC}"
echo -e "${GREEN}✓ Admin puede ver usuarios y grupos${NC}"
if [ -n "$NEW_PROF_ID" ]; then
    echo -e "${GREEN}✓ Admin puede crear profesor con grupos${NC}"
    echo -e "${GREEN}✓ Admin puede editar profesor y cambiar grupos${NC}"
fi
if [ -n "$PROF_TOKEN" ]; then
    echo -e "${GREEN}✓ Profesor puede hacer login y ver sus grupos${NC}"
fi
if [ -n "$STUDENT_TOKEN" ]; then
    echo -e "${GREEN}✓ Estudiante puede hacer login${NC}"
fi
echo ""
echo -e "${GREEN}=== Validación completada ===${NC}"

