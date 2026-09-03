import { jsPDF } from "jspdf";
import { configuracionService } from "@/services/configuracion.service";

export interface MarcaSGC {
  logoUrl: string | null;
  titulo: string;
  subtitulo: string;
}

export interface UsuarioSGC {
  nombre?: string;
  segundoNombre?: string;
  segundo_nombre?: string;
  primerApellido?: string;
  primer_apellido?: string;
  segundoApellido?: string;
  segundo_apellido?: string;
}

export interface VersionSGC {
  version?: string;
  descripcion_cambios?: string;
  creado_en?: string;
}

export interface DocumentoSGCData {
  nombre: string;
  codigo: string;
  version: string;
  tipoDocumento: string;
  estado?: string;
  contenidoHtml?: string;
  fechaVigencia?: string;
  fechaAprobacion?: string;
  fechaCreacion?: string;
  fechaElaboracion?: string;
  fechaRevision?: string;
  elaboradoPor?: string;
  revisadoPor?: string;
  aprobadoPor?: string;
  versiones?: VersionSGC[];
  ocultarFirmas?: boolean;
}

const TIPOS: Record<string, string> = {
  formato: "FORMATO",
  proceso: "PROCESO",
  procedimiento: "PROCEDIMIENTO",
  instructivo: "INSTRUCTIVO",
  manual: "MANUAL",
  politica: "POLÍTICA",
  registro: "REGISTRO",
  plan: "PLAN",
  caracterizacion: "CARACTERIZACIÓN",
  guia: "GUÍA",
  accion_correctiva: "ACCIÓN CORRECTIVA",
  accion_preventiva: "ACCIÓN PREVENTIVA",
  accion_mejora: "ACCIÓN DE MEJORA",
  tratamiento_riesgo: "TRATAMIENTO DE RIESGO",
  no_conformidad: "NO CONFORMIDAD",
  auditoria: "AUDITORÍA",
  control_riesgo: "CONTROL DE RIESGO",
  objetivo_calidad: "OBJETIVO DE CALIDAD",
  capacitacion: "CAPACITACIÓN",
  asistencia_capacitacion: "ASISTENCIA A CAPACITACIÓN",
  hallazgo: "HALLAZGO DE AUDITORÍA",
  competencia: "COMPETENCIA",
  area: "ÁREA",
  asignacion_responsable: "ASIGNACIÓN DE RESPONSABLE",
  usuario: "USUARIO",
  rol: "ROL Y PERMISOS",
  indicador: "INDICADOR",
  indicador_eficacia: "INDICADOR DE EFICACIA",
  indicador_eficiencia: "INDICADOR DE EFICIENCIA",
  indicador_cumplimiento: "INDICADOR DE CUMPLIMIENTO",
  ticket: "TICKET",
  solicitud_documento: "SOLICITUD DE DOCUMENTO",
};

export function etiquetaTipoDocumento(tipo?: string): string {
  if (!tipo) return "DOCUMENTO";
  return TIPOS[tipo.toLowerCase()] || tipo.replace(/_/g, " ").toUpperCase();
}

const ESTADOS: Record<string, string> = {
  borrador: "borrador",
  en_revision: "en revisión",
  pendiente_aprobacion: "pendiente de aprobación",
  aprobado: "aprobado",
  obsoleto: "obsoleto",
  pendiente: "pendiente",
  en_proceso: "en proceso",
  en_ejecucion: "en ejecución",
  implementada: "implementada",
  verificada: "verificada",
  cerrada: "cerrada",
  abierta: "abierta",
  en_tratamiento: "en tratamiento",
  identificado: "identificado",
  mitigado: "mitigado",
  aceptado: "aceptado",
  planificada: "planificada",
  en_curso: "en curso",
  completada: "completada",
  cancelada: "cancelada",
  programada: "programada",
  cumplido: "cumplido",
  no_cumplido: "no cumplido",
  cancelado: "cancelado",
  planificado: "planificado",
  activo: "activo",
  inactivo: "inactivo",
  revision: "en revisión",
  suspendido: "suspendido",
  reforzada: "reforzada",
  desarrollada: "desarrollada",
  "en desarrollo": "en desarrollo",
  asignado: "asignado",
  rechazado: "rechazado",
  abierto: "abierto",
  en_progreso: "en progreso",
  resuelto: "resuelto",
  cerrado: "cerrado",
  declinado: "declinado",
};

