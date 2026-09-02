import { apiClient } from "@/lib/api";

export type EntidadCodigo =
  | "documento"
  | "riesgo"
  | "proceso"
  | "no_conformidad"
  | "accion_correctiva"
  | "capacitacion"
  | "objetivo"
  | "indicador"
  | "auditoria"
  | "hallazgo"
  | "area"
  | "formulario"
  | "accion_proceso";

class CodigoService {
  async siguiente(
    entidad: EntidadCodigo,
    extras?: { tipo?: string; areaCodigo?: string },
  ): Promise<string> {
    const response = await apiClient.get("/codigos/siguiente", {
      params: {
        entidad,
        tipo: extras?.tipo || undefined,
        area_codigo: extras?.areaCodigo || undefined,
      },
    });
    return response.data.codigo as string;
  }
}

export const codigoService = new CodigoService();
