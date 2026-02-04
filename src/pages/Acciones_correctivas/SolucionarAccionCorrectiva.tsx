import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, Calendar, FileText, AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { accionCorrectivaService, AccionCorrectiva } from "@/services/accionCorrectiva.service";

export default function SolucionarAccionCorrectiva() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [accion, setAccion] = useState<AccionCorrectiva | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Campos del formulario
    const [fechaImplementacion, setFechaImplementacion] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [evidencias, setEvidencias] = useState("");

    useEffect(() => {
        if (id) {
            fetchAccion();
        }
    }, [id]);

    const fetchAccion = async () => {
        try {
            setLoading(true);
            const data = await accionCorrectivaService.getById(id!);
            setAccion(data);

            // Pre-llenar campos si ya existen
            if (data.fechaImplementacion) {
                setFechaImplementacion(new Date(data.fechaImplementacion).toISOString().split('T')[0]);
            }
            if (data.observacion) {
                setObservaciones(data.observacion);
            }
        } catch (error: any) {
            console.error("Error al cargar acción correctiva:", error);
            toast.error("Error al cargar la acción correctiva");
            navigate("/Acciones_correctivas_EnProceso");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fechaImplementacion) {
            toast.error("Por favor ingresa la fecha de implementación");
            return;
        }

        try {
            setSubmitting(true);

            // Actualizar la acción correctiva
            await accionCorrectivaService.update(id!, {
                fechaImplementacion,
                observacion: observaciones,
                estado: "implementada"
            });

            toast.success("Acción correctiva implementada exitosamente");
            navigate("/Acciones_correctivas_EnProceso");
        } catch (error: any) {
            console.error("Error al implementar acción:", error);
            toast.error(error.response?.data?.detail || "Error al implementar la acción correctiva");
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarcarVerificada = async () => {
        try {
            setSubmitting(true);

            await accionCorrectivaService.verificar(id!, observaciones);

            toast.success("Acción correctiva verificada exitosamente");
            navigate("/Acciones_correctivas_Verificadas");
        } catch (error: any) {
            console.error("Error al verificar acción:", error);
            toast.error(error.response?.data?.detail || "Error al verificar la acción correctiva");
        } finally {
            setSubmitting(false);
        }
    };

    const getTipoBadge = (tipo: string) => {
        const labels: Record<string, string> = {
            correctiva: "Correctiva",
            preventiva: "Preventiva",
            mejora: "Mejora",
        };
        return labels[tipo] || tipo;
    };

    const getEstadoBadge = (estado: string) => {
        const config: Record<string, { bg: string; text: string; border: string }> = {
            pendiente: { bg: "bg-[#F8FAFC]", text: "text-[#6B7280]", border: "border-[#E5E7EB]" },
            en_proceso: { bg: "bg-[#E0EDFF]", text: "text-[#2563EB]", border: "border-[#2563EB]/30" },
            implementada: { bg: "bg-[#ECFDF5]", text: "text-[#10B981]", border: "border-[#10B981]/30" },
            verificada: { bg: "bg-[#FFF7ED]", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
        };
        const c = config[estado] || { bg: "bg-[#F8FAFC]", text: "text-[#6B7280]", border: "border-[#E5E7EB]" };
        const label = {
            pendiente: "Pendiente",
            en_proceso: "En Proceso",
            implementada: "Implementada",
            verificada: "Verificada",
        }[estado] || estado;

        return (
            <Badge variant="outline" className={`${c.bg} ${c.text} ${c.border}`}>
                {label}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F5F7FA]">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent" />
                    <p className="mt-4 text-lg font-medium text-[#6B7280]">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!accion) {
        return (
            <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-20 text-center">
                        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold mb-2 text-[#1E3A8A]">
                            Acción Correctiva no encontrada
                        </h2>
                        <p className="text-[#6B7280] mb-6">
                            La acción correctiva que buscas no existe o fue eliminada
                        </p>
                        <Button onClick={() => navigate("/Acciones_correctivas_EnProceso")}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-gradient-to-br from-[#E0EDFF] to-[#C7D2FE] rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
                    <button
                        onClick={() => navigate("/Acciones_correctivas_EnProceso")}
                        className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1E3A8A] mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a acciones en proceso
                    </button>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
                                <CheckCircle className="h-9 w-9 text-[#2563EB]" />
                                Dar Solución a Acción Correctiva
                            </h1>
                            <p className="text-[#6B7280] mt-2 text-lg font-mono">
                                {accion.codigo}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {getEstadoBadge(accion.estado)}
                            <Badge variant="outline" className="capitalize">
                                {getTipoBadge(accion.tipo)}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Información de la Acción Correctiva */}
                <Card className="rounded-2xl shadow-sm border-[#E5E7EB]">
                    <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                        <CardTitle className="text-lg text-[#1E3A8A]">Información de la Acción</CardTitle>
                        <CardDescription>Detalles de la acción correctiva</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label className="text-[#6B7280] uppercase text-xs font-bold">Descripción</Label>
                                <p className="mt-2 text-[#111827]">{accion.descripcion || "Sin descripción"}</p>
                            </div>
                            <div>
                                <Label className="text-[#6B7280] uppercase text-xs font-bold">Fecha Compromiso</Label>
                                <p className="mt-2 text-[#111827]">
                                    {accion.fechaCompromiso
                                        ? new Date(accion.fechaCompromiso).toLocaleDateString("es-CO")
                                        : "No definida"}
                                </p>
                            </div>
                        </div>

                        {accion.analisisCausaRaiz && (
                            <div>
                                <Label className="text-[#6B7280] uppercase text-xs font-bold">Análisis de Causa Raíz</Label>
                                <div className="mt-2 p-4 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                                    <p className="text-[#111827] leading-relaxed">{accion.analisisCausaRaiz}</p>
                                </div>
                            </div>
                        )}

                        {accion.planAccion && (
                            <div>
                                <Label className="text-[#6B7280] uppercase text-xs font-bold">Plan de Acción</Label>
                                <div className="mt-2 p-4 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                                    <p className="text-[#111827] leading-relaxed">{accion.planAccion}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Formulario de Implementación */}
                <form onSubmit={handleSubmit}>
                    <Card className="rounded-2xl shadow-sm border-[#E5E7EB]">
                        <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                            <CardTitle className="text-lg text-[#1E3A8A]">Registro de Implementación</CardTitle>
                            <CardDescription>
                                Completa la información sobre la implementación de la acción correctiva
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Fecha de Implementación */}
                            <div>
                                <Label htmlFor="fechaImplementacion" className="text-[#1E3A8A] font-semibold">
                                    Fecha de Implementación <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative mt-2">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
                                    <Input
                                        id="fechaImplementacion"
                                        type="date"
                                        value={fechaImplementacion}
                                        onChange={(e) => setFechaImplementacion(e.target.value)}
                                        className="pl-10 py-6 rounded-xl border-[#E5E7EB]"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <Label htmlFor="observaciones" className="text-[#1E3A8A] font-semibold">
                                    Observaciones de Implementación
                                </Label>
                                <Textarea
                                    id="observaciones"
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    placeholder="Describe cómo se implementó la acción correctiva, resultados obtenidos, etc."
                                    className="mt-2 min-h-[150px] rounded-xl border-[#E5E7EB]"
                                />
                            </div>

                            {/* Evidencias (opcional - para futuro) */}
                            <div>
                                <Label htmlFor="evidencias" className="text-[#1E3A8A] font-semibold">
                                    Evidencias (Opcional)
                                </Label>
                                <Textarea
                                    id="evidencias"
                                    value={evidencias}
                                    onChange={(e) => setEvidencias(e.target.value)}
                                    placeholder="Enlaces a documentos, fotos, registros, etc."
                                    className="mt-2 min-h-[100px] rounded-xl border-[#E5E7EB]"
                                />
                                <p className="text-xs text-[#6B7280] mt-2">
                                    Puedes incluir enlaces o descripciones de las evidencias de implementación
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botones de Acción */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-6 rounded-xl font-semibold shadow-sm transition-all"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {submitting ? "Guardando..." : "Marcar como Implementada"}
                        </Button>

                        <Button
                            type="button"
                            onClick={handleMarcarVerificada}
                            disabled={submitting || !fechaImplementacion}
                            className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white py-6 rounded-xl font-semibold shadow-sm transition-all"
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            {submitting ? "Verificando..." : "Marcar como Verificada"}
                        </Button>

                        <Button
                            type="button"
                            onClick={() => navigate("/Acciones_correctivas_EnProceso")}
                            variant="outline"
                            className="sm:w-auto py-6 rounded-xl font-semibold border-[#E5E7EB]"
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
