import axios from "@/lib/api";

const API_URL = "/configuraciones";

export interface Configuracion {
    clave: string;
    valor: string;
    descripcion?: string;
    tipo_dato: string;
    categoria?: string;
    activa: boolean;
}

export const configuracionService = {
    async get(clave: string): Promise<Configuracion | null> {
        try {
            const response = await axios.get(`${API_URL}/${clave}`);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                return null;
            }
            throw error;
        }
    },

    async create(data: Configuracion): Promise<Configuracion> {
        const response = await axios.post(API_URL, data);
        return response.data;
    },

    async update(clave: string, data: Partial<Configuracion>): Promise<Configuracion> {
        const response = await axios.put(`${API_URL}/${clave}`, data);
        return response.data;
    },

    async save(clave: string, value: string, descripcion: string = "Configuración del sistema"): Promise<Configuracion> {
        const existing = await this.get(clave);
        if (existing) {
            return this.update(clave, { valor: value });
        } else {
            return this.create({
                clave,
                valor: value,
                descripcion,
                tipo_dato: "string", // Assuming string for URL
                categoria: "sistema",
                activa: true,
            });
        }
    },
};
