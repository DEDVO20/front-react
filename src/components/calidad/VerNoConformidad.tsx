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

                        {noConformidad.evidencias && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 mb-2">
                                    Evidencias
                                </h4>
                                <div className="flex flex-col gap-2">
                                    {(() => {
                                        try {
                                            const evidencias = typeof noConformidad.evidencias === 'string'
                                                ? JSON.parse(noConformidad.evidencias)
                                                : noConformidad.evidencias;

                                            if (!Array.isArray(evidencias)) return null;

                                            return evidencias.map((ev: any, index: number) => (
                                                <a
                                                    key={index}
                                                    href={ev.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center p-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors w-fit border border-blue-200"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                    {ev.name}
                                                </a>
                                            ));
                                        } catch (e) {
                                            return <p className="text-sm text-gray-500 italic">Error al mostrar evidencias</p>;
                                        }
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
