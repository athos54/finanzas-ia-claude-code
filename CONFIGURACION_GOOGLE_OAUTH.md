# Configuración de Google OAuth

## Obtener credenciales de Google Cloud Console

1. **Ir a Google Cloud Console**:

   - Visita https://console.cloud.google.com/
   - Crea un nuevo proyecto o selecciona uno existente

2. **Habilitar Google+ API**:

   - Ve a "APIs y servicios" > "Biblioteca"
   - Busca "Google+ API" y habilítala
   - También busca "People API" y habilítala

3. **Crear credenciales OAuth 2.0**:

   - Ve a "APIs y servicios" > "Credenciales"
   - Haz clic en "Crear credenciales" > "ID de cliente OAuth 2.0"
   - Configura la pantalla de consentimiento OAuth si es necesario
   - Selecciona "Aplicación web"
   - Añade estos valores:

   **Orígenes autorizados de JavaScript**:

   - http://localhost:3000
   - http://localhost:5173

   **URIs de redirección autorizadas**:

   - https://mcp.digital-goods.es/api/auth/google/callback

4. **Descargar credenciales**:
   - Copia el "Client ID" y "Client Secret"

## Configurar variables de entorno

Crea un archivo `.env` en el directorio `/backend/` con las siguientes variables:

```env
# Configuración existente
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/expenses-app
JWT_SECRET=tu_jwt_secret_key

# Nuevas variables para Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
SESSION_SECRET=tu_session_secret_key_aqui
CLIENT_URL=http://localhost:3000
```

## URLs importantes para configuración

### Desarrollo

- **Frontend**: http://localhost:3000 (o 5173 si usas Vite)
- **Backend**: http://localhost:5000
- **Callback URL**: https://mcp.digital-goods.es/api/auth/google/callback

### Producción (cuando despliegues)

Recuerda actualizar las URLs en Google Cloud Console y las variables de entorno:

- **CLIENT_URL**: tu dominio de frontend
- **Callback URL**: tu dominio de backend + /api/auth/google/callback

## Pasos para activar OAuth

1. **Obtener credenciales** de Google Cloud Console (pasos anteriores)
2. **Colocar las credenciales** en el archivo `.env`:
   - Reemplaza `tu_google_client_id_aqui` con tu Client ID
   - Reemplaza `tu_google_client_secret_aqui` con tu Client Secret
3. **Reiniciar el servidor backend** para que tome las nuevas variables de entorno
4. **Probar** haciendo clic en "Continuar con Google" en las páginas de login/registro

## Flujo de autenticación

1. Usuario hace clic en "Continuar con Google"
2. Se redirige a `/api/auth/google`
3. Google maneja la autenticación
4. Google redirige a `/api/auth/google/callback`
5. El servidor procesa el usuario y redirige al frontend con token
6. El frontend extrae el token de la URL y lo guarda en localStorage

¡Listo! Tu aplicación ahora soporta autenticación con Google OAuth.
