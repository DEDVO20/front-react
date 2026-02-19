import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Search, Download, Eye, Filter, Send, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { documentoService, type DocumentoResponse } from "@/services/documento.service";
import { areaService, type Area } from "@/services/area.service";
import ticketService, { type Ticket } from "@/services/ticket.service";
import { uploadService } from "@/services/upload.service";
import { getCurrentUser } from "@/services/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type SolicitudForm = {
  areaId: string;
  descripcion: string;
  archivo: File | null;
};

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
  const [selectedDocumento, setSelectedDocumento] = useState<DocumentoResponse | null>(null);
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
      const [docs, areasData, ticketsData] = await Promise.all([
        documentoService.getAll({ estado: "aprobado" }),
        areaService.getAll(),
        ticketService.getAll(),
      ]);
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
    const term = search.toLowerCase().trim();
    return documentos.filter((doc) => {
      const coincideBusqueda =
        term.length === 0 ||
        doc.nombre.toLowerCase().includes(term) ||
        doc.codigo.toLowerCase().includes(term);

      const coincideTipo = tipo.length === 0 || doc.tipo_documento === tipo;
      return coincideBusqueda && coincideTipo;
    });
  }, [documentos, search, tipo]);

  const misSolicitudes = useMemo(() => {
    if (!currentUser?.id) return [];
    return tickets.filter(
      (t) => t.categoria === "solicitud_documento" && t.solicitante_id === currentUser.id,
    );
  }, [tickets, currentUser]);

  const pendientesPorAprobar = useMemo(() => {
    if (!currentUser?.id) return [];
    return tickets.filter(
      (t) =>
        t.categoria === "solicitud_documento" &&
        t.estado === "abierto" &&
        t.asignado_a === currentUser.id,
    );
  }, [tickets, currentUser]);

  const areaNombrePorId = useMemo(() => {
    return new Map(areas.map((a) => [a.id, a.nombre]));
  }, [areas]);

  const handleDescargar = (doc: DocumentoResponse) => {
    if (!doc.ruta_archivo) {
      toast.info(`"${doc.nombre}" no tiene archivo descargable.`);
      return;
    }
    window.open(doc.ruta_archivo, "_blank", "noopener,noreferrer");
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
      toast.error("Selecciona el area destino");
      return;
    }
    if (!solicitudForm.archivo) {
      toast.error("Debes cargar el formato diligenciado");
      return;
    }

    try {
      setSending(true);
      const subida = await uploadService.uploadEvidencia(solicitudForm.archivo);

      await ticketService.create({
        titulo: `Solicitud ${selectedDocumento.codigo} - ${selectedDocumento.nombre}`,
        descripcion:
          solicitudForm.descripcion.trim() ||
          `Solicitud enviada desde documentos públicos para el formato ${selectedDocumento.codigo}.`,
        categoria: "solicitud_documento",
        prioridad: "media",
        area_destino_id: solicitudForm.areaId,
        documento_publico_id: selectedDocumento.id,
        archivo_adjunto_url: subida.url,
      });

      toast.success("Solicitud enviada al responsable del area");
      cerrarSolicitud();
      await cargarDatos();
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      toast.error("No se pudo enviar la solicitud");
    } finally {
      setSending(false);
    }
  };

  const decidirSolicitud = async (ticketId: string, accion: "aprobar" | "declinar") => {
    const comentario = window.prompt(
      accion === "aprobar"
        ? "Comentario de aprobacion (opcional):"
        : "Motivo de declinacion (opcional):",
    ) || "";

    try {
      if (accion === "aprobar") {
        await ticketService.aprobar(ticketId, { comentario });
        toast.success("Solicitud aprobada");
      } else {
        await ticketService.declinar(ticketId, { comentario });
        toast.success("Solicitud declinada");
      }
      await cargarDatos();
    } catch (error) {
      console.error("Error al resolver solicitud:", error);
      toast.error("No se pudo actualizar la solicitud");
    }
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
                  <p className="text-xs text-[#6B7280] mt-1">
                    Area: {t.area_destino_id ? areaNombrePorId.get(t.area_destino_id) || "Sin area" : "Sin area"}
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
                      onClick={() => decidirSolicitud(t.id, "aprobar")}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#16A34A] text-white text-sm font-medium hover:bg-[#15803D]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => decidirSolicitud(t.id, "declinar")}
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
                placeholder="Buscar por nombre o codigo..."
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
                  <p className="text-xs text-[#6B7280]">
                    Estado: <span className="font-semibold">{t.estado}</span> | Area:{" "}
                    {t.area_destino_id ? areaNombrePorId.get(t.area_destino_id) || "Sin area" : "Sin area"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedDocumento && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold text-[#1E3A8A]">Enviar Solicitud</h3>
            <p className="text-sm text-[#6B7280] mt-1">
              Documento: {selectedDocumento.codigo} - {selectedDocumento.nombre}
            </p>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-[#111827] block mb-1">Area destino</label>
                <select
                  className="w-full p-2 rounded-lg border border-[#E5E7EB]"
                  value={solicitudForm.areaId}
                  onChange={(e) => setSolicitudForm({ ...solicitudForm, areaId: e.target.value })}
                >
                  <option value="">Selecciona un area</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
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
                  Formato diligenciado
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
