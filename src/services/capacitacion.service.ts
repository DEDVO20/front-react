import { API_BASE_URL as API_URL } from "@/lib/api";

export interface Capacitacion {
  id: string;                      // UUID from backend
  codigo: string;                  // Required, unique identifier
  nombre: string;                  // Required, training name
  descripcion?: string;
  tipoCapacitacion: string;        // interna, externa, online
  modalidad: string;               // Virtual, Presencial
  duracionHoras?: number;          // Duration in hours
  instructor?: string;
  fechaProgramada?: string;        // ISO date string
  fechaRealizacion?: string;       // ISO date string
  lugar?: string;
  estado: "programada" | "en_curso" | "completada" | "cancelada";
  objetivo?: string;
  contenido?: string;
  responsableId?: string;          // UUID
  creadoEn?: string;
  actualizadoEn?: string;
  // Populated from relations
  responsable?: {
    id: string;
    nombre: string;
    primerApellido: string;
    segundoApellido: string;
    email: string;
  };
}

export interface AsistenciaCapacitacion {
  id: string;
  capacitacionId: string;
  usuarioId: string;
  asistio: boolean;
  observaciones?: string;
  calificacion?: number;
  capacitacion?: Capacitacion;
  usuario?: {
    nombre: string;
    primerApellido: string;
  };
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const fetchWithTimeout = async (url: string, options: RequestInit & { timeout?: number } = {}) => {
  const { timeout = 15000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...rest, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('La solicitud tardó demasiado. Por favor verifique su conexión o intente nuevamente.');
    }
    throw error;
  }
};

export const capacitacionService = {
  // Helper para convertir de Backend (snake_case) a Frontend (camelCase)
  mapToFrontend(data: any): Capacitacion {
    return {
      ...data,
      tipoCapacitacion: data.tipo_capacitacion,
      duracionHoras: data.duracion_horas,
      fechaProgramada: data.fecha_programada,
      fechaRealizacion: data.fecha_realizacion,
      creadoEn: data.creado_en,
      actualizadoEn: data.actualizado_en,
      responsableId: data.responsable_id,
    };
  },

  // Helper para convertir de Frontend (camelCase) a Backend (snake_case)
  mapToBackend(data: Partial<Capacitacion>): any {
    const mapped: any = { ...data };

    if (data.tipoCapacitacion) mapped.tipo_capacitacion = data.tipoCapacitacion;
    if (data.duracionHoras) mapped.duracion_horas = Number(data.duracionHoras);

    // Ensure dates are compatible with PostgreSQL DateTime (ISO 8601)
    if (data.fechaProgramada) {
      // If it's just a date YYYY-MM-DD, append time to make it a valid ISO datetime
      mapped.fecha_programada = data.fechaProgramada.includes('T')
        ? data.fechaProgramada
        : `${data.fechaProgramada}T09:00:00`;
    }

    if (data.fechaRealizacion) {
      mapped.fecha_realizacion = data.fechaRealizacion.includes('T')
        ? data.fechaRealizacion
        : `${data.fechaRealizacion}T09:00:00`;
    }

    if (data.responsableId) mapped.responsable_id = data.responsableId;

    // Limpiar claves camelCase para no enviarlas extra
    delete mapped.tipoCapacitacion;
    delete mapped.duracionHoras;
    delete mapped.fechaProgramada;
    delete mapped.fechaRealizacion;
    delete mapped.responsableId;
    delete mapped.creadoEn;
    delete mapped.actualizadoEn;
    delete mapped.responsable; // Si existe
    delete mapped.asistencias; // Don't send relations back

    return mapped;
  },

  // Obtener todas las capacitaciones
  async getAll(): Promise<Capacitacion[]> {
    const response = await fetchWithTimeout(`${API_URL}/capacitaciones`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener capacitaciones");
    const data = await response.json();
    return data.map((item: any) => this.mapToFrontend(item));
  },

  // Obtener capacitaciones programadas (pendientes)
  async getProgramadas(): Promise<Capacitacion[]> {
    const response = await fetchWithTimeout(`${API_URL}/capacitaciones?estado=programada`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener capacitaciones programadas");
    const data = await response.json();
    return data.map((item: any) => this.mapToFrontend(item));
  },

  // Obtener historial de capacitaciones (completadas)
  async getHistorial(): Promise<Capacitacion[]> {
    const response = await fetchWithTimeout(`${API_URL}/capacitaciones?estado=completada`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener historial");
    const data = await response.json();
    return data.map((item: any) => this.mapToFrontend(item));
  },

  // Obtener una capacitación por ID
  async getById(id: string): Promise<Capacitacion> {
    const response = await fetchWithTimeout(`${API_URL}/capacitaciones/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener capacitación");
    const data = await response.json();
    return this.mapToFrontend(data);
  },

  // Crear nueva capacitación
  async create(data: Partial<Capacitacion>): Promise<Capacitacion> {
    const payload = this.mapToBackend(data);
    const response = await fetchWithTimeout(`${API_URL}/capacitaciones`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Handle FastAPI validation error array
      if (Array.isArray(errorData.detail)) {
        const messages = errorData.detail.map((err: any) => `${err.loc[1] || 'Field'}: ${err.msg}`).join(', ');
        throw new Error(messages);
      }
      throw new Error(errorData.detail || "Error al crear capacitación");
    }

    const responseData = await response.json();
    return this.mapToFrontend(responseData);
  },

  // Actualizar capacitación
  async update(id: string, data: Partial<Capacitacion>): Promise<Capacitacion> {
    const payload = this.mapToBackend(data);
    const response = await fetchWithTimeout(`${API_URL}/capacitaciones/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Handle FastAPI validation error array
      if (Array.isArray(errorData.detail)) {
        const messages = errorData.detail.map((err: any) => `${err.loc[1] || 'Field'}: ${err.msg}`).join(', ');
        throw new Error(messages);
      }
      throw new Error(errorData.detail || "Error al actualizar capacitación");
    }

    const responseData = await response.json();
    return this.mapToFrontend(responseData);
  },

  // Marcar como completada
  async marcarCompletada(id: string): Promise<Capacitacion> {
    const response = await fetchWithTimeout(`${API_URL}/capacitaciones/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ estado: "completada" }),
    });
    if (!response.ok) throw new Error("Error al marcar como completada");
    const data = await response.json();
    return this.mapToFrontend(data);
  },

  // Eliminar capacitación
  async delete(id: string): Promise<void> {
    const response = await fetchWithTimeout(`${API_URL}/capacitaciones/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al eliminar capacitación");
  },

  // Obtener asistencias de una capacitación
  async getAsistencias(capacitacionId: string): Promise<AsistenciaCapacitacion[]> {
    const response = await fetchWithTimeout(
      `${API_URL}/asistencias-capacitacion?capacitacionId=${capacitacionId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener asistencias");
    return response.json();
  },

  // Registrar asistencia
  async registrarAsistencia(
    data: Partial<AsistenciaCapacitacion>
  ): Promise<AsistenciaCapacitacion> {
    const response = await fetchWithTimeout(`${API_URL}/asistencias-capacitacion`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al registrar asistencia");
    return response.json();
  },
};
