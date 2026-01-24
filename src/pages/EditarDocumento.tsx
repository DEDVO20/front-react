import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DocumentFormWithTipTap } from "@/components/documents/DocumentFormWithTipTap";
import { documentoService } from "@/services/documento.service";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, ArrowLeft, FileText } from "lucide-react";

interface DocumentoData {
  nombreArchivo?: string;
  tipoDocumento?: string;
  codigoDocumento?: string;
  version?: string;
  estado?: string;
  subidoPor?: string;
  aprobadoPor?: string;
  contenidoHtml?: string;
}

export default function EditarDocumento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<DocumentoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchDocumento = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await documentoService.getById(id);

      // Convert backend field names to form field names
      const formData: DocumentoData = {
        nombreArchivo: data.nombre,
        tipoDocumento: data.tipo_documento,
        codigoDocumento: data.codigo,
        version: data.version_actual,
        estado: data.estado,
        // Usar el UUID del creador (el select necesita el ID)
        subidoPor: data.creado_por || '',
        // Usar el UUID del aprobador (el select necesita el ID)
        aprobadoPor: data.aprobado_por || '',
        // Agregar el contenido HTML del documento
        contenidoHtml: data.descripcion || '',
      };

      setInitialData(formData);
    } catch (error) {
      console.error("Error al cargar documento:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al cargar documento";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDocumento();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    if (!id) return;

    try {
      setError(null);

      // Obtener el contenido HTML actual del formulario
      const nuevoContenido = formData.get("contenidoHtml") as string;
      const contenidoOriginal = initialData?.contenidoHtml || '';

      // Detectar si hubo cambios en el contenido
      const huboCambios = nuevoContenido !== contenidoOriginal;

      // Incrementar versión automáticamente si hubo cambios
      let versionActual = formData.get("version") as string;
      if (huboCambios && versionActual) {
        // Parsear la versión (ej: "1.0" -> [1, 0])
        const partes = versionActual.split('.');
        if (partes.length >= 2) {
          const mayor = parseInt(partes[0]) || 1;
          const menor = parseInt(partes[1]) || 0;
          // Incrementar el número menor
          versionActual = `${mayor}.${menor + 1}`;

          toast.info(`Cambios detectados. Versión actualizada a ${versionActual}`);
        }
      }

      // Convert FormData to JSON object with backend field names
      const documentData: any = {
        codigo: formData.get("codigoDocumento") as string,
        nombre: formData.get("nombreArchivo") as string,
        descripcion: nuevoContenido || `Documento ${formData.get("nombreArchivo")}`,
        tipo_documento: formData.get("tipoDocumento") as string,
        version_actual: versionActual,
        estado: formData.get("estado") as string,
      };

      // Add optional fields
      const creado_por = formData.get("subidoPor") as string;
      if (creado_por) {
        documentData.creado_por = creado_por;
      }

      const aprobado_por = formData.get("aprobadoPor") as string;
      if (aprobado_por) {
        documentData.aprobado_por = aprobado_por;
      }

      // Si hubo cambios, guardar la versión anterior en el historial
      if (huboCambios && initialData) {
        try {
          await documentoService.createVersion({
            documento_id: id,
            version: initialData.version || '1.0',
            descripcion_cambios: 'Versión anterior guardada automáticamente antes de actualizar',
            creado_por: user?.id || undefined
          });
          console.log('✅ Versión anterior guardada en historial');
        } catch (versionError) {
          console.error('⚠️ Error al guardar versión anterior:', versionError);
          // Continuar con la actualización aunque falle el guardado de versión
        }
      }

      await documentoService.update(id, documentData);

      setSuccess("Documento actualizado exitosamente");
      toast.success("Documento actualizado exitosamente");
      setTimeout(() => navigate(`/documentos/${id}`), 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al actualizar documento";
      setError(errorMessage);
      toast.error(errorMessage);
    }
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

  if (error && !initialData) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">
            Error al cargar documento
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
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

        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Editar Documento</h1>
            <p className="text-muted-foreground mt-2">
              Modifica la información del documento
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500 text-green-600 rounded-md flex items-start gap-3">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {initialData && (
        <DocumentFormWithTipTap
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/documentos/${id}`)}
          initialData={initialData}
          mode="edit"
        />
      )}
    </div>
  );
}
