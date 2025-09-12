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

-- Usuarios adicionales: profesor y estudiante
INSERT INTO users (name, email, password_hash, is_active, created_at)
SELECT 'Prof. John Doe', 'professor@u.icesi.edu.co', '$2a$10$xn3LI/AjqicFYZFruSwve.277PhWg4QrPx8LoC/uu2M1xf0QCqZu.', true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'professor@u.icesi.edu.co');

INSERT INTO users (name, email, password_hash, is_active, created_at)
SELECT 'Student Jane Roe', 'student@u.icesi.edu.co', '$2a$10$xn3LI/AjqicFYZFruSwve.277PhWg4QrPx8LoC/uu2M1xf0QCqZu.', true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'student@u.icesi.edu.co');

-- Asignar roles a profesor y estudiante
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'professor@u.icesi.edu.co' AND r.name = 'PROFESSOR'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id
);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'student@u.icesi.edu.co' AND r.name = 'STUDENT'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Crear profesor y estudiante (extensiones de usuario)
INSERT INTO professors (user_id)
SELECT u.id FROM users u
WHERE u.email = 'professor@u.icesi.edu.co'
AND NOT EXISTS (SELECT 1 FROM professors p WHERE p.user_id = u.id);

INSERT INTO students (user_id, initial_profile)
SELECT u.id, 'BEGINNER' FROM users u
WHERE u.email = 'student@u.icesi.edu.co'
AND NOT EXISTS (SELECT 1 FROM students s WHERE s.user_id = u.id);

-- Crear grupo para el semestre actual
INSERT INTO groups (name, course_id, semester_id)
SELECT 'Group A', NULL, s.id FROM semesters s
WHERE s.code = '2025-2'
AND NOT EXISTS (
  SELECT 1 FROM groups g WHERE g.name = 'Group A' AND g.semester_id = s.id
);

-- Asignación de profesor al grupo en el semestre
INSERT INTO professor_assignments (professor_id, group_id, semester_id)
SELECT p.user_id, g.id, s.id
FROM professors p, groups g, semesters s, users u
WHERE u.email = 'professor@u.icesi.edu.co'
AND p.user_id = u.id
AND g.name = 'Group A'
AND s.code = '2025-2'
AND NOT EXISTS (
  SELECT 1 FROM professor_assignments pa
  WHERE pa.professor_id = p.user_id AND pa.group_id = g.id AND pa.semester_id = s.id
);

-- Inscripción de estudiante al grupo en el semestre
INSERT INTO student_enrollments (student_id, group_id, semester_id, enrolled_at, is_active)
SELECT s.user_id, g.id, sem.id, CURRENT_TIMESTAMP, true
FROM students s, groups g, semesters sem, users u
WHERE u.email = 'student@u.icesi.edu.co'
AND s.user_id = u.id
AND g.name = 'Group A'
AND sem.code = '2025-2'
AND NOT EXISTS (
  SELECT 1 FROM student_enrollments se
  WHERE se.student_id = s.user_id AND se.group_id = g.id AND se.semester_id = sem.id
);

-- Crear actividad
INSERT INTO activities (group_id, professor_id, title, start_time, end_time, status)
SELECT g.id, p.user_id, 'Introducción al curso', CURRENT_TIMESTAMP, DATEADD('HOUR', 2, CURRENT_TIMESTAMP), 'SCHEDULED'
FROM groups g, professors p, users u
WHERE g.name = 'Group A'
AND u.email = 'professor@u.icesi.edu.co'
AND p.user_id = u.id
AND NOT EXISTS (
  SELECT 1 FROM activities a WHERE a.group_id = g.id AND a.title = 'Introducción al curso'
);

-- Crear ejercicios para la actividad
INSERT INTO exercises (activity_id, title, statement, difficulty, max_points)
SELECT a.id, 'Ejercicio 1', 'Resolver un problema básico de PC', 1, 10
FROM activities a
WHERE a.title = 'Introducción al curso'
AND NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.activity_id = a.id AND e.title = 'Ejercicio 1'
);

INSERT INTO exercises (activity_id, title, statement, difficulty, max_points)
SELECT a.id, 'Ejercicio 2', 'Problema intermedio de PC', 2, 20
FROM activities a
WHERE a.title = 'Introducción al curso'
AND NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.activity_id = a.id AND e.title = 'Ejercicio 2'
);

-- Asociar perfiles a ejercicios
INSERT INTO exercise_profiles (exercise_id, profile_code)
SELECT e.id, 'BEGINNER'
FROM exercises e
WHERE e.title = 'Ejercicio 1'
AND NOT EXISTS (
  SELECT 1 FROM exercise_profiles ep WHERE ep.exercise_id = e.id AND ep.profile_code = 'BEGINNER'
);

INSERT INTO exercise_profiles (exercise_id, profile_code)
SELECT e.id, 'INTERMEDIATE'
FROM exercises e
WHERE e.title = 'Ejercicio 2'
AND NOT EXISTS (
  SELECT 1 FROM exercise_profiles ep WHERE ep.exercise_id = e.id AND ep.profile_code = 'INTERMEDIATE'
);

-- Crear resolución de estudiante para Ejercicio 1
INSERT INTO resolutions (student_id, exercise_id, points_awarded, awarded_by, status, attempt_no, submitted_at)
SELECT s.user_id, e.id, 8, p.user_id, 'SUBMITTED', 1, CURRENT_TIMESTAMP
FROM students s, exercises e, professors p, users us, users up
WHERE us.email = 'student@u.icesi.edu.co' AND s.user_id = us.id
AND up.email = 'professor@u.icesi.edu.co' AND p.user_id = up.id
AND e.title = 'Ejercicio 1'
AND NOT EXISTS (
  SELECT 1 FROM resolutions r WHERE r.student_id = s.user_id AND r.exercise_id = e.id AND r.attempt_no = 1
);

-- Rendimiento de estudiante
INSERT INTO student_performance (student_id, total_points, category, updated_at)
SELECT s.user_id, 8, 'BEGINNER', CURRENT_TIMESTAMP
FROM students s, users u
WHERE u.email = 'student@u.icesi.edu.co' AND s.user_id = u.id
AND NOT EXISTS (
  SELECT 1 FROM student_performance sp WHERE sp.student_id = s.user_id AND sp.category = 'BEGINNER'
);

-- Evento del tablero de puntuación
INSERT INTO scoreboard_events (activity_id, student_id, exercise_id, message, created_at, user_id)
SELECT a.id, s.user_id, e.id, 'Student submitted Ejercicio 1', CURRENT_TIMESTAMP, s.user_id
FROM activities a, students s, exercises e, users u
WHERE a.title = 'Introducción al curso'
AND u.email = 'student@u.icesi.edu.co' AND s.user_id = u.id
AND e.title = 'Ejercicio 1'
AND NOT EXISTS (
  SELECT 1 FROM scoreboard_events se WHERE se.activity_id = a.id AND se.student_id = s.user_id AND se.exercise_id = e.id
);

-- Registro de exportación generado por el profesor
INSERT INTO export_logs (professor_id, group_id, generated_at, file_uri)
SELECT p.user_id, g.id, CURRENT_TIMESTAMP, '/exports/group-a-2025-2.csv'
FROM professors p, groups g, users u
WHERE u.email = 'professor@u.icesi.edu.co' AND p.user_id = u.id AND g.name = 'Group A'
AND NOT EXISTS (
  SELECT 1 FROM export_logs el WHERE el.professor_id = p.user_id AND el.group_id = g.id AND el.file_uri = '/exports/group-a-2025-2.csv'
);
