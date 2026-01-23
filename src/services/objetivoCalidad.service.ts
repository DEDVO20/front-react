const API_URL = "http://localhost:3000/api";

export interface ObjetivoCalidad {
  id: string;
  codigo: string;
  descripcion: string;
  procesoId?: string;
  areaId?: string;
  responsableId?: string;
  meta?: string;
  indicadorId?: string;
  valorMeta?: number;
  periodoInicio?: string;
  periodoFin?: string;
  estado?: string;
  creadoEn: string;
  actualizadoEn?: string;
  proceso?: { id: string; nombre: string };
  area?: { id: string; nombre: string };
  responsable?: { id: string; nombre: string; primerApellido?: string };
  indicador?: { id: string; nombre: string };
}

export interface SeguimientoObjetivo {
  id: string;
  objetivoId: string;
  valorActual: number;
  valorObjetivo: number;
  porcentajeCumplimiento: number;
  periodo: string;
  observaciones?: string;
  creadoEn: string;
  objetivo?: ObjetivoCalidad;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const objetivoCalidadService = {
  // Obtener todos los objetivos
  async getAll(): Promise<ObjetivoCalidad[]> {
    const response = await fetch(`${API_URL}/objetivos-calidad`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener objetivos de calidad");
    return response.json();
  },

  // Obtener objetivos activos
  async getActivos(): Promise<ObjetivoCalidad[]> {
    const response = await fetch(
      `${API_URL}/objetivos-calidad?estado=en_curso,planificado`,
      {
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener objetivos activos");
    return response.json();
  },

  // Obtener un objetivo por ID
  async getById(id: string): Promise<ObjetivoCalidad> {
    const response = await fetch(`${API_URL}/objetivos-calidad/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener objetivo");
    return response.json();
  },

  // Crear nuevo objetivo
  async create(data: Partial<ObjetivoCalidad>): Promise<ObjetivoCalidad> {
    const response = await fetch(`${API_URL}/objetivos-calidad`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear objetivo");
    return response.json();
  },

  // Actualizar objetivo
  async update(id: string, data: Partial<ObjetivoCalidad>): Promise<ObjetivoCalidad> {
    const response = await fetch(`${API_URL}/objetivos-calidad/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar objetivo");
    return response.json();
  },

  // Eliminar objetivo
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/objetivos-calidad/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al eliminar objetivo");
  },

  // Obtener seguimientos de un objetivo
  async getSeguimientos(objetivoId: string): Promise<SeguimientoObjetivo[]> {
    const response = await fetch(
      `${API_URL}/seguimientos-objetivo?objetivoId=${objetivoId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener seguimientos");
    return response.json();
  },

  // Crear seguimiento
  async createSeguimiento(
    data: Partial<SeguimientoObjetivo>
  ): Promise<SeguimientoObjetivo> {
    const response = await fetch(`${API_URL}/seguimientos-objetivo`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear seguimiento");
    return response.json();
  },

  // Actualizar seguimiento
  async updateSeguimiento(
    id: string,
    data: Partial<SeguimientoObjetivo>
  ): Promise<SeguimientoObjetivo> {
    const response = await fetch(`${API_URL}/seguimientos-objetivo/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar seguimiento");
    return response.json();
  },
};