export function etiquetaEstadoDocumento(estado?: string): string {
  if (!estado) return "sin estado";
  return ESTADOS[estado.toLowerCase()] || estado.replace(/_/g, " ");
}

export function logoSGCPorDefecto(): string {
  if (typeof window === "undefined") return "/logo-iudc.svg";
  return `${window.location.origin}/logo-iudc.svg`;
}

export function nombreUsuarioSGC(
  usuario?: UsuarioSGC | null,
  fallback = "Pendiente",
): string {
  if (!usuario) return fallback;
  const partes = [
    usuario.nombre,
    usuario.segundoNombre || usuario.segundo_nombre,
    usuario.primerApellido || usuario.primer_apellido,
    usuario.segundoApellido || usuario.segundo_apellido,
  ].filter(Boolean);
  return partes.length ? partes.join(" ") : fallback;
}

export function esContenidoHtml(valor?: string | null): boolean {
  if (!valor) return false;
  const texto = valor.trim();
  if (!texto.startsWith("<")) return false;
  return /<(p|div|h[1-6]|table|ul|ol|span|br|img)\b/i.test(texto);
}

export function formatearFechaSGC(fecha?: string | null): string {
  if (!fecha) return "—";
  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) return fecha;
  return parsed.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function limpiarVineta(linea: string): string {
  return linea.replace(/^\s*(?:[-•●▪◦*]|\d+[.)])\s+/, "").trim();
}

function esEtiquetaSeccion(linea: string): boolean {
  return /^.{2,48}:$/.test(linea.trim());
}

function listaOParrafoHtml(lineas: string[]): string {
  if (lineas.length === 1) return `<p>${escapeHtml(lineas[0])}</p>`;
  return `<ul>${lineas.map((linea) => `<li>${escapeHtml(limpiarVineta(linea))}</li>`).join("")}</ul>`;
}

export function textoAHtmlSGC(texto?: string | null, vacio = "No registrado."): string {
  if (!texto?.trim()) return `<p class="sgc-empty">${escapeHtml(vacio)}</p>`;
  if (esContenidoHtml(texto)) return texto;

  const bloques = texto.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  return bloques
    .map((bloque) => {
      const lineas = bloque.split("\n").map((linea) => linea.trim()).filter(Boolean);
      if (lineas.length <= 1) {
        return lineas[0] ? `<p>${escapeHtml(lineas[0])}</p>` : "";
      }

      const partes: string[] = [];
      let items: string[] = [];
      const vaciar = () => {
        if (items.length) partes.push(listaOParrafoHtml(items));
        items = [];
      };

      for (const linea of lineas) {
        if (esEtiquetaSeccion(linea)) {
          vaciar();
          partes.push(`<h3>${escapeHtml(linea.replace(/:$/, ""))}</h3>`);
        } else {
          items.push(linea);
        }
      }
      vaciar();
      return partes.join("");
    })
    .join("");
}

export function tablaCamposSGC(filas: Array<[string, string]>): string {
  const cuerpo = filas
    .map(
      ([etiqueta, valor]) => `
        <tr>
          <th style="width:34%;text-align:left">${escapeHtml(etiqueta)}</th>
          <td>${escapeHtml(valor || "—")}</td>
        </tr>`,
    )
    .join("");

  return `<table class="sgc-grid"><tbody>${cuerpo}</tbody></table>`;
}

export function seccionSGC(titulo: string, html: string): string {
  return `<h2>${escapeHtml(titulo)}</h2>${html}`;
}

