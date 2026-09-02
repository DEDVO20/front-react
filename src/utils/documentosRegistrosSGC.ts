import type { AccionCorrectiva } from "@/services/accionCorrectiva.service";
import type { Auditoria, HallazgoAuditoria } from "@/services/auditoria.service";
import type {
  AsistenciaCapacitacion,
  Capacitacion,
  ResumenAsistenciaCapacitacion,
} from "@/services/capacitacion.service";
import type { NoConformidad } from "@/services/noConformidad.service";
import type { ObjetivoCalidad, SeguimientoObjetivo } from "@/services/objetivoCalidad.service";
import type { Riesgo } from "@/services/riesgo.service";
import {
  formatearFechaSGC,
  nombreUsuarioSGC,
  seccionSGC,
  tablaCamposSGC,
  textoAHtmlSGC,
  type DocumentoSGCData,
} from "@/utils/documentoSGC";

function tipoAccionSGC(tipo?: string): string {
  const mapa: Record<string, string> = {
    correctiva: "accion_correctiva",
    preventiva: "accion_preventiva",
    mejora: "accion_mejora",
  };
  return mapa[(tipo || "").toLowerCase()] || "accion_correctiva";
}

function etiquetaTipoAccion(tipo?: string): string {
  const mapa: Record<string, string> = {
    correctiva: "Correctiva",
    preventiva: "Preventiva",
    mejora: "Mejora",
  };
  return mapa[(tipo || "").toLowerCase()] || tipo || "—";
}

function tituloAccion(tipo?: string): string {
  const mapa: Record<string, string> = {
    correctiva: "Acción correctiva",
    preventiva: "Acción preventiva",
    mejora: "Acción de mejora",
  };
  return mapa[(tipo || "").toLowerCase()] || "Acción correctiva";
}

export function datosSGCDesdeAccionCorrectiva(accion: AccionCorrectiva): DocumentoSGCData {
  const contenidoHtml = [
    seccionSGC(
      "Datos de la acción",
      tablaCamposSGC([
        ["Código", accion.codigo || "—"],
        ["Tipo", etiquetaTipoAccion(accion.tipo)],
        ["Estado", (accion.estado || "—").replace(/_/g, " ")],
        ["Fecha de compromiso", formatearFechaSGC(accion.fechaCompromiso)],
        ["Fecha de implementación", formatearFechaSGC(accion.fechaImplementacion)],
        ["Fecha de verificación", formatearFechaSGC(accion.fechaVerificacion)],
        ["Responsable", nombreUsuarioSGC(accion.responsable, "Sin asignar")],
        ["Implementado por", nombreUsuarioSGC(accion.implementador, "Pendiente")],
        ["Verificado por", nombreUsuarioSGC(accion.verificador, "Pendiente")],
        ["Eficacia verificada", accion.eficaciaVerificada ? "Sí" : "No"],
      ]),
    ),
    seccionSGC("Descripción", textoAHtmlSGC(accion.descripcion, "Sin descripción.")),
    seccionSGC("Análisis de causa raíz", textoAHtmlSGC(accion.analisisCausaRaiz)),
    seccionSGC("Plan de acción", textoAHtmlSGC(accion.planAccion)),
    seccionSGC("Evidencias", textoAHtmlSGC(accion.evidencias, "Sin evidencias registradas.")),
    seccionSGC("Observaciones", textoAHtmlSGC(accion.observacion)),
    ...(accion.comentarios?.length
      ? [
          seccionSGC(
            "Seguimiento",
            tablaCamposSGC(
              accion.comentarios.map((comentario, index) => [
                `Registro ${index + 1} — ${formatearFechaSGC(comentario.creadoEn || comentario.creado_en)}`,
                `${nombreUsuarioSGC(comentario.usuario, "Sistema")}: ${comentario.comentario || "—"}`,
              ]),
            ),
          ),
        ]
      : []),
  ].join("");

  return {
    nombre: `${tituloAccion(accion.tipo)} ${accion.codigo || ""}`.trim(),
    codigo: accion.codigo || "S/C",
    version: "1.0",
    tipoDocumento: tipoAccionSGC(accion.tipo),
    estado: accion.estado,
    contenidoHtml,
    fechaCreacion: accion.creadoEn || accion.creado_en,
    fechaVigencia: accion.fechaCompromiso,
    elaboradoPor: nombreUsuarioSGC(accion.responsable, "Sistema"),
    revisadoPor: nombreUsuarioSGC(accion.verificador, "Pendiente"),
    aprobadoPor: nombreUsuarioSGC(accion.implementador, "Pendiente"),
  };
}

