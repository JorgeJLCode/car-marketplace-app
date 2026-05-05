// Configuración global de la aplicación
// UX/PROD Decision: Permite que la app funcione con rutas relativas (dev proxy o same-domain hosting)
// o con una URL absoluta definida en las variables de entorno de producción.
export const API_URL = import.meta.env.VITE_API_URL || '';
