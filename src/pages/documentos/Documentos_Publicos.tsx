import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Search, Download, Printer, Eye, Filter, Send, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { matchesTextSearch, SEARCH_ANY_PLACEHOLDER } from "@/utils/textSearch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { documentoService, type DocumentoResponse } from "@/services/documento.service";
import { datosSGCDesdeDocumento, esContenidoHtml, exportarDocumentoSGC } from "@/utils/documentoSGC";
import { areaService, type Area } from "@/services/area.service";
import ticketService, { type Ticket } from "@/services/ticket.service";
import { uploadService } from "@/services/upload.service";
import { getCurrentUser } from "@/services/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { sameId } from "@/lib/permissions";

type SolicitudForm = {
  areaId: string;
  descripcion: string;
  archivo: File | null;
};

type DecisionAction = "aprobar" | "declinar";

function nombreUsuario(u?: { nombre?: string; segundo_nombre?: string; primer_apellido?: string; segundo_apellido?: string } | null) {
  if (!u) return "—";
  return `${u.nombre || ""} ${u.segundo_nombre || ""} ${u.primer_apellido || ""} ${u.segundo_apellido || ""}`.replace(/\s+/g, " ").trim() || "—";
}

function etiquetaEstadoSolicitud(estado: string) {
  const map: Record<string, string> = {
    abierto: "Abierta",
    en_progreso: "En revisión",
    resuelto: "Resuelta",
    cerrado: "Cerrada",
    aprobado: "Aprobada",
    declinado: "Declinada",
  };
  return map[estado] || estado;
}

