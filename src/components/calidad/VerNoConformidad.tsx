import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { NoConformidad } from "@/services/noConformidad.service";

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
    if (!noConformidad) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        {noConformidad.codigo}
                        <Badge
                            className={`${noConformidad.estado === "abierta"
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                : noConformidad.estado === "en_tratamiento"
                                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                }`}
                        >
                            {noConformidad.estado.replace("_", " ").toUpperCase()}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500">Tipo</h4>
                            <p className="text-gray-900">{noConformidad.tipo || "N/A"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500">Gravedad</h4>
                            <Badge variant="outline">{noConformidad.gravedad || "N/A"}</Badge>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500">
                                Fecha de Detección
                            </h4>
                            <p className="text-gray-900">
                                {noConformidad.fecha_deteccion
                                    ? new Date(noConformidad.fecha_deteccion).toLocaleDateString()
                                    : "N/A"}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500">Proceso</h4>
                            <p className="text-gray-900">
                                {noConformidad.proceso
                                    ? noConformidad.proceso.nombre
                                    : (noConformidad.proceso_id || "N/A")}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500">Detectado Por</h4>
                            <p className="text-gray-900">
                                {noConformidad.detector
                                    ? `${noConformidad.detector.nombre} ${noConformidad.detector.primerApellido}`
                                    : (noConformidad.detectado_por || "N/A")}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500">Fuente</h4>
                            <p className="text-gray-900">{noConformidad.fuente || "N/A"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500">Responsable</h4>
                            <p className="text-gray-900">
                                {noConformidad.responsable
                                    ? `${noConformidad.responsable.nombre} ${noConformidad.responsable.primerApellido}`
                                    : "Sin asignar"}
                            </p>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500">
                                Descripción
                            </h4>
                            <div className="bg-gray-50 p-4 rounded-lg text-gray-900 whitespace-pre-wrap">
                                {noConformidad.descripcion}
                            </div>
                        </div>

                        {noConformidad.analisis_causa && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500">
                                    Análisis de Causa
                                </h4>
                                <div className="bg-gray-50 p-4 rounded-lg text-gray-900 whitespace-pre-wrap">
                                    {noConformidad.analisis_causa}
                                </div>
                            </div>
                        )}

                        {noConformidad.plan_accion && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500">
                                    Plan de Acción
                                </h4>
                                <div className="bg-gray-50 p-4 rounded-lg text-gray-900 whitespace-pre-wrap">
                                    {noConformidad.plan_accion}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
