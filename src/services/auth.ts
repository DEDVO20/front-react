import apiClient from "@/lib/api";

export interface LoginData {
  nombre_usuario: string;  // Cambio de 'usuario' a 'nombre_usuario'
  password: string;  // Cambio de 'contrasena' a 'password'
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  usuario: {
    id: string;
    nombre_usuario: string;
    email: string;
    nombre_completo: string;
    cargo?: string;
    activo: boolean;
  };
}

export async function login(data: LoginData) {
  try {
    const response = await apiClient.post<TokenResponse>("/auth/login", data);

    const result = response.data;
    console.log("Login resultado:", result);

    if (result.access_token) {
      localStorage.setItem("token", result.access_token);
      localStorage.setItem("user", JSON.stringify(result.usuario));
      console.log("Token almacenado:", result.access_token);
    }
    return result;
  } catch (error) {
    console.error("Error en login:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error desconocido");
  }
}

export async function logout() {
  try {
    await apiClient.post("/auth/logout");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return { message: "Sesión cerrada exitosamente" };
  } catch (error) {
    console.error("Error en logout:", error);

    // Limpiar localStorage de todas formas
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error desconocido");
  }
}

//Funcion para obtener el token del usuario
export function getToken(): string | null {
  return localStorage.getItem("token");
}

//Funcion para obtener el usuario actual
export function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

//Funcion para verificar si el usuario esta autenticado
export function isAuthenticated(): boolean {
  const token = getToken();
  return token !== null && token !== "";
}

//Funcion para limpiar la sesion del usuario
export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
