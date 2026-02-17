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

const mapObjetivoFromApi = (raw: any): ObjetivoCalidad => ({
  id: raw.id,
  codigo: raw.codigo,
  descripcion: raw.descripcion,
  areaId: raw.area_id,
  responsableId: raw.responsable_id,
  periodoInicio: raw.fecha_inicio,
  periodoFin: raw.fecha_fin,
  estado: raw.estado,
  creadoEn: raw.creado_en,
  actualizadoEn: raw.actualizado_en,
  area: raw.area ? { id: raw.area.id, nombre: raw.area.nombre } : undefined,
  responsable: raw.responsable
    ? {
        id: raw.responsable.id,
        nombre: raw.responsable.nombre,
        primerApellido: raw.responsable.primer_apellido ?? raw.responsable.primerApellido,
      }
    : undefined,
});

const mapObjetivoToApi = (data: Partial<ObjetivoCalidad>) => ({
  codigo: data.codigo,
  descripcion: data.descripcion,
  area_id: data.areaId ?? null,
  responsable_id: data.responsableId ?? null,
  fecha_inicio: data.periodoInicio,
  fecha_fin: data.periodoFin,
  estado: data.estado,
});

const mapSeguimientoFromApi = (raw: any): SeguimientoObjetivo => ({
  id: raw.id,
  objetivoId: raw.objetivo_calidad_id ?? raw.objetivoId,
  valorActual: Number(raw.valor_actual ?? raw.valorActual ?? 0),
  valorObjetivo: Number(raw.valor_objetivo ?? raw.valorObjetivo ?? 0),
  porcentajeCumplimiento: Number(raw.porcentaje_cumplimiento ?? raw.porcentajeCumplimiento ?? 0),
  periodo: raw.periodo ?? "",
  observaciones: raw.observaciones,
  creadoEn: raw.creado_en ?? raw.creadoEn,
});

const mapSeguimientoToApi = (data: Partial<SeguimientoObjetivo>) => ({
  objetivo_calidad_id: data.objetivoId,
  valor_actual: data.valorActual,
  observaciones: data.observaciones,
  fecha_seguimiento: data.creadoEn ?? new Date().toISOString(),
});



export const objetivoCalidadService = {
  // Obtener todos los objetivos
  async getAll(): Promise<ObjetivoCalidad[]> {
    const response = await apiClient.get('/objetivos-calidad');
    return Array.isArray(response.data) ? response.data.map(mapObjetivoFromApi) : [];
  },

  // Obtener objetivos activos
  // Obtener objetivos activos
  async getActivos(): Promise<ObjetivoCalidad[]> {
    const response = await apiClient.get('/objetivos-calidad?estado=en_curso,planificado');
    const objetivos = Array.isArray(response.data) ? response.data.map(mapObjetivoFromApi) : [];
    return objetivos.filter((o) => o.estado === "en_curso" || o.estado === "planificado");
  },

  // Obtener un objetivo por ID
  // Obtener un objetivo por ID
  async getById(id: string): Promise<ObjetivoCalidad> {
    const response = await apiClient.get(`/objetivos-calidad/${id}`);
    return mapObjetivoFromApi(response.data);
  },

  // Crear nuevo objetivo
  // Crear nuevo objetivo
  async create(data: Partial<ObjetivoCalidad>): Promise<ObjetivoCalidad> {
    const response = await apiClient.post('/objetivos-calidad', mapObjetivoToApi(data));
    return mapObjetivoFromApi(response.data);
  },

  // Actualizar objetivo
  // Actualizar objetivo
  async update(id: string, data: Partial<ObjetivoCalidad>): Promise<ObjetivoCalidad> {
    const response = await apiClient.put(`/objetivos-calidad/${id}`, mapObjetivoToApi(data));
    return mapObjetivoFromApi(response.data);
  },

  // Eliminar objetivo
  // Eliminar objetivo
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/objetivos-calidad/${id}`);
  },

  // Obtener seguimientos de un objetivo
  // Obtener seguimientos de un objetivo
  async getSeguimientos(objetivoId: string): Promise<SeguimientoObjetivo[]> {
    const response = await apiClient.get(`/seguimientos-objetivo?objetivo_id=${objetivoId}`);
    return Array.isArray(response.data) ? response.data.map(mapSeguimientoFromApi) : [];
  },

  // Crear seguimiento
  // Crear seguimiento
  async createSeguimiento(
    data: Partial<SeguimientoObjetivo>
  ): Promise<SeguimientoObjetivo> {
    const response = await apiClient.post('/seguimientos-objetivo', mapSeguimientoToApi(data));
    return mapSeguimientoFromApi(response.data);
  },

  // Actualizar seguimiento
  // Actualizar seguimiento
  async updateSeguimiento(
    id: string,
    data: Partial<SeguimientoObjetivo>
  ): Promise<SeguimientoObjetivo> {
    const response = await apiClient.put(`/seguimientos-objetivo/${id}`, mapSeguimientoToApi(data));
    return mapSeguimientoFromApi(response.data);
  },
};
