import { procesoService } from "@/services/proceso.service";
import { riesgoService } from "@/services/riesgo.service";
import { competenciaService } from "@/services/competencia.service";
import { capacitacionService } from "@/services/capacitacion.service";
import { indicadorService } from "@/services/indicador.service";
import { auditoriaService } from "@/services/auditoria.service";
import { accionCorrectivaService } from "@/services/accionCorrectiva.service";

export interface DashboardPHVAMetrics {
  plan: {
    procesosDefinidos: number;
    riesgosIdentificados: number;
    competenciasDefinidas: number;
  };
  do: {
    operacionesEjecutadas: number;
    capacitacionesRealizadas: number;
    controlesAplicados: number;
  };
  check: {
    indicadoresMedidos: number;
    auditoriasEjecutadas: number;
    hallazgosDetectados: number;
  };
  act: {
    accionesCorrectivas: number;
    eficaciaVerificada: number;
    riesgosActualizados: number;
  };
}

export const dashboardPhvaService = {
  async getMetrics(): Promise<DashboardPHVAMetrics> {
    const [
      procesos,
      riesgos,
      competencias,
      capacitaciones,
      indicadores,
      auditorias,
      hallazgos,
      acciones,
    ] = await Promise.all([
      procesoService.listar({ limit: 1000 }),
      riesgoService.getAll(),
      competenciaService.getAll(),
      capacitacionService.getAll(),
      indicadorService.getAll(),
      auditoriaService.getAll(),
      auditoriaService.getAllHallazgos(),
      accionCorrectivaService.getAll({ limit: 1000 }),
    ]);

    const auditoriasEjecutadas = auditorias.filter((a) => ["en_curso", "completada", "cerrada"].includes(a.estado)).length;
    const capacitacionesRealizadas = capacitaciones.filter((c) => ["completada", "cerrada"].includes(c.estado)).length;
    const operacionesEjecutadas = procesos.filter((p) => ["activo", "revision"].includes(String(p.estado))).length;
    const riesgosActualizados = riesgos.filter((r) => !!r.fecha_revision).length;

    return {
      plan: {
        procesosDefinidos: procesos.length,
        riesgosIdentificados: riesgos.length,
        competenciasDefinidas: competencias.length,
      },
      do: {
        operacionesEjecutadas,
        capacitacionesRealizadas,
        controlesAplicados: riesgos.filter((r) => ["cerrado", "mitigado"].includes(String(r.estado))).length,
      },
      check: {
        indicadoresMedidos: indicadores.length,
        auditoriasEjecutadas,
        hallazgosDetectados: hallazgos.length,
      },
      act: {
        accionesCorrectivas: acciones.length,
        eficaciaVerificada: acciones.filter((a) => ["verificada", "cerrada"].includes(String(a.estado))).length,
        riesgosActualizados,
      },
    };
  },
};