export function datosSGCDesdeDocumento(doc: {
  nombre: string;
  codigo: string;
  version_actual?: string;
  tipo_documento: string;
  estado?: string;
  descripcion?: string;
  creado_en?: string;
  actualizado_en?: string;
  fecha_aprobacion?: string;
  fecha_vigencia?: string;
  creador?: UsuarioSGC | null;
  revisor?: UsuarioSGC | null;
  aprobador?: UsuarioSGC | null;
  versiones?: VersionSGC[];
}): DocumentoSGCData {
  return {
    nombre: doc.nombre,
    codigo: doc.codigo,
    version: doc.version_actual || "1.0",
    tipoDocumento: doc.tipo_documento,
    estado: doc.estado,
    contenidoHtml: doc.descripcion,
    fechaCreacion: doc.creado_en,
    fechaAprobacion: doc.fecha_aprobacion || (doc.estado === "aprobado" ? doc.actualizado_en : undefined),
    fechaVigencia: doc.fecha_vigencia,
    elaboradoPor: nombreUsuarioSGC(doc.creador, "Sistema"),
    revisadoPor: nombreUsuarioSGC(doc.revisor, "Pendiente"),
    aprobadoPor: nombreUsuarioSGC(doc.aprobador, "Pendiente"),
    versiones: doc.versiones,
  };
}

export async function cargarMarcaSGC(): Promise<MarcaSGC> {
  try {
    const configs = await configuracionService.list({ categoria: "sistema", limit: 500 });
    const byKey = new Map(configs.map((cfg) => [cfg.clave, cfg.valor]));
    return {
      logoUrl: byKey.get("logo_universidad") || logoSGCPorDefecto(),
      titulo: byKey.get("sistema_titulo") || "Universitaria de Colombia",
      subtitulo: byKey.get("sistema_subtitulo") || "Sistema de Gestión de Calidad",
    };
  } catch {
    return {
      logoUrl: logoSGCPorDefecto(),
      titulo: "Universitaria de Colombia",
      subtitulo: "Sistema de Gestión de Calidad",
    };
  }
}

