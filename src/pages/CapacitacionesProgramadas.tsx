import { useEffect, useState } from "react";
import {
  GraduationCap,
  Plus,
  Laptop,
  MapPin,
  Calendar,
  Clock,
  Tag,
  Users,
  Link as LinkIcon,
  Eye,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { capacitacionService, Capacitacion } from "@/services/capacitacion.service";

export default function CapacitacionesProgramadas() {
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedCap, setSelectedCap] = useState<Capacitacion | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    tipoCapacitacion: '',
    modalidad: 'Virtual' as 'Virtual' | 'Presencial',
    fechaProgramada: '',
    duracionHoras: '' as string | number, // CAMBIO: Permitir string vacío para el input
    lugar: '',
    instructor: '',
  });
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; cap: Capacitacion | null }>({
    open: false,
    cap: null,
  });

  useEffect(() => {
    cargarCapacitaciones();
  }, []);

  const cargarCapacitaciones = async () => {
    try {
      setLoading(true);
      const data = await capacitacionService.getProgramadas();
      setCapacitaciones(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || "Error al cargar capacitaciones");
    } finally {
      setLoading(false);
    }
  };

  const marcarCompletada = async (id: string) => {
    try {
      await capacitacionService.marcarCompletada(id);
      setCapacitaciones((prev) =>
        prev.map((cap) =>
          cap.id === id ? { ...cap, estado: "completada" } : cap
        )
      );
      toast.success("Capacitación marcada como completada");
    } catch (err: any) {
      toast.error("Error al marcar como completada");
    }
  };

  const handleCreate = () => {
    setDialogMode('create');
    setFormData({
      nombre: '',
      codigo: '',
      tipoCapacitacion: '',
      modalidad: 'Virtual',
      fechaProgramada: '',
      duracionHoras: '', // CAMBIO: Vacío en lugar de 0
      lugar: '',
      instructor: '',
    });
    setSelectedCap(null);
    setShowDialog(true);
  };

  const handleEdit = (cap: Capacitacion) => {
    setDialogMode('edit');
    // CAMBIO: Formato correcto de fecha para input type="date"
    let fechaFormateada = '';
    if (cap.fechaProgramada) {
      try {
        // Intentar obtener YYYY-MM-DD de forma segura
        fechaFormateada = new Date(cap.fechaProgramada).toISOString().split('T')[0];
      } catch (e) {
        console.error("Error parsing date:", cap.fechaProgramada);
        // Fallback si falla el parsing
        fechaFormateada = String(cap.fechaProgramada).split('T')[0] || '';
      }
    }

    setFormData({
      nombre: cap.nombre,
      codigo: cap.codigo,
      tipoCapacitacion: cap.tipoCapacitacion || '',
      modalidad: cap.modalidad,
      fechaProgramada: fechaFormateada,
      duracionHoras: cap.duracionHoras || '',
      lugar: cap.lugar || '',
      instructor: cap.instructor || '',
    });
    setSelectedCap(cap);
    setShowDialog(true);
  };

  const handleView = (cap: Capacitacion) => {
    setDialogMode('view');
    setSelectedCap(cap);
    setShowDialog(true);
  };

  const handleSave = async () => {
    // CAMBIO: Validación mejorada
    const duracionNum = Number(formData.duracionHoras);

    if (!formData.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    if (!formData.codigo.trim()) {
      toast.error("El código es obligatorio");
      return;
    }

    if (!formData.fechaProgramada) {
      toast.error("La fecha programada es obligatoria");
      return;
    }

    if (!formData.duracionHoras || duracionNum <= 0 || isNaN(duracionNum)) {
      toast.error("La duración debe ser mayor a 0");
      return;
    }

    try {
      setSaving(true);

      if (dialogMode === 'create') {
        const newCap = await capacitacionService.create({
          ...formData,
          duracionHoras: duracionNum,
          estado: 'programada'
        });
        setCapacitaciones([newCap, ...capacitaciones]);
        toast.success('Capacitación agregada con éxito!');
      } else if (dialogMode === 'edit' && selectedCap) {
        const updatedCap = await capacitacionService.update(selectedCap.id, {
          ...formData,
          duracionHoras: duracionNum
        });
        setCapacitaciones(prev =>
          prev.map(c =>
            c.id === selectedCap.id ? updatedCap : c
          )
        );
        toast.success('Capacitación actualizada con éxito!');
      }

      setShowDialog(false);
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
      console.error('Error al guardar:', error);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (cap: Capacitacion) => {
    setDeleteDialog({ open: true, cap });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, cap: null });
  };

  const handleDelete = async () => {
    const cap = deleteDialog.cap;
    if (!cap) return;

    try {
      await capacitacionService.delete(cap.id);
      setCapacitaciones(prev => prev.filter(c => c.id !== cap.id));
      toast.success('Capacitación eliminada');
      closeDeleteDialog();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar");
      console.error('Error al eliminar:', error);
    }
  };

  const filteredCapacitaciones = Array.isArray(capacitaciones) ? capacitaciones.filter((c) =>
    (c.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.tipoCapacitacion || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.instructor || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.lugar || "").toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const total = capacitaciones.length;
  const virtuales = capacitaciones.filter(c => c.modalidad === "Virtual").length;
  const presenciales = capacitaciones.filter(c => c.modalidad === "Presencial").length;
  const pendientes = capacitaciones.filter(c => c.estado === "programada").length;
  const completadas = total - pendientes;
  const completionPercentage = total === 0 ? 0 : Math.round((completadas / total) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando capacitaciones...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <TooltipProvider>
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="bg-gradient-to-br from-[#E0EDFF] to-[#C7D2FE] rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
                  <GraduationCap className="h-9 w-9 text-[#2563EB]" />
                  Gestión de Capacitaciones
                </h1>
                <p className="text-[#6B7280] mt-2 text-lg">
                  Programa y administra las capacitaciones del personal
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Badge className="bg-white text-[#2563EB] border border-[#E5E7EB]">
                    {total} capacitaciones
                  </Badge>
                  {pendientes > 0 && (
                    <Badge className="bg-[#FFF7ED] text-[#F97316] border border-[#F97316]/30">
                      {pendientes} pendientes
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                onClick={handleCreate}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm rounded-xl px-6 py-6 h-auto font-bold"
              >
                <Plus className="mr-2 h-5 w-5" />
                Agregar Capacitación
              </Button>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <Card className="bg-[#E0EDFF] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#1E3A8A]">Total</CardDescription>
                  <GraduationCap className="h-8 w-8 text-[#2563EB]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#1E3A8A]">{total}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-[#F3E8FF] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#6B21A8]">Virtuales</CardDescription>
                  <Laptop className="h-8 w-8 text-[#9333EA]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#6B21A8]">{virtuales}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-[#ECFDF5] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#065F46]">Presenciales</CardDescription>
                  <MapPin className="h-8 w-8 text-[#10B981]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#065F46]">{presenciales}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-[#FFF7ED] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#9A3412]">Pendientes</CardDescription>
                  <Clock className="h-8 w-8 text-[#F97316]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#9A3412]">{pendientes}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-[#ECFEFF] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#0E7490]">Completadas</CardDescription>
                  <CheckCircle className="h-8 w-8 text-[#06B6D4]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#0E7490]">{completadas}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#6B7280] font-medium">
                  Capacitaciones finalizadas
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guía de Gestión */}
          <Card className="rounded-2xl shadow-sm border-[#E5E7EB] overflow-hidden">
            <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <CardTitle className="text-lg text-[#1E3A8A]">Guía de Gestión de Capacitaciones</CardTitle>
              <CardDescription>
                Mejores prácticas para mantener las capacitaciones actualizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-start gap-3 p-4 bg-[#EFF6FF] rounded-xl border border-[#DBEAFE]">
                  <div className="h-8 w-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <span className="font-bold text-[#1E3A8A] block mb-1">Planificar con Anticipación</span>
                    <span className="text-[#6B7280]">Programa capacitaciones con tiempo suficiente.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#ECFDF5] rounded-xl border border-[#D1FAE5]">
                  <div className="h-8 w-8 rounded-lg bg-[#10B981] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <span className="font-bold text-[#065F46] block mb-1">Registrar Asistencias</span>
                    <span className="text-[#6B7280]">Mantén un registro completo de participantes.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#FFF7ED] rounded-xl border border-[#FBBF24]/20">
                  <div className="h-8 w-8 rounded-lg bg-[#F97316] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <span className="font-bold text-[#9A3412] block mb-1">Evaluar Resultados</span>
                    <span className="text-[#6B7280]">Mide el impacto y efectividad de cada capacitación.</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buscador */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
              <Input
                placeholder="Buscar por nombre, tipo, instructor o lugar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-6 rounded-xl border-[#E5E7EB]"
              />
            </div>
          </div>

          {/* Lista */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1E3A8A]">Listado de Capacitaciones</h2>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={cargarCapacitaciones}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
                <Badge variant="outline" className="bg-white border-[#E5E7EB] text-[#6B7280]">
                  {filteredCapacitaciones.length} resultados
                </Badge>
              </div>
            </div>

            <div className="p-6">
              {filteredCapacitaciones.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-center">
                  <GraduationCap className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-[#6B7280]">
                    {searchTerm ? "No se encontraron capacitaciones" : "No hay capacitaciones registradas"}
                  </p>
                  {!searchTerm && (
                    <Button onClick={handleCreate} className="mt-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl">
                      <Plus className="mr-2 h-5 w-5" />
                      Agregar primera capacitación
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredCapacitaciones.map((cap) => (
                    <Card key={cap.id} className="hover:shadow-md transition-shadow border-[#E5E7EB]">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-[#111827] mb-4">{cap.nombre}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#6B7280]">
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-700">Cód: {cap.codigo}</span>
                              </div>
                              {cap.tipoCapacitacion && (
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                                  <span>{cap.tipoCapacitacion}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                {cap.modalidad === "Virtual" ? (
                                  <Laptop className="w-4 h-4 text-blue-500" />
                                ) : (
                                  <MapPin className="w-4 h-4 text-green-500" />
                                )}
                                <span>{cap.modalidad}</span>
                              </div>
                              {cap.fechaProgramada && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span>{new Date(cap.fechaProgramada).toLocaleDateString('es-CO')}</span>
                                </div>
                              )}
                              {cap.duracionHoras && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span>{cap.duracionHoras} horas</span>
                                </div>
                              )}
                              {cap.lugar && (
                                <div className="flex items-center gap-2">
                                  {cap.modalidad === "Virtual" ? <LinkIcon className="w-4 h-4 text-blue-400" /> : <MapPin className="w-4 h-4 text-gray-500" />}
                                  {cap.modalidad === "Virtual" ? (
                                    <a href={cap.lugar} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px]">
                                      {cap.lugar}
                                    </a>
                                  ) : (
                                    <span>{cap.lugar}</span>
                                  )}
                                </div>
                              )}
                              {cap.instructor && (
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-500" />
                                  <span>Instructor: {cap.instructor}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-center gap-4">
                            <Badge
                              className={`px-4 py-2 text-sm font-bold ${cap.estado === "programada"
                                ? "bg-[#FFF7ED] text-[#F97316]"
                                : "bg-[#ECFDF5] text-[#065F46]"
                                }`}
                            >
                              {cap.estado === "programada" ? "Pendiente" : "Completada"}
                            </Badge>

                            {cap.estado === "programada" ? (
                              <Button
                                onClick={() => marcarCompletada(cap.id)}
                                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Marcar como asistida
                              </Button>
                            ) : (
                              <div className="flex items-center text-[#065F46] font-semibold">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Completada
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" variant="outline" onClick={() => handleView(cap)} className="rounded-xl">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Ver detalles</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" variant="outline" onClick={() => handleEdit(cap)} className="rounded-xl">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Editar</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" variant="destructive" onClick={() => openDeleteDialog(cap)} className="rounded-xl">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Eliminar</p></TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dialog Crear/Editar/Ver */}
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent className="max-w-4xl rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#1E3A8A] flex items-center gap-3">
                  {dialogMode === 'create' && <><Plus className="h-7 w-7 text-[#2563EB]" /> Agregar Capacitación</>}
                  {dialogMode === 'edit' && <><Edit className="h-7 w-7 text-[#2563EB]" /> Editar Capacitación</>}
                  {dialogMode === 'view' && <><Eye className="h-7 w-7 text-[#2563EB]" /> Detalles de Capacitación</>}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-8 py-4">
                {dialogMode === 'view' && selectedCap ? (
                  <>
                    <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                      <h3 className="text-2xl font-bold text-[#111827] mb-6">{selectedCap.nombre}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-[#6B7280] uppercase text-xs font-bold">Código</Label>
                          <p className="mt-2 text-lg font-medium">{selectedCap.codigo}</p>
                        </div>
                        {selectedCap.tipoCapacitacion && (
                          <div>
                            <Label className="text-[#6B7280] uppercase text-xs font-bold">Tipo</Label>
                            <p className="mt-2 text-lg">{selectedCap.tipoCapacitacion}</p>
                          </div>
                        )}
                        <div>
                          <Label className="text-[#6B7280] uppercase text-xs font-bold">Modalidad</Label>
                          <p className="mt-2 text-lg flex items-center gap-2">
                            {selectedCap.modalidad === "Virtual" ? <Laptop className="h-5 w-5 text-blue-500" /> : <MapPin className="h-5 w-5 text-green-500" />}
                            {selectedCap.modalidad}
                          </p>
                        </div>
                        {selectedCap.fechaProgramada && (
                          <div>
                            <Label className="text-[#6B7280] uppercase text-xs font-bold">Fecha</Label>
                            <p className="mt-2 text-lg">{new Date(selectedCap.fechaProgramada).toLocaleDateString('es-CO')}</p>
                          </div>
                        )}
                        {selectedCap.duracionHoras && (
                          <div>
                            <Label className="text-[#6B7280] uppercase text-xs font-bold">Duración</Label>
                            <p className="mt-2 text-lg">{selectedCap.duracionHoras} horas</p>
                          </div>
                        )}
                        {selectedCap.lugar && (
                          <div>
                            <Label className="text-[#6B7280] uppercase text-xs font-bold">{selectedCap.modalidad === 'Virtual' ? 'Link / Plataforma' : 'Lugar'}</Label>
                            <p className="mt-2 text-lg flex items-center gap-2">
                              {selectedCap.modalidad === "Virtual" ? (
                                <a href={selectedCap.lugar} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                  <LinkIcon className="h-4 w-4" /> {selectedCap.lugar}
                                </a>
                              ) : (
                                <span>{selectedCap.lugar}</span>
                              )}
                            </p>
                          </div>
                        )}
                        {selectedCap.instructor && (
                          <div>
                            <Label className="text-[#6B7280] uppercase text-xs font-bold">Instructor</Label>
                            <p className="mt-2 text-lg">{selectedCap.instructor}</p>
                          </div>
                        )}
                        <div className="md:col-span-2">
                          <Label className="text-[#6B7280] uppercase text-xs font-bold">Estado</Label>
                          <Badge className={`mt-2 px-4 py-2 text-lg font-bold ${selectedCap.estado === "programada" ? "bg-[#FFF7ED] text-[#F97316]" : "bg-[#ECFDF5] text-[#065F46]"}`}>
                            {selectedCap.estado === "programada" ? "Pendiente" : "Completada"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <Label className="font-bold">Nombre <span className="text-red-500">*</span></Label>
                        <Input
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          placeholder="Ej: Seguridad en el trabajo"
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold">Código <span className="text-red-500">*</span></Label>
                        <Input
                          value={formData.codigo}
                          onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                          placeholder="Ej: CAP-2024-001"
                          className="rounded-xl"
                          disabled={dialogMode === 'edit'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold">Tipo de capacitación</Label>
                        <Input
                          value={formData.tipoCapacitacion}
                          onChange={(e) => setFormData({ ...formData, tipoCapacitacion: e.target.value })}
                          placeholder="Ej: Inducción, Anual"
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold">Modalidad <span className="text-red-500">*</span></Label>
                        <Select
                          value={formData.modalidad}
                          onValueChange={(value) => setFormData({ ...formData, modalidad: value as 'Virtual' | 'Presencial' })}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Virtual">Virtual</SelectItem>
                            <SelectItem value="Presencial">Presencial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold">Fecha programada <span className="text-red-500">*</span></Label>
                        <Input
                          type="date"
                          value={formData.fechaProgramada}
                          onChange={(e) => setFormData({ ...formData, fechaProgramada: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold">Duración (horas) <span className="text-red-500">*</span></Label>
                        <Input
                          type="number"
                          min="1"
                          step="0.5"
                          value={formData.duracionHoras}
                          onChange={(e) => setFormData({ ...formData, duracionHoras: e.target.value })}
                          placeholder="Ej: 8"
                          className="rounded-xl"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label className="font-bold">
                          {formData.modalidad === 'Virtual' ? 'Link de Reunión / Zoom' : 'Lugar / Ubicación'}
                        </Label>
                        <div className="relative">
                          {formData.modalidad === 'Virtual' ? (
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          ) : (
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          )}
                          <Input
                            value={formData.lugar}
                            onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                            placeholder={formData.modalidad === 'Virtual' ? "https://zoom.us/..." : "Sala de Juntas B"}
                            className="pl-10 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label className="font-bold">Instructor</Label>
                        <Input
                          value={formData.instructor}
                          onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                          placeholder="Nombre del instructor o facilitador"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-4">
                <Button variant="outline" onClick={() => setShowDialog(false)} className="rounded-xl">
                  {dialogMode === 'view' ? 'Cerrar' : 'Cancelar'}
                </Button>
                {dialogMode !== 'view' && (
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-bold"
                  >
                    {saving ? (
                      <>
                        <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-5 w-5" />
                        Guardar Capacitación
                      </>
                    )}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* AlertDialog Eliminación */}
          <AlertDialog open={deleteDialog.open} onOpenChange={closeDeleteDialog}>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-[#EF4444]" />
                  ¿Eliminar capacitación?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteDialog.cap && (
                    <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E7EB] mt-4">
                      <p className="font-bold text-lg">{deleteDialog.cap.nombre}</p>
                      <p className="text-sm text-[#6B7280]">Modalidad: {deleteDialog.cap.modalidad}</p>
                      <p className="text-sm mt-3 text-[#991B1B] font-medium">
                        Esta acción es permanente y no se podrá deshacer.
                      </p>
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-[#EF4444] hover:bg-[#DC2626] rounded-xl">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TooltipProvider>
    </div>
  );
}