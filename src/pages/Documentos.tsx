import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { documentoService } from "@/services/documento.service";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface Documento {
  id: string;
  nombre: string;
  tipo_documento: string;
  codigo: string;
  version_actual: string;
  estado: string;
  creado_en: string;
  actualizado_en: string;
}

export default function Documentos() {
  const navigate = useNavigate();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  useEffect(() => {
    fetchDocumentos();
  }, []);

  const fetchDocumentos = async () => {
    try {
      setLoading(true);
      const data = await documentoService.getAll();
      setDocumentos(data || []);
    } catch (error) {
      console.error("Error al cargar documentos:", error);
      toast.error("Error al cargar documentos");
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estados: Record<
      string,
      { color: string; icon: React.ReactElement; label: string }
    > = {
      borrador: {
        color: "bg-[#F8FAFC] text-[#6B7280] border-[#E5E7EB]",
        icon: <Clock className="w-3 h-3" />,
        label: "Borrador",
      },
      en_revision: {
        color: "bg-[#E0EDFF] text-[#2563EB] border-[#2563EB]/30",
        icon: <AlertCircle className="w-3 h-3" />,
        label: "En Revisión",
      },
      pendiente_aprobacion: {
        color: "bg-[#FFF7ED] text-[#F59E0B] border-[#F59E0B]/30",
        icon: <Clock className="w-3 h-3" />,
        label: "Pendiente Aprobación",
      },
      aprobado: {
        color: "bg-[#ECFDF5] text-[#22C55E] border-[#22C55E]/30",
        icon: <CheckCircle className="w-3 h-3" />,
        label: "Aprobado",
      },
      obsoleto: {
        color: "bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/30",
        icon: <XCircle className="w-3 h-3" />,
        label: "Obsoleto",
      },
    };

    const badge = estados[estado] || estados.borrador;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}
      >
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const getTipoColor = (tipo: string) => {
    const tipos: Record<string, string> = {
      formato: "bg-[#F5F3FF] text-[#9333EA] border-[#9333EA]/30",
      procedimiento: "bg-[#E0EDFF] text-[#2563EB] border-[#2563EB]/30",
      instructivo: "bg-[#ECFEFF] text-[#06B6D4] border-[#06B6D4]/30",
      manual: "bg-[#EEF2FF] text-[#6366F1] border-[#6366F1]/30",
      politica: "bg-[#FCE7F3] text-[#EC4899] border-[#EC4899]/30",
      registro: "bg-[#FEF9C3] text-[#EAB308] border-[#EAB308]/30",
      plan: "bg-[#FFF7ED] text-[#F59E0B] border-[#F59E0B]/30",
    };

    return tipos[tipo] || "bg-[#F8FAFC] text-[#6B7280] border-[#E5E7EB]";
  };

  const filteredDocumentos = documentos.filter((doc) => {
    const matchSearch =
      doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === "" || doc.tipo_documento === filterTipo;
    const matchEstado = filterEstado === "" || doc.estado === filterEstado;

    return matchSearch && matchTipo && matchEstado;
  });

  const handleView = (id: string) => {
    navigate(`/documentos/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/documentos/${id}/editar`);
  };

  const handleDelete = async (docId: string, nombre: string) => {
    toast.warning(
      <div>
        <p className="font-semibold">¿Eliminar documento?</p>
        <p className="text-sm text-muted-foreground mt-1">
          Se eliminará "{nombre}"
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={async () => {
              try {
                await documentoService.delete(docId);
                toast.success("Documento eliminado correctamente");
                fetchDocumentos();
              } catch (error) {
                console.error("Error al eliminar documento:", error);
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Error al eliminar documento",
                );
              }
            }}
            className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm"
          >
            Eliminar
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>,
      {
        duration: 10000,
      },
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Profesional */}
        <div className="bg-gradient-to-br from-[#E0EDFF] to-[#C7D2FE] rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
                <FileText className="h-9 w-9 text-[#2563EB]" />
                Gestión Documental
              </h1>
              <p className="text-[#6B7280] mt-2 text-lg">
                Administra todos los documentos del sistema de gestión de calidad ISO 9001
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-[#2563EB] border border-[#E5E7EB]">
                  {documentos.length} documentos totales
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#22C55E]">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {documentos.filter((d) => d.estado === "aprobado").length} aprobados
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate("/documentos/crear")}
              className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold shadow-sm transition-all"
            >
              <Plus className="w-5 h-5" />
              Nuevo Documento
            </button>
          </div>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-[#E5E7EB] rounded-lg bg-white focus:ring-2 focus:ring-[#2563EB]/20 outline-none"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-4 h-4" />
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-[#E5E7EB] rounded-lg bg-white appearance-none focus:ring-2 focus:ring-[#2563EB]/20 outline-none"
              >
                <option value="">Todos los tipos</option>
                <option value="formato">Formato</option>
                <option value="procedimiento">Procedimiento</option>
                <option value="instructivo">Instructivo</option>
                <option value="manual">Manual</option>
                <option value="politica">Política</option>
                <option value="registro">Registro</option>
                <option value="plan">Plan</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-4 h-4" />
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-[#E5E7EB] rounded-lg bg-white appearance-none focus:ring-2 focus:ring-[#2563EB]/20 outline-none"
              >
                <option value="">Todos los estados</option>
                <option value="borrador">Borrador</option>
                <option value="en_revision">En Revisión</option>
                <option value="pendiente_aprobacion">Pendiente Aprobación</option>
                <option value="aprobado">Aprobado</option>
                <option value="obsoleto">Obsoleto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#E0EDFF] p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#1E3A8A] font-semibold">Total Documentos</p>
              <FileText className="w-8 h-8 text-[#2563EB]" />
            </div>
            <p className="text-4xl font-bold text-[#1E3A8A]">{documentos.length}</p>
          </div>

          <div className="bg-[#ECFDF5] p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#1E3A8A] font-semibold">Aprobados</p>
              <CheckCircle className="w-8 h-8 text-[#22C55E]" />
            </div>
            <p className="text-4xl font-bold text-[#1E3A8A]">
              {documentos.filter((d) => d.estado === "aprobado").length}
            </p>
          </div>

          <div className="bg-[#FFF7ED] p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#1E3A8A] font-semibold">En Proceso</p>
              <AlertCircle className="w-8 h-8 text-[#F59E0B]" />
            </div>
            <p className="text-4xl font-bold text-[#1E3A8A]">
              {
                documentos.filter(
                  (d) =>
                    d.estado === "en_revision" ||
                    d.estado === "pendiente_aprobacion",
                ).length
              }
            </p>
          </div>

          <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#1E3A8A] font-semibold">Borradores</p>
              <Clock className="w-8 h-8 text-[#6B7280]" />
            </div>
            <p className="text-4xl font-bold text-[#1E3A8A]">
              {documentos.filter((d) => d.estado === "borrador").length}
            </p>
          </div>
        </div>

        {/* Content */}
        {filteredDocumentos.length === 0 ? (
          <div className="bg-white p-20 rounded-2xl border border-[#E5E7EB] shadow-sm text-center">
            <div className="flex flex-col items-center">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-[#1E3A8A]">
                No se encontraron documentos
              </h3>
              <p className="text-[#6B7280] mb-6">
                {searchTerm || filterTipo || filterEstado
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primer documento"}
              </p>
              {!searchTerm && !filterTipo && !filterEstado && (
                <button
                  onClick={() => navigate("/documentos/crear")}
                  className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Crear Documento
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocumentos.map((documento) => (
              <div
                key={documento.id}
                className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[#1E3A8A] mb-1 line-clamp-1 group-hover:text-[#2563EB] transition-colors">
                      {documento.nombre}
                    </h3>
                    <p className="text-xs text-[#6B7280] font-mono bg-[#F8FAFC] px-2 py-1 rounded-md inline-block border border-[#E5E7EB]">
                      {documento.codigo}
                    </p>
                  </div>
                  <div className="bg-[#E0EDFF] p-2 rounded-xl text-[#2563EB]">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getTipoColor(
                      documento.tipo_documento,
                    )}`}
                  >
                    {documento.tipo_documento}
                  </span>
                  {getEstadoBadge(documento.estado)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-tight">Versión</p>
                    <p className="text-sm font-semibold text-[#1E3A8A]">{documento.version_actual}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-tight">Actualizado</p>
                    <p className="text-sm font-semibold text-[#1E3A8A]">
                      {new Date(documento.actualizado_en).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(documento.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#EFF6FF] text-[#2563EB] rounded-xl hover:bg-[#DBEAFE] font-semibold text-sm transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  <button
                    onClick={() => handleEdit(documento.id)}
                    className="p-2.5 bg-[#F8FAFC] text-[#6B7280] border border-[#E5E7EB] rounded-xl hover:bg-[#F1F5F9] transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(documento.id, documento.nombre)}
                    className="p-2.5 bg-red-50 text-[#EF4444] border border-red-100 rounded-xl hover:bg-red-100 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