export function datosSGCDesdeRiesgo(riesgo: Riesgo): DocumentoSGCData {
  const contenidoHtml = [
    seccionSGC(
      "Identificación del riesgo",
      tablaCamposSGC([
        ["Código", riesgo.codigo || "—"],
        ["Nombre", riesgo.nombre || "Sin nombre"],
        ["Proceso", riesgo.proceso?.nombre || "No asociado"],
        ["Categoría", riesgo.categoria || "—"],
        ["Tipo de riesgo", riesgo.tipo_riesgo || "—"],
        ["Estado", (riesgo.estado || "—").replace(/_/g, " ")],
        ["Nivel de riesgo", riesgo.nivel_riesgo || "Sin evaluar"],
        ["Probabilidad", riesgo.probabilidad != null ? String(riesgo.probabilidad) : "—"],
        ["Impacto", riesgo.impacto != null ? String(riesgo.impacto) : "—"],
        ["Nivel residual", riesgo.nivel_residual != null ? String(riesgo.nivel_residual) : "—"],
        ["Fecha de identificación", formatearFechaSGC(riesgo.fecha_identificacion)],
        ["Próxima revisión", formatearFechaSGC(riesgo.fecha_revision)],
        ["Responsable", nombreUsuarioSGC(riesgo.responsable, "Sin asignar")],
      ]),
    ),
    seccionSGC("Descripción", textoAHtmlSGC(riesgo.descripcion, "Sin descripción.")),
    seccionSGC("Causas", textoAHtmlSGC(riesgo.causas)),
    seccionSGC("Consecuencias", textoAHtmlSGC(riesgo.consecuencias)),
    seccionSGC("Plan de tratamiento", textoAHtmlSGC(riesgo.tratamiento, "No se ha definido un plan de tratamiento.")),
  ].join("");

  return {
    nombre: riesgo.nombre || `Tratamiento de riesgo ${riesgo.codigo || ""}`.trim(),
    codigo: riesgo.codigo || "S/C",
    version: "1.0",
    tipoDocumento: "tratamiento_riesgo",
    estado: riesgo.estado,
    contenidoHtml,
    fechaCreacion: riesgo.creado_en,
    fechaVigencia: riesgo.fecha_revision || riesgo.fecha_identificacion,
    elaboradoPor: nombreUsuarioSGC(riesgo.responsable, "Sistema"),
    revisadoPor: "Pendiente",
    aprobadoPor: "Pendiente",
  };
}

function evidenciasNoConformidadAHtml(evidencias?: string | null): string {
  if (!evidencias?.trim()) return textoAHtmlSGC("", "Sin evidencias registradas.");
  try {
    const parsed = JSON.parse(evidencias);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return tablaCamposSGC(
        parsed.map((item: { nombreArchivo?: string; descripcion?: string; url?: string }, index: number) => [
          item.nombreArchivo || item.descripcion || `Evidencia ${index + 1}`,
          item.url || item.descripcion || "—",
        ]),
      );
    }
  } catch {
    // Texto plano legado
  }
  return textoAHtmlSGC(evidencias, "Sin evidencias registradas.");
}

