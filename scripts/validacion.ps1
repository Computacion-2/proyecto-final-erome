# PowerShell version of validation script
param(
    [string]$AppBase = "http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT",
    [string]$ApiDocsUrl = "$AppBase/api-docs",
    [string]$SwaggerUiUrl = "$AppBase/swagger-ui",
    [string]$Collection = "postman/pc-api.postman_collection.json",
    [string]$EnvFile = "postman/local.postman_environment.json",
    [string]$NewmanHtml = "postman/report.html"
)

$BaseDir = Split-Path -Parent $PSScriptRoot
$PostmanDir = Join-Path $BaseDir "postman"
$DocsDir = Join-Path $BaseDir "docs"
$Out = Join-Path $BaseDir "reporte_validacion.txt"

# Set full paths
$Collection = Join-Path $BaseDir $Collection
$EnvFile = Join-Path $BaseDir $EnvFile
$NewmanHtml = Join-Path $BaseDir $NewmanHtml

# Redirect output to file
$null = Start-Process -FilePath "powershell" -ArgumentList "-Command", @"
Write-Output "Validación puntos 3 y 5"; Get-Date
Write-Output "Repo: $BaseDir"
Write-Output "Base API: $AppBase"
Write-Output "----------------------------------------"

Write-Output "[1] Postman"
if (Test-Path "$Collection") {
    Write-Output "Colección: OK ($Collection)"
    try {
        `$json = Get-Content "$Collection" | ConvertFrom-Json
        `$reqCount = (`$json.item | Measure-Object).Count
        Write-Output "Requests: `$reqCount"
    } catch {
        Write-Output "Requests: Error parsing collection"
    }
} else {
    Write-Output "Colección: FALTA ($Collection)"
}

if (Test-Path "$EnvFile") {
    Write-Output "Entorno: OK $EnvFile"
} else {
    Write-Output "Entorno: FALTA $EnvFile"
}

Write-Output "----------------------------------------"
Write-Output "[2] Newman"
if (Get-Command npx -ErrorAction SilentlyContinue) {
    if ((Test-Path "$Collection") -and (Test-Path "$EnvFile")) {
        try {
            npx --yes newman run "$Collection" -e "$EnvFile" -r htmlextra --reporter-htmlextra-export "$NewmanHtml" --insecure
            if (Test-Path "$NewmanHtml") {
                Write-Output "Reporte HTML: OK $NewmanHtml"
            } else {
                Write-Output "Reporte HTML: NO $NewmanHtml"
            }
        } catch {
            Write-Output "Error ejecutando Newman: `$_"
        }
    } else {
        Write-Output "No se ejecutó Newman (colección/entorno no disponibles)."
    }
} else {
    Write-Output "No se ejecutó Newman (npx no disponible)."
}

Write-Output "----------------------------------------"
Write-Output "[3] Swagger/OpenAPI"
try {
    `$apiResponse = Invoke-WebRequest -Uri "$ApiDocsUrl" -UseBasicParsing -ErrorAction SilentlyContinue
    if (`$apiResponse.StatusCode -eq 200) {
        Write-Output "api-docs: OK $ApiDocsUrl"
        try {
            `$apiJson = `$apiResponse.Content | ConvertFrom-Json
            Write-Output "openapi: `$(`$apiJson.openapi)"
            Write-Output "paths: `$(`$apiJson.paths.PSObject.Properties.Count)"
            if (`$apiJson.components.securitySchemes.bearerAuth) {
                Write-Output "bearer: `$(`$apiJson.components.securitySchemes.bearerAuth.type)"
            } else {
                Write-Output "bearer: no"
            }
        } catch {
            Write-Output "Error parsing API JSON"
        }
    } else {
        Write-Output "api-docs: SIN RESPUESTA $ApiDocsUrl"
    }
} catch {
    Write-Output "api-docs: SIN RESPUESTA $ApiDocsUrl"
}

try {
    `$swaggerResponse = Invoke-WebRequest -Uri "$SwaggerUiUrl" -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Output "swagger-ui: `$(`$swaggerResponse.StatusCode) `$(`$swaggerResponse.StatusDescription)"
} catch {
    Write-Output "swagger-ui: SIN RESPUESTA $SwaggerUiUrl"
}

Write-Output "----------------------------------------"
Write-Output "[4] Contrato"
if (Test-Path "$DocsDir/openapi.json") {
    Write-Output "Contrato: OK $DocsDir/openapi.json"
    try {
        `$contractJson = Get-Content "$DocsDir/openapi.json" | ConvertFrom-Json
        Write-Output "Paths en contrato: `$(`$contractJson.paths.PSObject.Properties.Count)"
    } catch {
        Write-Output "Error parsing contract JSON"
    }
} else {
    Write-Output "Contrato: NO $DocsDir/openapi.json"
}

Write-Output "----------------------------------------"
`$res = "PASS"
if (-not (Test-Path "$Collection")) { `$res = "FAIL" }
if (-not `$apiResponse -or `$apiResponse.StatusCode -ne 200) { `$res = "FAIL" }
Write-Output "Resultado: `$res"
Write-Output "Reporte: $Out"
"@ -RedirectStandardOutput $Out -Wait -NoNewWindow

Write-Host "Validación completada. Reporte generado en: $Out"
Write-Host "Contenido del reporte:"
Get-Content $Out
