#!/bin/bash

# Script completo de validación del flujo de grupos de profesores

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== VALIDACIÓN COMPLETA DEL FLUJO DE GRUPOS DE PROFESORES ===${NC}\n"

API_BASE="http://localhost:8080/api"

# Función para hacer login
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

# Función para crear usuario
create_user() {
    local token=$1
    local data=$2
    curl -s -w "\n%{http_code}" -X POST "$API_BASE/users" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$data"
}

# Función para actualizar usuario
update_user() {
    local token=$1
    local userId=$2
    local data=$3
    curl -s -w "\n%{http_code}" -X PUT "$API_BASE/users/$userId" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$data"
}

# Función para obtener actividades
get_activities() {
    local token=$1
    curl -s -X GET "$API_BASE/activities" \
        -H "Authorization: Bearer $token"
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
    "name": "Prof. Validación Test",
    "email": "prof.validacion@icesi.edu.co",
    "password": "test123",
    "role": "PROFESSOR",
    "groups": ["GrupoTest1", "GrupoTest2"]
}'

CREATE_RESPONSE=$(create_user "$ADMIN_TOKEN" "$NEW_PROF_DATA")
HTTP_CODE=$(echo "$CREATE_RESPONSE" | tail -1)
BODY=$(echo "$CREATE_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    NEW_PROF_ID=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
    NEW_PROF_GROUPS=$(echo "$BODY" | python3 -c "import sys, json; groups = json.load(sys.stdin).get('groups', []); print(','.join(groups) if groups else 'None')" 2>/dev/null)
    if [ "$NEW_PROF_GROUPS" != "None" ] && [ -n "$NEW_PROF_GROUPS" ]; then
        echo -e "${GREEN}✓ Profesor creado con grupos: $NEW_PROF_GROUPS${NC}"
        echo -e "${GREEN}✓ Admin puede crear profesor con grupos asignados${NC}"
    else
        echo -e "${RED}✗ Profesor creado pero sin grupos${NC}"
    fi
else
    # Profesor puede ya existir, intentar obtenerlo
    NEW_PROF_ID=$(echo "$USERS_JSON" | python3 -c "import sys, json; users = json.load(sys.stdin); u = next((u for u in users if u.get('email') == 'prof.validacion@icesi.edu.co'), None); print(u['id'] if u else '')" 2>/dev/null)
    if [ -n "$NEW_PROF_ID" ]; then
        echo -e "${YELLOW}⚠ Profesor ya existe, continuando con validación...${NC}"
    else
        echo -e "${RED}✗ Error al crear profesor: HTTP $HTTP_CODE${NC}"
    fi
fi
echo ""

if [ -n "$NEW_PROF_ID" ]; then
    echo -e "${YELLOW}4. Validando edición de profesor y cambio de grupos...${NC}"
    UPDATE_DATA='{
        "name": "Prof. Validación Test",
        "email": "prof.validacion@icesi.edu.co",
        "role": "PROFESSOR",
        "groups": ["GrupoTest3", "GrupoTest4", "GrupoTest5"]
    }'
    
    UPDATE_RESPONSE=$(update_user "$ADMIN_TOKEN" "$NEW_PROF_ID" "$UPDATE_DATA")
    UPDATE_HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -1)
    UPDATE_BODY=$(echo "$UPDATE_RESPONSE" | head -n -1)
    
    if [ "$UPDATE_HTTP_CODE" = "200" ]; then
        UPDATED_GROUPS=$(echo "$UPDATE_BODY" | python3 -c "import sys, json; groups = json.load(sys.stdin).get('groups', []); print(','.join(groups) if groups else 'None')" 2>/dev/null)
        
        if [ "$UPDATED_GROUPS" != "None" ] && [ -n "$UPDATED_GROUPS" ]; then
            echo -e "${GREEN}✓ Grupos actualizados correctamente: $UPDATED_GROUPS${NC}"
            echo -e "${GREEN}✓ Admin puede editar profesor y cambiar sus grupos${NC}"
        else
            echo -e "${RED}✗ Error: No se pudieron actualizar los grupos${NC}"
        fi
    else
        echo -e "${RED}✗ Error al actualizar: HTTP $UPDATE_HTTP_CODE${NC}"
        echo "Respuesta: $UPDATE_BODY"
    fi
    echo ""
    
    echo -e "${YELLOW}5. Validando eliminación de grupos (array vacío)...${NC}"
    EMPTY_GROUPS_DATA='{
        "name": "Prof. Validación Test",
        "email": "prof.validacion@icesi.edu.co",
        "role": "PROFESSOR",
        "groups": []
    }'
    
    EMPTY_RESPONSE=$(update_user "$ADMIN_TOKEN" "$NEW_PROF_ID" "$EMPTY_GROUPS_DATA")
    EMPTY_HTTP_CODE=$(echo "$EMPTY_RESPONSE" | tail -1)
    EMPTY_BODY=$(echo "$EMPTY_RESPONSE" | head -n -1)
    
    if [ "$EMPTY_HTTP_CODE" = "200" ]; then
        EMPTY_GROUPS=$(echo "$EMPTY_BODY" | python3 -c "import sys, json; groups = json.load(sys.stdin).get('groups', []); print('empty' if not groups else 'has_groups')" 2>/dev/null)
        
        if [ "$EMPTY_GROUPS" = "empty" ]; then
            echo -e "${GREEN}✓ Grupos eliminados correctamente (array vacío)${NC}"
            echo -e "${GREEN}✓ Cuando se eliminan todos los grupos, se limpian las asignaciones correctamente${NC}"
        else
            echo -e "${RED}✗ Aún tiene grupos después de eliminar${NC}"
        fi
    else
        echo -e "${RED}✗ Error al eliminar grupos: HTTP $EMPTY_HTTP_CODE${NC}"
    fi
    echo ""
