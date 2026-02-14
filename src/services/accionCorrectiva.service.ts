import { apiClient } from "@/lib/api";

export interface AccionCorrectiva {
  id: string;
  noConformidadId: string;
  codigo: string;
  tipo: string;
  descripcion: string;
  analisisCausaRaiz: string;
  planAccion: string;
  responsableId?: string;
  fechaCompromiso?: string;
  fechaImplementacion?: string;
  implementadoPor?: string;
  estado: string;
  eficaciaVerificada?: number;
  verificadoPor?: string;
  fechaVerificacion?: string;
  observacion?: string;
  evidencias?: string;
  creado_en: string;
  actualizado_en: string;
  responsable?: {
    id: string;
    nombre: string;
    primerApellido: string;
  };
  implementador?: {
    id: string;
    nombre: string;
    primerApellido: string;
  };
  verificador?: {
    id: string;
    nombre: string;
    primerApellido: string;
  };
}

export const accionCorrectivaService = {
  // Obtener acciones correctivas de una no conformidad
  async getByNoConformidad(noConformidadId: string): Promise<AccionCorrectiva[]> {
    const response = await apiClient.get("/acciones-correctivas", {
      params: { no_conformidad_id: noConformidadId }
    });
    return response.data;
  },

  // Obtener una acción correctiva por ID
  async getById(id: string): Promise<AccionCorrectiva> {
    const response = await apiClient.get(`/acciones-correctivas/${id}`);
    return response.data;
  },

  // Crear nueva acción correctiva
  async create(data: Partial<AccionCorrectiva>): Promise<AccionCorrectiva> {
    const response = await apiClient.post("/acciones-correctivas", data);
    return response.data;
  },

  // Actualizar acción correctiva
  async update(id: string, data: Partial<AccionCorrectiva>): Promise<AccionCorrectiva> {
    const response = await apiClient.put(`/acciones-correctivas/${id}`, data);
    return response.data;
  },

  // Implementar acción correctiva
  async implementar(id: string, data: { fecha_implementacion: string; observacion?: string; evidencias?: string }): Promise<AccionCorrectiva> {
    const response = await apiClient.patch(`/acciones-correctivas/${id}/implementar`, data);
    return response.data;
  },

  // Verificar acción correctiva
  async verificar(id: string, data: { eficaciaVerificada: number; observaciones?: string }): Promise<AccionCorrectiva> {
    const response = await apiClient.patch(`/acciones-correctivas/${id}/verificar`, data);
    return response.data;
  },

  // Eliminar acción correctiva
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/acciones-correctivas/${id}`);
  },
};
