import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Network,
    TrendingUp,
    Cog,
    BarChart3,
    Target,
    Plus,
    Filter,
    Search,
    Eye,
    Edit,
    Trash2,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import procesoService, { Proceso, TipoProceso, EstadoProceso } from "@/services/proceso.service";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function MapaProcesos() {
    const navigate = useNavigate();
    const [procesos, setProcesos] = useState<Proceso[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [filtroTipo, setFiltroTipo] = useState<string>("todos");
    const [filtroEstado, setFiltroEstado] = useState<string>("todos");

    // Estado para el diálogo de eliminación
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        proceso: Proceso | null;
    }>({
        open: false,
        proceso: null
    });

    useEffect(() => {
        cargarProcesos();
    }, []);

    const cargarProcesos = async () => {
        try {
            setLoading(true);
            const data = await procesoService.listar();
            setProcesos(data);
        } catch (error) {
            console.error("Error cargando procesos:", error);
            toast.error("Error al cargar los procesos");
        } finally {
            setLoading(false);
        }
    };

    const abrirDialogoEliminar = (proceso: Proceso) => {
        setDeleteDialog({
            open: true,
            proceso
        });
    };

    const cerrarDialogoEliminar = () => {
        setDeleteDialog({
            open: false,
            proceso: null
        });
    };

    const confirmarEliminar = async () => {
        if (!deleteDialog.proceso) return;

        try {
            await procesoService.eliminar(deleteDialog.proceso.id);
            toast.success(`Proceso "${deleteDialog.proceso.nombre}" eliminado exitosamente`);
            cerrarDialogoEliminar();
            cargarProcesos(); // Recargar la lista
        } catch (error: any) {
            console.error("Error eliminando proceso:", error);
            toast.error(error.response?.data?.detail || "Error al eliminar el proceso");
        }
    };

    const procesosFiltrados = procesos.filter(proceso => {
        const matchBusqueda =
            proceso.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            proceso.codigo.toLowerCase().includes(busqueda.toLowerCase());

        const matchTipo = filtroTipo === "todos" || proceso.tipo_proceso === filtroTipo;
        const matchEstado = filtroEstado === "todos" || proceso.estado === filtroEstado;

        return matchBusqueda && matchTipo && matchEstado;
    });

    const procesosAgrupados = {
        estrategico: procesosFiltrados.filter(p => p.tipo_proceso === TipoProceso.ESTRATEGICO),
        operativo: procesosFiltrados.filter(p => p.tipo_proceso === TipoProceso.OPERATIVO),
        apoyo: procesosFiltrados.filter(p => p.tipo_proceso === TipoProceso.APOYO),
        medicion: procesosFiltrados.filter(p => p.tipo_proceso === TipoProceso.MEDICION),
    };

    const getIconoPorTipo = (tipo?: TipoProceso) => {
        switch (tipo) {
            case TipoProceso.ESTRATEGICO:
                return <Target className="h-5 w-5" />;
            case TipoProceso.OPERATIVO:
                return <Cog className="h-5 w-5" />;
            case TipoProceso.APOYO:
                return <TrendingUp className="h-5 w-5" />;
            case TipoProceso.MEDICION:
                return <BarChart3 className="h-5 w-5" />;
            default:
                return <Network className="h-5 w-5" />;
        }
    };

    const getColorPorTipo = (tipo?: TipoProceso) => {
        switch (tipo) {
            case TipoProceso.ESTRATEGICO:
                return "bg-purple-500";
            case TipoProceso.OPERATIVO:
                return "bg-blue-500";
            case TipoProceso.APOYO:
                return "bg-green-500";
            case TipoProceso.MEDICION:
                return "bg-orange-500";
            default:
                return "bg-gray-500";
        }
    };

    const getEstadoBadge = (estado: EstadoProceso) => {
        const configs = {
            [EstadoProceso.ACTIVO]: {
                icon: CheckCircle,
                className: "bg-green-100 text-green-800 border-green-200"
            },
            [EstadoProceso.BORRADOR]: {
                icon: Edit,
                className: "bg-gray-100 text-gray-800 border-gray-200"
            },
            [EstadoProceso.REVISION]: {
                icon: Clock,
                className: "bg-yellow-100 text-yellow-800 border-yellow-200"
            },
            [EstadoProceso.SUSPENDIDO]: {
                icon: AlertCircle,
                className: "bg-orange-100 text-orange-800 border-orange-200"
            },
            [EstadoProceso.OBSOLETO]: {
                icon: XCircle,
                className: "bg-red-100 text-red-800 border-red-200"
            },
        };

        const config = configs[estado];
        const Icon = config.icon;

        return (
            <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
                <Icon className="h-3 w-3" />
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </Badge>
        );
    };

    const TarjetaProceso = ({ proceso }: { proceso: Proceso }) => (
        <Card className="group hover:shadow-lg transition-all duration-200 border-l-4"
            style={{ borderLeftColor: getColorPorTipo(proceso.tipo_proceso).replace('bg-', '#') }}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getColorPorTipo(proceso.tipo_proceso)} bg-opacity-10`}>
                            {getIconoPorTipo(proceso.tipo_proceso)}
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-gray-900">
                                {proceso.nombre}
                            </CardTitle>
                            <p className="text-sm text-gray-500 mt-1">{proceso.codigo}</p>
                        </div>
                    </div>
                    {getEstadoBadge(proceso.estado)}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {proceso.objetivo && (
                    <p className="text-sm text-gray-600 line-clamp-2">{proceso.objetivo}</p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                        {proceso.version && (
                            <span className="flex items-center gap-1">
                                <span className="font-medium">v{proceso.version}</span>
                            </span>
                        )}
                        {proceso.responsable_nombre && (
                            <span className="truncate max-w-[150px]">
                                👤 {proceso.responsable_nombre}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/procesos/${proceso.id}`)}
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/procesos/${proceso.id}/editar`)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => abrirDialogoEliminar(proceso)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const SeccionProcesos = ({
        titulo,
        icono,
        color,
        procesos
    }: {
        titulo: string;
        icono: React.ReactNode;
        color: string;
        procesos: Proceso[]
    }) => (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color} text-white`}>
                    {icono}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{titulo}</h2>
                    <p className="text-sm text-gray-500">{procesos.length} proceso(s)</p>
                </div>
            </div>

            {procesos.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-8 text-center text-gray-500">
                        <Network className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>No hay procesos en esta categoría</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {procesos.map(proceso => (
                        <TarjetaProceso key={proceso.id} proceso={proceso} />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-gradient-to-br from-[#E0EDFF] to-[#C7D2FE] rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
                                <Network className="h-9 w-9 text-[#2563EB]" />
                                Mapa de Procesos ISO 9001
                            </h1>
                            <p className="text-[#6B7280] mt-2 text-lg">
                                Gestión de procesos del Sistema de Gestión de Calidad
                            </p>
                        </div>
                        <Button
                            onClick={() => navigate("/procesos/nuevo")}
                            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl px-6 py-5 h-auto font-bold"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Nuevo Proceso
                        </Button>
                    </div>
                </div>

                {/* Filtros */}
                <Card className="rounded-2xl shadow-sm">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar por nombre o código..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="pl-10 rounded-xl"
                                />
                            </div>

                            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Tipo de proceso" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos los tipos</SelectItem>
                                    <SelectItem value="estrategico">Estratégicos</SelectItem>
                                    <SelectItem value="operativo">Operativos</SelectItem>
                                    <SelectItem value="apoyo">Apoyo</SelectItem>
                                    <SelectItem value="medicion">Medición</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos los estados</SelectItem>
                                    <SelectItem value="activo">Activo</SelectItem>
                                    <SelectItem value="borrador">Borrador</SelectItem>
                                    <SelectItem value="revision">En Revisión</SelectItem>
                                    <SelectItem value="suspendido">Suspendido</SelectItem>
                                    <SelectItem value="obsoleto">Obsoleto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Procesos Agrupados */}
                {loading ? (
                    <LoadingSpinner message="Cargando Procesos" />
                ) : (
                    <div className="space-y-8">
                        <SeccionProcesos
                            titulo="Procesos Estratégicos"
                            icono={<Target className="h-5 w-5" />}
                            color="bg-purple-500"
                            procesos={procesosAgrupados.estrategico}
                        />

                        <SeccionProcesos
                            titulo="Procesos Operativos"
                            icono={<Cog className="h-5 w-5" />}
                            color="bg-blue-500"
                            procesos={procesosAgrupados.operativo}
                        />

                        <SeccionProcesos
                            titulo="Procesos de Apoyo"
                            icono={<TrendingUp className="h-5 w-5" />}
                            color="bg-green-500"
                            procesos={procesosAgrupados.apoyo}
                        />

                        <SeccionProcesos
                            titulo="Procesos de Medición y Mejora"
                            icono={<BarChart3 className="h-5 w-5" />}
                            color="bg-orange-500"
                            procesos={procesosAgrupados.medicion}
                        />
                    </div>
                )}
            </div>

            {/* Diálogo de confirmación de eliminación */}
            <AlertDialog open={deleteDialog.open} onOpenChange={cerrarDialogoEliminar}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[#1E3A8A]">
                            ¿Eliminar proceso?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-4">
                                <p>
                                    ¿Estás seguro de que deseas eliminar el proceso{" "}
                                    <span className="font-semibold text-gray-900">
                                        {deleteDialog.proceso?.nombre}
                                    </span>{" "}
                                    ({deleteDialog.proceso?.codigo})?
                                </p>
                                <p className="text-red-600 font-medium">
                                    Esta acción no se puede deshacer. Se eliminarán también todas las etapas,
                                    indicadores y relaciones asociadas a este proceso.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cerrarDialogoEliminar}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmarEliminar}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
