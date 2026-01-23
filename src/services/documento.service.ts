const API_URL = "http://localhost:3000/api";

export interface DocumentoData {
  nombreArchivo: string;
  tipoDocumento: string;
  codigoDocumento: string;
  version: string;
  visibilidad: "publico" | "privado";
  estado: "borrador" | "en_revision" | "aprobado" | "obsoleto";
  proximaRevision?: string;
  subidoPor?: string;
  creadoPor: string;
  revisadoPor?: string;
  aprobadoPor?: string;
  contenidoHtml?: string;
}

export interface DocumentoResponse {
  id: string;
  nombreArchivo: string;
  tipoDocumento: string;
  codigoDocumento: string;
  version: string;
  visibilidad: string;
  estado: string;
  contenidoHtml?: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface DocumentosListResponse {
  items: DocumentoResponse[];
  total: number;
  page: number;
  limit: number;
}

class DocumentoService {
  private getAuthHeader() {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async create(formData: FormData): Promise<DocumentoResponse> {
    const response = await fetch(`${API_URL}/documentos`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al crear documento");
    }

    return response.json();
  }

  async getAll(
    params?: Record<string, string>,
  ): Promise<DocumentosListResponse> {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_URL}/documentos?${queryParams}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Error al obtener documentos");
    }

    return response.json();
  }

  async getById(id: string): Promise<DocumentoResponse> {
    const response = await fetch(`${API_URL}/documentos/${id}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al obtener documento");
    }

    return response.json();
  }

  async update(id: string, formData: FormData): Promise<DocumentoResponse> {
    const response = await fetch(`${API_URL}/documentos/${id}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al actualizar documento");
    }

    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/documentos/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al eliminar documento");
    }
  }
}

export const documentoService = new DocumentoService();
