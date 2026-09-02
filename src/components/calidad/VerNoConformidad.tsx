import { VistaDocumentoSGCDialog } from "@/components/documents/VistaDocumentoSGCDialog";
import { NoConformidad } from "@/services/noConformidad.service";
import { datosSGCDesdeNoConformidad } from "@/utils/documentosRegistrosSGC";

interface VerNoConformidadProps {
    noConformidad: NoConformidad | null;
    open: boolean;
    onClose: () => void;
}

export function VerNoConformidad({
    noConformidad,
    open,
    onClose,
}: VerNoConformidadProps) {
    return (
        <VistaDocumentoSGCDialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) onClose();
            }}
            data={noConformidad ? datosSGCDesdeNoConformidad(noConformidad) : null}
            title="No conformidad"
            description="Documento controlado con el detalle de la no conformidad y su tratamiento."
        />
    );
}