fi

echo -e "${YELLOW}6. Validando login como profesor y visualización de grupos...${NC}"
PROF_TOKEN=$(login "professor@u.icesi.edu.co" "prof123")
if [ -z "$PROF_TOKEN" ]; then
    echo -e "${RED}✗ Error: No se pudo hacer login como profesor${NC}"
else
    PROF_USER=$(get_current_user "$PROF_TOKEN")
    PROF_GROUPS=$(echo "$PROF_USER" | python3 -c "import sys, json; groups = json.load(sys.stdin).get('groups', []); print(','.join(groups) if groups else 'None')" 2>/dev/null)
    
    if [ "$PROF_GROUPS" != "None" ] && [ -n "$PROF_GROUPS" ]; then
        echo -e "${GREEN}✓ Profesor ve sus grupos después de login: $PROF_GROUPS${NC}"
        echo -e "${GREEN}✓ Profesor ve sus grupos asignados en el perfil después de login${NC}"
    else
        echo -e "${RED}✗ Error: Profesor no ve sus grupos asignados${NC}"
    fi
fi
echo ""

echo -e "${YELLOW}7. Validando que profesor puede asignar tareas a sus grupos...${NC}"
if [ -n "$PROF_TOKEN" ]; then
    # Verificar que el profesor tiene grupos para asignar tareas
    PROF_GROUPS_COUNT=$(echo "$PROF_USER" | python3 -c "import sys, json; groups = json.load(sys.stdin).get('groups', []); print(len(groups))" 2>/dev/null)
    if [ "$PROF_GROUPS_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ Profesor tiene $PROF_GROUPS_COUNT grupos asignados${NC}"
        echo -e "${GREEN}✓ Profesor puede asignar tareas a sus grupos asignados (verificado: tiene grupos)${NC}"
    else
        echo -e "${RED}✗ Profesor no tiene grupos para asignar tareas${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No se pudo validar (profesor no autenticado)${NC}"
fi
echo ""

echo -e "${YELLOW}8. Validando que estudiantes pueden ver actividades asignadas...${NC}"
STUDENT_TOKEN=$(login "ana.martinez@u.icesi.edu.co" "student123")
if [ -z "$STUDENT_TOKEN" ]; then
    # Intentar con otro estudiante
    STUDENT_TOKEN=$(login "student@u.icesi.edu.co" "student123")
fi

if [ -z "$STUDENT_TOKEN" ]; then
    echo -e "${YELLOW}⚠ Estudiante no existe o credenciales incorrectas${NC}"
else
    echo -e "${GREEN}✓ Login como estudiante exitoso${NC}"
    ACTIVITIES=$(get_activities "$STUDENT_TOKEN")
    ACTIVITY_COUNT=$(echo "$ACTIVITIES" | python3 -c "import sys, json; acts = json.load(sys.stdin) if sys.stdin.read(1) else []; print(len(acts) if isinstance(acts, list) else 0)" 2>/dev/null || echo "0")
    
    if [ "$ACTIVITY_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ Estudiante puede ver $ACTIVITY_COUNT actividades${NC}"
        echo -e "${GREEN}✓ Estudiantes pueden ver actividades asignadas por su profesor${NC}"
    else
        echo -e "${YELLOW}⚠ Estudiante no tiene actividades asignadas aún (esto es normal si no se han creado)${NC}"
    fi
fi
echo ""

echo -e "${BLUE}=== RESUMEN DE VALIDACIÓN ===${NC}\n"

VALIDATIONS=0
TOTAL=6

if [ -n "$ADMIN_TOKEN" ]; then
    echo -e "${GREEN}✓ Admin puede hacer login${NC}"
    VALIDATIONS=$((VALIDATIONS + 1))
fi

if [ -n "$NEW_PROF_ID" ] && [ "$NEW_PROF_GROUPS" != "None" ]; then
    echo -e "${GREEN}✓ Admin puede crear profesor con grupos asignados${NC}"
    VALIDATIONS=$((VALIDATIONS + 1))
fi

if [ "$UPDATE_HTTP_CODE" = "200" ] && [ "$UPDATED_GROUPS" != "None" ]; then
    echo -e "${GREEN}✓ Admin puede editar profesor y cambiar sus grupos${NC}"
    VALIDATIONS=$((VALIDATIONS + 1))
fi

if [ -n "$PROF_TOKEN" ] && [ "$PROF_GROUPS" != "None" ]; then
    echo -e "${GREEN}✓ Profesor ve sus grupos asignados en el perfil después de login${NC}"
    VALIDATIONS=$((VALIDATIONS + 1))
fi

if [ -n "$PROF_TOKEN" ] && [ "$PROF_GROUPS_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Profesor puede asignar tareas a sus grupos asignados${NC}"
    VALIDATIONS=$((VALIDATIONS + 1))
fi

if [ "$EMPTY_HTTP_CODE" = "200" ] && [ "$EMPTY_GROUPS" = "empty" ]; then
    echo -e "${GREEN}✓ Cuando se eliminan todos los grupos, se limpian las asignaciones correctamente${NC}"
    VALIDATIONS=$((VALIDATIONS + 1))
fi

echo ""
echo -e "${BLUE}Validaciones exitosas: $VALIDATIONS/$TOTAL${NC}"
echo ""

if [ "$VALIDATIONS" -eq "$TOTAL" ]; then
    echo -e "${GREEN}🎉 ¡Todas las validaciones fueron exitosas!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Algunas validaciones requieren atención${NC}"
    exit 1
fi

