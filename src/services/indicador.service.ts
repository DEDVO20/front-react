import apiClient from "@/lib/api";

export interface Indicador {
  id: string;
  proceso_id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  formula?: string;
  unidad_medida?: string;
  meta?: number;
  frecuencia_medicion: string;
  responsable_medicion_id?: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  // Relaciones opcionales
  proceso?: {
    id: string;
    nombre: string;
  };
  responsable?: {
    id: string;
    nombre: string;
    primer_apellido: string;
  };
}

export interface MedicionIndicador {
  id: string;
  indicador_id: string;
  periodo: string;
  valor: number;
  meta?: number | null;
  cumple_meta?: boolean | null;
  observaciones?: string | null;
  registrado_por?: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface TendenciaIndicador {
  indicador_id: string;
  total_mediciones: number;
  promedio: number;
  ultimo_valor?: number | null;
  ultimo_periodo?: string | null;
  tendencia: "subiendo" | "bajando" | "estable" | "sin_datos" | string;
}

export const indicadorService = {
  // Obtener todos los indicadores
  async getAll(filters?: { proceso_id?: string; activo?: boolean }): Promise<Indicador[]> {
    const response = await apiClient.get('/indicadores', {
      params: {
        proceso_id: filters?.proceso_id,
        activo: filters?.activo
      }
    });
    return response.data;
  },

  // Obtener indicadores activos
  async getActivos(): Promise<Indicador[]> {
    return this.getAll({ activo: true });
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

  async registrarMedicion(id: string, data: {
    periodo: string;
    valor: number;
    meta?: number;
    observaciones?: string;
  }): Promise<MedicionIndicador> {
    const response = await apiClient.post(`/indicadores/${id}/mediciones`, data);
    return response.data;
  },

  async getMediciones(id: string): Promise<MedicionIndicador[]> {
    const response = await apiClient.get(`/indicadores/${id}/mediciones`);
    return response.data;
  },

  async getTendencia(id: string): Promise<TendenciaIndicador> {
    const response = await apiClient.get(`/indicadores/${id}/tendencia`);
    return response.data;
  },
};
