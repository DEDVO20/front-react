import apiClient from "../lib/api";

export interface DashboardMetrics {
    calidad: {
        noconformidades: Record<string, number>;
        objetivos_total: number;
        indicadores_total: number;
    };
    riesgos: HeatmapPoint[];
    documentos: {
        por_estado: Record<string, number>;
    };
    auditorias: {
        hallazgos_por_tipo: Record<string, number>;
        total_auditorias: number;
    };
    riesgos_stats: {
        total_riesgos: number;
    };
}

export interface HeatmapPoint {
    probabilidad: string | number;
    impacto: string | number;
    cantidad: number;
}

export const analyticsService = {
    getCalidadMetrics: async () => {
        const response = await apiClient.get("/analytics/calidad");
        return response.data;
    },

    getRiesgosHeatmap: async (): Promise<HeatmapPoint[]> => {
        const response = await apiClient.get("/analytics/riesgos/heatmap");
        return response.data;
    },

    getDocumentosStats: async () => {
        const response = await apiClient.get("/analytics/documentos/stats");
        return response.data;
    },

    getAuditoriasStats: async () => {
        const response = await apiClient.get("/analytics/auditorias/stats");
        return response.data;
    },

    // Helper to fetch all at once for the main dashboard
    getAllDashboardData: async (): Promise<DashboardMetrics> => {
        const [calidad, riesgos, documentos, auditorias, riesgos_stats] = await Promise.all([
            apiClient.get("/analytics/calidad"),
            apiClient.get("/analytics/riesgos/heatmap"),
            apiClient.get("/analytics/documentos/stats"),
            apiClient.get("/analytics/auditorias/stats"),
            apiClient.get("/analytics/riesgos/stats")
        ]);

        return {
            calidad: calidad.data,
            riesgos: riesgos.data,
            documentos: documentos.data,
            auditorias: auditorias.data,
            riesgos_stats: riesgos_stats.data
        };
    }
};
