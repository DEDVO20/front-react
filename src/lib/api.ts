/**
 * Cliente API centralizado para comunicación con el backend FastAPI
 */
import axios, { AxiosInstance, AxiosError } from "axios";

// Configuración base de la API
const rawBase = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
export const API_BASE_URL = rawBase.endsWith("/api/v1") ? rawBase : rawBase.replace(/\/+$/, '') + "/api/v1";

// Debug: mostrar la URL base en la consola del navegador (útil en dev)
if (import.meta.env.DEV) {
  console.info("🔧 API_BASE_URL:", API_BASE_URL);
}

const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || "30000");

/**
 * Instancia de axios configurada
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor para agregar el token JWT a todas las peticiones
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor para manejar errores de respuesta
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Si el error es 401 (no autorizado), limpiar sesión y redirigir a login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Extraer mensaje de error de la respuesta de FastAPI
    const errorMessage =
      (error.response?.data as any)?.detail ||
      error.message ||
      "Error desconocido";

    const errorObj = new Error(errorMessage) as any;
    errorObj.response = error.response;
    return Promise.reject(errorObj);
  }
);

/**
 * Tipos de respuesta comunes
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/**
 * Utilidad para manejar errores de API
 */
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Error desconocido";
};

/**
 * Exportar cliente por defecto
 */
export default apiClient;
