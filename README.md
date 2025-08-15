# TestAI - Full Stack Web Application

Una aplicación web completa desarrollada con Node.js, Express, MongoDB, React, Vite y Tailwind CSS.

## Tecnologías Utilizadas

### Backend

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación con tokens
- **bcryptjs** - Encriptación de contraseñas

### Frontend

- **React** - Librería de interfaz de usuario
- **Vite** - Herramienta de desarrollo rápido
- **Tailwind CSS 4** - Framework de CSS utility-first
- **React Router** - Navegación
- **Axios** - Cliente HTTP

## Estructura del Proyecto

```
testai/
├── backend/                 # Servidor API
│   ├── src/
│   │   ├── config/         # Configuraciones
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middleware/     # Middlewares
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Rutas de API
│   │   └── server.js       # Punto de entrada
│   └── package.json
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── utils/          # Utilidades
│   │   └── main.jsx        # Punto de entrada
│   └── package.json
└── package.json           # Scripts principales
```

## Instalación y Configuración

### Opción 1: Con Docker (Recomendado)

1. **Ejecutar con Docker Compose:**

```bash
# Construir e iniciar todos los servicios
npm run docker:up

# Ver logs en tiempo real
npm run docker:logs
```

Esto ejecutará:

- MongoDB en puerto 27017
- Backend en http://localhost:5000
- Frontend en http://localhost:5173

2. **Parar los servicios:**

```bash
npm run docker:down
```

### Opción 2: Desarrollo Local

1. **Instalar dependencias:**

```bash
npm run install:all
```

2. **Configurar variables de entorno:**

```bash
# Los archivos .env ya están configurados
# Puedes modificarlos según necesites
```

3. **Asegurar MongoDB:**
   Asegúrate de tener MongoDB ejecutándose localmente en el puerto 27017.

4. **Ejecutar en modo desarrollo:**

```bash
npm run dev
```

## Scripts Disponibles

### Desarrollo Local

- `npm run dev` - Ejecuta backend y frontend en paralelo
- `npm run dev:backend` - Solo el backend
- `npm run dev:frontend` - Solo el frontend
- `npm run build` - Construye la aplicación para producción
- `npm run install:all` - Instala todas las dependencias

### Docker

- `npm run docker:up` - Inicia todos los servicios con Docker
- `npm run docker:down` - Para todos los servicios Docker
- `npm run docker:build` - Reconstruye las imágenes Docker
- `npm run docker:logs` - Ver logs de todos los servicios

## Funcionalidades

### Autenticación

- Registro de usuarios
- Inicio de sesión
- Protección con JWT
- Hash de contraseñas con bcrypt

### Frontend

- Interfaz responsive con Tailwind CSS
- Navegación con React Router
- Interceptores de Axios para manejo de tokens
- Páginas: Home, Login, Register, Dashboard

### Backend

- API RESTful con Express
- Conexión a MongoDB con Mongoose
- Middleware de manejo de errores
- CORS configurado
- Validación de datos

## Desarrollo

### Agregar nuevas rutas API

1. Crear el controlador en `backend/src/controllers/`
2. Agregar las rutas en `backend/src/routes/`
3. Importar en `backend/src/server.js`

### Agregar nuevas páginas

1. Crear componente en `frontend/src/pages/`
2. Agregar ruta en `frontend/src/App.jsx`
3. Actualizar navegación si es necesario

## Variables de Entorno

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/testai
JWT_SECRET=tu_clave_secreta_muy_segura
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (frontend/.env)

```env
VITE_API_URL=https://mcp.digital-goods.es/api
```

## Contribuir

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
