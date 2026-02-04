import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { documentoService } from "@/services/documento.service";
import { DocumentWorkflow } from "@/components/documents/DocumentWorkflow";
import { toast } from "sonner";
import {
  FileText,
  ArrowLeft,
  Edit,
  Download,
  Clock,
  CheckCircle,
  Calendar,
  Eye,
  Shield,
  Hash,
  FileType,
  Trash2,
  FileCheck,
} from "lucide-react";

interface Documento {
  id: string;
  nombre: string;
  tipo_documento: string;
  codigo: string;
  version_actual: string;
  estado: string;
  ruta_archivo?: string;
  descripcion?: string;
  creado_en: string;
  actualizado_en: string;
  creado_por?: string;
  aprobado_por?: string;
}

export default function VerDocumento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [versiones, setVersiones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVersiones, setLoadingVersiones] = useState(false);

  const fetchDocumento = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await documentoService.getById(id);
      setDocumento(data as unknown as Documento);

      // Cargar versiones del documento
      fetchVersiones();
    } catch (error) {
      console.error("Error al cargar documento:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al cargar documento",
      );
      navigate("/documentos");
    } finally {
      setLoading(false);
    }
  };

  const fetchVersiones = async () => {
    if (!id) return;

    try {
      setLoadingVersiones(true);
      const data = await documentoService.getVersiones(id);
      setVersiones(data || []);
    } catch (error) {
      console.error("Error al cargar versiones:", error);
      // No mostrar error al usuario, solo log
    } finally {
      setLoadingVersiones(false);
    }
  };

  const handleWorkflowStateChange = async (newState: string) => {
    if (!id) return;

    try {
      // Actualizar el estado del documento
      await documentoService.update(id, { estado: newState });

      // Recargar el documento para mostrar los cambios
      await fetchDocumento();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (id) {
      fetchDocumento();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleExportPDF = () => {
    if (!documento) return;

    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${documento.nombre}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                max-width: 210mm;
                margin: 0 auto;
              }
              .header {
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .header h1 {
                margin: 0;
                color: #0A4BA0;
              }
              .metadata {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                margin-bottom: 30px;
                font-size: 14px;
              }
              .metadata-item {
                padding: 8px;
                background: #f5f5f5;
                border-radius: 4px;
              }
              .metadata-label {
                font-weight: bold;
                color: #666;
              }
              table {
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
              }
              td, th {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #0A4BA0;
                color: white;
              }
              h1, h2, h3 {
                color: #333;
                margin-top: 20px;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${documento.nombre}</h1>
            </div>

            <div class="metadata">
              <div class="metadata-item">
                <span class="metadata-label">Código:</span> ${documento.codigo}
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Versión:</span> ${documento.version_actual}
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Tipo:</span> ${documento.tipo_documento}
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Estado:</span> ${documento.estado}
              </div>
            </div>

            <div class="content">
              ${documento.descripcion || "<p>Sin contenido</p>"}
            </div>

            <div class="footer">
              <p>Documento generado el ${new Date().toLocaleDateString("es-ES")}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDelete = () => {
    if (!documento) return;

    toast.warning(
      <div>
        <p className="font-semibold">¿Eliminar documento?</p>
        <p className="text-sm text-muted-foreground mt-1">
          Se eliminará "{documento.nombre}"
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={async () => {
              try {
                await documentoService.delete(documento.id);
                toast.success("Documento eliminado correctamente");
                navigate("/documentos");
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

  const getEstadoBadge = (estado: string) => {
    const estados: Record<
      string,
      { color: string; icon: React.ReactElement; label: string }
    > = {
      borrador: {
        color: "bg-[#F8FAFC] text-[#6B7280] border-[#E5E7EB]",
        icon: <Clock className="w-4 h-4" />,
        label: "Borrador",
      },
      en_revision: {
        color: "bg-[#E0EDFF] text-[#2563EB] border-[#2563EB]/30",
        icon: <Eye className="w-4 h-4" />,
        label: "En Revisión",
      },
      pendiente_aprobacion: {
        color: "bg-[#FFF7ED] text-[#F59E0B] border-[#F59E0B]/30",
        icon: <FileCheck className="w-4 h-4" />,
        label: "Pendiente Aprobación",
      },
      aprobado: {
        color: "bg-[#ECFDF5] text-[#22C55E] border-[#22C55E]/30",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Aprobado",
      },
      obsoleto: {
        color: "bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/30",
        icon: <Trash2 className="w-4 h-4" />,
        label: "Obsoleto",
      },
    };

    const badge = estados[estado] || estados.borrador;

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${badge.color}`}
      >
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F7FA]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent" />
          <p className="mt-4 text-lg font-medium text-[#6B7280]">Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (!documento) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-20 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-[#1E3A8A]">
              Documento no encontrado
            </h2>
            <p className="text-[#6B7280] mb-6">
              El documento que buscas no existe o fue eliminado
            </p>
            <button
              onClick={() => navigate("/documentos")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Documentos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Profesional */}
        <div className="bg-gradient-to-br from-[#E0EDFF] to-[#C7D2FE] rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
          <button
            onClick={() => navigate("/documentos")}
            className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1E3A8A] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a documentos
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
                <FileText className="h-9 w-9 text-[#2563EB]" />
                {documento.nombre}
              </h1>
              <p className="text-[#6B7280] mt-2 text-lg font-mono">
                {documento.codigo}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/documentos/${documento.id}/editar`)}
                className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold shadow-sm transition-all"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-6 py-3 bg-white text-[#6B7280] border border-[#E5E7EB] rounded-xl hover:bg-[#F8FAFC] font-semibold transition-all"
              >
                <Download className="w-4 h-4" />
                Exportar PDF
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-6 py-3 bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/30 rounded-xl hover:bg-red-100 font-semibold transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>

        {/* Metadata Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Estado */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[#1E3A8A]">Estado</span>
            </div>
            {getEstadoBadge(documento.estado)}
          </div>

          {/* Versión */}
          <div className="bg-[#E0EDFF] p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-5 h-5 text-[#2563EB]" />
              <span className="text-sm font-semibold text-[#1E3A8A]">Versión</span>
            </div>
            <p className="text-3xl font-bold text-[#1E3A8A]">{documento.version_actual}</p>
          </div>

          {/* Tipo de Documento */}
          <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <FileType className="w-5 h-5 text-[#6B7280]" />
              <span className="text-sm font-semibold text-[#1E3A8A]">Tipo</span>
            </div>
            <p className="text-xl font-semibold text-[#1E3A8A] capitalize">
              {documento.tipo_documento}
            </p>
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-[#2563EB]" />
              <span className="text-sm font-semibold text-[#1E3A8A]">Fecha de Creación</span>
            </div>
            <p className="text-lg text-[#6B7280]">
              {new Date(documento.creado_en).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-[#2563EB]" />
              <span className="text-sm font|-semibold text-[#1E3A8A]">Última Actualización</span>
            </div>
            <p className="text-lg text-[#6B7280]">
              {new Date(documento.actualizado_en).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Contenido del Documento */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
          <div className="p-6 border-b border-[#E5E7EB] bg-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#2563EB]" />
              <h2 className="text-xl font-semibold text-[#1E3A8A]">Contenido del Documento</h2>
            </div>
          </div>
          <div className="p-8">
            {documento.descripcion ? (
              <div
                className="prose prose-sm max-w-none text-[#6B7280]"
                dangerouslySetInnerHTML={{ __html: documento.descripcion }}
              />
            ) : (
              <div className="text-center py-12 text-[#6B7280]">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-300" />
                <p>Este documento no tiene contenido</p>
              </div>
            )}
          </div>
        </div>
      </div >
    </div >
  );
}
