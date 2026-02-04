import { apiClient } from "@/lib/api";

export interface AccionCorrectiva {
  id: string;
  noConformidadId: string;
  codigo: string;
  tipo: string;
  descripcion: string;
  analisisCausaRaiz: string;
  planAccion: string;
  responsableId: string;
  fechaCompromiso: string;
  fechaImplementacion?: string;
  fechaVerificacion?: string;
  eficaciaVerificada?: number;
  verificadoPor?: string;
  implementadoPor?: string;
  estado: string;
  observacion?: string;
  evidencias?: string; // URLs o descripciones de evidencias
  creadoEn: string;
  actualizadoEn?: string;
  // Relaciones con usuarios
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
  // Obtener todas las acciones correctivas
  async getAll(): Promise<AccionCorrectiva[]> {
    const response = await apiClient.get("/acciones-correctivas");
    return response.data;
  },

  // Obtener acciones por estado
  async getByEstado(estado: string): Promise<AccionCorrectiva[]> {
    const response = await apiClient.get(`/acciones-correctivas`, {
      params: { estado }
    });
    return response.data;
  },

  // Obtener acciones en proceso
  async getEnProceso(): Promise<AccionCorrectiva[]> {
    const estados = ["en_proceso", "pendiente", "en_ejecucion"];
    const response = await apiClient.get("/acciones-correctivas");
    return response.data.filter((ac: AccionCorrectiva) => estados.includes(ac.estado));
  },

  // Obtener acciones verificadas
  async getVerificadas(): Promise<AccionCorrectiva[]> {
    const response = await apiClient.get("/acciones-correctivas", {
      params: { estado: "verificada" }
    });
    return response.data;
  },

  // Obtener acciones cerradas
  async getCerradas(): Promise<AccionCorrectiva[]> {
    const estados = ["cerrada", "completada"];
    const response = await apiClient.get("/acciones-correctivas");
    return response.data.filter((ac: AccionCorrectiva) => estados.includes(ac.estado));
  },

  // Obtener acciones nuevas
  async getNuevas(): Promise<AccionCorrectiva[]> {
    const estados = ["nueva", "pendiente"];
    const response = await apiClient.get("/acciones-correctivas");
    return response.data.filter((ac: AccionCorrectiva) => estados.includes(ac.estado));
  },

  // Obtener una acción por ID
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

  // Cambiar estado de acción correctiva
  async cambiarEstado(id: string, estado: string): Promise<AccionCorrectiva> {
    const response = await apiClient.patch(`/acciones-correctivas/${id}/estado`, { estado });
    return response.data;
  },

  // Verificar acción correctiva
  async verificar(id: string, observaciones?: string): Promise<AccionCorrectiva> {
    const response = await apiClient.patch(`/acciones-correctivas/${id}/verificar`, { observaciones });
    return response.data;
  },

  // Eliminar acción correctiva
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/acciones-correctivas/${id}`);
  },
};
