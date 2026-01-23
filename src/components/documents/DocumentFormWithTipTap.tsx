import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { TipTapEditor } from "./TipTapEditor";
import { FileUpload } from "./FileUpload";
import { usuarioService, Usuario } from "@/services/usuario.service";
import { toast } from "sonner";
import { Save, Eye, Download, FileText, Upload as UploadIcon, Edit } from "lucide-react";

interface InitialData {
  nombreArchivo?: string;
  tipoDocumento?: string;
  codigoDocumento?: string;
  version?: string;
  visibilidad?: string;
  estado?: string;
  proximaRevision?: string;
  subidoPor?: string;
  revisadoPor?: string;
  aprobadoPor?: string;
  contenidoHtml?: string;
}

interface DocumentFormWithTipTapProps {
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  initialData?: InitialData;
  mode: "create" | "edit";
}

export const DocumentFormWithTipTap = ({
  onSubmit,
  onCancel,
  initialData,
  mode,
}: DocumentFormWithTipTapProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Document creation mode: 'editor' or 'upload'
  const [documentMode, setDocumentMode] = useState<'editor' | 'upload'>('editor');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nombreArchivo: initialData?.nombreArchivo || "",
    tipoDocumento: initialData?.tipoDocumento || "formato",
    codigoDocumento: initialData?.codigoDocumento || "",
    version: initialData?.version || "1.0",
    visibilidad: initialData?.visibilidad || "privado",
    estado: initialData?.estado || "borrador",
    proximaRevision: initialData?.proximaRevision || "",
    subidoPor: initialData?.subidoPor || user?.id || "",
    revisadoPor: initialData?.revisadoPor || "",
    aprobadoPor: initialData?.aprobadoPor || "",
  });

  const [content, setContent] = useState(initialData?.contenidoHtml || "");

  // Cargar usuarios activos
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const usuarios = await usuarioService.getAllActive();
        setUsuarios(usuarios);
      } catch (error) {
        console.error("❌ Error al cargar usuarios:", error);
        toast.error("Error al cargar la lista de usuarios");
      }
    };
    fetchUsuarios();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombreArchivo.trim()) {
      newErrors.nombreArchivo = "El nombre del archivo es requerido";
    }
    if (!formData.codigoDocumento.trim()) {
      newErrors.codigoDocumento = "El código del documento es requerido";
    }
    if (!formData.version.trim()) {
      newErrors.version = "La versión es requerida";
    }
    if (!formData.subidoPor) {
      newErrors.subidoPor = "Debe seleccionar quien creó el documento";
    }

    // Validate content based on mode
    if (documentMode === 'editor') {
      if (!content.trim() || content === "<p></p>") {
        newErrors.content = "El contenido del documento es requerido";
      }
    } else if (documentMode === 'upload') {
      if (!uploadedFile) {
        newErrors.file = "Debe seleccionar un archivo para subir";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Crear FormData para enviar al backend
      const data = new FormData();
      // Mapear campos requeridos por el backend
      data.append("codigo", formData.codigoDocumento);
      data.append("nombre", formData.nombreArchivo);
      data.append("descripcion", `Documento ${formData.nombreArchivo}`); // Descripción por defecto

      data.append("nombreArchivo", formData.nombreArchivo);
      data.append("tipoDocumento", formData.tipoDocumento);
      data.append("codigoDocumento", formData.codigoDocumento);
      data.append("version", formData.version);
      data.append("visibilidad", formData.visibilidad);
      data.append("estado", formData.estado);
      data.append("subidoPor", formData.subidoPor);

      // Add content based on mode
      if (documentMode === 'editor') {
        data.append("contenidoHtml", content);
      } else if (documentMode === 'upload' && uploadedFile) {
        data.append("archivo", uploadedFile);
      }

      if (formData.proximaRevision) {
        data.append("proximaRevision", formData.proximaRevision);
      }
      if (formData.revisadoPor) {
        data.append("revisadoPor", formData.revisadoPor);
      }
      if (formData.aprobadoPor) {
        data.append("aprobadoPor", formData.aprobadoPor);
      }

      await onSubmit(data);
    } catch (error) {
      console.error("Error al enviar formulario:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${formData.nombreArchivo}</title>
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
              <h1>${formData.nombreArchivo}</h1>
            </div>

            <div class="metadata">
              <div class="metadata-item">
                <span class="metadata-label">Código:</span> ${formData.codigoDocumento}
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Versión:</span> ${formData.version}
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Tipo:</span> ${formData.tipoDocumento}
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Estado:</span> ${formData.estado}
              </div>
            </div>

            <div class="content">
              ${content}
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información del Documento */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Información del Documento</h3>
        </div>

        {/* Nota sobre flujo de aprobación */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Flujo de aprobación:</strong> El documento debe pasar por 3
            etapas: 1️⃣ Creación (Borrador) → 2️⃣ Revisión (En Revisión) → 3️⃣
            Aprobación Final (Aprobado)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Nombre del Archivo */}
          <div className="col-span-3">
            <label className="block text-sm font-medium mb-2">
              Nombre del Documento *
            </label>
            <input
              type="text"
              name="nombreArchivo"
              value={formData.nombreArchivo}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md bg-background ${errors.nombreArchivo ? "border-destructive" : "border-input"
                }`}
              placeholder="Ej: Formato de Solicitud de Equipos"
            />
            {errors.nombreArchivo && (
              <p className="text-destructive text-sm mt-1">
                {errors.nombreArchivo}
              </p>
            )}
          </div>

          {/* Código del Documento */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Código del Documento *
            </label>
            <input
              type="text"
              name="codigoDocumento"
              value={formData.codigoDocumento}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md bg-background ${errors.codigoDocumento ? "border-destructive" : "border-input"
                }`}
              placeholder="Ej: FO-GC-001"
            />
            {errors.codigoDocumento && (
              <p className="text-destructive text-sm mt-1">
                {errors.codigoDocumento}
              </p>
            )}
          </div>

          {/* Versión */}
          <div>
            <label className="block text-sm font-medium mb-2">Versión *</label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md bg-background ${errors.version ? "border-destructive" : "border-input"
                }`}
              placeholder="Ej: 1.0"
            />
            {errors.version && (
              <p className="text-destructive text-sm mt-1">{errors.version}</p>
            )}
          </div>

          {/* Tipo de Documento */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tipo de Documento *
            </label>
            <select
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="formato">Formato</option>
              <option value="procedimiento">Procedimiento</option>
              <option value="instructivo">Instructivo</option>
              <option value="manual">Manual</option>
              <option value="politica">Política</option>
              <option value="registro">Registro</option>
              <option value="plan">Plan</option>
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium mb-2">Estado *</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="borrador">Borrador (Creado)</option>
              <option value="en_revision">En Revisión (Revisado)</option>
              <option value="aprobado">Aprobado (Final)</option>
              <option value="obsoleto">Obsoleto</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              {formData.estado === "borrador" && "📝 Documento en creación"}
              {formData.estado === "en_revision" &&
                "👁️ Documento en proceso de revisión"}
              {formData.estado === "aprobado" &&
                "✅ Documento aprobado y vigente"}
              {formData.estado === "obsoleto" && "❌ Documento descontinuado"}
            </p>
          </div>

          {/* Visibilidad */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Visibilidad *
            </label>
            <select
              name="visibilidad"
              value={formData.visibilidad}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="privado">Privado</option>
              <option value="publico">Público</option>
            </select>
          </div>

          {/* Próxima Revisión */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Próxima Revisión
            </label>
            <input
              type="date"
              name="proximaRevision"
              value={formData.proximaRevision}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            />
          </div>
        </div>
      </div>

      {/* Responsables - Flujo de Aprobación */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Flujo de Aprobación</h3>
          <p className="text-sm text-muted-foreground mt-1">
            El documento pasa por 3 etapas: Creación → Revisión → Aprobación
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Creado por */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <span className="inline-flex items-center gap-1">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold">
                  1
                </span>
                Creado por *
              </span>
            </label>
            <select
              name="subidoPor"
              value={formData.subidoPor}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md bg-background ${errors.subidoPor ? "border-destructive" : "border-input"
                }`}
            >
              <option value="">Seleccionar usuario</option>
              {usuarios?.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre} {usuario.primerApellido}
                </option>
              ))}
            </select>
            {errors.subidoPor && (
              <p className="text-destructive text-sm mt-1">
                {errors.subidoPor}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Persona que crea el documento
            </p>
          </div>

          {/* 2. Revisado por */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <span className="inline-flex items-center gap-1">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold">
                  2
                </span>
                Revisado por
              </span>
            </label>
            <select
              name="revisadoPor"
              value={formData.revisadoPor}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="">Seleccionar (opcional)</option>
              {usuarios?.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre} {usuario.primerApellido}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Persona que revisa el documento
            </p>
          </div>

          {/* 3. Aprobado por */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <span className="inline-flex items-center gap-1">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs font-bold">
                  3
                </span>
                Aprobado por
              </span>
            </label>
            <select
              name="aprobadoPor"
              value={formData.aprobadoPor}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="">Seleccionar (opcional)</option>
              {usuarios?.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre} {usuario.primerApellido}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Jefe del área que aprueba
            </p>
          </div>
        </div>

        {/* Indicador visual del flujo */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mb-2">
                1
              </div>
              <p className="text-xs font-medium text-center">Creación</p>
              <p className="text-xs text-muted-foreground text-center">
                Borrador
              </p>
            </div>
            <div className="flex-1 h-0.5 bg-border mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold mb-2">
                2
              </div>
              <p className="text-xs font-medium text-center">Revisión</p>
              <p className="text-xs text-muted-foreground text-center">
                En Revisión
              </p>
            </div>
            <div className="flex-1 h-0.5 bg-border mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mb-2">
                3
              </div>
              <p className="text-xs font-medium text-center">Aprobación</p>
              <p className="text-xs text-muted-foreground text-center">
                Aprobado
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Editor or Upload */}
      <div className="bg-card p-6 rounded-lg border border-border">
        {/* Mode Selection Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-border">
            <button
              type="button"
              onClick={() => setDocumentMode('editor')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${documentMode === 'editor'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <Edit className="w-4 h-4" />
              Crear con Editor
            </button>
            <button
              type="button"
              onClick={() => setDocumentMode('upload')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${documentMode === 'upload'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <UploadIcon className="w-4 h-4" />
              Subir Archivo
            </button>
          </div>
        </div>

        {/* Editor Mode */}
        {documentMode === 'editor' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Contenido del Documento</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreview(!preview)}
                  className="flex items-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {preview ? "Editar" : "Vista Previa"}
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exportar PDF
                </button>
              </div>
            </div>

            <TipTapEditor
              content={content}
              onChange={setContent}
              editable={!preview}
            />
            {errors.content && (
              <p className="text-destructive text-sm mt-2">{errors.content}</p>
            )}
          </>
        )}

        {/* Upload Mode */}
        {documentMode === 'upload' && (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Subir Archivo Existente</h3>
              <p className="text-sm text-muted-foreground">
                Sube un documento existente (PDF, Word, Excel, etc.) a Supabase Storage
              </p>
            </div>

            <FileUpload
              onFileSelect={setUploadedFile}
              selectedFile={uploadedFile}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              maxSize={10}
            />
            {errors.file && (
              <p className="text-destructive text-sm mt-2">{errors.file}</p>
            )}
          </>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2 border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading
            ? "Guardando..."
            : mode === "create"
              ? "Crear Documento"
              : "Actualizar Documento"}
        </button>
      </div>
    </form>
  );
};
