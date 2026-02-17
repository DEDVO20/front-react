import { API_BASE_URL as API_URL } from "@/lib/api";

export interface FormularioDinamico {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  modulo: string;
  entidadTipo: string;
  procesoId?: string;
  activo: boolean;
  version: number;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface CampoFormulario {
  id: string;
  formularioId?: string;
  procesoId?: string;
  nombre: string;
  etiqueta: string;
  tipoCampo: string;
  requerido: boolean;
  opciones?: any;
  orden: number;
  activo: boolean;
  validaciones?: any;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface RespuestaFormulario {
  id: string;
  campoFormularioId: string;
  instanciaProcesoId?: string;
  auditoriaId?: string;
  valor?: string;
  archivoAdjunto?: string;
  usuarioRespuestaId?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const mapFormularioToFrontend = (data: any): FormularioDinamico => ({
  ...data,
  entidadTipo: data.entidad_tipo ?? data.entidadTipo,
  procesoId: data.proceso_id ?? data.procesoId,
  creadoEn: data.creado_en ?? data.creadoEn,
  actualizadoEn: data.actualizado_en ?? data.actualizadoEn,
});

const mapCampoToFrontend = (data: any): CampoFormulario => ({
  ...data,
  formularioId: data.formulario_id ?? data.formularioId,
  procesoId: data.proceso_id ?? data.procesoId,
  tipoCampo: data.tipo_campo ?? data.tipoCampo,
  creadoEn: data.creado_en ?? data.creadoEn,
  actualizadoEn: data.actualizado_en ?? data.actualizadoEn,
});

const mapRespuestaToFrontend = (data: any): RespuestaFormulario => ({
  ...data,
  campoFormularioId: data.campo_formulario_id ?? data.campoFormularioId,
  instanciaProcesoId: data.instancia_proceso_id ?? data.instanciaProcesoId,
  auditoriaId: data.auditoria_id ?? data.auditoriaId,
  archivoAdjunto: data.archivo_adjunto ?? data.archivoAdjunto,
  usuarioRespuestaId: data.usuario_respuesta_id ?? data.usuarioRespuestaId,
  creadoEn: data.creado_en ?? data.creadoEn,
  actualizadoEn: data.actualizado_en ?? data.actualizadoEn,
});

export const formularioDinamicoService = {
  async getFormularios(filters?: {
    modulo?: string;
    entidadTipo?: string;
    procesoId?: string;
    activo?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<FormularioDinamico[]> {
    const params = new URLSearchParams();
    if (filters?.modulo) params.append("modulo", filters.modulo);
    if (filters?.entidadTipo) params.append("entidad_tipo", filters.entidadTipo);
    if (filters?.procesoId) params.append("proceso_id", filters.procesoId);
    if (filters?.activo !== undefined) params.append("activo", String(filters.activo));
    if (filters?.skip !== undefined) params.append("skip", String(filters.skip));
    if (filters?.limit !== undefined) params.append("limit", String(filters.limit));

    const response = await fetch(`${API_URL}/formularios-dinamicos?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener formularios dinámicos");
    const data = await response.json();
    return Array.isArray(data) ? data.map(mapFormularioToFrontend) : [];
  },

  async getCampos(filters?: {
    formularioId?: string;
    procesoId?: string;
    activo?: boolean;
  }): Promise<CampoFormulario[]> {
    const params = new URLSearchParams();
    if (filters?.formularioId) params.append("formulario_id", filters.formularioId);
    if (filters?.procesoId) params.append("proceso_id", filters.procesoId);
    if (filters?.activo !== undefined) params.append("activo", String(filters.activo));

    const response = await fetch(`${API_URL}/campos-formulario?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener campos del formulario");
    const data = await response.json();
    return Array.isArray(data) ? data.map(mapCampoToFrontend) : [];
  },

  async crearFormulario(data: {
    codigo: string;
    nombre: string;
    descripcion?: string;
    modulo: string;
    entidadTipo: string;
    procesoId?: string;
    activo?: boolean;
    version?: number;
  }): Promise<FormularioDinamico> {
    const payload = {
      codigo: data.codigo,
      nombre: data.nombre,
      descripcion: data.descripcion,
      modulo: data.modulo,
      entidad_tipo: data.entidadTipo,
      proceso_id: data.procesoId,
      activo: data.activo ?? true,
      version: data.version ?? 1,
    };
    const response = await fetch(`${API_URL}/formularios-dinamicos`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al crear formulario dinámico");
    }
    return mapFormularioToFrontend(await response.json());
  },

  async actualizarFormulario(
    id: string,
    data: Partial<{
      nombre: string;
      descripcion: string;
      modulo: string;
      entidadTipo: string;
      procesoId: string;
      activo: boolean;
      version: number;
    }>
  ): Promise<FormularioDinamico> {
    const payload = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      modulo: data.modulo,
      entidad_tipo: data.entidadTipo,
      proceso_id: data.procesoId,
      activo: data.activo,
      version: data.version,
    };
    const response = await fetch(`${API_URL}/formularios-dinamicos/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al actualizar formulario dinámico");
    }
    return mapFormularioToFrontend(await response.json());
  },

  async eliminarFormulario(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/formularios-dinamicos/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al eliminar formulario dinámico");
    }
  },

  async crearCampo(data: {
    formularioId: string;
    nombre: string;
    etiqueta: string;
    tipoCampo: string;
    requerido?: boolean;
    opciones?: any;
    orden?: number;
    activo?: boolean;
    validaciones?: any;
    procesoId?: string;
  }): Promise<CampoFormulario> {
    const payload = {
      formulario_id: data.formularioId,
      nombre: data.nombre,
      etiqueta: data.etiqueta,
      tipo_campo: data.tipoCampo,
      requerido: data.requerido ?? false,
      opciones: data.opciones,
      orden: data.orden ?? 1,
      activo: data.activo ?? true,
      validaciones: data.validaciones,
      proceso_id: data.procesoId,
    };
    const response = await fetch(`${API_URL}/campos-formulario`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al crear campo del formulario");
    }
    return mapCampoToFrontend(await response.json());
  },

  async actualizarCampo(
    id: string,
    data: Partial<{
      formularioId: string;
      procesoId: string;
      nombre: string;
      etiqueta: string;
      tipoCampo: string;
      requerido: boolean;
      opciones: any;
      orden: number;
      activo: boolean;
      validaciones: any;
    }>
  ): Promise<CampoFormulario> {
    const payload = {
      formulario_id: data.formularioId,
      proceso_id: data.procesoId,
      nombre: data.nombre,
      etiqueta: data.etiqueta,
      tipo_campo: data.tipoCampo,
      requerido: data.requerido,
      opciones: data.opciones,
      orden: data.orden,
      activo: data.activo,
      validaciones: data.validaciones,
    };
    const response = await fetch(`${API_URL}/campos-formulario/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al actualizar campo del formulario");
    }
    return mapCampoToFrontend(await response.json());
  },

  async eliminarCampo(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/campos-formulario/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al eliminar campo del formulario");
    }
  },

  async getRespuestas(filters?: {
    auditoriaId?: string;
    instanciaProcesoId?: string;
    campoFormularioId?: string;
  }): Promise<RespuestaFormulario[]> {
    const params = new URLSearchParams();
    if (filters?.auditoriaId) params.append("auditoria_id", filters.auditoriaId);
    if (filters?.instanciaProcesoId) params.append("instancia_proceso_id", filters.instanciaProcesoId);
    if (filters?.campoFormularioId) params.append("campo_formulario_id", filters.campoFormularioId);

    const response = await fetch(`${API_URL}/respuestas-formulario?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener respuestas del formulario");
    const data = await response.json();
    return Array.isArray(data) ? data.map(mapRespuestaToFrontend) : [];
  },

  async crearRespuesta(data: {
    campoFormularioId: string;
    auditoriaId: string;
    valor?: string;
    archivoAdjunto?: string;
  }): Promise<RespuestaFormulario> {
    const payload = {
      campo_formulario_id: data.campoFormularioId,
      auditoria_id: data.auditoriaId,
      valor: data.valor ?? "",
      archivo_adjunto: data.archivoAdjunto,
    };
    const response = await fetch(`${API_URL}/respuestas-formulario`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al crear respuesta");
    }
    return mapRespuestaToFrontend(await response.json());
  },

  async actualizarRespuesta(
    respuestaId: string,
    data: { valor?: string; archivoAdjunto?: string }
  ): Promise<RespuestaFormulario> {
    const payload = {
      valor: data.valor ?? "",
      archivo_adjunto: data.archivoAdjunto,
    };
    const response = await fetch(`${API_URL}/respuestas-formulario/${respuestaId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al actualizar respuesta");
    }
    return mapRespuestaToFrontend(await response.json());
  },

  async guardarRespuestasAuditoria(
    auditoriaId: string,
    respuestas: Array<{ campoFormularioId: string; valor?: string; respuestaId?: string }>
  ): Promise<RespuestaFormulario[]> {
    const operaciones = respuestas.map((item) =>
      item.respuestaId
        ? this.actualizarRespuesta(item.respuestaId, { valor: item.valor })
        : this.crearRespuesta({
            campoFormularioId: item.campoFormularioId,
            auditoriaId,
            valor: item.valor,
          })
    );
    return Promise.all(operaciones);
  },
};