export function estilosDocumentoSGC(): string {
  return `
    @page { size: letter; margin: 16mm 16mm 18mm 16mm; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: #111;
      background: #fff;
    }
    .sgc-doc { width: 100%; }
    .sgc-letterhead {
      width: 100%;
      border-bottom: 2px solid #1E3A8A;
      padding-bottom: 12px;
      margin-bottom: 20px;
      border-collapse: collapse;
    }
    .sgc-letterhead td { border: none; padding: 0; vertical-align: middle; }
    .sgc-brand { text-align: right; }
    .sgc-brand-title {
      font-size: 13px;
      font-weight: 700;
      color: #1E3A8A;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .sgc-brand-sub { font-size: 10px; color: #4B5563; margin-top: 2px; }
    .sgc-logo img {
      max-width: 220px;
      max-height: 78px;
      object-fit: contain;
      object-position: left center;
    }
    .sgc-logo-fallback {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 22px;
      font-weight: 700;
      line-height: 1.1;
      color: #111;
    }
    .sgc-logo-fallback span { color: #C8102E; }
    .sgc-title {
      margin: 0 0 22px;
      text-align: center;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #111;
    }
    .sgc-intro {
      margin: 0 0 18px;
      font-size: 12px;
      line-height: 1.55;
      text-align: justify;
    }
    .sgc-content {
      min-height: 240px;
      font-size: 12px;
      line-height: 1.7;
      text-align: justify;
    }
    .sgc-content > *:first-child { margin-top: 0; }
    .sgc-content h1,
    .sgc-content h2,
    .sgc-content h3,
    .sgc-content h4,
    .sgc-content h5,
    .sgc-content h6 {
      display: block;
      color: #111;
      text-align: left;
      font-weight: 700;
      line-height: 1.35;
    }
    .sgc-content h1 { font-size: 16px; margin: 1.4em 0 0.65em; }
    .sgc-content h2 { font-size: 13px; margin: 1.45em 0 0.55em; }
    .sgc-content h3,
    .sgc-content h4 { font-size: 12px; margin: 1.25em 0 0.45em; }
    .sgc-content p { display: block; margin: 0 0 0.9em; text-align: justify; }
    .sgc-content p:has(> strong:only-child),
    .sgc-content p:has(> b:only-child) {
      margin-top: 1.25em;
      margin-bottom: 0.45em;
      font-size: 13px;
      text-align: left;
    }
    .sgc-content ul,
    .sgc-content ol {
      display: block;
      margin: 0.55em 0 1.1em;
      padding-left: 1.6em;
      text-align: left;
    }
    .sgc-content ul { list-style-type: disc; list-style-position: outside; }
    .sgc-content ol { list-style-type: decimal; list-style-position: outside; }
    .sgc-content li {
      display: list-item;
      margin: 0.4em 0;
      line-height: 1.65;
    }
    .sgc-content li p { margin: 0 0 0.25em; text-align: left; }
    .sgc-content br { display: block; content: ""; margin-bottom: 0.45em; }
    .sgc-content img { max-width: 100%; height: auto; margin: 0.8em 0; }
    .sgc-content table,
    .sgc-grid {
      border-collapse: collapse;
      width: 100%;
      margin: 14px 0 18px;
      font-size: 11px;
    }
    .sgc-content th,
    .sgc-content td,
    .sgc-grid th,
    .sgc-grid td {
      border: 1px solid #111;
      padding: 6px 8px;
      text-align: left;
      vertical-align: middle;
    }
    .sgc-content th,
    .sgc-grid th {
      background: #6B6B6B;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      text-align: center;
    }
    .sgc-grid td.center,
    .sgc-content td.center { text-align: center; }
    .sgc-grid .sgc-subtotal td {
      background: #E5E5E5;
      font-weight: 700;
    }
    .sgc-grid .sgc-total td {
      background: #D4D4D4;
      font-weight: 700;
      font-size: 12px;
    }
    .sgc-section {
      margin-top: 22px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .sgc-note {
      margin: 22px 0 0;
      font-size: 11px;
      line-height: 1.5;
      text-align: justify;
    }
    .sgc-signs {
      width: 100%;
      margin-top: 36px;
      border-collapse: collapse;
    }
    .sgc-signs td {
      width: 33.33%;
      text-align: center;
      vertical-align: top;
      padding: 0 12px;
      font-size: 11px;
    }
    .sgc-signs .line {
      display: block;
      margin: 42px auto 8px;
      width: 85%;
      border-top: 1px solid #111;
    }
    .sgc-signs .role {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.6px;
      text-transform: uppercase;
    }
    .sgc-signs .date {
      font-size: 9px;
      color: #555;
      margin: 2px 0 4px;
    }
    .sgc-empty { color: #666; font-style: italic; text-align: left; }
    .sgc-grid, .sgc-signs, .sgc-note { break-inside: avoid; page-break-inside: avoid; }
    .sgc-content h2, .sgc-content h3 { break-after: avoid; page-break-after: avoid; }
    .sgc-signs { margin-top: 28px; }
  `;
}

function logoHtml(marca: MarcaSGC): string {
  if (marca.logoUrl) {
    return `<img src="${escapeHtml(marca.logoUrl)}" alt="${escapeHtml(marca.titulo)}" />`;
  }
  return `<div class="sgc-logo-fallback">U ${escapeHtml(marca.titulo)}<br /><span>${escapeHtml(marca.subtitulo)}</span></div>`;
}

