import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Award, Brain, TrendingUp, Eye, RefreshCw, Search, GraduationCap } from "lucide-react";
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

interface Competencia {
  id: number;
  nombre: string;
  capacitacion: string;
  responsable: string;
  fecha: string;
  estado: string;
  nivel: string;
  descripcion: string;
}

const CapacitacionesCompetencias: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedCompetencia, setSelectedCompetencia] = useState<Competencia | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    cargarCapacitaciones();
  }, []);

  const cargarCapacitaciones = async () => {
    try {
      setLoading(true);
      const data = await capacitacionService.getAll();
      setCapacitaciones(data);
    } catch (err) {
      console.error("Error al cargar capacitaciones:", err);
      toast.error("Error al cargar capacitaciones");
    } finally {
      setLoading(false);
    }
  };

  // Datos simulados de competencias
  const competencias: Competencia[] = [
    {
      id: 1,
      nombre: "Liderazgo y Toma de Decisiones",
      capacitacion: "Formación de Líderes de Equipo",
      responsable: "Laura Martínez",
      fecha: "2025-08-15",
      estado: "Reforzada",
      nivel: "Avanzado",
      descripcion: "Se evidenció una mejora significativa en la autonomía y liderazgo del equipo.",
    },
    {
      id: 2,
      nombre: "Trabajo en Equipo",
      capacitacion: "Comunicación y Colaboración",
      responsable: "Carlos Castro",
      fecha: "2025-07-12",
      estado: "Desarrollada",
      nivel: "Intermedio",
      descripcion: "Los participantes demostraron mejor coordinación en tareas conjuntas.",
    },
    {
      id: 3,
      nombre: "Gestión del Tiempo",
      capacitacion: "Productividad y Eficiencia Personal",
      responsable: "Ana Gómez",
      fecha: "2025-06-20",
      estado: "Pendiente de Refuerzo",
      nivel: "Básico",
      descripcion: "Se identificó la necesidad de seguimiento para consolidar la mejora.",
    },
  ];

  const filteredCompetencias = competencias.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.capacitacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.responsable.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDialog = (competencia: Competencia) => {
    setSelectedCompetencia(competencia);
    setOpen(true);
  };

  const totalCompetencias = competencias.length;
  const reforzadas = competencias.filter((c) => c.estado === "Reforzada").length;
  const pendientes = competencias.filter((c) => c.estado === "Pendiente de Refuerzo").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando competencias...</p>
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
                  <Brain className="h-9 w-9 text-[#2563EB]" />
                  Competencias Desarrolladas
                </h1>
                <p className="text-[#6B7280] mt-2 text-lg">
                  Evaluación y seguimiento de competencias en capacitaciones
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Badge className="bg-white text-[#2563EB] border border-[#E5E7EB]">
                    {totalCompetencias} competencias evaluadas
                  </Badge>
                  {reforzadas > 0 && (
                    <Badge className="bg-[#ECFDF5] text-[#065F46] border border-[#10B981]/30">
                      {reforzadas} reforzadas
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas de métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#E0EDFF] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#1E3A8A]">Total Evaluadas</CardDescription>
                  <Brain className="h-8 w-8 text-[#2563EB]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#1E3A8A]">{totalCompetencias}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#6B7280] font-medium">
                  Competencias en seguimiento
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#ECFEFF] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#0E7490]">Reforzadas</CardDescription>
                  <Award className="h-8 w-8 text-[#06B6D4]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#0E7490]">{reforzadas}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#6B7280] font-medium">
                  Nivel avanzado alcanzado
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#FFF7ED] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#9A3412]">Pendientes</CardDescription>
                  <TrendingUp className="h-8 w-8 text-[#F97316]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#9A3412]">{pendientes}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-white/80 text-[#F97316] border-[#F97316]/20 font-bold uppercase text-[10px]">
                  Requieren refuerzo
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Guía de Gestión */}
          <Card className="rounded-2xl shadow-sm border-[#E5E7EB] overflow-hidden">
            <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <CardTitle className="text-lg text-[#1E3A8A]">Guía de Gestión de Competencias</CardTitle>
              <CardDescription>
                Mejores prácticas para el desarrollo y evaluación de competencias
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-start gap-3 p-4 bg-[#EFF6FF] rounded-xl border border-[#DBEAFE]">
                  <div className="h-8 w-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <span className="font-bold text-[#1E3A8A] block mb-1">Identificar Competencias</span>
                    <span className="text-[#6B7280]">Define las competencias clave para cada rol.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#ECFDF5] rounded-xl border border-[#D1FAE5]">
                  <div className="h-8 w-8 rounded-lg bg-[#10B981] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <span className="font-bold text-[#065F46] block mb-1">Evaluar Regularmente</span>
                    <span className="text-[#6B7280]">Mide el progreso y nivel de cada competencia.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#FFF7ED] rounded-xl border border-[#FBBF24]/20">
                  <div className="h-8 w-8 rounded-lg bg-[#F97316] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <span className="font-bold text-[#9A3412] block mb-1">Reforzar Continuamente</span>
                    <span className="text-[#6B7280]">Implementa planes de mejora y seguimiento.</span>
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
                placeholder="Buscar por competencia, capacitación o responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-6 rounded-xl border-[#E5E7EB]"
              />
            </div>
          </div>

          {/* Tabla principal */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1E3A8A]">Evaluación de Competencias</h2>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={cargarCapacitaciones}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
                <Badge variant="outline" className="bg-white border-[#E5E7EB] text-[#6B7280]">
                  {filteredCompetencias.length} resultados
                </Badge>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#F8FAFC]">
                  <TableRow>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Competencia</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Capacitación</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Responsable</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Fecha</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Nivel</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Estado</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompetencias.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-20 text-[#6B7280]">
                        <div className="flex flex-col items-center">
                          <GraduationCap className="h-16 w-16 text-gray-300 mb-4" />
                          <p className="text-lg font-medium">
                            {searchTerm ? "No se encontraron competencias" : "No hay competencias registradas"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompetencias.map((item) => (
                      <TableRow key={item.id} className="hover:bg-[#F5F3FF] transition-colors">
                        <TableCell className="px-6 py-4 font-bold">{item.nombre}</TableCell>
                        <TableCell className="px-6 py-4 text-[#6B7280]">{item.capacitacion}</TableCell>
                        <TableCell className="px-6 py-4 text-[#6B7280]">{item.responsable}</TableCell>
                        <TableCell className="px-6 py-4 text-[#6B7280]">
                          {new Date(item.fecha).toLocaleDateString('es-CO')}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge className="bg-[#E0EDFF] text-[#2563EB] font-bold px-4 py-2">
                            {item.nivel}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge
                            className={
                              item.estado === "Reforzada"
                                ? "bg-[#ECFDF5] text-[#065F46] font-bold px-4 py-2"
                                : item.estado === "Desarrollada"
                                  ? "bg-[#E0EDFF] text-[#2563EB] font-bold px-4 py-2"
                                  : "bg-[#FFF7ED] text-[#9A3412] font-bold px-4 py-2"
                            }
                          >
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
                  <Brain className="h-7 w-7 text-[#2563EB]" />
                  Detalles de Competencia
                </DialogTitle>
                <DialogDescription className="text-[#6B7280] mt-2">
                  Información detallada sobre la competencia seleccionada
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-8 py-4">
                <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                  <h3 className="text-2xl font-bold text-[#111827] mb-6">{selectedCompetencia?.nombre}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Capacitación</Label>
                      <p className="mt-2 text-lg font-medium">{selectedCompetencia?.capacitacion}</p>
                    </div>
                    <div>
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Responsable</Label>
                      <p className="mt-2 text-lg font-medium">{selectedCompetencia?.responsable}</p>
                    </div>
                    <div>
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Fecha</Label>
                      <p className="mt-2 text-lg font-medium">
                        {selectedCompetencia?.fecha ? new Date(selectedCompetencia.fecha).toLocaleDateString('es-CO', { dateStyle: 'long' }) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Nivel</Label>
                      <Badge className="mt-2 text-lg px-6 py-3 bg-[#2563EB]/10 text-[#2563EB] font-bold">
                        {selectedCompetencia?.nivel}
                      </Badge>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Estado</Label>
                      <Badge
                        className={`mt-2 px-4 py-2 text-lg font-bold ${selectedCompetencia?.estado === "Reforzada"
                          ? "bg-[#ECFDF5] text-[#065F46]"
                          : selectedCompetencia?.estado === "Desarrollada"
                            ? "bg-[#E0EDFF] text-[#2563EB]"
                            : "bg-[#FFF7ED] text-[#9A3412]"
                          }`}
                      >
                        {selectedCompetencia?.estado}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedCompetencia?.descripcion && (
                  <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                    <Label className="text-[#6B7280] uppercase text-xs font-bold mb-3 block">Descripción</Label>
                    <p className="text-[#111827] leading-relaxed">{selectedCompetencia.descripcion}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-4">
                <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
                  Cerrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default CapacitacionesCompetencias;
