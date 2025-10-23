# Frontend - Pensamiento Computacional

Este es el frontend de la aplicación Pensamiento Computacional, desarrollado con React, TypeScript y Material-UI.

## Características

### Componentes Reutilizables (50% del desarrollo)
- **Layout Components**: Header, Footer, Layout principal
- **Common Components**: Loading, ErrorBoundary, ProtectedRoute
- **Form Components**: FormWrapper para formularios consistentes
- **Navigation**: Sistema de navegación con react-router-dom

### Páginas Principales
- **Dashboard**: Vista principal con estadísticas y resúmenes
- **Gestión de Usuarios**: CRUD completo para usuarios del sistema
- **Gestión de Estudiantes**: CRUD completo para estudiantes
- **Autenticación**: Login y registro de usuarios

### Hooks de React
- **useState**: Para manejo de estado local en todos los componentes
- **useEffect**: Para efectos secundarios y carga de datos
- **useAuth**: Hook personalizado para autenticación
- **useNavigate**: Para navegación programática

### Librería de Estilización
- **Material-UI**: Componentes y sistema de diseño
- **Tema personalizado**: Colores y tipografía consistentes
- **Responsive Design**: Adaptable a diferentes tamaños de pantalla

### React Router DOM
- **Rutas protegidas**: Autenticación y autorización
- **Navegación programática**: Redirecciones basadas en permisos
- **Rutas públicas**: Login, registro, página principal

## Estructura del Proyecto

```
src/
├── components/
│   ├── layout/          # Componentes de layout
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── common/          # Componentes comunes
│   │   ├── Loading.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ProtectedRoute.tsx
│   └── forms/           # Componentes de formularios
│       └── FormWrapper.tsx
├── pages/               # Páginas de la aplicación
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── UsersPage.tsx
│   └── StudentsPage.tsx
├── hooks/               # Hooks personalizados
│   └── useAuth.ts
├── services/            # Servicios de API
│   └── api.ts
├── types/               # Tipos TypeScript
│   └── index.ts
└── utils/               # Utilidades
```

## Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Instalación
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

### Variables de Entorno
Crear archivo `.env` en la raíz del proyecto:
```
REACT_APP_API_URL=http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT/api
```

## Uso de la Aplicación

### Autenticación
1. **Registro**: Los usuarios pueden registrarse con nombre, email y contraseña
2. **Login**: Autenticación con JWT tokens
3. **Protección de rutas**: Rutas protegidas basadas en permisos y roles

### Gestión de Usuarios
- **Lista de usuarios**: Tabla con paginación y filtros
- **Crear usuario**: Formulario con validación
- **Editar usuario**: Actualización de datos y roles
- **Eliminar usuario**: Confirmación antes de eliminar

### Gestión de Estudiantes
- **Lista de estudiantes**: Vista tabular con información completa
- **Crear estudiante**: Formulario con semestre y grupo
- **Editar estudiante**: Actualización de datos académicos
- **Eliminar estudiante**: Confirmación de eliminación

### Dashboard
- **Estadísticas**: Contadores de usuarios, estudiantes y roles
- **Usuarios recientes**: Lista de últimos usuarios registrados
- **Estudiantes recientes**: Lista de últimos estudiantes agregados
- **Información del usuario**: Datos del usuario autenticado

## Características Técnicas

### TypeScript
- Tipado fuerte para mejor desarrollo
- Interfaces para datos de API
- Props tipadas para componentes

### Material-UI
- Componentes consistentes y accesibles
- Sistema de temas personalizable
- Responsive design integrado

### React Router DOM
- Navegación declarativa
- Rutas protegidas con permisos
- Redirecciones automáticas

### Estado y Hooks
- Context API para autenticación global
- Hooks personalizados para lógica reutilizable
- Estado local con useState y useEffect

## API Integration

La aplicación se conecta con el backend Spring Boot a través de:
- **Servicio API**: Cliente HTTP con axios
- **Interceptores**: Manejo automático de tokens JWT
- **Refresh tokens**: Renovación automática de sesión
- **Manejo de errores**: Gestión centralizada de errores

## Desarrollo

### Scripts Disponibles
```bash
npm start          # Servidor de desarrollo
npm run build      # Build de producción
npm test           # Ejecutar tests
npm run eject      # Ejectar configuración (irreversible)
```

### Estructura de Componentes
- **Componentes funcionales** con hooks
- **Props tipadas** con TypeScript
- **Composición** sobre herencia
- **Separación de responsabilidades**

## Despliegue

### Build de Producción
```bash
npm run build
```

### Variables de Entorno para Producción
```
REACT_APP_API_URL=http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT/api
```

## Contribución

1. Seguir las convenciones de TypeScript
2. Usar Material-UI para componentes
3. Implementar manejo de errores
4. Documentar componentes complejos
5. Mantener consistencia en el diseño

## Licencia

MIT License - Ver archivo LICENSE para más detalles.