import java.io.*;
import java.sql.*;
import java.util.Properties;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

public class LoadExtendedData {
    public static void main(String[] args) {
        System.out.println("=== Cargar Datos Extendidos en RDS ===\n");
        
        // Cargar variables de entorno desde .env
        Properties env = loadEnvFile(".env");
        
        String dbHost = env.getProperty("DB_HOST");
        String dbPort = env.getProperty("DB_PORT", "5432");
        String dbName = env.getProperty("DB_NAME");
        String dbUser = env.getProperty("DB_USER");
        String dbPassword = env.getProperty("DB_PASSWORD");
        
        if (dbHost == null || dbName == null || dbUser == null || dbPassword == null) {
            System.err.println("Error: Variables de base de datos no configuradas en .env");
            System.err.println("Se requieren: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD");
            System.exit(1);
        }
        
        String sqlFile = "pensamientoComputacional/src/main/resources/data-extended.sql";
        
        if (!new File(sqlFile).exists()) {
            System.err.println("Error: Archivo SQL no encontrado: " + sqlFile);
            System.exit(1);
        }
        
        System.out.println("Conectando a RDS: " + dbHost + ":" + dbPort + "/" + dbName);
        System.out.println("Usuario: " + dbUser);
        System.out.println("Ejecutando script SQL: " + sqlFile + "\n");
        
        String url = "jdbc:postgresql://" + dbHost + ":" + dbPort + "/" + dbName + "?sslmode=require";
        
        try (Connection conn = DriverManager.getConnection(url, dbUser, dbPassword)) {
            conn.setAutoCommit(true);
            
            String sqlContent = readFile(sqlFile);
            String[] statements = splitStatements(sqlContent);
            
            int successCount = 0;
            int errorCount = 0;
            int skipCount = 0;
            
            for (int i = 0; i < statements.length; i++) {
                String statement = statements[i].trim();
                if (statement.isEmpty()) continue;
                
                try (Statement stmt = conn.createStatement()) {
                    stmt.execute(statement);
                    successCount++;
                    System.out.println("  ✓ Statement " + (i + 1) + "/" + statements.length + " ejecutado");
                } catch (SQLException e) {
                    // Ignorar errores de "ya existe" (NOT EXISTS clauses)
                    String errorMsg = e.getMessage().toLowerCase();
                    if (errorMsg.contains("already exists") || 
                        errorMsg.contains("duplicate") ||
                        errorMsg.contains("violates unique constraint")) {
                        skipCount++;
                        System.out.println("  ⚠ Statement " + (i + 1) + " ya existe (ignorado)");
                    } else {
                        errorCount++;
                        System.err.println("  ✗ Error en statement " + (i + 1) + ": " + e.getMessage());
                        String preview = statement.length() > 100 ? statement.substring(0, 100) + "..." : statement;
                        System.err.println("    Statement: " + preview);
                    }
                }
            }
            
            System.out.println("\n✓ Datos extendidos cargados exitosamente");
            System.out.println("  Exitosos: " + successCount);
            System.out.println("  Omitidos (ya existían): " + skipCount);
            if (errorCount > 0) {
                System.out.println("  Errores: " + errorCount);
            }
            
        } catch (SQLException e) {
            System.err.println("✗ Error al conectar a la base de datos: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        } catch (IOException e) {
            System.err.println("✗ Error al leer el archivo SQL: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
        
        System.out.println("\n=== Proceso completado ===");
    }
    
    private static Properties loadEnvFile(String filename) {
        Properties props = new Properties();
        try (BufferedReader reader = new BufferedReader(new FileReader(filename))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;
                int eqIndex = line.indexOf('=');
                if (eqIndex > 0) {
                    String key = line.substring(0, eqIndex).trim();
                    String value = line.substring(eqIndex + 1).trim();
                    props.setProperty(key, value);
                }
            }
        } catch (IOException e) {
            System.err.println("Advertencia: No se pudo cargar .env: " + e.getMessage());
        }
        return props;
    }
    
    private static String readFile(String filename) throws IOException {
        StringBuilder content = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new FileReader(filename))) {
            String line;
            while ((line = reader.readLine()) != null) {
                // Ignorar líneas de comentarios
                if (!line.trim().startsWith("--")) {
                    content.append(line).append("\n");
                }
            }
        }
        return content.toString();
    }
    
    private static String[] splitStatements(String sql) {
        // Dividir por punto y coma, pero respetar strings y comentarios
        java.util.List<String> statements = new java.util.ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inString = false;
        char stringChar = 0;
        
        for (int i = 0; i < sql.length(); i++) {
            char c = sql.charAt(i);
            
            if (!inString && (c == '\'' || c == '"')) {
                inString = true;
                stringChar = c;
                current.append(c);
            } else if (inString && c == stringChar) {
                inString = false;
                current.append(c);
            } else if (!inString && c == ';') {
                current.append(c);
                String stmt = current.toString().trim();
                if (!stmt.isEmpty()) {
                    statements.add(stmt);
                }
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        
        // Agregar el último statement si no termina con punto y coma
        String last = current.toString().trim();
        if (!last.isEmpty()) {
            statements.add(last);
        }
        
        return statements.toArray(new String[0]);
    }
}

