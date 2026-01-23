import apiClient from "@/lib/api";

export interface Usuario {
  id: string;
  nombre_usuario: string;  // snake_case
  email: string;
  nombre_completo: string; // snake_case
  cargo?: string;
  area_id?: string;        // snake_case
  activo: boolean;
  telefono?: string;
  creado_en?: string;      // snake_case
  actualizado_en?: string; // snake_case
}

export interface UsuariosListResponse {
  usuarios: Usuario[];
  total?: number;
  page?: number;
  totalPages?: number;
}

class UsuarioService {
  async getAll(params?: {
    skip?: number;
    limit?: number;
    activo?: boolean;
  }): Promise<Usuario[]> {
    const queryParams = new URLSearchParams();

    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.activo !== undefined)
      queryParams.append("activo", params.activo.toString());

    const response = await apiClient.get<Usuario[]>(
      `/usuarios?${queryParams.toString()}`
    );

    return response.data;
  }

  async getById(id: string): Promise<Usuario> {
    const response = await apiClient.get<Usuario>(`/usuarios/${id}`);
    return response.data;
  }

  async create(userData: Partial<Usuario> & { password: string }): Promise<Usuario> {
    const response = await apiClient.post<Usuario>("/usuarios", userData);
    return response.data;
  }

  async update(id: string, userData: Partial<Usuario>): Promise<Usuario> {
    const response = await apiClient.put<Usuario>(`/usuarios/${id}`, userData);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/usuarios/${id}`);
  }

  /**
   * Obtiene todos los usuarios activos para selects
   */
  async getAllActive(): Promise<Usuario[]> {
    console.log("🔍 getAllActive - calling getAll...");
    const response = await this.getAll({ activo: true, limit: 1000 });
    console.log("✅ getAllActive - response:", response);

    return Array.isArray(response) ? response : [];
  }
}

export const usuarioService = new UsuarioService();
