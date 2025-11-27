#!/usr/bin/env python3
"""
Script para cargar datos extendidos en RDS usando Python
Alternativa cuando psql no está disponible
"""

import os
import sys
import re

def load_env():
    """Carga variables de entorno desde .env"""
    env_vars = {}
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars

def check_psycopg2():
    """Verifica si psycopg2 está disponible"""
    try:
        import psycopg2
        return True, psycopg2
    except ImportError:
        return False, None

def execute_sql_with_psycopg2(env_vars, sql_file):
    """Ejecuta SQL usando psycopg2"""
    try:
        import psycopg2
        from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
        
        db_host = env_vars.get('DB_HOST')
        db_port = env_vars.get('DB_PORT', '5432')
        db_name = env_vars.get('DB_NAME')
        db_user = env_vars.get('DB_USER')
        db_password = env_vars.get('DB_PASSWORD')
        
        if not all([db_host, db_name, db_user, db_password]):
            print("Error: Variables de base de datos no configuradas en .env")
            print("Se requieren: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD")
            sys.exit(1)
        
        print(f"Conectando a RDS: {db_host}:{db_port}/{db_name}")
        print(f"Usuario: {db_user}")
        
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password,
            sslmode='require'
        )
        
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        print(f"Ejecutando script SQL: {sql_file}")
        
        with open(sql_file, 'r') as f:
            sql_content = f.read()
        
        # Dividir el contenido en statements individuales
        # Remover comentarios y dividir por punto y coma
        statements = []
        current_statement = ""
        
        for line in sql_content.split('\n'):
            # Ignorar líneas de comentarios
            if line.strip().startswith('--'):
                continue
            
            current_statement += line + '\n'
            
            # Si la línea termina con punto y coma, es el final de un statement
            if line.strip().endswith(';'):
                stmt = current_statement.strip()
                if stmt:
                    statements.append(stmt)
                current_statement = ""
        
        # Ejecutar cada statement
        for i, statement in enumerate(statements, 1):
            if statement.strip():
                try:
                    cursor.execute(statement)
                    print(f"  ✓ Statement {i}/{len(statements)} ejecutado")
                except Exception as e:
                    # Ignorar errores de "ya existe" (NOT EXISTS clauses)
                    if 'already exists' in str(e).lower() or 'duplicate' in str(e).lower():
                        print(f"  ⚠ Statement {i} ya existe (ignorado)")
                    else:
                        print(f"  ✗ Error en statement {i}: {e}")
                        print(f"    Statement: {statement[:100]}...")
        
        cursor.close()
        conn.close()
        
        print("\n✓ Datos extendidos cargados exitosamente")
        return True
        
    except Exception as e:
        print(f"✗ Error al conectar o ejecutar SQL: {e}")
        return False

def main():
    print("=== Cargar Datos Extendidos en RDS ===\n")
    
    # Cargar variables de entorno
    env_vars = load_env()
    if not env_vars:
        print("Error: No se pudieron cargar variables de entorno desde .env")
        sys.exit(1)
    
    # Verificar archivo SQL
    sql_file = "pensamientoComputacional/src/main/resources/data-extended.sql"
    if not os.path.exists(sql_file):
        print(f"Error: Archivo SQL no encontrado: {sql_file}")
        sys.exit(1)
    
    # Intentar usar psycopg2
    has_psycopg2, psycopg2_module = check_psycopg2()
    
    if has_psycopg2:
        print("Usando psycopg2 para conectar a PostgreSQL...\n")
        success = execute_sql_with_psycopg2(env_vars, sql_file)
        if success:
            print("\n=== Proceso completado ===")
            sys.exit(0)
        else:
            sys.exit(1)
    else:
        print("psycopg2 no está instalado.")
        print("\nPara instalar psycopg2, ejecuta:")
        print("  pip install psycopg2-binary")
        print("\nO usa el script Java alternativo:")
        print("  ./scripts/load-extended-data-java.sh")
        sys.exit(1)

if __name__ == "__main__":
    main()

