-- Insertar permisos básicos
INSERT INTO permissions (name, description) VALUES
('READ_USER', 'Permite leer información de usuarios'),
('WRITE_USER', 'Permite crear y modificar usuarios'),
('DELETE_USER', 'Permite eliminar usuarios'),
('READ_ROLE', 'Permite leer roles'),
('WRITE_ROLE', 'Permite crear y modificar roles'),
('DELETE_ROLE', 'Permite eliminar roles'),
('MANAGE_ACTIVITIES', 'Permite gestionar actividades'),
('GRADE_EXERCISES', 'Permite calificar ejercicios'),    
('VIEW_REPORTS', 'Permite ver reportes'),
('EXPORT_DATA', 'Permite exportar datos');

-- Insertar roles básicos
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Administrador del sistema'),
('PROFESSOR', 'Profesor'),
('STUDENT', 'Estudiante');

-- Asignar permisos a roles
-- Admin tiene todos los permisos
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Profesor tiene permisos específicos
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions 
WHERE name IN ('READ_USER', 'MANAGE_ACTIVITIES', 'GRADE_EXERCISES', 'VIEW_REPORTS', 'EXPORT_DATA');

-- Estudiante tiene permisos básicos
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions 
WHERE name IN ('READ_USER');

-- Insertar tipos de perfil
INSERT INTO profile_types (profile_code, description) VALUES
('BEGINNER', 'Estudiante principiante'),
('INTERMEDIATE', 'Estudiante intermedio'),
('ADVANCED', 'Estudiante avanzado'),
('PRO', 'Estudiante profesional');

-- Insertar usuario administrador por defecto
INSERT INTO users (name, email, password_hash, is_active, created_at) VALUES
('Admin', 'admin@u.icesi.edu.co', '$2a$10$xn3LI/AjqicFYZFruSwve.277PhWg4QrPx8LoC/uu2M1xf0QCqZu.', true, CURRENT_TIMESTAMP);

-- Asignar rol de admin al usuario admin
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

-- Insertar semestre actual
INSERT INTO semesters (code, start_date, end_date, is_active) VALUES
('2025-2', '2025-07-21', '2025-12-05', true);
