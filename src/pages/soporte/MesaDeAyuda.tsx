import { useEffect, useState } from "react";
import {
  Plus, Search, RefreshCw, LifeBuoy, Headset, Clock, CheckCircle,
  AlertTriangle, MoreHorizontal, Ticket as TicketIcon, Edit, Eye, Trash2, Save
} from "lucide-react";
import { toast } from "sonner";
import ticketService, { Ticket, TicketCreate, TicketUpdate } from "@/services/ticket.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function MesaDeAyuda() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<TicketCreate>({
    titulo: "",
    descripcion: "",
    tipo: "soporte",
    prioridad: "media",
  });

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; ticket: Ticket | null }>({
    open: false,
    ticket: null,
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketService.getAll();
      setTickets(data);
    } catch (error) {
      toast.error("Error al cargar los tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setDialogMode('create');
    setFormData({
      titulo: "",
      descripcion: "",
      tipo: "soporte",
      prioridad: "media",
    });
    setSelectedTicket(null);
    setOpenDialog(true);
  };

  const handleEdit = (ticket: Ticket) => {
    setDialogMode('edit');
    setFormData({
      titulo: ticket.titulo,
      descripcion: ticket.descripcion,
      tipo: ticket.tipo,
      prioridad: ticket.prioridad,
    });
    setSelectedTicket(ticket);
    setOpenDialog(true);
  };

  const handleView = (ticket: Ticket) => {
    setDialogMode('view');
    setSelectedTicket(ticket);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.titulo.trim() || !formData.descripcion.trim()) {
      toast.error("Título y descripción son obligatorios");
      return;
    }

    setSaving(true);
    try {
      if (dialogMode === 'create') {
        await ticketService.create(formData);
        toast.success("Ticket creado exitosamente");
      } else if (selectedTicket) {
        await ticketService.update(selectedTicket.id, formData as TicketUpdate);
        toast.success("Ticket actualizado exitosamente");
      }
      setOpenDialog(false);
      fetchTickets();
    } catch (error) {
      toast.error(dialogMode === 'create' ? "Error al crear el ticket" : "Error al actualizar el ticket");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (ticket: Ticket) => {
    setDeleteDialog({ open: true, ticket });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, ticket: null });
  };

  const handleDelete = async () => {
    const ticket = deleteDialog.ticket;
    if (!ticket) return;

    try {
      await ticketService.delete(ticket.id);
      toast.success("Ticket eliminado correctamente");
      fetchTickets();
      closeDeleteDialog();
    } catch (error) {
      toast.error("Error al eliminar el ticket");
    }
  };

  // Métricas
  const total = tickets.length;
  const abiertos = tickets.filter(t => t.estado === "abierto").length;
  const enProgreso = tickets.filter(t => t.estado === "en_progreso").length;
  const resueltos = tickets.filter(t => t.estado === "resuelto" || t.estado === "cerrado").length;

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "abierto":
        return <Badge className="bg-[#EF4444] text-white">Abierto</Badge>;
      case "en_progreso":
        return <Badge className="bg-[#2563EB] text-white">En Progreso</Badge>;
      case "resuelto":
      case "cerrado":
        return <Badge className="bg-[#10B981] text-white">Resuelto</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getPriorityBadge = (prioridad: string) => {
    switch (prioridad) {
      case "critica":
        return <Badge className="bg-[#991B1B] text-white">Crítica</Badge>;
      case "alta":
        return <Badge className="bg-[#F97316] text-white">Alta</Badge>;
      case "media":
        return <Badge className="bg-[#EAB308] text-black">Media</Badge>;
      case "baja":
        return <Badge className="bg-[#10B981] text-white">Baja</Badge>;
      default:
        return <Badge variant="outline">{prioridad}</Badge>;
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563EB]"></div>
        <p className="ml-4 text-[#1E3A8A] font-medium">Cargando tickets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <TooltipProvider>
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header Profesional */}
          <div className="bg-gradient-to-br from-[#E0EDFF] to-[#C7D2FE] rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
                  <LifeBuoy className="h-9 w-9 text-[#2563EB]" />
                  Mesa de Ayuda
                </h1>
                <p className="text-[#6B7280] mt-2 text-lg">
                  Gestiona solicitudes de soporte, consultas y mejoras del sistema de calidad
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Badge className="bg-white text-[#2563EB] border border-[#E5E7EB]">
                    {total} tickets
                  </Badge>
                  {abiertos > 0 && (
                    <Badge className="bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/30">
                      {abiertos} abiertos
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                onClick={handleCreate}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm rounded-xl px-6 py-6 h-auto font-bold"
              >
                <Plus className="mr-2 h-5 w-5" />
                Nuevo Ticket
              </Button>
            </div>
          </div>

          {/* Tarjetas de métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[#E0EDFF] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#1E3A8A]">Total Tickets</CardDescription>
                  <TicketIcon className="h-8 w-8 text-[#2563EB]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#1E3A8A]">{total}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#6B7280] font-medium">
                  Registrados en el sistema
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#FEF2F2] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#991B1B]">Abiertos</CardDescription>
                  <AlertTriangle className="h-8 w-8 text-[#EF4444]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#991B1B]">{abiertos}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-white/80 text-[#EF4444] border-[#EF4444]/20 font-bold uppercase text-[10px]">
                  Requieren atención
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-[#DBEAFE] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#1E3A8A]">En Progreso</CardDescription>
                  <Clock className="h-8 w-8 text-[#2563EB]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#1E3A8A]">{enProgreso}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#6B7280] font-medium">
                  Siendo atendidos
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#ECFDF5] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#065F46]">Resueltos</CardDescription>
                  <CheckCircle className="h-8 w-8 text-[#10B981]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#065F46]">{resueltos}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#6B7280] font-medium">
                  Cerrados satisfactoriamente
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guía de Uso */}
          <Card className="rounded-2xl shadow-sm border-[#E5E7EB] overflow-hidden">
            <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <CardTitle className="text-lg text-[#1E3A8A]">Guía para Crear Tickets Efectivos</CardTitle>
              <CardDescription>Mejores prácticas para una atención rápida</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-start gap-3 p-4 bg-[#EFF6FF] rounded-xl border border-[#DBEAFE]">
                  <div className="h-8 w-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <span className="font-bold text-[#1E3A8A] block mb-1">Título Claro</span>
                    <span className="text-[#6B7280]">Resume el problema en pocas palabras.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#ECFDF5] rounded-xl border border-[#D1FAE5]">
                  <div className="h-8 w-8 rounded-lg bg-[#10B981] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <span className="font-bold text-[#065F46] block mb-1">Descripción Detallada</span>
                    <span className="text-[#6B7280]">Pasos para reproducir, pantallas, errores exactos.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#FFF7ED] rounded-xl border border-[#FBBF24]/20">
                  <div className="h-8 w-8 rounded-lg bg-[#F97316] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <span className="font-bold text-[#9A3412] block mb-1">Prioridad Correcta</span>
                    <span className="text-[#6B7280]">Solo crítica si bloquea operaciones.</span>
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
                placeholder="Buscar por título o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-6 rounded-xl border-[#E5E7EB]"
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1E3A8A]">Listado de Tickets</h2>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={fetchTickets}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
                <Badge variant="outline" className="bg-white border-[#E5E7EB] text-[#6B7280]">
                  {filteredTickets.length} resultados
                </Badge>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#F8FAFC]">
                  <TableRow>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Título</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Tipo</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Prioridad</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Estado</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Fecha</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 text-[#6B7280]">
                        <div className="flex flex-col items-center">
                          <LifeBuoy className="h-16 w-16 text-gray-300 mb-4" />
                          <p className="text-lg font-medium">
                            {searchTerm ? "No se encontraron tickets" : "No hay tickets registrados"}
                          </p>
                          {!searchTerm && (
                            <Button onClick={handleCreate} className="mt-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl">
                              <Plus className="mr-2 h-5 w-5" />
                              Crear primer ticket
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="hover:bg-[#F5F3FF] transition-colors">
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold">{ticket.titulo}</span>
                            <span className="text-sm text-[#6B7280] line-clamp-2 max-w-md">
                              {ticket.descripcion || "Sin descripción"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 capitalize">{ticket.tipo.replace("_", " ")}</TableCell>
                        <TableCell className="px-6 py-4">{getPriorityBadge(ticket.prioridad)}</TableCell>
                        <TableCell className="px-6 py-4">{getStatusBadge(ticket.estado)}</TableCell>
                        <TableCell className="px-6 py-4 text-[#6B7280]">
                          {new Date(ticket.creado_en).toLocaleDateString('es-CO')}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => handleView(ticket)} className="rounded-xl">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Ver detalle</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => handleEdit(ticket)} className="rounded-xl">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Editar</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="destructive" onClick={() => openDeleteDialog(ticket)} className="rounded-xl">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Eliminar</p></TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Dialog Crear/Editar/Ver Ticket */}
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#1E3A8A] flex items-center gap-3">
                  {dialogMode === 'create' && <><Plus className="h-7 w-7 text-[#2563EB]" /> Crear Nuevo Ticket</>}
                  {dialogMode === 'edit' && <><Edit className="h-7 w-7 text-[#2563EB]" /> Editar Ticket</>}
                  {dialogMode === 'view' && <><Eye className="h-7 w-7 text-[#2563EB]" /> Detalles del Ticket</>}
                </DialogTitle>
              </DialogHeader>

              {dialogMode === 'view' && selectedTicket ? (
                <div className="space-y-6 py-4">
                  <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB] space-y-4">
                    <div>
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Título</Label>
                      <p className="mt-1 text-xl font-bold text-[#111827]">{selectedTicket.titulo}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[#6B7280] uppercase text-xs font-bold">Tipo</Label>
                        <p className="mt-1 font-medium capitalize">{selectedTicket.tipo.replace("_", " ")}</p>
                      </div>
                      <div>
                        <Label className="text-[#6B7280] uppercase text-xs font-bold">Prioridad</Label>
                        <div className="mt-1">{getPriorityBadge(selectedTicket.prioridad)}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[#6B7280] uppercase text-xs font-bold">Estado</Label>
                        <div className="mt-1">{getStatusBadge(selectedTicket.estado)}</div>
                      </div>
                      <div>
                        <Label className="text-[#6B7280] uppercase text-xs font-bold">Fecha</Label>
                        <p className="mt-1">{new Date(selectedTicket.creado_en).toLocaleString('es-CO')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                    <Label className="text-[#6B7280] uppercase text-xs font-bold mb-2 block">Descripción</Label>
                    <p className="text-[#111827] leading-relaxed whitespace-pre-wrap">{selectedTicket.descripcion}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold">
                        Título <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.titulo}
                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        placeholder="Ej: Error al generar reporte mensual"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Tipo</Label>
                      <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="soporte">Soporte Técnico</SelectItem>
                          <SelectItem value="consulta">Consulta (ISO/Procesos)</SelectItem>
                          <SelectItem value="mejora">Solicitud de Mejora</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold">Prioridad</Label>
                      <Select value={formData.prioridad} onValueChange={(v) => setFormData({ ...formData, prioridad: v })}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baja">Baja</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="critica">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">
                      Descripción <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder="Describe detalladamente el problema, pasos para reproducirlo, capturas si aplica..."
                      rows={6}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              )}

              <DialogFooter className="gap-4">
                <Button variant="outline" onClick={() => setOpenDialog(false)} className="rounded-xl">
                  {dialogMode === 'view' ? 'Cerrar' : 'Cancelar'}
                </Button>
                {dialogMode !== 'view' && (
                  <Button onClick={handleSave} disabled={saving} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-bold">
                    {saving ? (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-5 w-5" />
                        {dialogMode === 'create' ? 'Enviar Ticket' : 'Guardar Cambios'}
                      </>
                    )}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* AlertDialog de Eliminación */}
          <AlertDialog open={deleteDialog.open} onOpenChange={closeDeleteDialog}>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-[#EF4444]" />
                  ¿Eliminar ticket?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteDialog.ticket && (
                    <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E7EB] mt-4">
                      <p className="font-bold">{deleteDialog.ticket.titulo}</p>
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
                  Eliminar Ticket
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TooltipProvider>
    </div>
  );
}

