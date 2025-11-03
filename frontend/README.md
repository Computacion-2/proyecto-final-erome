# Frontend - Pensamiento Computacional

Frontend React para la plataforma de Pensamiento Computacional de la Universidad Icesi.

## Tecnologías

- **React 19** con TypeScript
- **Vite** como build tool
- **React Router** para routing
- **Tailwind CSS** para estilos
- **Axios** para comunicación con API
- **Socket.io-client** para WebSockets (scoreboard en tiempo real)
- **Recharts** para gráficos y visualizaciones
- **Zustand** para manejo de estado
- **Lucide React** para iconos

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Build

```bash
npm run build
```

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Layout.tsx
│   ├── ProtectedRoute.tsx
│   ├── Podium.tsx
│   └── Scoreboard.tsx
├── config/             # Configuración
│   └── api.ts          # Configuración de Axios
├── context/            # Contextos React
│   └── AuthContext.tsx # Contexto de autenticación
├── pages/              # Páginas de la aplicación
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── AdminUsersPage.tsx
│   ├── ProfessorActivitiesPage.tsx
│   ├── ProfessorStudentsPage.tsx
│   ├── StudentActivitiesPage.tsx
│   └── StudentPerformancePage.tsx
├── services/           # Servicios API
│   ├── authService.ts
│   ├── userService.ts
│   ├── studentService.ts
│   ├── semesterService.ts
│   └── roleService.ts
└── types/              # Tipos TypeScript
    └── index.ts
```

## Características

### Autenticación
- Login con JWT
- Registro de estudiantes (solo con correo @u.icesi.edu.co)
- Refresh token automático
- Rutas protegidas por rol

### Roles

#### Estudiante
- Ver actividades activas y pasadas
- Participar en actividades activas
- Ver scoreboard en tiempo real
- Consultar rendimiento y métricas
- Ver podium del grupo

#### Profesor
- Crear y gestionar actividades
- Ver lista de estudiantes por grupo
- Calificar ejercicios
- Ver estadísticas y reportes
- Exportar datos a PDF
- Ver podium de todos los grupos

#### Administrador
- Gestión completa de usuarios
- Asignar roles
- Ver todas las estadísticas

### Funcionalidades Principales

1. **Actividades**: Los profesores pueden crear actividades con múltiples ejercicios
2. **Scoreboard en Tiempo Real**: WebSockets para actualizaciones en tiempo real
3. **Podium**: Ranking de top 5 estudiantes por grupo
4. **Métricas y Gráficos**: Visualización del rendimiento con Recharts
5. **Exportación PDF**: Generación de reportes en PDF

## Configuración

Crea un archivo `.env` con:

```
VITE_API_BASE_URL=http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT
```

Para producción, actualiza la URL del servidor.

## Scripts

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Previsualiza build de producción
- `npm run lint` - Ejecuta el linter

## Notas

- El frontend requiere que el backend esté corriendo en la URL configurada
- Para WebSockets, el backend debe tener soporte para Socket.io configurado
- Las imágenes de perfil se pueden cargar usando URLs o archivos locales
