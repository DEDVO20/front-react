import { apiClient } from "@/lib/api";

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



export const objetivoCalidadService = {
  // Obtener todos los objetivos
  async getAll(): Promise<ObjetivoCalidad[]> {
    const response = await apiClient.get('/objetivos-calidad');
    return response.data;
  },

  // Obtener objetivos activos
  // Obtener objetivos activos
  async getActivos(): Promise<ObjetivoCalidad[]> {
    const response = await apiClient.get('/objetivos-calidad?estado=en_curso,planificado');
    return response.data;
  },

  // Obtener un objetivo por ID
  // Obtener un objetivo por ID
  async getById(id: string): Promise<ObjetivoCalidad> {
    const response = await apiClient.get(`/objetivos-calidad/${id}`);
    return response.data;
  },

  // Crear nuevo objetivo
  // Crear nuevo objetivo
  async create(data: Partial<ObjetivoCalidad>): Promise<ObjetivoCalidad> {
    const response = await apiClient.post('/objetivos-calidad', data);
    return response.data;
  },

  // Actualizar objetivo
  // Actualizar objetivo
  async update(id: string, data: Partial<ObjetivoCalidad>): Promise<ObjetivoCalidad> {
    const response = await apiClient.put(`/objetivos-calidad/${id}`, data);
    return response.data;
  },

  // Eliminar objetivo
  // Eliminar objetivo
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/objetivos-calidad/${id}`);
  },

  // Obtener seguimientos de un objetivo
  // Obtener seguimientos de un objetivo
  async getSeguimientos(objetivoId: string): Promise<SeguimientoObjetivo[]> {
    const response = await apiClient.get(`/seguimientos-objetivo?objetivoId=${objetivoId}`);
    return response.data;
  },

  // Crear seguimiento
  // Crear seguimiento
  async createSeguimiento(
    data: Partial<SeguimientoObjetivo>
  ): Promise<SeguimientoObjetivo> {
    const response = await apiClient.post('/seguimientos-objetivo', data);
    return response.data;
  },

  // Actualizar seguimiento
  // Actualizar seguimiento
  async updateSeguimiento(
    id: string,
    data: Partial<SeguimientoObjetivo>
  ): Promise<SeguimientoObjetivo> {
    const response = await apiClient.put(`/seguimientos-objetivo/${id}`, data);
    return response.data;
  },
};