export default function DocumentosPublicos() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [documentos, setDocumentos] = useState<DocumentoResponse[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("");
  const [sending, setSending] = useState(false);
  const [resolviendoDecision, setResolviendoDecision] = useState(false);
  const [selectedDocumento, setSelectedDocumento] = useState<DocumentoResponse | null>(null);
  const [decisionTicketId, setDecisionTicketId] = useState<string | null>(null);
  const [decisionAccion, setDecisionAccion] = useState<DecisionAction>("aprobar");
  const [decisionComentario, setDecisionComentario] = useState("");
  const [solicitudForm, setSolicitudForm] = useState<SolicitudForm>({
    areaId: "",
    descripcion: "",
    archivo: null,
  });

  useEffect(() => {
    void cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const docsPromise = documentoService.getAll({ estado: "aprobado" }).catch((error) => {
        console.error("Error al cargar documentos publicos:", error);
        toast.error("No se pudieron cargar los documentos públicos");
        return [] as DocumentoResponse[];
      });
      const areasPromise = areaService.getAll().catch((error) => {
        console.error("Error al cargar áreas:", error);
        return [] as Area[];
      });
      const ticketsPromise = ticketService.getAll().catch((error) => {
        console.error("Error al cargar solicitudes:", error);
        return [] as Ticket[];
      });
      const [docs, areasData, ticketsData] = await Promise.all([docsPromise, areasPromise, ticketsPromise]);
      setDocumentos(docs || []);
      setAreas(areasData || []);
      setTickets(ticketsData || []);
    } catch (error) {
      console.error("Error al cargar documentos publicos:", error);
      toast.error("No se pudieron cargar los datos");
      setDocumentos([]);
      setAreas([]);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const tiposDisponibles = useMemo(() => {
    return [...new Set(documentos.map((doc) => doc.tipo_documento).filter(Boolean))].sort();
  }, [documentos]);

  const documentosFiltrados = useMemo(() => {
    return documentos.filter((doc) => {
      const coincideBusqueda = matchesTextSearch(search, doc);
      const coincideTipo = tipo.length === 0 || doc.tipo_documento === tipo;
      return coincideBusqueda && coincideTipo;
    });
  }, [documentos, search, tipo]);

  const misSolicitudes = useMemo(() => {
    if (!currentUser?.id) return [];
    return tickets.filter(
      (t) => t.categoria === "solicitud_documento" && sameId(t.solicitante_id, currentUser.id),
    );
  }, [tickets, currentUser]);

  const pendientesPorAprobar = useMemo(() => {
    if (!currentUser?.id) return [];
    return tickets.filter(
      (t) =>
        t.categoria === "solicitud_documento" &&
        t.estado === "abierto" &&
        sameId(t.asignado_a, currentUser.id),
    );
  }, [tickets, currentUser]);

  const areasConResponsable = useMemo(() => {
    return areas.filter((a) => Array.isArray(a.asignaciones) && a.asignaciones.length > 0);
  }, [areas]);

  const areaNombrePorId = useMemo(() => {
    return new Map(areas.map((a) => [a.id, a.nombre]));
  }, [areas]);

  const handleImprimir = async (doc: DocumentoResponse) => {
    try {
      await exportarDocumentoSGC(datosSGCDesdeDocumento(doc));
      toast.success("Seleccione Imprimir o Guardar como PDF en el cuadro de impresión");
    } catch (error) {
      console.error("Error al imprimir documento:", error);
      toast.error("No se pudo abrir la impresión del documento");
    }
  };

  const handleDescargar = async (doc: DocumentoResponse) => {
    try {
      if (esContenidoHtml(doc.descripcion) || !doc.ruta_archivo) {
        await handleImprimir(doc);
        return;
      }
      window.open(doc.ruta_archivo, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      toast.error("No se pudo generar el PDF del documento");
    }
  };

  const abrirSolicitud = (doc: DocumentoResponse) => {
    setSelectedDocumento(doc);
    setSolicitudForm({
      areaId: "",
      descripcion: "",
      archivo: null,
    });
  };

  const cerrarSolicitud = () => {
    setSelectedDocumento(null);
    setSolicitudForm({
      areaId: "",
      descripcion: "",
      archivo: null,
    });
  };

  const enviarSolicitud = async () => {
    if (!selectedDocumento) return;
    if (!solicitudForm.areaId) {
      toast.error("Selecciona el área destino");
      return;
    }
    if (!solicitudForm.descripcion.trim() && !solicitudForm.archivo) {
      toast.error("Describe la solicitud o adjunta el formato diligenciado");
      return;
    }

    try {
      setSending(true);
      let archivoUrl: string | undefined;
      if (solicitudForm.archivo) {
        const subida = await uploadService.uploadEvidencia(solicitudForm.archivo);
        archivoUrl = subida.url;
      }

      await ticketService.create({
        titulo: `Solicitud ${selectedDocumento.codigo} - ${selectedDocumento.nombre}`,
        descripcion:
          solicitudForm.descripcion.trim() ||
          `Solicitud enviada desde documentos públicos para el formato ${selectedDocumento.codigo}.`,
        categoria: "solicitud_documento",
        prioridad: "media",
        area_destino_id: solicitudForm.areaId,
        documento_publico_id: selectedDocumento.id,
        archivo_adjunto_url: archivoUrl,
      });

      toast.success("Solicitud enviada. Quedó registrada con trazabilidad para el área responsable.");
      cerrarSolicitud();
      await cargarDatos();
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      toast.error(error instanceof Error ? error.message : "No se pudo enviar la solicitud");
    } finally {
      setSending(false);
    }
  };

  const abrirDecisionModal = (ticketId: string, accion: DecisionAction) => {
    setDecisionTicketId(ticketId);
    setDecisionAccion(accion);
    setDecisionComentario("");
  };

  const cerrarDecisionModal = () => {
    setDecisionTicketId(null);
    setDecisionComentario("");
  };

  const decidirSolicitud = async (ticketId: string, accion: DecisionAction, comentario: string) => {
    try {
      setResolviendoDecision(true);
      if (accion === "aprobar") {
        await ticketService.aprobar(ticketId, { comentario });
        toast.success("Solicitud aprobada");
      } else {
        await ticketService.declinar(ticketId, { comentario });
        toast.success("Solicitud declinada");
      }
      await cargarDatos();
      cerrarDecisionModal();
    } catch (error) {
      console.error("Error al resolver solicitud:", error);
      toast.error("No se pudo actualizar la solicitud");
    } finally {
      setResolviendoDecision(false);
    }
  };

  const confirmarDecision = async () => {
    if (!decisionTicketId) return;
    await decidirSolicitud(decisionTicketId, decisionAccion, decisionComentario.trim());
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#1E3A8A] flex items-center gap-2">
                <FileText className="w-8 h-8 text-[#2563EB]" />
                Documentos Publicos
              </h1>
              <p className="text-[#6B7280] mt-1">
                Descarga formatos y envia solicitudes al area encargada para aprobacion.
              </p>
            </div>
            <div className="text-sm font-semibold text-[#1E3A8A] bg-[#E0EDFF] px-4 py-2 rounded-full w-fit">
              {documentos.length} documentos publicados
            </div>
          </div>
        </div>

        {pendientesPorAprobar.length > 0 && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 md:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#1E3A8A] mb-3">Solicitudes pendientes por aprobar</h2>
            <div className="space-y-3">
              {pendientesPorAprobar.map((t) => (
                <div key={t.id} className="border border-[#E5E7EB] rounded-xl p-4">
                  <p className="font-semibold text-[#111827]">{t.titulo}</p>
                  <p className="text-sm text-[#6B7280] mt-1">{t.descripcion}</p>
                  <p className="text-xs text-[#6B7280] mt-2">
                    Solicitante: <span className="font-semibold">{nombreUsuario(t.solicitante)}</span>
                    {t.solicitante?.correo_electronico ? ` · ${t.solicitante.correo_electronico}` : ""}
                    {t.solicitante?.documento ? ` · CC ${t.solicitante.documento}` : ""}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Área: {t.area_destino_id ? areaNombrePorId.get(t.area_destino_id) || "Sin área" : "Sin área"}
                    {" · "}
                    Creada: {new Date(t.creado_en).toLocaleString("es-CO")}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {t.archivo_adjunto_url && (
                      <button
                        onClick={() => window.open(t.archivo_adjunto_url, "_blank", "noopener,noreferrer")}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm font-medium hover:bg-[#F9FAFB]"
                      >
                        <Download className="w-4 h-4" />
                        Ver archivo
                      </button>
                    )}
                    <button
                      onClick={() => abrirDecisionModal(t.id, "aprobar")}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#16A34A] text-white text-sm font-medium hover:bg-[#15803D]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => abrirDecisionModal(t.id, "declinar")}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#DC2626] text-white text-sm font-medium hover:bg-[#B91C1C]"
                    >
                      <XCircle className="w-4 h-4" />
                      Declinar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder={SEARCH_ANY_PLACEHOLDER}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <select
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-[#E5E7EB] appearance-none bg-white focus:ring-2 focus:ring-[#2563EB]/20 outline-none"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                {tiposDisponibles.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 md:p-6 shadow-sm">
          {loading ? (
            <LoadingSpinner message="Cargando documentos publicos" />
          ) : documentosFiltrados.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No hay documentos publicos con esos filtros.</p>
          ) : (
            <div className="space-y-3">
              {documentosFiltrados.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-[#E5E7EB] rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#111827] truncate">{doc.nombre}</p>
                    <p className="text-sm text-[#6B7280]">
                      {doc.codigo} | {doc.tipo_documento} | v{doc.version_actual}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-1">
                      Actualizado: {new Date(doc.actualizado_en).toLocaleDateString("es-ES")}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => navigate(`/documentos/${doc.id}`)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm font-medium hover:bg-[#F9FAFB]"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleImprimir(doc)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm font-medium hover:bg-[#F9FAFB]"
                    >
                      <Printer className="w-4 h-4" />
                      Imprimir
                    </button>
                    <button
                      onClick={() => handleDescargar(doc)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8]"
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </button>
                    <button
                      onClick={() => abrirSolicitud(doc)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0E7490] text-white text-sm font-medium hover:bg-[#155E75]"
                    >
                      <Send className="w-4 h-4" />
                      Enviar Solicitud
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {misSolicitudes.length > 0 && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 md:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#1E3A8A] mb-3">Mis solicitudes</h2>
            <div className="space-y-2">
              {misSolicitudes.map((t) => (
                <div key={t.id} className="border border-[#E5E7EB] rounded-xl p-3">
                  <p className="font-medium text-[#111827]">{t.titulo}</p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Estado: <span className="font-semibold">{etiquetaEstadoSolicitud(t.estado)}</span>
                    {" · Área: "}
                    {t.area_destino_id ? areaNombrePorId.get(t.area_destino_id) || "Sin área" : "Sin área"}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Solicitante: {nombreUsuario(t.solicitante)}
                    {" · Responsable: "}
                    {nombreUsuario(t.asignado)}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Enviada: {new Date(t.creado_en).toLocaleString("es-CO")}
                    {t.fecha_resolucion ? ` · Resolución: ${new Date(t.fecha_resolucion).toLocaleString("es-CO")}` : ""}
                  </p>
                  {t.solucion && (
                    <p className="text-sm text-[#374151] mt-2 bg-[#F8FAFC] rounded-lg p-2">
                      Comentario: {t.solucion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(decisionTicketId)}
        onOpenChange={(open) => {
          if (!open && !resolviendoDecision) {
            cerrarDecisionModal();
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl border border-[#E5E7EB]">
          <DialogHeader>
            <DialogTitle className={decisionAccion === "aprobar" ? "text-[#166534]" : "text-[#991B1B]"}>
              {decisionAccion === "aprobar" ? "Aprobar solicitud" : "Declinar solicitud"}
            </DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              {decisionAccion === "aprobar"
                ? "Puedes dejar un comentario opcional para la aprobación."
                : "Puedes dejar un motivo opcional para la declinación."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#111827]">
              {decisionAccion === "aprobar" ? "Comentario de aprobación" : "Motivo de declinación"} (opcional)
            </label>
            <Textarea
              value={decisionComentario}
              onChange={(e) => setDecisionComentario(e.target.value)}
              placeholder={
                decisionAccion === "aprobar"
                  ? "Ej: Solicitud revisada y aprobada."
                  : "Ej: El archivo no cumple el formato requerido."
              }
              className="min-h-[100px] border-[#E5E7EB] focus-visible:ring-[#2563EB]/30"
            />
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="border-[#D1D5DB]"
              onClick={cerrarDecisionModal}
              disabled={resolviendoDecision}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmarDecision}
              disabled={resolviendoDecision}
              className={
                decisionAccion === "aprobar"
                  ? "bg-[#16A34A] hover:bg-[#15803D]"
                  : "bg-[#DC2626] hover:bg-[#B91C1C]"
              }
            >
              {resolviendoDecision
                ? "Procesando..."
                : decisionAccion === "aprobar"
                  ? "Aprobar solicitud"
                  : "Declinar solicitud"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedDocumento && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold text-[#1E3A8A]">Enviar Solicitud</h3>
            <p className="text-sm text-[#6B7280] mt-1">
              Documento: {selectedDocumento.codigo} - {selectedDocumento.nombre}
            </p>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-[#111827] block mb-1">Área destino</label>
                <select
                  className="w-full p-2 rounded-lg border border-[#E5E7EB]"
                  value={solicitudForm.areaId}
                  onChange={(e) => setSolicitudForm({ ...solicitudForm, areaId: e.target.value })}
                >
                  <option value="">Selecciona un área con responsable</option>
                  {(areasConResponsable.length > 0 ? areasConResponsable : areas).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
                {areasConResponsable.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    El área debe tener un responsable asignado para poder enviar la solicitud.
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-[#111827] block mb-1">Descripcion</label>
                <textarea
                  className="w-full p-2 rounded-lg border border-[#E5E7EB] min-h-[90px]"
                  placeholder="Describe brevemente tu solicitud..."
                  value={solicitudForm.descripcion}
                  onChange={(e) => setSolicitudForm({ ...solicitudForm, descripcion: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#111827] block mb-1">
                  Formato diligenciado (opcional)
                </label>
                <input
                  type="file"
                  className="w-full p-2 rounded-lg border border-[#E5E7EB]"
                  onChange={(e) =>
                    setSolicitudForm({
                      ...solicitudForm,
                      archivo: e.target.files && e.target.files[0] ? e.target.files[0] : null,
                    })
                  }
                />
                <p className="text-xs text-[#6B7280] mt-1">
                  Puedes enviar la solicitud con una descripción o adjuntando el formato.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={cerrarSolicitud}
                className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"
                disabled={sending}
              >
                Cancelar
              </button>
              <button
                onClick={enviarSolicitud}
                className="px-4 py-2 rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8] disabled:opacity-60"
                disabled={sending}
              >
                {sending ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
