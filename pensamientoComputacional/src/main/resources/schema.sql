-- Tabla de permisos
CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Tabla de relación roles-permisos
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    photo_url VARCHAR(255),
    group_name VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación usuarios-roles
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Tabla de estudiantes
CREATE TABLE IF NOT EXISTS students (
    user_id BIGINT PRIMARY KEY,
    initial_profile VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de profesores
CREATE TABLE IF NOT EXISTS professors (
    user_id BIGINT PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de semestres
CREATE TABLE IF NOT EXISTS semesters (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE
);

-- Tabla de grupos
CREATE TABLE IF NOT EXISTS groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    course_id BIGINT,
    semester_id BIGINT NOT NULL,
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

-- Tabla de inscripciones de estudiantes
CREATE TABLE IF NOT EXISTS student_enrollments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    semester_id BIGINT NOT NULL,
    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (student_id) REFERENCES students(user_id),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

-- Tabla de asignaciones de profesores
CREATE TABLE IF NOT EXISTS professor_assignments (
    id BIGSERIAL PRIMARY KEY,
    professor_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    semester_id BIGINT NOT NULL,
    FOREIGN KEY (professor_id) REFERENCES professors(user_id),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

-- Tabla de actividades
CREATE TABLE IF NOT EXISTS activities (
    id BIGSERIAL PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS exercises (
    id BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    statement TEXT NOT NULL,
    difficulty INTEGER NOT NULL,
    max_points INTEGER NOT NULL,
    FOREIGN KEY (activity_id) REFERENCES activities(id)
);

-- Tabla de resoluciones
CREATE TABLE IF NOT EXISTS resolutions (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    points_awarded INTEGER,
    awarded_by BIGINT,
    status VARCHAR(50) NOT NULL,
    attempt_no INTEGER NOT NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    code TEXT,
    FOREIGN KEY (student_id) REFERENCES students(user_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id),
    FOREIGN KEY (awarded_by) REFERENCES professors(user_id)
);

-- Tabla de rendimiento de estudiantes
CREATE TABLE IF NOT EXISTS student_performance (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    total_points INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(user_id)
);

-- Tabla de tipos de perfil
CREATE TABLE IF NOT EXISTS profile_types (
    profile_code VARCHAR(50) PRIMARY KEY,
    description VARCHAR(255) NOT NULL
);

-- Tabla de perfiles de ejercicios
CREATE TABLE IF NOT EXISTS exercise_profiles (
    id BIGSERIAL PRIMARY KEY,
    exercise_id BIGINT NOT NULL,
    profile_code VARCHAR(50) NOT NULL,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id),
    FOREIGN KEY (profile_code) REFERENCES profile_types(profile_code)
);

-- Tabla de eventos del tablero de puntuación
CREATE TABLE IF NOT EXISTS scoreboard_events (
    id BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    message VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (activity_id) REFERENCES activities(id),
    FOREIGN KEY (student_id) REFERENCES students(user_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de registros de exportación
CREATE TABLE IF NOT EXISTS export_logs (
    id BIGSERIAL PRIMARY KEY,
    professor_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    file_uri VARCHAR(255) NOT NULL,
    FOREIGN KEY (professor_id) REFERENCES professors(user_id),
    FOREIGN KEY (group_id) REFERENCES groups(id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_professors_user_id ON professors(user_id);
CREATE INDEX IF NOT EXISTS idx_resolutions_student_id ON resolutions(student_id);
CREATE INDEX IF NOT EXISTS idx_resolutions_exercise_id ON resolutions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_activities_group_id ON activities(group_id);
CREATE INDEX IF NOT EXISTS idx_activities_professor_id ON activities(professor_id);
CREATE INDEX IF NOT EXISTS idx_exercises_activity_id ON exercises(activity_id);
