# Scripts de Validación - Puntos 3 y 5

Este directorio contiene scripts para validar automáticamente la implementación de los puntos 3 (Pruebas Postman) y 5 (Documentación Swagger/OpenAPI).

## Scripts Disponibles

### `validacion.sh` (Bash/Linux/macOS)
Script principal para sistemas Unix-like.

### `validacion.ps1` (PowerShell/Windows)
Versión PowerShell para sistemas Windows.

## Uso

### Opción 1: Script Bash (recomendado para Linux/macOS/WSL)

```bash
# Hacer ejecutable (solo la primera vez)
chmod +x scripts/validacion.sh

# Validación local (requiere la app corriendo en localhost:8080)
bash scripts/validacion.sh

# Validación contra el servidor
APP_BASE="http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT" \
API_DOCS_URL="$APP_BASE/api-docs" \
SWAGGER_UI_URL="$APP_BASE/swagger-ui" \
ENV_FILE="postman/server.postman_environment.json" \
bash scripts/validacion.sh
```

### Opción 2: Script PowerShell (Windows)

```powershell
# Validación local
.\scripts\validacion.ps1

# Validación contra el servidor
.\scripts\validacion.ps1 -AppBase "http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT" -EnvFile "postman/server.postman_environment.json"
```

## Variables de Entorno (Bash)

| Variable | Valor por defecto | Descripción |
|----------|-------------------|--------------|
| `APP_BASE` | `http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT` | URL base de la aplicación |
| `API_DOCS_URL` | `$APP_BASE/api-docs` | URL del endpoint de documentación OpenAPI |
| `SWAGGER_UI_URL` | `$APP_BASE/swagger-ui` | URL de la interfaz Swagger UI |
| `COLLECTION` | `postman/pc-api.postman_collection.json` | Ruta a la colección Postman |
| `ENV_FILE` | `postman/local.postman_environment.json` | Ruta al archivo de entorno Postman |
| `NEWMAN_HTML` | `postman/report.html` | Ruta del reporte HTML de Newman |

## Parámetros (PowerShell)

| Parámetro | Valor por defecto | Descripción |
|-----------|-------------------|--------------|
| `-AppBase` | `http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT` | URL base de la aplicación |
| `-ApiDocsUrl` | `$AppBase/api-docs` | URL del endpoint de documentación OpenAPI |
| `-SwaggerUiUrl` | `$AppBase/swagger-ui` | URL de la interfaz Swagger UI |
| `-Collection` | `postman/pc-api.postman_collection.json` | Ruta a la colección Postman |
| `-EnvFile` | `postman/local.postman_environment.json` | Ruta al archivo de entorno Postman |
| `-NewmanHtml` | `postman/report.html` | Ruta del reporte HTML de Newman |

## Qué Valida el Script

### [1] Postman
- ✅ Presencia de la colección `pc-api.postman_collection.json`
- ✅ Presencia del archivo de entorno
- ✅ Conteo de requests y tests en la colección

### [2] Newman
- ✅ Ejecución de pruebas con Newman
- ✅ Generación del reporte HTML
- ✅ Verificación de que el reporte se creó correctamente

### [3] Swagger/OpenAPI
- ✅ Accesibilidad del endpoint `/api-docs`
- ✅ Validación del formato OpenAPI
- ✅ Conteo de paths documentados
- ✅ Verificación de la configuración de seguridad JWT
- ✅ Accesibilidad de Swagger UI

### [4] Contrato
- ✅ Presencia del contrato estático `docs/openapi.json`
- ✅ Conteo de paths en el contrato

## Resultado

El script genera un archivo `reporte_validacion.txt` en la raíz del proyecto con:

- **Timestamp** de la validación
- **Estado detallado** de cada componente
- **Métricas** (número de requests, tests, paths, etc.)
- **Resultado final**: `PASS` o `FAIL`

## Criterios de Éxito

Para que el resultado sea `PASS`:
- ✅ Colección Postman debe existir
- ✅ API docs debe responder correctamente
- ✅ Contrato OpenAPI debe existir

## Ejemplos de Uso

### Validación Completa Local
```bash
# Asegúrate de que la app esté corriendo en localhost:8080
bash scripts/validacion.sh
```

### Validación Contra Servidor
```bash
# Validar contra el servidor desplegado
APP_BASE="http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT" \
ENV_FILE="postman/server.postman_environment.json" \
bash scripts/validacion.sh
```

### Solo Verificar Archivos (sin ejecutar Newman)
```bash
# Si no tienes Node.js instalado, solo verifica archivos
COLLECTION="postman/pc-api.postman_collection.json" \
bash scripts/validacion.sh
```

## Troubleshooting

### Error: "npx not found"
- Instala Node.js y npm
- O usa solo la validación de archivos sin ejecutar Newman

### Error: "curl not found"
- Instala curl
- O usa el script PowerShell en Windows

### Error: "jq not found"
- Instala jq para parsing de JSON
- O usa el script PowerShell que usa ConvertFrom-Json

### API no responde
- Verifica que la aplicación esté corriendo
- Verifica la URL base
- Verifica conectividad de red

