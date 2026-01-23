const API_URL = "http://localhost:3000/api";

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

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const procesoService = {
  // Obtener todos los procesos
  async getAll(filters?: { tipo?: string; estado?: string }): Promise<Proceso[]> {
    const params = new URLSearchParams();
    if (filters?.tipo) params.append("tipo", filters.tipo);
    if (filters?.estado) params.append("estado", filters.estado);

    const url = `${API_URL}/procesos${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener procesos");
    return response.json();
  },

  // Obtener procesos activos
  async getActivos(): Promise<Proceso[]> {
    return this.getAll({ estado: "activo" });
  },

  // Obtener un proceso por ID
  async getById(id: string): Promise<Proceso> {
    const response = await fetch(`${API_URL}/procesos/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener proceso");
    return response.json();
  },

  // Crear nuevo proceso
  async create(data: Partial<Proceso>): Promise<Proceso> {
    const response = await fetch(`${API_URL}/procesos`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear proceso");
    return response.json();
  },

  // Actualizar proceso
  async update(id: string, data: Partial<Proceso>): Promise<Proceso> {
    const response = await fetch(`${API_URL}/procesos/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar proceso");
    return response.json();
  },

  // Eliminar proceso
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/procesos/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al eliminar proceso");
  },
};
