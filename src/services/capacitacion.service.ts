const API_URL = "http://localhost:3000/api";

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

export const capacitacionService = {
  // Obtener todas las capacitaciones
  async getAll(): Promise<Capacitacion[]> {
    const response = await fetch(`${API_URL}/capacitaciones`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener capacitaciones");
    return response.json();
  },

  // Obtener capacitaciones programadas (pendientes)
  async getProgramadas(): Promise<Capacitacion[]> {
    const response = await fetch(`${API_URL}/capacitaciones?estado=programada`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener capacitaciones programadas");
    return response.json();
  },

  // Obtener historial de capacitaciones (completadas)
  async getHistorial(): Promise<Capacitacion[]> {
    const response = await fetch(`${API_URL}/capacitaciones?estado=completada`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener historial");
    return response.json();
  },

  // Obtener una capacitación por ID
  async getById(id: string): Promise<Capacitacion> {
    const response = await fetch(`${API_URL}/capacitaciones/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener capacitación");
    return response.json();
  },

  // Crear nueva capacitación
  async create(data: Partial<Capacitacion>): Promise<Capacitacion> {
    const response = await fetch(`${API_URL}/capacitaciones`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear capacitación");
    return response.json();
  },

  // Actualizar capacitación
  async update(id: string, data: Partial<Capacitacion>): Promise<Capacitacion> {
    const response = await fetch(`${API_URL}/capacitaciones/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar capacitación");
    return response.json();
  },

  // Marcar como completada
  async marcarCompletada(id: string): Promise<Capacitacion> {
    const response = await fetch(`${API_URL}/capacitaciones/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ estado: "completada" }),
    });
    if (!response.ok) throw new Error("Error al marcar como completada");
    return response.json();
  },

  // Eliminar capacitación
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/capacitaciones/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al eliminar capacitación");
  },

  // Obtener asistencias de una capacitación
  async getAsistencias(capacitacionId: string): Promise<AsistenciaCapacitacion[]> {
    const response = await fetch(
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
    const response = await fetch(`${API_URL}/asistencias-capacitacion`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al registrar asistencia");
    return response.json();
  },
};
