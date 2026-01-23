import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentFormWithTipTap } from "@/components/documents/DocumentFormWithTipTap";
import { documentoService } from "@/services/documento.service";
import { uploadFileToSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function CreateDocument() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setError(null);

      // Check if there's a file to upload
      const file = formData.get("archivo") as File | null;

      if (file) {
        setUploading(true);
        toast.info("Subiendo archivo a Supabase...");

        // Upload file to Supabase Storage
        const timestamp = Date.now();
        const filename = `documentos/${timestamp}-${file.name}`;

        const { url } = await uploadFileToSupabase(file, filename, "documentos");

        // Remove file from FormData and add URL instead
        formData.delete("archivo");
        formData.append("url", url);

        toast.success("Archivo subido correctamente");
        setUploading(false);
      }

      await documentoService.create(formData);

      setSuccess("Documento creado exitosamente");
      toast.success("Documento creado exitosamente");
      setTimeout(() => navigate("/documentos"), 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setError(errorMessage);
      toast.error(errorMessage);
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Crear Nuevo Documento</h1>
        <p className="text-muted-foreground mt-2">
          Complete el formulario para crear un documento
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500 text-green-600 rounded-md flex items-start gap-3">
          <CheckCircle className="w-5 h-5 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      {uploading && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500 text-blue-600 rounded-md flex items-start gap-3">
          <div className="w-5 h-5 mt-0.5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <p>Subiendo archivo a Supabase Storage...</p>
        </div>
      )}

      <DocumentFormWithTipTap
        onSubmit={handleSubmit}
        onCancel={() => navigate("/documentos")}
        mode="create"
      />
    </div>
  );
}
