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
  nombreArchivo: string;
  tipoDocumento: string;
  codigoDocumento: string;
  version: string;
  estado: string;
  visibilidad: string;
  creadoEn: string;
  actualizadoEn: string;
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
      setDocumentos(data.items || []);
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
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: <Clock className="w-3 h-3" />,
        label: "Borrador",
      },
      en_revision: {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: <AlertCircle className="w-3 h-3" />,
        label: "En Revisión",
      },
      pendiente_aprobacion: {
        color: "bg-orange-100 text-orange-800 border-orange-300",
        icon: <Clock className="w-3 h-3" />,
        label: "Pendiente Aprobación",
      },
      aprobado: {
        color: "bg-green-100 text-green-800 border-green-300",
        icon: <CheckCircle className="w-3 h-3" />,
        label: "Aprobado",
      },
      obsoleto: {
        color: "bg-red-100 text-red-800 border-red-300",
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
      formato: "bg-purple-100 text-purple-800 border-purple-300",
      procedimiento: "bg-blue-100 text-blue-800 border-blue-300",
      instructivo: "bg-cyan-100 text-cyan-800 border-cyan-300",
      manual: "bg-indigo-100 text-indigo-800 border-indigo-300",
      politica: "bg-pink-100 text-pink-800 border-pink-300",
      registro: "bg-yellow-100 text-yellow-800 border-yellow-300",
      plan: "bg-orange-100 text-orange-800 border-orange-300",
    };

    return tipos[tipo] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const filteredDocumentos = documentos.filter((doc) => {
    const matchSearch =
      doc.nombreArchivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.codigoDocumento.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === "" || doc.tipoDocumento === filterTipo;
    const matchEstado = filterEstado === "" || doc.estado === filterEstado;

    return matchSearch && matchTipo && matchEstado;
  });

  const handleView = (id: string) => {
    navigate(`/documentos/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/documentos/${id}/editar`);
  };

  const handleDelete = async (docId: string, nombreDocumento: string) => {
    toast.warning(
      <div>
        <p className="font-semibold">¿Eliminar documento?</p>
        <p className="text-sm text-muted-foreground mt-1">
          Se eliminará "{nombreDocumento}"
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
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            Gestión Documental
          </h1>
          <p className="text-muted-foreground mt-2">
            Administra todos los documentos del sistema de gestión de calidad
          </p>
        </div>
        <button
          onClick={() => navigate("/documentos/crear")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Documento
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border border-border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background"
            />
          </div>

          {/* Filter Tipo */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background appearance-none"
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

          {/* Filter Estado */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background appearance-none"
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{documentos.length}</p>
            </div>
            <FileText className="w-8 h-8 text-primary opacity-50" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Aprobados</p>
              <p className="text-2xl font-bold text-green-600">
                {documentos.filter((d) => d.estado === "aprobado").length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">En Proceso</p>
              <p className="text-2xl font-bold text-blue-600">
                {
                  documentos.filter(
                    (d) =>
                      d.estado === "en_revision" ||
                      d.estado === "pendiente_aprobacion",
                  ).length
                }
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Borradores</p>
              <p className="text-2xl font-bold text-gray-600">
                {documentos.filter((d) => d.estado === "borrador").length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-gray-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocumentos.length === 0 ? (
        <div className="bg-card p-12 rounded-lg border border-border text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">
            No se encontraron documentos
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterTipo || filterEstado
              ? "Intenta ajustar los filtros de búsqueda"
              : "Comienza creando tu primer documento"}
          </p>
          {!searchTerm && !filterTipo && !filterEstado && (
            <button
              onClick={() => navigate("/documentos/crear")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear Documento
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocumentos.map((documento) => (
            <div
              key={documento.id}
              className="bg-card p-5 rounded-lg border border-border hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                    {documento.nombreArchivo}
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    {documento.codigoDocumento}
                  </p>
                </div>
                <FileText className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getTipoColor(
                    documento.tipoDocumento,
                  )}`}
                >
                  {documento.tipoDocumento.charAt(0).toUpperCase() +
                    documento.tipoDocumento.slice(1)}
                </span>
                {getEstadoBadge(documento.estado)}
              </div>

              {/* Meta Info */}
              <div className="space-y-1 mb-4 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Versión:</span>
                  <span className="font-medium">{documento.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Visibilidad:</span>
                  <span className="font-medium capitalize">
                    {documento.visibilidad}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Actualizado:</span>
                  <span className="font-medium">
                    {new Date(documento.actualizadoEn).toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => handleView(documento.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-sm"
                  title="Ver documento"
                >
                  <Eye className="w-4 h-4" />
                  Ver
                </button>
                <button
                  onClick={() => handleEdit(documento.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-600 rounded-md hover:bg-blue-500/20 transition-colors text-sm"
                  title="Editar documento"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    handleDelete(documento.id, documento.nombreArchivo)
                  }
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors text-sm"
                  title="Eliminar documento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