export function datosSGCDesdeNoConformidad(nc: NoConformidad): DocumentoSGCData {
  const contenidoHtml = [
    seccionSGC(
      "Datos de la no conformidad",
      tablaCamposSGC([
        ["Código", nc.codigo || "—"],
        ["Tipo", nc.tipo || "No Conformidad"],
        ["Estado", (nc.estado || "—").replace(/_/g, " ")],
        ["Gravedad", nc.gravedad || "—"],
        ["Fuente", nc.fuente || "—"],
        ["Fecha de detección", formatearFechaSGC(nc.fecha_deteccion)],
        ["Proceso", nc.proceso?.nombre || "No asociado"],
        ["Área", nc.area?.nombre || "—"],
        ["Detectado por", nombreUsuarioSGC(nc.detector, nc.detectado_por || "—")],
        ["Responsable", nombreUsuarioSGC(nc.responsable, "Sin asignar")],
      ]),
    ),
    seccionSGC("Descripción", textoAHtmlSGC(nc.descripcion, "Sin descripción.")),
    seccionSGC("Análisis de causa", textoAHtmlSGC(nc.analisis_causa)),
    seccionSGC("Plan de acción", textoAHtmlSGC(nc.plan_accion)),
    seccionSGC("Evidencias", evidenciasNoConformidadAHtml(nc.evidencias)),
  ].join("");

  return {
    nombre: `No conformidad ${nc.codigo || ""}`.trim(),
    codigo: nc.codigo || "S/C",
    version: "1.0",
    tipoDocumento: "no_conformidad",
    estado: nc.estado,
    contenidoHtml,
    fechaCreacion: nc.creado_en || nc.fecha_deteccion,
    fechaVigencia: nc.fecha_deteccion,
    elaboradoPor: nombreUsuarioSGC(nc.detector, "Sistema"),
    revisadoPor: nombreUsuarioSGC(nc.responsable, "Pendiente"),
    aprobadoPor: "Pendiente",
  };
}

function etiquetaTipoAuditoria(tipo?: string): string {
  const mapa: Record<string, string> = {
    interna: "Interna",
    externa: "Externa",
    certificacion: "Certificación",
    seguimiento: "Seguimiento",
  };
  return mapa[(tipo || "").toLowerCase()] || tipo || "—";
}

function etiquetaTipoHallazgo(tipo?: string): string {
  const mapa: Record<string, string> = {
    no_conformidad_mayor: "No conformidad mayor",
    no_conformidad_menor: "No conformidad menor",
    observacion: "Observación",
    oportunidad_mejora: "Oportunidad de mejora",
  };
  return mapa[(tipo || "").toLowerCase()] || (tipo || "—").replace(/_/g, " ");
}

function hallazgosAuditoriaAHtml(hallazgos: HallazgoAuditoria[] = []): string {
  if (!hallazgos.length) return textoAHtmlSGC("", "Sin hallazgos registrados.");
  return tablaCamposSGC(
    hallazgos.map((hallazgo) => {
      const raw = hallazgo as HallazgoAuditoria & {
        tipo_hallazgo?: string;
        clausula_norma?: string;
      };
      const tipo = raw.tipo || raw.tipo_hallazgo;
      const clausula = raw.clausulaIso || raw.clausula_norma;
      return [
        `${raw.codigo || "S/C"} — ${etiquetaTipoHallazgo(tipo)}`,
        [
          raw.descripcion || "Sin descripción",
          raw.requisito ? `Requisito: ${raw.requisito}` : null,
          clausula ? `Cláusula ISO: ${clausula}` : null,
          raw.gravedad ? `Gravedad: ${raw.gravedad}` : null,
          `Estado: ${(raw.estado || "—").replace(/_/g, " ")}`,
        ]
          .filter(Boolean)
          .join(" · "),
      ];
    }),
  );
}

export function datosSGCDesdeAuditoria(
  auditoria: Auditoria,
  hallazgos: HallazgoAuditoria[] = [],
): DocumentoSGCData {
  const areas =
    auditoria.areasAuditadas?.filter(Boolean).join(", ") || "—";
  const contenidoHtml = [
    seccionSGC(
      "Datos de la auditoría",
      tablaCamposSGC([
        ["Código", auditoria.codigo || "—"],
        ["Nombre", auditoria.nombre || "—"],
        ["Tipo", etiquetaTipoAuditoria(auditoria.tipo)],
        ["Estado", (auditoria.estado || "—").replace(/_/g, " ")],
        ["Norma de referencia", auditoria.normaReferencia || "—"],
        ["Fecha planificada", formatearFechaSGC(auditoria.fechaPlanificada)],
        ["Fecha de inicio", formatearFechaSGC(auditoria.fechaInicio)],
        ["Fecha de finalización", formatearFechaSGC(auditoria.fechaFin)],
        ["Auditor líder", nombreUsuarioSGC(auditoria.auditorLider, "Sin asignar")],
        ["Registrado por", nombreUsuarioSGC(auditoria.creadoPorUsuario, "Sistema de Calidad")],
        ["Áreas auditadas", areas],
      ]),
    ),
    seccionSGC("Objetivo", textoAHtmlSGC(auditoria.objetivo || auditoria.objetivos, "Sin objetivo.")),
    seccionSGC("Alcance", textoAHtmlSGC(auditoria.alcance, "Sin alcance.")),
    seccionSGC("Informe final", textoAHtmlSGC(auditoria.informeFinal, "Sin informe final registrado.")),
    seccionSGC("Hallazgos", hallazgosAuditoriaAHtml(hallazgos)),
  ].join("");

  return {
    nombre: auditoria.nombre || `Auditoría ${auditoria.codigo || ""}`.trim(),
    codigo: auditoria.codigo || "S/C",
    version: "1.0",
    tipoDocumento: "auditoria",
    estado: auditoria.estado,
    contenidoHtml,
    fechaCreacion: auditoria.creadoEn,
    fechaVigencia: auditoria.fechaFin || auditoria.fechaPlanificada,
    elaboradoPor: nombreUsuarioSGC(auditoria.auditorLider, "Sistema"),
    revisadoPor: nombreUsuarioSGC(auditoria.creadoPorUsuario, "Pendiente"),
    aprobadoPor: "Pendiente",
  };
}

