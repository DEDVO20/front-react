import api from "@/lib/api";

export interface Notificacion {
    id: string;
    usuario_id: string;
    titulo: string;
    mensaje: string;
    tipo: string;
    leida: boolean;
    fecha_lectura: string | null;
    referencia_tipo: string | null;
    referencia_id: string | null;
    creado_en: string;
}

class NotificacionService {
    /**
     * Obtener lista de notificaciones del usuario actual
     */
    async getNotificaciones(soloNoLeidas: boolean = false): Promise<Notificacion[]> {
        try {
            const params = soloNoLeidas ? { solo_no_leidas: true } : {};
            const response = await api.get<Notificacion[]>("/notificaciones", { params });
            return response.data;
        } catch (error: any) {
            if (error?.message === "Network Error") return [];
            throw error;
        }
    }

    /**
     * Obtener contador de notificaciones no leídas
     */
    async getNoLeidas(): Promise<number> {
        try {
            const response = await api.get<{ count: number }>("/notificaciones/no-leidas/count");
            return response.data.count;
        } catch (error: any) {
            if (error?.message === "Network Error") return 0;
            throw error;
        }
    }

    /**
     * Marcar una notificación como leída
     */
    async marcarComoLeida(id: string): Promise<Notificacion | null> {
        try {
            const response = await api.put<Notificacion>(`/notificaciones/${id}/marcar-leida`);
            return response.data;
        } catch (error: any) {
            // Si la notificación no existe (404), retornar null silenciosamente
            if (error.response?.status === 404) {
                console.warn(`Notificación ${id} no encontrada, posiblemente ya fue eliminada`);
                return null;
            }
            // Re-lanzar otros errores
            throw error;
        }
    }

    /**
     * Marcar todas las notificaciones como leídas
     */
    async marcarTodasLeidas(): Promise<void> {
        await api.put("/notificaciones/marcar-todas-leidas");
    }

    /**
     * Eliminar una notificación
     */
    async eliminarNotificacion(id: string): Promise<void> {
        await api.delete(`/notificaciones/${id}`);
    }
}

export default new NotificacionService();
