
import apiClient from "../lib/api";

export const reportsService = {
    downloadAuditoriaReport: async (id: string, codigo: string) => {
        try {
            const response = await apiClient.get(`/reportes/auditorias/${id}/pdf`, {
                responseType: 'blob' // Important for binary data
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `auditoria_${codigo}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading report:", error);
            throw error;
        }
    },

    downloadNCReport: async (estado?: string) => {
        try {
            const params = estado ? { estado } : {};
            const response = await apiClient.get(`/reportes/noconformidades/pdf`, {
                params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_noconformidades_${new Date().getFullYear()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading report:", error);
            throw error;
        }
    }
};