export function datosSGCDesdeHallazgo(
  hallazgo: Partial<HallazgoAuditoria> & { id: string },
  auditoria?: { codigo?: string; nombre?: string } | null,
): DocumentoSGCData {
  const raw = hallazgo as Partial<HallazgoAuditoria> & {
    id: string;
    tipo_hallazgo?: string;
    clausula_norma?: string;
  };
  const tipo = raw.tipo || raw.tipo_hallazgo;
  const clausula = raw.clausulaIso || raw.clausula_norma;
  const contenidoHtml = [
    seccionSGC(
      "Datos del hallazgo",
      tablaCamposSGC([
        ["Código", raw.codigo || "—"],
        ["Tipo", etiquetaTipoHallazgo(tipo)],
        ["Estado", (raw.estado || "—").replace(/_/g, " ")],
        ["Gravedad", raw.gravedad || "—"],
        ["Cláusula ISO", clausula || "—"],
        ["Requisito", raw.requisito || "—"],
        ["Auditoría", auditoria?.codigo || raw.auditoria?.codigo || "—"],
        ["Nombre de la auditoría", auditoria?.nombre || raw.auditoria?.nombre || "—"],
        ["Fecha de registro", formatearFechaSGC(raw.creadoEn)],
        ["Responsable", nombreUsuarioSGC(raw.responsable, "Sin asignar")],
      ]),
    ),
    seccionSGC("Descripción", textoAHtmlSGC(raw.descripcion, "Sin descripción.")),
    seccionSGC("Evidencia", textoAHtmlSGC(raw.evidencia, "Sin evidencia registrada.")),
  ].join("");

  return {
    nombre: `Hallazgo ${raw.codigo || ""}`.trim() || "Hallazgo de auditoría",
    codigo: raw.codigo || auditoria?.codigo || "S/C",
    version: "1.0",
    tipoDocumento: "hallazgo",
    estado: raw.estado,
    contenidoHtml,
    fechaCreacion: raw.creadoEn,
    elaboradoPor: nombreUsuarioSGC(raw.responsable, "Sistema"),
    revisadoPor: "Pendiente",
    aprobadoPor: "Pendiente",
  };
}

export interface ControlRiesgoSGC {
  id: string;
  riesgo_id: string;
  descripcion?: string;
  tipo_control?: string;
  frecuencia?: string;
  efectividad?: string;
  activo?: boolean;
  creado_en: string;
}

export function datosSGCDesdeControlRiesgo(
  control: ControlRiesgoSGC,
  riesgo?: { codigo?: string; nombre?: string; descripcion?: string } | null,
): DocumentoSGCData {
  const contenidoHtml = [
    seccionSGC(
      "Datos del control",
      tablaCamposSGC([
        ["Riesgo asociado", riesgo?.codigo || "—"],
        ["Nombre del riesgo", riesgo?.nombre || "Sin nombre"],
        ["Tipo de control", control.tipo_control || "—"],
        ["Frecuencia", control.frecuencia || "—"],
        ["Efectividad", control.efectividad || "—"],
        ["Estado", control.activo === false ? "Inactivo" : "Activo"],
        ["Fecha de registro", formatearFechaSGC(control.creado_en)],
      ]),
    ),
    seccionSGC("Descripción del control", textoAHtmlSGC(control.descripcion, "Sin descripción.")),
    seccionSGC("Descripción del riesgo", textoAHtmlSGC(riesgo?.descripcion, "Sin descripción del riesgo.")),
  ].join("");

  return {
    nombre: control.descripcion?.slice(0, 80) || `Control ${riesgo?.codigo || ""}`.trim(),
    codigo: riesgo?.codigo || "S/C",
    version: "1.0",
    tipoDocumento: "control_riesgo",
    estado: control.activo === false ? "inactivo" : "activo",
    contenidoHtml,
    fechaCreacion: control.creado_en,
    elaboradoPor: "Sistema",
    revisadoPor: "Pendiente",
    aprobadoPor: "Pendiente",
  };
}

