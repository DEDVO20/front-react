import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle, Users, Laptop, MapPin, Download, GraduationCap, Eye, RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { capacitacionService, Capacitacion } from "@/services/capacitacion.service";
import { toast } from "sonner";

const CapacitacionesAsistencia: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedCapacitacion, setSelectedCapacitacion] = useState<Capacitacion | null>(null);
  const [asistencias, setAsistencias] = useState<Capacitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    cargarAsistencias();
  }, []);

  const cargarAsistencias = async () => {
    try {
      setLoading(true);
      const data = await capacitacionService.getHistorial();
      setAsistencias(data);
    } catch (err: any) {
      console.error("Error al cargar asistencias:", err);
      toast.error(err.message || "Error al cargar asistencias");
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (capacitacion: Capacitacion) => {
    setSelectedCapacitacion(capacitacion);
    setOpen(true);
  };

  const filteredAsistencias = asistencias.filter(
    (a) =>
      a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.tipoCapacitacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = asistencias.length;
  const virtuales = asistencias.filter((a) => a.modalidad === "Virtual").length;
  const presenciales = asistencias.filter((a) => a.modalidad === "Presencial").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando asistencias...</p>
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
                  <CheckCircle className="h-9 w-9 text-[#2563EB]" />
                  Historial de Asistencias
                </h1>
                <p className="text-[#6B7280] mt-2 text-lg">
                  Registro completo de capacitaciones completadas
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Badge className="bg-white text-[#2563EB] border border-[#E5E7EB]">
                    {total} asistencias registradas
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas de métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#E0EDFF] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#1E3A8A]">Total Asistencias</CardDescription>
                  <Users className="h-8 w-8 text-[#2563EB]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#1E3A8A]">{total}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#6B7280] font-medium">
                  Capacitaciones completadas
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#F3E8FF] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#6B21A8]">Virtuales</CardDescription>
                  <Laptop className="h-8 w-8 text-[#9333EA]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#6B21A8]">{virtuales}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#6B7280] font-medium">
                  Modalidad en línea
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#ECFDF5] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#065F46]">Presenciales</CardDescription>
                  <MapPin className="h-8 w-8 text-[#10B981]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#065F46]">{presenciales}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#6B7280] font-medium">
                  Modalidad presencial
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guía de Gestión */}
          <Card className="rounded-2xl shadow-sm border-[#E5E7EB] overflow-hidden">
            <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <CardTitle className="text-lg text-[#1E3A8A]">Guía de Gestión de Asistencias</CardTitle>
              <CardDescription>
                Mejores prácticas para el registro y seguimiento de asistencias
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-start gap-3 p-4 bg-[#EFF6FF] rounded-xl border border-[#DBEAFE]">
                  <div className="h-8 w-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <span className="font-bold text-[#1E3A8A] block mb-1">Verificar Asistencia</span>
                    <span className="text-[#6B7280]">Confirma la participación de cada asistente.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#ECFDF5] rounded-xl border border-[#D1FAE5]">
                  <div className="h-8 w-8 rounded-lg bg-[#10B981] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <span className="font-bold text-[#065F46] block mb-1">Emitir Certificados</span>
                    <span className="text-[#6B7280]">Genera certificados para quienes completaron.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#FFF7ED] rounded-xl border border-[#FBBF24]/20">
                  <div className="h-8 w-8 rounded-lg bg-[#F97316] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <span className="font-bold text-[#9A3412] block mb-1">Archivar Registros</span>
                    <span className="text-[#6B7280]">Mantén un historial completo y organizado.</span>
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
                placeholder="Buscar por nombre, tipo o instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-6 rounded-xl border-[#E5E7EB]"
              />
            </div>
          </div>

          {/* Tabla principal */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1E3A8A]">Registro de Asistencias</h2>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={cargarAsistencias}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
                <Badge variant="outline" className="bg-white border-[#E5E7EB] text-[#6B7280]">
                  {filteredAsistencias.length} resultados
                </Badge>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#F8FAFC]">
                  <TableRow>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Nombre</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Modalidad</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Fecha</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Duración</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Instructor</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Estado</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAsistencias.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-20 text-[#6B7280]">
                        <div className="flex flex-col items-center">
                          <GraduationCap className="h-16 w-16 text-gray-300 mb-4" />
                          <p className="text-lg font-medium">
                            {searchTerm ? "No se encontraron asistencias" : "No hay asistencias registradas"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAsistencias.map((item) => (
                      <TableRow key={item.id} className="hover:bg-[#F5F3FF] transition-colors">
                        <TableCell className="px-6 py-4 font-bold">{item.nombre}</TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge className={item.modalidad === "Virtual" ? "bg-[#E0EDFF] text-[#2563EB]" : "bg-[#F0FDF4] text-[#166534]"}>
                            {item.modalidad}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-[#6B7280]">
                          {item.fechaProgramada ? new Date(item.fechaProgramada).toLocaleDateString('es-CO') : 'N/A'}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-[#6B7280]">
                          {item.duracionHoras ? `${item.duracionHoras}h` : 'N/A'}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-[#6B7280]">{item.instructor || 'N/A'}</TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge className="bg-[#ECFDF5] text-[#065F46] font-bold px-4 py-2">
                            {item.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => openDialog(item)} className="rounded-xl">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Ver detalles</p></TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Modal flotante */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-4xl rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#1E3A8A] flex items-center gap-3">
                  <CheckCircle className="h-7 w-7 text-[#2563EB]" />
                  Certificado de Asistencia
                </DialogTitle>
                <DialogDescription className="text-[#6B7280] mt-2">
                  🎓 Has completado la capacitación <strong>{selectedCapacitacion?.nombre}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-8 py-4">
                <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Fecha</Label>
                      <p className="mt-2 text-lg font-medium">
                        {selectedCapacitacion?.fechaProgramada ? new Date(selectedCapacitacion.fechaProgramada).toLocaleDateString('es-CO', { dateStyle: 'long' }) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Instructor</Label>
                      <p className="mt-2 text-lg font-medium">{selectedCapacitacion?.instructor || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Duración</Label>
                      <p className="mt-2 text-lg font-medium">
                        {selectedCapacitacion?.duracionHoras ? `${selectedCapacitacion.duracionHoras} horas` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Modalidad</Label>
                      <p className="mt-2 text-lg font-medium">{selectedCapacitacion?.modalidad}</p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-4">
                <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
                  Cerrar
                </Button>
                <Button
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-bold"
                  onClick={() => toast.success("Descargando certificado...")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Certificado
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default CapacitacionesAsistencia;
