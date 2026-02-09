import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  FileText, Eye, Search, RefreshCw, AlertTriangle, CheckCircle, XCircle, Shield, Edit, Play, Check, Ban
} from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { riesgoService, Riesgo } from "@/services/riesgo.service";

const TratamientoRiesgos: React.FC = () => {
  const [riesgos, setRiesgos] = useState<Riesgo[]>([]);
  const [loading, setLoading] = useState(true);

  // Diálogo vista
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedRiesgo, setSelectedRiesgo] = useState<Riesgo | null>(null);

  // Diálogo edición
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    tratamiento: "",
    estado: "",
    fecha_revision: "",
  });
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRiesgos();
  }, []);

  const fetchRiesgos = async () => {
    try {
      setLoading(true);
      const data = await riesgoService.getAll();
      setRiesgos(data);
    } catch (error: any) {
      toast.error(error.message || "Error al cargar los tratamientos de riesgos");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (riesgo: Riesgo) => {
    setSelectedRiesgo(riesgo);
    setShowViewDialog(true);
  };

  const handleEdit = (riesgo: Riesgo) => {
    setSelectedRiesgo(riesgo);
    setEditFormData({
      tratamiento: riesgo.tratamiento || "",
      estado: riesgo.estado || "identificado",
      fecha_revision: riesgo.fecha_revision || "",
    });
    setShowEditDialog(true);
  };

  const handleUpdateTratamiento = async () => {
    if (!selectedRiesgo) return;

    try {
      setSaving(true);
      await riesgoService.update(selectedRiesgo.id, editFormData);
      toast.success("Tratamiento actualizado exitosamente");
      setShowEditDialog(false);
      fetchRiesgos();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar tratamiento");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusChange = async (riesgo: Riesgo, nuevoEstado: string) => {
    try {
      await riesgoService.update(riesgo.id, { estado: nuevoEstado });
      toast.success(`Estado cambiado a: ${nuevoEstado.replace('_', ' ')}`);
      fetchRiesgos();
    } catch (error: any) {
      toast.error(error.message || "Error al cambiar estado");
    }
  };

  // Helpers
  const filteredRiesgos = riesgos.filter(r =>
    r.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.tratamiento || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estadísticas
  const total = riesgos.length;
  const conTratamiento = riesgos.filter(r => r.tratamiento && r.tratamiento.trim() !== "").length;
  const enTratamiento = riesgos.filter(r => r.estado === "en_tratamiento").length;
  const mitigados = riesgos.filter(r => r.estado === "mitigado").length;
  const coveragePercentage = total === 0 ? 0 : Math.round((mitigados / total) * 100);

  const getNivelColor = (nivel?: string) => {
    if (!nivel) return "bg-gray-200 text-gray-700";
    const nivelLower = nivel.toLowerCase();
    if (nivelLower === 'crítico' || nivelLower === 'critico') return "bg-[#FEF2F2] text-[#991B1B] border border-[#EF4444]/30";
    if (nivelLower === 'alto') return "bg-[#FFF7ED] text-[#9A3412] border border-[#F97316]/30";
    if (nivelLower === 'medio') return "bg-[#FFFBEB] text-[#92400E] border border-[#F59E0B]/30";
    return "bg-[#ECFDF5] text-[#065F46] border border-[#10B981]/30";
  };

  const getNivelLabel = (nivel?: string) => {
    if (!nivel) return "Sin evaluar";
    return nivel.charAt(0).toUpperCase() + nivel.slice(1);
  };

  const getEstadoBadge = (estado?: string) => {
    const estilos: Record<string, { icon: React.ElementType; color: string }> = {
      identificado: { icon: AlertTriangle, color: "bg-[#DBEAFE] text-[#2563EB]" },
      en_tratamiento: { icon: FileText, color: "bg-[#FFF7ED] text-[#F97316]" },
      mitigado: { icon: CheckCircle, color: "bg-[#ECFDF5] text-[#065F46]" },
      aceptado: { icon: XCircle, color: "bg-[#F8FAFC] text-[#6B7280]" },
    };
    const config = estilos[estado || ""] || { icon: AlertTriangle, color: "bg-gray-100 text-gray-800" };
    const Icon = config.icon;
    const label = estado ? estado.replace('_', ' ').charAt(0).toUpperCase() + estado.replace('_', ' ').slice(1) : "Sin estado";
    return (
      <Badge className={`${config.color} flex items-center gap-1.5 font-medium`}>
        <Icon className="h-4 w-4" />
        {label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando tratamientos...</p>
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
                  <FileText className="h-9 w-9 text-[#2563EB]" />
                  Tratamiento de Riesgos
                </h1>
                <p className="text-[#6B7280] mt-2 text-lg">
                  Monitorea el plan de tratamiento y estado de cada riesgo
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Badge className="bg-white text-[#2563EB] border border-[#E5E7EB]">
                    {total} riesgos
                  </Badge>
                  {mitigados > 0 && (
                    <Badge className="bg-[#ECFDF5] text-[#065F46] border border-[#D1FAE5]">
                      {mitigados} mitigados
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas de métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[#E0EDFF] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#1E3A8A]">Total Riesgos</CardDescription>
                  <FileText className="h-8 w-8 text-[#2563EB]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#1E3A8A]">{total}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#6B7280] font-medium">Con plan de tratamiento</div>
              </CardContent>
            </Card>

            <Card className="bg-[#DBEAFE] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#1E3A8A]">Con Tratamiento</CardDescription>
                  <Shield className="h-8 w-8 text-[#2563EB]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#1E3A8A]">{conTratamiento}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#6B7280] font-medium">Definido</div>
              </CardContent>
            </Card>

            <Card className="bg-[#FFF7ED] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#9A3412]">En Tratamiento</CardDescription>
                  <AlertTriangle className="h-8 w-8 text-[#F97316]/70" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#9A3412]">{enTratamiento}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#6B7280] font-medium">En proceso</div>
              </CardContent>
            </Card>

            <Card className="bg-[#ECFDF5] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#065F46]">Mitigados</CardDescription>
                  <CheckCircle className="h-8 w-8 text-[#10B981]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#065F46]">{mitigados}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#6B7280] font-medium mb-2">
                  Cobertura: {coveragePercentage}%
                </div>
                <div className="w-full bg-[#E5E7EB] rounded-full h-3">
                  <div className="bg-[#10B981] h-3 rounded-full transition-all" style={{ width: `${coveragePercentage}%` }} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guía */}
          <Card className="rounded-2xl shadow-sm border-[#E5E7EB] overflow-hidden">
            <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <CardTitle className="text-lg text-[#1E3A8A]">Guía de Tratamiento de Riesgos</CardTitle>
              <CardDescription>Mejores prácticas para gestionar y mitigar riesgos</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-start gap-3 p-4 bg-[#EFF6FF] rounded-xl border border-[#DBEAFE]">
                  <div className="h-8 w-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <span className="font-bold text-[#1E3A8A] block mb-1">Definir Estrategia</span>
                    <span className="text-[#6B7280]">Elige mitigar, aceptar, transferir o evitar.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#ECFDF5] rounded-xl border border-[#D1FAE5]">
                  <div className="h-8 w-8 rounded-lg bg-[#10B981] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <span className="font-bold text-[#065F46] block mb-1">Implementar Acciones</span>
                    <span className="text-[#6B7280]">Asigna responsables y plazos claros.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#FFF7ED] rounded-xl border border-[#FBBF24]/20">
                  <div className="h-8 w-8 rounded-lg bg-[#F97316] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <span className="font-bold text-[#9A3412] block mb-1">Monitorear Efectividad</span>
                    <span className="text-[#6B7280]">Revisa periódicamente el nivel residual.</span>
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
                placeholder="Buscar por código, descripción o tratamiento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-6 rounded-xl border-[#E5E7EB]"
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1E3A8A]">Plan de Tratamiento de Riesgos</h2>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={fetchRiesgos}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
                <Badge variant="outline" className="bg-white border-[#E5E7EB] text-[#6B7280]">
                  {filteredRiesgos.length} resultados
                </Badge>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#F8FAFC]">
                  <TableRow>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Código</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Descripción</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Tratamiento</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Nivel</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Estado</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRiesgos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 text-[#6B7280]">
                        <div className="flex flex-col items-center">
                          <FileText className="h-16 w-16 text-gray-300 mb-4" />
                          <p className="text-lg font-medium">
                            {searchTerm ? "No se encontraron riesgos" : "No hay riesgos registrados"}
                          </p>
                          <p className="text-sm mt-2">
                            {searchTerm ? "Intenta con otros términos" : "Los riesgos aparecerán aquí cuando se identifiquen"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRiesgos.map((r) => (
                      <TableRow key={r.id} className="hover:bg-[#F5F3FF] transition-colors">
                        <TableCell className="px-6 py-4">
                          <Badge className="bg-[#E0EDFF] text-[#2563EB] font-bold px-4 py-2">
                            {r.codigo}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 font-medium max-w-md">
                          {r.descripcion || <span className="italic text-[#6B7280]">Sin descripción</span>}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-[#6B7280] max-w-lg">
                          {r.tratamiento ? (
                            <p className="line-clamp-3">{r.tratamiento}</p>
                          ) : (
                            <span className="italic">Sin tratamiento definido</span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge className={getNivelColor(r.nivel_riesgo)}>
                            {getNivelLabel(r.nivel_riesgo)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {getEstadoBadge(r.estado)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => handleView(r)} className="rounded-xl">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Ver detalles</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => handleEdit(r)} className="rounded-xl">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Editar tratamiento</p></TooltipContent>
                            </Tooltip>

                            {r.estado === 'identificado' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    className="rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white"
                                    onClick={() => handleQuickStatusChange(r, 'en_tratamiento')}
                                  >
                                    <Play className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Iniciar tratamiento</p></TooltipContent>
                              </Tooltip>
                            )}

                            {r.estado === 'en_tratamiento' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    className="rounded-xl bg-[#10B981] hover:bg-[#059669] text-white"
                                    onClick={() => handleQuickStatusChange(r, 'mitigado')}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Marcar como mitigado</p></TooltipContent>
                              </Tooltip>
                            )}

                            {(r.estado === 'identificado' || r.estado === 'en_tratamiento') && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={() => handleQuickStatusChange(r, 'aceptado')}
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Aceptar riesgo</p></TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Diálogo Detalles */}
          <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
            <DialogContent className="max-w-4xl rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#1E3A8A] flex items-center gap-3">
                  <Eye className="h-7 w-7 text-[#2563EB]" />
                  Detalles del Tratamiento
                </DialogTitle>
              </DialogHeader>

              {selectedRiesgo && (
                <div className="space-y-8 py-4">
                  <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB] flex items-center justify-between">
                    <div>
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Código</Label>
                      <Badge className="mt-2 text-2xl px-6 py-3 bg-[#2563EB]/10 text-[#2563EB] font-bold">
                        {selectedRiesgo.codigo}
                      </Badge>
                    </div>
                    <div className="flex gap-4">
                      <Badge className={`text-xl px-6 py-3 ${getNivelColor(selectedRiesgo.nivel_riesgo)}`}>
                        {getNivelLabel(selectedRiesgo.nivel_riesgo)}
                      </Badge>
                      {getEstadoBadge(selectedRiesgo.estado)}
                    </div>
                  </div>

                  {selectedRiesgo.descripcion && (
                    <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                      <Label className="text-[#6B7280] uppercase text-xs font-bold mb-3 block">Descripción del Riesgo</Label>
                      <p className="text-[#111827] leading-relaxed">{selectedRiesgo.descripcion}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 border border-[#E5E7EB]">
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Probabilidad</Label>
                      <p className="mt-2 text-3xl font-bold text-[#1E3A8A]">{selectedRiesgo.probabilidad || '-'}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-[#E5E7EB]">
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Impacto</Label>
                      <p className="mt-2 text-3xl font-bold text-[#1E3A8A]">{selectedRiesgo.impacto || '-'}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-[#E5E7EB]">
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Nivel de Riesgo</Label>
                      <p className="mt-2 text-3xl font-bold text-[#1E3A8A]">{selectedRiesgo.nivel_riesgo || '-'}</p>
                    </div>
                  </div>

                  {selectedRiesgo.tratamiento ? (
                    <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                      <Label className="text-[#6B7280] uppercase text-xs font-bold mb-3 block">Plan de Tratamiento</Label>
                      <p className="text-[#111827] leading-relaxed whitespace-pre-wrap">{selectedRiesgo.tratamiento}</p>
                    </div>
                  ) : (
                    <div className="bg-[#FFF7ED] rounded-xl p-6 border border-[#F97316]/30">
                      <Label className="text-[#9A3412] uppercase text-xs font-bold mb-3 block">Plan de Tratamiento</Label>
                      <p className="text-[#9A3412] italic">No se ha definido un plan de tratamiento</p>
                    </div>
                  )}

                  {selectedRiesgo.tipo_riesgo && (
                    <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Tipo de Riesgo</Label>
                      <p className="mt-2 text-lg font-medium capitalize">{selectedRiesgo.tipo_riesgo}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedRiesgo.fecha_identificacion && (
                      <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                        <Label className="text-[#6B7280] uppercase text-xs font-bold">Fecha de Identificación</Label>
                        <p className="mt-2 text-lg font-medium">
                          {new Date(selectedRiesgo.fecha_identificacion).toLocaleDateString('es-CO', { dateStyle: 'long' })}
                        </p>
                      </div>
                    )}
                    {selectedRiesgo.fecha_revision && (
                      <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                        <Label className="text-[#6B7280] uppercase text-xs font-bold">Próxima Revisión</Label>
                        <p className="mt-2 text-lg font-medium">
                          {new Date(selectedRiesgo.fecha_revision).toLocaleDateString('es-CO', { dateStyle: 'long' })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowViewDialog(false)} className="rounded-xl">
                  Cerrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>


          {/* Diálogo de Edición de Tratamiento */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-3xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#1E3A8A] flex items-center gap-3">
                  <Edit className="h-7 w-7 text-[#2563EB]" />
                  Editar Tratamiento
                </DialogTitle>
              </DialogHeader>

              {selectedRiesgo && (
                <div className="space-y-6 py-4">
                  <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E5E7EB]">
                    <Label className="text-[#6B7280] uppercase text-xs font-bold">Riesgo</Label>
                    <Badge className="mt-2 text-lg px-4 py-2 bg-[#2563EB]/10 text-[#2563EB] font-bold">
                      {selectedRiesgo.codigo}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tratamiento" className="text-[#1E3A8A] font-bold">
                      Plan de Tratamiento
                    </Label>
                    <Textarea
                      id="tratamiento"
                      value={editFormData.tratamiento}
                      onChange={(e) => setEditFormData({ ...editFormData, tratamiento: e.target.value })}
                      placeholder="Describe el plan de tratamiento para este riesgo..."
                      className="min-h-[150px] rounded-xl border-[#E5E7EB]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="estado" className="text-[#1E3A8A] font-bold">
                        Estado del Riesgo
                      </Label>
                      <select
                        id="estado"
                        value={editFormData.estado}
                        onChange={(e) => setEditFormData({ ...editFormData, estado: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      >
                        <option value="identificado">Identificado</option>
                        <option value="en_tratamiento">En Tratamiento</option>
                        <option value="mitigado">Mitigado</option>
                        <option value="aceptado">Aceptado</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fecha_revision" className="text-[#1E3A8A] font-bold">
                        Próxima Revisión
                      </Label>
                      <Input
                        id="fecha_revision"
                        type="date"
                        value={editFormData.fecha_revision}
                        onChange={(e) => setEditFormData({ ...editFormData, fecha_revision: e.target.value })}
                        className="rounded-xl border-[#E5E7EB]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)} 
                  className="rounded-xl"
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpdateTratamiento} 
                  className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8]"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </TooltipProvider>
    </div>
  );
};

export default TratamientoRiesgos;