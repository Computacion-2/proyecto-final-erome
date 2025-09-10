-- Tabla de permisos
CREATE TABLE permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Tabla de roles
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Tabla de relación roles-permisos
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

-- Tabla de usuarios
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    photo_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL
);

-- Tabla de relación usuarios-roles
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Tabla de estudiantes
CREATE TABLE students (
    user_id BIGINT PRIMARY KEY,
    initial_profile VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de profesores
CREATE TABLE professors (
    user_id BIGINT PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de semestres
CREATE TABLE semesters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE
);

-- Tabla de grupos
CREATE TABLE groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    course_id BIGINT,
    semester_id BIGINT NOT NULL,
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

-- Tabla de inscripciones de estudiantes
CREATE TABLE student_enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    semester_id BIGINT NOT NULL,
    enrolled_at TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (student_id) REFERENCES students(user_id),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

-- Tabla de asignaciones de profesores
CREATE TABLE professor_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    professor_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    semester_id BIGINT NOT NULL,
    FOREIGN KEY (professor_id) REFERENCES professors(user_id),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

-- Tabla de actividades
CREATE TABLE activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    professor_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (professor_id) REFERENCES professors(user_id)
);

-- Tabla de ejercicios
CREATE TABLE exercises (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    activity_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    statement TEXT NOT NULL,
    difficulty INTEGER NOT NULL,
    max_points INTEGER NOT NULL,
    FOREIGN KEY (activity_id) REFERENCES activities(id)
);

-- Tabla de resoluciones
CREATE TABLE resolutions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    points_awarded INTEGER,
    awarded_by BIGINT,
    status VARCHAR(50) NOT NULL,
    attempt_no INTEGER NOT NULL,
    submitted_at TIMESTAMP NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(user_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id),
    FOREIGN KEY (awarded_by) REFERENCES professors(user_id)
);

-- Tabla de rendimiento de estudiantes
CREATE TABLE student_performance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    total_points INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(user_id)
);

-- Tabla de tipos de perfil
CREATE TABLE profile_types (
    profile_code VARCHAR(50) PRIMARY KEY,
    description VARCHAR(255) NOT NULL
);

-- Tabla de perfiles de ejercicios
CREATE TABLE exercise_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exercise_id BIGINT NOT NULL,
    profile_code VARCHAR(50) NOT NULL,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id),
    FOREIGN KEY (profile_code) REFERENCES profile_types(profile_code)
);

-- Tabla de eventos del tablero de puntuación
CREATE TABLE scoreboard_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    activity_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    message VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (activity_id) REFERENCES activities(id),
    FOREIGN KEY (student_id) REFERENCES students(user_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de registros de exportación
CREATE TABLE export_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    professor_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    generated_at TIMESTAMP NOT NULL,
    file_uri VARCHAR(255) NOT NULL,
    FOREIGN KEY (professor_id) REFERENCES professors(user_id),
    FOREIGN KEY (group_id) REFERENCES groups(id)
);
