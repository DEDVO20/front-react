const API_URL = "http://localhost:3000/api";

export interface Auditoria {
  id: string;
  codigo: string;
  nombre?: string;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  alcance?: string;
  objetivo?: string;
  objetivos?: string;
  normaReferencia?: string;
  auditorLiderId?: string;
  creadoPor?: string;
  equipoAuditor?: string[];
  areasAuditadas?: string[];
  fechaPlanificada?: string;
  creadoEn?: string;
  actualizadoEn?: string;
  auditorLider?: {
    id: string;
    nombre: string;
    primerApellido?: string;
    email?: string;
  };
  creadoPorUsuario?: {
    id: string;
    nombre: string;
    email?: string;
  };
}

export interface HallazgoAuditoria {
  id: string;
  auditoriaId: string;
  tipo: string;
  descripcion: string;
  requisito?: string;
  gravedad?: string;
  responsableId?: string;
  estado: string;
  creadoEn?: string;
  auditoria?: Auditoria;
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

export const auditoriaService = {
  // Obtener todas las auditorías
  async getAll(filters?: { tipo?: string; estado?: string }): Promise<Auditoria[]> {
    const params = new URLSearchParams();
    if (filters?.tipo) params.append("tipo", filters.tipo);
    if (filters?.estado) params.append("estado", filters.estado);

    const url = `${API_URL}/auditorias${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener auditorías");
    return response.json();
  },

  // Obtener auditorías planificadas
  async getPlanificadas(): Promise<Auditoria[]> {
    const response = await fetch(`${API_URL}/auditorias?estado=planificada`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener auditorías planificadas");
    return response.json();
  },

  // Obtener auditorías en curso
  async getEnCurso(): Promise<Auditoria[]> {
    const response = await fetch(`${API_URL}/auditorias?estado=en_curso`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener auditorías en curso");
    return response.json();
  },

  // Obtener auditorías completadas
  async getCompletadas(): Promise<Auditoria[]> {
    const response = await fetch(`${API_URL}/auditorias?estado=completada`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener auditorías completadas");
    return response.json();
  },

  // Obtener una auditoría por ID
  async getById(id: string): Promise<Auditoria> {
    const response = await fetch(`${API_URL}/auditorias/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener auditoría");
    return response.json();
  },

  // Crear nueva auditoría
  async create(data: Partial<Auditoria>): Promise<Auditoria> {
    const response = await fetch(`${API_URL}/auditorias`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear auditoría");
    return response.json();
  },

  // Actualizar auditoría
  async update(id: string, data: Partial<Auditoria>): Promise<Auditoria> {
    const response = await fetch(`${API_URL}/auditorias/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar auditoría");
    return response.json();
  },

  // Cambiar estado de auditoría
  async cambiarEstado(id: string, estado: string): Promise<Auditoria> {
    const response = await fetch(`${API_URL}/auditorias/${id}/estado`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ estado }),
    });
    if (!response.ok) throw new Error("Error al cambiar estado");
    return response.json();
  },

  // Eliminar auditoría
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/auditorias/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al eliminar auditoría");
  },

  // Obtener hallazgos de una auditoría
  async getHallazgos(auditoriaId: string): Promise<HallazgoAuditoria[]> {
    const response = await fetch(`${API_URL}/hallazgos-auditoria?auditoriaId=${auditoriaId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener hallazgos");
    return response.json();
  },

  // Crear hallazgo
  async createHallazgo(data: Partial<HallazgoAuditoria>): Promise<HallazgoAuditoria> {
    const response = await fetch(`${API_URL}/hallazgos-auditoria`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear hallazgo");
    return response.json();
  },

  // Actualizar hallazgo
  async updateHallazgo(
    id: string,
    data: Partial<HallazgoAuditoria>
  ): Promise<HallazgoAuditoria> {
    const response = await fetch(`${API_URL}/hallazgos-auditoria/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar hallazgo");
    return response.json();
  },
};