function seguimientosObjetivoAHtml(seguimientos: SeguimientoObjetivo[] = [], valorMeta?: number): string {
  if (!seguimientos.length) return textoAHtmlSGC("", "Sin seguimientos registrados.");
  return tablaCamposSGC(
    seguimientos.map((seg, index) => {
      const raw = seg as SeguimientoObjetivo & {
        valor_actual?: number;
        fecha_seguimiento?: string;
        porcentaje_cumplimiento?: number;
      };
      const valorActual = raw.valorActual ?? raw.valor_actual;
      const porcentaje =
        typeof raw.porcentajeCumplimiento === "number"
          ? raw.porcentajeCumplimiento
          : typeof raw.porcentaje_cumplimiento === "number"
            ? raw.porcentaje_cumplimiento
            : valorMeta && valorActual != null
              ? (Number(valorActual) / Number(valorMeta)) * 100
              : null;
      return [
        `Seguimiento ${index + 1} — ${formatearFechaSGC(raw.creadoEn || raw.fecha_seguimiento || raw.periodo)}`,
        [
          valorActual != null ? `Valor: ${valorActual}` : null,
          porcentaje != null && Number.isFinite(porcentaje) ? `Cumplimiento: ${porcentaje.toFixed(1)}%` : null,
          raw.observaciones || null,
        ]
          .filter(Boolean)
          .join(" · ") || "—",
      ];
    }),
  );
}

export function datosSGCDesdeObjetivoCalidad(
  objetivo: ObjetivoCalidad,
  seguimientos: SeguimientoObjetivo[] = [],
): DocumentoSGCData {
  const contenidoHtml = [
    seccionSGC(
      "Datos del objetivo",
      tablaCamposSGC([
        ["Código", objetivo.codigo || "—"],
        ["Estado", (objetivo.estado || "—").replace(/_/g, " ")],
        ["Área", objetivo.area?.nombre || "Sin área asignada"],
        ["Proceso", objetivo.proceso?.nombre || "—"],
        ["Responsable", nombreUsuarioSGC(objetivo.responsable, "Sin asignar")],
        ["Indicador", objetivo.indicador?.nombre || objetivo.indicadorId || "—"],
        ["Valor meta", objetivo.valorMeta != null ? String(objetivo.valorMeta) : "—"],
        ["Periodo de inicio", formatearFechaSGC(objetivo.periodoInicio)],
        ["Periodo de fin", formatearFechaSGC(objetivo.periodoFin)],
      ]),
    ),
    seccionSGC("Descripción", textoAHtmlSGC(objetivo.descripcion, "Sin descripción.")),
    seccionSGC("Meta", textoAHtmlSGC(objetivo.meta, "Sin meta definida.")),
    seccionSGC("Seguimientos", seguimientosObjetivoAHtml(seguimientos, objetivo.valorMeta)),
  ].join("");

  return {
    nombre: `Objetivo de calidad ${objetivo.codigo || ""}`.trim(),
    codigo: objetivo.codigo || "S/C",
    version: "1.0",
    tipoDocumento: "objetivo_calidad",
    estado: objetivo.estado,
    contenidoHtml,
    fechaCreacion: objetivo.creadoEn,
    fechaVigencia: objetivo.periodoFin,
    elaboradoPor: nombreUsuarioSGC(objetivo.responsable, "Sistema"),
    revisadoPor: "Pendiente",
    aprobadoPor: "Pendiente",
  };
}

function etiquetaEstadoCapacitacion(estado?: string): string {
  const mapa: Record<string, string> = {
    programada: "Programada",
    en_curso: "En curso",
    completada: "Completada",
    cancelada: "Cancelada",
  };
  return mapa[(estado || "").toLowerCase()] || (estado || "—").replace(/_/g, " ");
}