export function parrafoIntroSGC(data: DocumentoSGCData, marca: MarcaSGC): string {
  const vigencia = formatearFechaSGC(
    data.fechaVigencia || data.fechaAprobacion || data.fechaCreacion,
  );
  const tipo = etiquetaTipoDocumento(data.tipoDocumento).toLowerCase();
  const estado = etiquetaEstadoDocumento(data.estado);
  const encabezado = `La <strong>${escapeHtml(marca.titulo)}</strong>, ${escapeHtml(marca.subtitulo)}, hace constar que el presente ${escapeHtml(tipo)} denominado <strong>${escapeHtml(data.nombre || "Documento sin título")}</strong>, identificado con código <strong>${escapeHtml(data.codigo || "S/C")}</strong> versión <strong>${escapeHtml(data.version || "1.0")}</strong>, se encuentra en estado <strong>${escapeHtml(estado)}</strong>`;

  if (data.ocultarFirmas) {
    return `${encabezado}, con vigencia a partir del <strong>${escapeHtml(vigencia)}</strong>.`;
  }

  return `${encabezado}. Fue elaborado por <strong>${escapeHtml(data.elaboradoPor || "Pendiente")}</strong>, revisado por <strong>${escapeHtml(data.revisadoPor || "Pendiente")}</strong> y aprobado por <strong>${escapeHtml(data.aprobadoPor || "Pendiente")}</strong>, con vigencia a partir del <strong>${escapeHtml(vigencia)}</strong>.`;
}

function encabezadoHtml(data: DocumentoSGCData, marca: MarcaSGC): string {
  return `
    <table class="sgc-letterhead">
      <tr>
        <td class="sgc-logo">${logoHtml(marca)}</td>
        <td class="sgc-brand">
          <div class="sgc-brand-title">${escapeHtml(marca.titulo)}</div>
          <div class="sgc-brand-sub">${escapeHtml(marca.subtitulo)}</div>
        </td>
      </tr>
    </table>
    <h1 class="sgc-title">${escapeHtml(data.nombre || etiquetaTipoDocumento(data.tipoDocumento))}</h1>
  `;
}

function identificacionHtml(data: DocumentoSGCData): string {
  return `
    <table class="sgc-grid">
      <thead>
        <tr>
          <th>Código</th>
          <th>Tipo</th>
          <th>Versión</th>
          <th>Estado</th>
          <th>Vigencia</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="center">${escapeHtml(data.codigo || "—")}</td>
          <td>${escapeHtml(etiquetaTipoDocumento(data.tipoDocumento))}</td>
          <td class="center">${escapeHtml(data.version || "1.0")}</td>
          <td class="center">${escapeHtml(etiquetaEstadoDocumento(data.estado).toUpperCase())}</td>
          <td class="center">${escapeHtml(formatearFechaSGC(data.fechaVigencia || data.fechaAprobacion || data.fechaCreacion))}</td>
        </tr>
        <tr class="sgc-total">
          <td colspan="3">DOCUMENTO CONTROLADO DEL SGC</td>
          <td class="center" colspan="2">${escapeHtml((data.estado || "borrador").toUpperCase())}</td>
        </tr>
      </tbody>
    </table>
  `;
}

function pieHtml(data: DocumentoSGCData): string {
  const nota = `
    <p class="sgc-note">
      El presente documento se emite sin enmendaduras ni tachones. La versión vigente es la publicada
      en el Sistema de Gestión de Calidad. Cualquier copia impresa se considera no controlada.
    </p>
  `;

  if (data.ocultarFirmas) {
    return nota;
  }

  const firma = (nombre: string | undefined, rol: string, fecha?: string) => {
    const etiqueta = nombre || "Pendiente";
    const fechaHtml =
      etiqueta !== "Pendiente" && fecha
        ? `<div class="date">${escapeHtml(formatearFechaSGC(fecha))}</div>`
        : "";
    return `
        <td>
          <span class="line"></span>
          <strong>${escapeHtml(etiqueta)}</strong>
          ${fechaHtml}
          <div class="role">${rol}</div>
        </td>`;
  };

  return `
    ${nota}
    <table class="sgc-signs">
      <tr>
        ${firma(data.elaboradoPor, "Elaboró", data.fechaElaboracion || data.fechaCreacion)}
        ${firma(data.revisadoPor, "Revisó", data.fechaRevision)}
        ${firma(data.aprobadoPor, "Aprobó", data.fechaAprobacion)}
      </tr>
    </table>
  `;
}

