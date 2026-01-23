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
  nombreArchivo: string;
  tipoDocumento: string;
  codigoDocumento: string;
  version: string;
  estado: string;
  visibilidad: string;
  contenidoHtml?: string;
  proximaRevision?: string;
  creadoEn: string;
  actualizadoEn: string;
  subidoPor?: {
    id: string;
    nombre: string;
    primerApellido: string;
    correoElectronico: string;
  };
  revisadoPor?: {
    id: string;
    nombre: string;
    primerApellido: string;
    correoElectronico: string;
  };
  aprobadoPor?: {
    id: string;
    nombre: string;
    primerApellido: string;
    correoElectronico: string;
  };
}

export default function VerDocumento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDocumento = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await documentoService.getById(id);
      setDocumento(data as unknown as Documento);
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

  const handleWorkflowStateChange = async (newState: string) => {
    if (!id) return;

    try {
      // Actualizar el estado del documento
      const formData = new FormData();
      formData.append("estado", newState);

      await documentoService.update(id, formData);

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
            <title>${documento.nombreArchivo}</title>
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
              <h1>${documento.nombreArchivo}</h1>
            </div>

            <div class="metadata">
              <div class="metadata-item">
                <span class="metadata-label">Código:</span> ${documento.codigoDocumento}
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Versión:</span> ${documento.version}
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Tipo:</span> ${documento.tipoDocumento}
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Estado:</span> ${documento.estado}
              </div>
            </div>

            <div class="content">
              ${documento.contenidoHtml || "<p>Sin contenido</p>"}
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
          Se eliminará "{documento.nombreArchivo}"
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
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: <Clock className="w-4 h-4" />,
        label: "Borrador",
      },
      en_revision: {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: <Eye className="w-4 h-4" />,
        label: "En Revisión",
      },
      pendiente_aprobacion: {
        color: "bg-orange-100 text-orange-800 border-orange-300",
        icon: <FileCheck className="w-4 h-4" />,
        label: "Pendiente Aprobación",
      },
      aprobado: {
        color: "bg-green-100 text-green-800 border-green-300",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Aprobado",
      },
      obsoleto: {
        color: "bg-red-100 text-red-800 border-red-300",
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (!documento) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">
            Documento no encontrado
          </h2>
          <p className="text-muted-foreground mb-6">
            El documento que buscas no existe o fue eliminado
          </p>
          <button
            onClick={() => navigate("/documentos")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Documentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/documentos")}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a documentos
        </button>

        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {documento.nombreArchivo}
            </h1>
            <p className="text-muted-foreground font-mono text-lg">
              {documento.codigoDocumento}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/documentos/${documento.id}/editar`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Estado */}
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Estado</span>
          </div>
          {getEstadoBadge(documento.estado)}
        </div>

        {/* Versión */}
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Versión</span>
          </div>
          <p className="text-2xl font-bold">{documento.version}</p>
        </div>

        {/* Tipo de Documento */}
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <FileType className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Tipo</span>
          </div>
          <p className="text-xl font-semibold capitalize">
            {documento.tipoDocumento}
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Visibilidad */}
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Visibilidad</span>
          </div>
          <p className="text-lg capitalize">{documento.visibilidad}</p>
        </div>

        {/* Próxima Revisión */}
        {documento.proximaRevision && (
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Próxima Revisión</span>
            </div>
            <p className="text-lg">
              {new Date(documento.proximaRevision).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}
      </div>

      {/* Acciones de Flujo de Trabajo */}
      {documento && (
        <DocumentWorkflow
          currentState={documento.estado}
          creadoPorId={documento.subidoPor?.id}
          revisadoPorId={documento.revisadoPor?.id}
          aprobadoPorId={documento.aprobadoPor?.id}
          onStateChange={handleWorkflowStateChange}
        />
      )}

      {/* Flujo de Aprobación */}
      <div className="bg-card p-6 rounded-lg border border-border mb-6 mt-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Flujo de Aprobación</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Seguimiento del proceso de revisión y aprobación del documento
          </p>
        </div>

        {/* Indicador visual del flujo */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full ${documento.subidoPor ? "bg-blue-500" : "bg-gray-300"
                  } text-white flex items-center justify-center font-bold mb-2`}
              >
                {documento.subidoPor ? "✓" : "1"}
              </div>
              <p className="text-xs font-medium text-center">Creación</p>
              <p className="text-xs text-muted-foreground text-center">
                Borrador
              </p>
            </div>
            <div
              className={`flex-1 h-1 ${documento.revisadoPor ? "bg-orange-500" : "bg-border"
                } mx-2`}
            ></div>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full ${documento.revisadoPor ? "bg-orange-500" : "bg-gray-300"
                  } text-white flex items-center justify-center font-bold mb-2`}
              >
                {documento.revisadoPor ? "✓" : "2"}
              </div>
              <p className="text-xs font-medium text-center">Revisión</p>
              <p className="text-xs text-muted-foreground text-center">
                En Revisión
              </p>
            </div>
            <div
              className={`flex-1 h-1 ${documento.aprobadoPor ? "bg-green-500" : "bg-border"
                } mx-2`}
            ></div>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full ${documento.aprobadoPor ? "bg-green-500" : "bg-gray-300"
                  } text-white flex items-center justify-center font-bold mb-2`}
              >
                {documento.aprobadoPor ? "✓" : "3"}
              </div>
              <p className="text-xs font-medium text-center">Aprobación</p>
              <p className="text-xs text-muted-foreground text-center">
                Aprobado
              </p>
            </div>
          </div>
        </div>

        {/* Responsables */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Creado por */}
          <div className="bg-background p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <span className="text-sm font-medium">Creado por</span>
            </div>
            {documento.subidoPor ? (
              <div>
                <p className="font-semibold">
                  {documento.subidoPor.nombre}{" "}
                  {documento.subidoPor.primerApellido}
                </p>
                <p className="text-sm text-muted-foreground">
                  {documento.subidoPor.correoElectronico}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No asignado</p>
            )}
          </div>

          {/* Revisado por */}
          <div className="bg-background p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <span className="text-sm font-medium">Revisado por</span>
            </div>
            {documento.revisadoPor ? (
              <div>
                <p className="font-semibold">
                  {documento.revisadoPor.nombre}{" "}
                  {documento.revisadoPor.primerApellido}
                </p>
                <p className="text-sm text-muted-foreground">
                  {documento.revisadoPor.correoElectronico}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Pendiente</p>
            )}
          </div>

          {/* Aprobado por */}
          <div className="bg-background p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <span className="text-sm font-medium">Aprobado por</span>
            </div>
            {documento.aprobadoPor ? (
              <div>
                <p className="font-semibold">
                  {documento.aprobadoPor.nombre}{" "}
                  {documento.aprobadoPor.primerApellido}
                </p>
                <p className="text-sm text-muted-foreground">
                  {documento.aprobadoPor.correoElectronico}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Pendiente</p>
            )}
          </div>
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Fecha de Creación</span>
          </div>
          <p className="text-lg">
            {new Date(documento.creadoEn).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Última Actualización</span>
          </div>
          <p className="text-lg">
            {new Date(documento.actualizadoEn).toLocaleDateString("es-ES", {
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
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Contenido del Documento</h2>
          </div>
        </div>
        <div className="p-6">
          {documento.contenidoHtml ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: documento.contenidoHtml }}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Este documento no tiene contenido</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