function asistenciasCapacitacionAHtml(asistencias: AsistenciaCapacitacion[] = []): string {
  if (!asistencias.length) return textoAHtmlSGC("", "Sin registros de asistencia.");
  return tablaCamposSGC(
    asistencias.map((asistencia) => [
      nombreUsuarioSGC(asistencia.usuario, "Participante"),
      [
        asistencia.asistio ? "Asistió" : "No asistió",
        asistencia.evaluacionAprobada ? "Evaluación aprobada" : "Evaluación pendiente",
        asistencia.calificacion != null ? `Calificación: ${asistencia.calificacion}` : null,
        asistencia.observaciones || null,
      ]
        .filter(Boolean)
        .join(" · "),
    ]),
  );
}

export function datosSGCDesdeCapacitacion(
  capacitacion: Capacitacion,
  extras?: {
    resumen?: ResumenAsistenciaCapacitacion | null;
    asistencias?: AsistenciaCapacitacion[];
  },
): DocumentoSGCData {
  const resumen = extras?.resumen;
  const asistencias = extras?.asistencias || [];
  const contenidoHtml = [
    seccionSGC(
      "Datos de la capacitación",
      tablaCamposSGC([
        ["Código", capacitacion.codigo || "—"],
        ["Nombre", capacitacion.nombre || "—"],
        ["Tipo", capacitacion.tipoCapacitacion || "—"],
        ["Modalidad", capacitacion.modalidad || "—"],
        ["Estado", etiquetaEstadoCapacitacion(capacitacion.estado)],
        ["Fecha programada", formatearFechaSGC(capacitacion.fechaProgramada)],
        ["Fecha de inicio", formatearFechaSGC(capacitacion.fechaInicio)],
        ["Fecha de fin", formatearFechaSGC(capacitacion.fechaFin)],
        ["Duración", capacitacion.duracionHoras != null ? `${capacitacion.duracionHoras} horas` : "—"],
        ["Lugar / plataforma", capacitacion.lugar || "—"],
        ["Instructor", capacitacion.instructor || "—"],
        ["Cobertura", capacitacion.aplicaTodasAreas ? "Todas las áreas" : "Área específica"],
        ["Responsable", nombreUsuarioSGC(capacitacion.responsable, "Sin asignar")],
      ]),
    ),
    seccionSGC("Objetivo", textoAHtmlSGC(capacitacion.objetivo, "Sin objetivo.")),
    seccionSGC("Descripción", textoAHtmlSGC(capacitacion.descripcion, "Sin descripción.")),
    seccionSGC("Contenido", textoAHtmlSGC(capacitacion.contenido)),
    ...(resumen
      ? [
          seccionSGC(
            "Resumen de asistencia",
            tablaCamposSGC([
              ["Participantes", String(resumen.total_participantes ?? 0)],
              ["Asistieron", String(resumen.asistieron ?? 0)],
              ["No asistieron", String(resumen.no_asistieron ?? 0)],
              ["Porcentaje de asistencia", `${Number(resumen.porcentaje_asistencia || 0).toFixed(1)}%`],
              ["Evaluados", String(resumen.evaluados ?? 0)],
              ["Evaluación aprobada", String(resumen.evaluacion_aprobada ?? 0)],
              ["Porcentaje de aprobación", `${Number(resumen.porcentaje_aprobacion || 0).toFixed(1)}%`],
            ]),
          ),
        ]
      : []),
    seccionSGC("Registro de asistencia", asistenciasCapacitacionAHtml(asistencias)),
  ].join("");

  return {
    nombre: capacitacion.nombre || `Capacitación ${capacitacion.codigo || ""}`.trim(),
    codigo: capacitacion.codigo || "S/C",
    version: "1.0",
    tipoDocumento: extras?.resumen ? "asistencia_capacitacion" : "capacitacion",
    estado: capacitacion.estado,
    contenidoHtml,
    fechaCreacion: capacitacion.creadoEn,
    fechaVigencia: capacitacion.fechaProgramada || capacitacion.fechaFin,
    elaboradoPor: capacitacion.instructor || nombreUsuarioSGC(capacitacion.responsable, "Sistema"),
    revisadoPor: "Pendiente",
    aprobadoPor: "Pendiente",
  };
}