function controlCambiosHtml(versiones?: VersionSGC[]): string {
  if (!versiones?.length) return "";
  const filas = versiones
    .map(
      (v) => `
      <tr>
        <td class="center">${escapeHtml(v.version || "—")}</td>
        <td>${escapeHtml(v.descripcion_cambios || "Sin descripción")}</td>
        <td class="center">${escapeHtml(formatearFechaSGC(v.creado_en))}</td>
      </tr>`,
    )
    .join("");

  return `
    <div class="sgc-section">Control de cambios</div>
    <table class="sgc-grid">
      <thead>
        <tr>
          <th style="width:16%">Versión</th>
          <th>Descripción del cambio</th>
          <th style="width:20%">Fecha</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
  `;
}

export function generarHtmlDocumentoSGC(data: DocumentoSGCData, marca: MarcaSGC): string {
  const contenido = data.contenidoHtml?.trim()
    ? data.contenidoHtml
    : `<p class="sgc-empty">Este documento no tiene contenido.</p>`;
  const intro = parrafoIntroSGC(data, marca);

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(data.codigo)} — ${escapeHtml(data.nombre)}</title>
    <style>${estilosDocumentoSGC()}</style>
  </head>
  <body>
    <div class="sgc-doc">
      ${encabezadoHtml(data, marca)}
      <p class="sgc-intro">${intro}</p>
      ${identificacionHtml(data)}
      <div class="sgc-content">
        ${contenido}
        ${controlCambiosHtml(data.versiones)}
      </div>
      ${pieHtml(data)}
    </div>
  </body>
</html>`;
}

function esperarImagenes(doc: Document): Promise<void[]> {
  return Promise.all(
    Array.from(doc.images).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }),
    ),
  );
}

function nombreArchivoSGC(data: DocumentoSGCData): string {
  const crudo = `${data.codigo || "documento"} — ${data.nombre || "SGC"}`.replace(/[\\/:*?"<>|]/g, "-");
  return `${crudo}.pdf`;
}

async function imprimirHtmlSGC(html: string): Promise<void> {
  const printWindow = window.open("", "_blank", "height=900,width=900");
  if (!printWindow) {
    throw new Error("El navegador bloqueó la ventana de impresión");
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  await esperarImagenes(printWindow.document);
  printWindow.focus();
  printWindow.print();
}

export async function exportarDocumentoSGC(
  data: DocumentoSGCData,
  marca?: MarcaSGC,
): Promise<void> {
  const branding = marca || (await cargarMarcaSGC());
  const html = generarHtmlDocumentoSGC(data, branding);
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  Object.assign(iframe.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "816px",
    height: "1056px",
    border: "0",
  });
  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) throw new Error("No se pudo preparar el documento");
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
    await esperarImagenes(iframeDoc);
    iframe.style.height = `${Math.max(iframeDoc.documentElement.scrollHeight, 1056)}px`;
    await new Promise((resolve) => window.setTimeout(resolve, 200));

    const pdf = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait", compress: true });
    await pdf.html(iframeDoc.body, {
      autoPaging: "text",
      width: 532,
      windowWidth: 816,
      x: 0,
      y: 0,
      margin: [28, 36, 48, 36],
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      },
    });

    const total = pdf.getNumberOfPages();
    for (let i = 1; i <= total; i += 1) {
      pdf.setPage(i);
      const ancho = pdf.internal.pageSize.getWidth();
      const alto = pdf.internal.pageSize.getHeight();
      pdf.setDrawColor(180);
      pdf.line(36, alto - 32, ancho - 36, alto - 32);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(90);
      pdf.text(
        `${data.codigo || "S/C"}  ·  Ver. ${data.version || "1.0"}  ·  Documento controlado SGC`,
        36,
        alto - 18,
      );
      pdf.text(`${i} / ${total}`, ancho - 36, alto - 18, { align: "right" });
    }

    pdf.save(nombreArchivoSGC(data));
  } catch (error) {
    console.error("No se pudo generar el PDF institucional, se abre impresión", error);
    await imprimirHtmlSGC(html);
  } finally {
    iframe.remove();
  }
}
