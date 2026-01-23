const API_URL = "http://localhost:3000/api";

export interface Indicador {
  id: string;
  procesoId?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo?: string;
  formula?: string;
  unidadMedida?: string;
  meta?: number;
  frecuenciaMedicion?: string;
  responsableId?: string;
  estado?: string;
  creadoEn: string;
  actualizadoEn?: string;
  proceso?: {
    id: string;
    nombre: string;
  };
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

export const indicadorService = {
  // Obtener todos los indicadores
  async getAll(filters?: { procesoId?: string; tipo?: string; estado?: string }): Promise<Indicador[]> {
    const params = new URLSearchParams();
    if (filters?.procesoId) params.append("procesoId", filters.procesoId);
    if (filters?.tipo) params.append("tipo", filters.tipo);
    if (filters?.estado) params.append("estado", filters.estado);

    const url = `${API_URL}/indicadores${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener indicadores");
    return response.json();
  },

  // Obtener indicadores activos
  async getActivos(): Promise<Indicador[]> {
    return this.getAll({ estado: "activo" });
  },

  // Obtener un indicador por ID
  async getById(id: string): Promise<Indicador> {
    const response = await fetch(`${API_URL}/indicadores/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener indicador");
    return response.json();
  },

  // Crear nuevo indicador
  async create(data: Partial<Indicador>): Promise<Indicador> {
    const response = await fetch(`${API_URL}/indicadores`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear indicador");
    return response.json();
  },

  // Actualizar indicador
  async update(id: string, data: Partial<Indicador>): Promise<Indicador> {
    const response = await fetch(`${API_URL}/indicadores/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar indicador");
    return response.json();
  },

  // Eliminar indicador
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/indicadores/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al eliminar indicador");
  },
};
