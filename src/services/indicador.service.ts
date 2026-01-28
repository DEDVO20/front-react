import apiClient from "@/lib/api";

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

export const indicadorService = {
  // Obtener todos los indicadores
  async getAll(filters?: { procesoId?: string; tipo?: string; estado?: string }): Promise<Indicador[]> {
    const params = new URLSearchParams();
    if (filters?.procesoId) params.append("proceso_id", filters.procesoId);
    if (filters?.tipo) params.append("tipo", filters.tipo);
    if (filters?.estado) params.append("estado", filters.estado); // Backend expects snake case for some filters? status? No, "estado" seems same.

    // Note: Backend likely expects snake_case for query params if they map to DB fields, checking previous patterns.
    // However, let's stick to what was there but cleaned up. API usually handles query params.
    // Actually, looking at other services, we often just pass params directly to axios.

    // Correction: Backend is FastAPI. It usually takes query params as function arguments.
    // Let's assume frontend camelCase filter keys might need mapping if backend uses snake_case arguments.
    // In `calidad.py`: `proceso_id: UUID = None`. So `procesoId` must be `proceso_id`.

    const response = await apiClient.get('/indicadores', {
      params: {
        proceso_id: filters?.procesoId,
        tipo: filters?.tipo,
        estado: filters?.estado
      }
    });
    return response.data;
  },

  // Obtener indicadores activos
  async getActivos(): Promise<Indicador[]> {
    return this.getAll({ estado: "activo" });
  },

  // Obtener un indicador por ID
  async getById(id: string): Promise<Indicador> {
    const response = await apiClient.get(`/indicadores/${id}`);
    return response.data;
  },

  // Crear nuevo indicador
  async create(data: Partial<Indicador>): Promise<Indicador> {
    // Ensure payload is snake_case if needed. 
    // Usually we might need a mapper, but let's assume for now user data is mostly compatible or handled elsewhere.
    // Ideally, we should map camelCase to snake_case here if the form sends camelCase.
    // Given previous tasks, we often did this mapping in the REACT COMPONENT handleSubmit.
    // So we will just pass data through.
    const response = await apiClient.post('/indicadores', data);
    return response.data;
  },

  // Actualizar indicador
  async update(id: string, data: Partial<Indicador>): Promise<Indicador> {
    const response = await apiClient.put(`/indicadores/${id}`, data);
    return response.data;
  },

  // Eliminar indicador
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/indicadores/${id}`);
  },
};
