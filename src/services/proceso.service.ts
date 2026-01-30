import { apiClient } from "@/lib/api";

export interface Proceso {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo?: string;
  objetivo?: string;
  alcance?: string;
  responsableId?: string;
  estado?: string;
  creadoEn: string;
  actualizadoEn?: string;
  responsable?: {
    id: string;
    nombre: string;
    primerApellido: string;
  };
}

export const procesoService = {
  // Obtener todos los procesos
  async getAll(filters?: { tipo?: string; estado?: string }): Promise<Proceso[]> {
    const params = new URLSearchParams();
    if (filters?.tipo) params.append("tipo", filters.tipo);
    if (filters?.estado) params.append("estado", filters.estado);

    const response = await apiClient.get<Proceso[]>(`/procesos?${params.toString()}`);
    return response.data;
  },

  // Obtener procesos activos
  async getActivos(): Promise<Proceso[]> {
    return this.getAll({ estado: "activo" });
  },

  // Obtener un proceso por ID
  async getById(id: string): Promise<Proceso> {
    const response = await apiClient.get<Proceso>(`/procesos/${id}`);
    return response.data;
  },

  // Crear nuevo proceso
  async create(data: Partial<Proceso>): Promise<Proceso> {
    const response = await apiClient.post<Proceso>("/procesos", data);
    return response.data;
  },

  // Actualizar proceso
  async update(id: string, data: Partial<Proceso>): Promise<Proceso> {
    const response = await apiClient.put<Proceso>(`/procesos/${id}`, data);
    return response.data;
  },

  // Eliminar proceso
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/procesos/${id}`);
  },
};
