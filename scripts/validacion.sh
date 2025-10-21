#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
POSTMAN_DIR="$BASE_DIR/postman"
DOCS_DIR="$BASE_DIR/docs"
OUT="$BASE_DIR/reporte_validacion.txt"

APP_BASE="${APP_BASE:-http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT}"
API_DOCS_URL="${API_DOCS_URL:-$APP_BASE/api-docs}"
SWAGGER_UI_URL="${SWAGGER_UI_URL:-$APP_BASE/swagger-ui}"
COLLECTION="${COLLECTION:-$POSTMAN_DIR/pc-api.postman_collection.json}"
ENV_FILE="${ENV_FILE:-$POSTMAN_DIR/local.postman_environment.json}"
NEWMAN_HTML="${NEWMAN_HTML:-$POSTMAN_DIR/report.html}"

exec >"$OUT" 2>&1
echo "Validación puntos 3 y 5"; date
echo "Repo: $BASE_DIR"
echo "Base API: $APP_BASE"
echo "----------------------------------------"

echo "[1] Postman"
if [ -f "$COLLECTION" ]; then
  echo "Colección: OK ($COLLECTION)"
  REQ=$(jq '[..|objects|select(has("request"))]|length' "$COLLECTION" 2>/dev/null || echo 0)
  TST=$(jq -r '..|objects|select(has("event"))|.event[]?|select(.listen=="test")|.script.exec[]?' "$COLLECTION" 2>/dev/null | grep -c '^pm\.test' || echo 0)
  echo "Requests: $REQ | Tests: $TST"
else
  echo "Colección: FALTA ($COLLECTION)"
fi
echo "Entorno: $( [ -f "$ENV_FILE" ] && echo OK || echo FALTA ) $ENV_FILE"

echo "----------------------------------------"
echo "[2] Newman"
if command -v npx >/dev/null && [ -f "$COLLECTION" ] && [ -f "$ENV_FILE" ]; then
  npx --yes newman run "$COLLECTION" -e "$ENV_FILE" -r htmlextra --reporter-htmlextra-export "$NEWMAN_HTML" --insecure || true
  echo "Reporte HTML: $( [ -f "$NEWMAN_HTML" ] && echo OK || echo NO ) $NEWMAN_HTML"
else
  echo "No se ejecutó Newman (npx/colección/entorno no disponibles)."
fi

echo "----------------------------------------"
echo "[3] Swagger/OpenAPI"
API_JSON="$(curl -s "$API_DOCS_URL" || true)"
if [ -n "$API_JSON" ]; then
  echo "api-docs: OK $API_DOCS_URL"
  echo "openapi: $(echo "$API_JSON" | jq -r '.openapi' 2>/dev/null || echo desconocido)"
  echo "paths:   $(echo "$API_JSON" | jq -r '.paths|length' 2>/dev/null || echo 0)"
  echo "bearer:  $(echo "$API_JSON" | jq -r '.components.securitySchemes.bearerAuth.type' 2>/dev/null || echo no)"
else
  echo "api-docs: SIN RESPUESTA $API_DOCS_URL"
fi
echo "swagger-ui: $(curl -s -I "$SWAGGER_UI_URL" | head -n1 | tr -d '\r')"

echo "----------------------------------------"
echo "[4] Contrato"
if [ -f "$DOCS_DIR/openapi.json" ]; then
  echo "Contrato: OK $DOCS_DIR/openapi.json"
  jq '.paths|length' "$DOCS_DIR/openapi.json" 2>/dev/null || true
else
  echo "Contrato: NO $DOCS_DIR/openapi.json"
fi

echo "----------------------------------------"
RES=PASS
[ -f "$COLLECTION" ] || RES=FAIL
[ -n "$API_JSON" ] || RES=FAIL
echo "Resultado: $RES"
echo "Reporte: $OUT"

