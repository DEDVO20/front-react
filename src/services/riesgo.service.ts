import { API_BASE_URL as API_URL } from "@/lib/api";

export interface Riesgo {
  id: string;
  procesoId?: string;
  codigo: string;
  descripcion?: string;
  categoria?: string;
  tipoRiesgo?: string;
  probabilidad?: number;
  impacto?: number;
  nivelRiesgo?: number;
  causas?: string;
  consecuencias?: string;
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

export const riesgoService = {
  // Obtener todos los riesgos
  async getAll(filters?: { categoria?: string; nivelRiesgo?: string; estado?: string }): Promise<Riesgo[]> {
    const params = new URLSearchParams();
    if (filters?.categoria) params.append("categoria", filters.categoria);
    if (filters?.nivelRiesgo) params.append("nivelRiesgo", filters.nivelRiesgo);
    if (filters?.estado) params.append("estado", filters.estado);

    const url = `${API_URL}/riesgos${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener riesgos");
    return response.json();
  },

  // Obtener un riesgo por ID
  async getById(id: string): Promise<Riesgo> {
    const response = await fetch(`${API_URL}/riesgos/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener riesgo");
    return response.json();
  },

  // Crear nuevo riesgo
  async create(data: Partial<Riesgo>): Promise<Riesgo> {
    const response = await fetch(`${API_URL}/riesgos`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear riesgo");
    return response.json();
  },

  // Actualizar riesgo
  async update(id: string, data: Partial<Riesgo>): Promise<Riesgo> {
    const response = await fetch(`${API_URL}/riesgos/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar riesgo");
    return response.json();
  },

  // Eliminar riesgo
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/riesgos/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al eliminar riesgo");
  },
};
