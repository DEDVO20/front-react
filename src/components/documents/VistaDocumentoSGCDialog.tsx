import { useEffect, useState, type ReactNode } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentoSGCPaper } from "@/components/documents/DocumentoSGCPaper";
import {
  cargarMarcaSGC,
  exportarDocumentoSGC,
  type DocumentoSGCData,
  type MarcaSGC,
} from "@/utils/documentoSGC";

interface VistaDocumentoSGCDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DocumentoSGCData | null;
  title?: string;
  description?: string;
  extraActions?: ReactNode;
}

export function VistaDocumentoSGCDialog({
  open,
  onOpenChange,
  data,
  title = "Documento controlado",
  description = "Formato oficial del Sistema de Gestión de Calidad.",
  extraActions,
}: VistaDocumentoSGCDialogProps) {
  const [marca, setMarca] = useState<MarcaSGC>({
    logoUrl: null,
    titulo: "Universitaria de Colombia",
    subtitulo: "Sistema de Gestión de Calidad",
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!open) return;
    cargarMarcaSGC().then(setMarca);
  }, [open]);

  const handleExportPDF = async () => {
    if (!data) return;
    try {
      setExporting(true);
      await exportarDocumentoSGC(data, marca);
      toast.success("Seleccione 'Guardar como PDF' en el cuadro de impresión");
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      toast.error(
        error instanceof Error ? error.message : "No se pudo generar el PDF del documento",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl rounded-2xl max-h-[92vh] overflow-hidden p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
          <DialogTitle className="text-2xl font-bold text-[#1E3A8A]">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(92vh-180px)] bg-[#F8FAFC] p-3 sm:p-6">
          {data ? (
            <div className="min-w-[640px] max-w-[816px] mx-auto border border-[#E5E7EB] shadow-sm bg-white">
              <DocumentoSGCPaper data={data} marca={marca} />
            </div>
          ) : (
            <p className="text-center text-[#6B7280] py-16">No hay información para mostrar.</p>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[#E5E7EB] bg-white gap-2 flex-wrap sm:justify-end">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button
            className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            onClick={handleExportPDF}
            disabled={!data || exporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Generando PDF..." : "Exportar PDF"}
          </Button>
          {extraActions}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
