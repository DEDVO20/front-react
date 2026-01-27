import { apiClient } from "@/lib/api";

export interface DocumentoData {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo_documento: string;
  ruta_archivo?: string;
  version_actual?: string;
  estado?: string;
  fecha_aprobacion?: string;
  fecha_vigencia?: string;
  creado_por?: string;
  aprobado_por?: string;
}

export interface UsuarioNested {
  id: string;
  nombre: string;
  primerApellido?: string;
  segundoApellido?: string;
  correoElectronico?: string;
}

export interface DocumentoResponse {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo_documento: string;
  ruta_archivo?: string;
  version_actual: string;
  estado: string;
  fecha_aprobacion?: string;
  fecha_vigencia?: string;
  creado_por?: string;  // UUID
  aprobado_por?: string;  // UUID
  creador?: UsuarioNested;  // Objeto usuario completo
  aprobador?: UsuarioNested;  // Objeto usuario completo
  creado_en: string;
  actualizado_en: string;
}

class DocumentoService {
  async create(data: DocumentoData): Promise<DocumentoResponse> {
    const response = await apiClient.post("/documentos", data);
    return response.data;
  }

  async getAll(params?: Record<string, string>): Promise<DocumentoResponse[]> {
    const response = await apiClient.get("/documentos", { params });
    return response.data;
  }

  async getById(id: string): Promise<DocumentoResponse> {
    const response = await apiClient.get(`/documentos/${id}`);
    return response.data;
  }

  async update(id: string, data: Partial<DocumentoData>): Promise<DocumentoResponse> {
    const response = await apiClient.put(`/documentos/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/documentos/${id}`);
  }

  async getVersiones(documentoId: string): Promise<any[]> {
    const response = await apiClient.get(`/documentos/${documentoId}/versiones`);
    return response.data;
  }

  async createVersion(data: {
    documento_id: string;
    version: string;
    descripcion_cambios?: string;
    creado_por?: string;
  }): Promise<any> {
    const response = await apiClient.post('/versiones-documentos', data);
    return response.data;
  }
}

export const documentoService = new DocumentoService();
