import type { AccionCorrectiva } from "@/services/accionCorrectiva.service";
import type { Auditoria, HallazgoAuditoria } from "@/services/auditoria.service";
import type { NoConformidad } from "@/services/noConformidad.service";
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
