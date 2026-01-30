import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Target, Search, Eye, RefreshCw, CheckCircle, AlertCircle, X, BarChart3, Calendar, Save
} from 'lucide-react';
import { objetivoCalidadService, ObjetivoCalidad, SeguimientoObjetivo } from '@/services/objetivoCalidad.service';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

interface Seguimiento extends SeguimientoObjetivo {}

const HistorialObjetivos: React.FC = () => {
  const [objetivos, setObjetivos] = useState<ObjetivoCalidad[]>([]);
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [loading, setLoading] = useState(true);

  // Diálogo de vista
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedObjetivo, setSelectedObjetivo] = useState<ObjetivoCalidad | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const allObjetivos = await objetivoCalidadService.getAll();
      const historicos = allObjetivos.filter(o => 
        ["cumplido", "no_cumplido", "cancelado"].includes(o.estado || "")
      );
      setObjetivos(historicos);

      const allSeguimientos: Seguimiento[] = [];
      for (const obj of historicos) {
        try {
          const segs = await objetivoCalidadService.getSeguimientos(obj.id);
          allSeguimientos.push(...segs);
        } catch (err) {
          console.error(`Error cargando seguimientos de ${obj.id}`);
        }
      }
      setSeguimientos(allSeguimientos);
    } catch (err) {
      toast.error("Error al cargar el historial de objetivos");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (obj: ObjetivoCalidad) => {
    setSelectedObjetivo(obj);
    setShowViewDialog(true);
  };

  const getSeguimientosObjetivo = (id: string) => 
    seguimientos.filter(s => s.objetivoId === id || s.objetivo_calidad_id === id);

  const getUltimoSeguimiento = (id: string) => {
    const segs = getSeguimientosObjetivo(id);
    return segs.sort((a, b) => {
      const dateB = new Date((b as any).creadoEn || (b as any).fecha_seguimiento || '').getTime();
      const dateA = new Date((a as any).creadoEn || (a as any).fecha_seguimiento || '').getTime();
      return dateB - dateA;
    })[0];
  };

  const getEstadoBadge = (estado: string) => {
    const estilos: { [key: string]: string } = {
      'cumplido': 'bg-[#ECFDF5] text-[#065F46] border border-[#D1FAE5]',
      'no_cumplido': 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]',
      'cancelado': 'bg-[#F8FAFC] text-[#6B7280] border border-[#E5E7EB]'
    };
    return estilos[estado] || 'bg-gray-100 text-gray-800';
  };

  const getCumplimientoColor = (porcentaje: number) => {
    if (porcentaje >= 90) return 'text-[#065F46]';
    if (porcentaje >= 70) return 'text-[#F97316]';
    return 'text-[#991B1B]';
  };

  const filteredObjetivos = objetivos.filter(o =>
    o.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: objetivos.length,
    cumplidos: objetivos.filter(o => o.estado === 'cumplido').length,
    noCumplidos: objetivos.filter(o => o.estado === 'no_cumplido').length,
    cancelados: objetivos.filter(o => o.estado === 'cancelado').length
  };

  const coveragePercentage = stats.total === 0 ? 0 : Math.round((stats.cumplidos / stats.total) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando historial...</p>
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
                  <Target className="h-9 w-9 text-[#2563EB]" />
                  Historial de Objetivos de Calidad
                </h1>
                <p className="text-[#6B7280] mt-2 text-lg">
                  Objetivos finalizados, cumplidos, no cumplidos o cancelados
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Badge className="bg-white text-[#2563EB] border border-[#E5E7EB]">
                    {stats.total} registros
                  </Badge>
                  <Badge className="bg-[#ECFDF5] text-[#065F46] border border-[#D1FAE5]">
                    {stats.cumplidos} cumplidos
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas de métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[#E0EDFF] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#1E3A8A]">Total Histórico</CardDescription>
                  <Target className="h-8 w-8 text-[#2563EB]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#1E3A8A]">{stats.total}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#6B7280] font-medium">Registros en el historial</div>
              </CardContent>
            </Card>

            <Card className="bg-[#ECFDF5] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#065F46]">Cumplidos</CardDescription>
                  <CheckCircle className="h-8 w-8 text-[#10B981]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#065F46]">{stats.cumplidos}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#6B7280] font-medium mb-2">
                  Tasa de cumplimiento: {coveragePercentage}%
                </div>
                <div className="w-full bg-[#E5E7EB] rounded-full h-3">
                  <div className="bg-[#10B981] h-3 rounded-full transition-all" style={{ width: `${coveragePercentage}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#FEF2F2] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#991B1B]">No Cumplidos</CardDescription>
                  <AlertCircle className="h-8 w-8 text-[#EF4444]/80" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#991B1B]">{stats.noCumplidos}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-white/80 text-[#EF4444] border-[#EF4444]/20 font-bold uppercase text-[10px]">
                  Requiere análisis
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-bold text-[#6B7280]">Cancelados</CardDescription>
                  <X className="h-8 w-8 text-[#6B7280]" />
                </div>
                <CardTitle className="text-4xl font-bold text-[#6B7280]">{stats.cancelados}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#6B7280] font-medium">Objetivos anulados</div>
              </CardContent>
            </Card>
          </div>

          {/* Guía */}
          <Card className="rounded-2xl shadow-sm border-[#E5E7EB] overflow-hidden">
            <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <CardTitle className="text-lg text-[#1E3A8A]">Guía de Análisis del Historial</CardTitle>
              <CardDescription>Buenas prácticas para el cierre y aprendizaje de objetivos</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-start gap-3 p-4 bg-[#EFF6FF] rounded-xl border border-[#DBEAFE]">
                  <div className="h-8 w-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <span className="font-bold text-[#1E3A8A] block mb-1">Documentar Resultados</span>
                    <span className="text-[#6B7280]">Registra causas y evidencias finales.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#ECFDF5] rounded-xl border border-[#D1FAE5]">
                  <div className="h-8 w-8 rounded-lg bg-[#10B981] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <span className="font-bold text-[#065F46] block mb-1">Analizar Lecciones</span>
                    <span className="text-[#6B7280]">Identifica éxitos y oportunidades de mejora.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#FFF7ED] rounded-xl border border-[#FBBF24]/20">
                  <div className="h-8 w-8 rounded-lg bg-[#F97316] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <span className="font-bold text-[#9A3412] block mb-1">Aplicar Mejoras</span>
                    <span className="text-[#6B7280]">Incorpora aprendizajes en futuros objetivos.</span>
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
                placeholder="Buscar por código o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-6 rounded-xl border-[#E5E7EB]"
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1E3A8A]">Registros Históricos</h2>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={cargarDatos}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
                <Badge variant="outline" className="bg-white border-[#E5E7EB] text-[#6B7280]">
                  {filteredObjetivos.length} resultados
                </Badge>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#F8FAFC]">
                  <TableRow>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Código</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Descripción</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Área</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Periodo</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Estado</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Cumplimiento Final</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]"># Seg.</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-[#1E3A8A] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredObjetivos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-20 text-[#6B7280]">
                        <div className="flex flex-col items-center">
                          <Target className="h-16 w-16 text-gray-300 mb-4" />
                          <p className="text-lg font-medium">
                            {searchTerm ? "No se encontraron registros" : "No hay objetivos en el historial aún"}
                          </p>
                          <p className="text-sm mt-2">
                            {searchTerm ? "Intenta con otros términos de búsqueda" : "Los objetivos finalizados aparecerán aquí"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredObjetivos.map((obj) => {
                      const ultimo = getUltimoSeguimiento(obj.id);
                      const numSeg = getSeguimientosObjetivo(obj.id).length;
                      const porcentaje = ultimo ? (ultimo.porcentajeCumplimiento || 0) : 0;

                      return (
                        <TableRow key={obj.id} className="hover:bg-[#F5F3FF] transition-colors">
                          <TableCell className="px-6 py-4">
                            <Badge className="bg-[#E0EDFF] text-[#2563EB] font-bold px-4 py-2">
                              {obj.codigo}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-medium max-w-md">
                            {obj.descripcion || <span className="italic text-[#6B7280]">Sin descripción</span>}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-[#6B7280]">
                            {obj.area?.nombre || '-'}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-[#6B7280]">
                            {obj.periodoInicio ? new Date(obj.periodoInicio).toLocaleDateString('es-CO') : '-'}
                            {' → '}
                            {obj.periodoFin ? new Date(obj.periodoFin).toLocaleDateString('es-CO') : '-'}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <Badge className={getEstadoBadge(obj.estado || '')}>
                              {obj.estado?.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {ultimo ? (
                              <div className="flex items-center gap-3">
                                <span className={`font-bold ${getCumplimientoColor(porcentaje)}`}>
                                  {porcentaje.toFixed(1)}%
                                </span>
                                <div className="w-24 bg-[#E5E7EB] rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      porcentaje >= 90 ? 'bg-[#10B981]' : porcentaje >= 70 ? 'bg-[#F97316]' : 'bg-[#EF4444]'
                                    }`}
                                    style={{ width: `${Math.min(porcentaje, 100)}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="italic text-[#6B7280]">Sin seguimiento</span>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-[#6B7280]">{numSeg}</TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => handleView(obj)} className="rounded-xl">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Ver detalles y historial</p></TooltipContent>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Diálogo de Vista Detallada */}
          <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
            <DialogContent className="max-w-5xl rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#1E3A8A] flex items-center gap-3">
                  <BarChart3 className="h-7 w-7 text-[#2563EB]" />
                  Detalle del Objetivo Histórico
                </DialogTitle>
              </DialogHeader>

              {selectedObjetivo && (
                <div className="space-y-8 py-4">
                  {/* Información principal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                    <div>
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Código</Label>
                      <Badge className="mt-2 text-lg px-6 py-3 bg-[#2563EB]/10 text-[#2563EB] font-bold">
                        {selectedObjetivo.codigo}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Estado Final</Label>
                      <Badge className={`mt-2 text-lg px-6 py-3 ${getEstadoBadge(selectedObjetivo.estado || '')}`}>
                        {selectedObjetivo.estado?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {selectedObjetivo.descripcion && (
                    <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                      <Label className="text-[#6B7280] uppercase text-xs font-bold mb-3 block">Descripción</Label>
                      <p className="text-[#111827] leading-relaxed">{selectedObjetivo.descripcion}</p>
                    </div>
                  )}

                  {selectedObjetivo.meta && (
                    <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                      <Label className="text-[#6B7280] uppercase text-xs font-bold mb-3 block">Meta</Label>
                      <p className="text-[#111827] leading-relaxed">{selectedObjetivo.meta}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Área</Label>
                      <p className="mt-2 text-lg font-medium">{selectedObjetivo.area?.nombre || 'Sin área asignada'}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Valor Meta</Label>
                      <p className="mt-2 text-lg font-medium">{selectedObjetivo.valorMeta ? `${selectedObjetivo.valorMeta}%` : '-'}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                      <Label className="text-[#6B7280] uppercase text-xs font-bold">Periodo</Label>
                      <p className="mt-2 text-lg font-medium flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[#6B7280]" />
                        {selectedObjetivo.periodoInicio ? new Date(selectedObjetivo.periodoInicio).toLocaleDateString('es-CO') : '-'}
                        {' → '}
                        {selectedObjetivo.periodoFin ? new Date(selectedObjetivo.periodoFin).toLocaleDateString('es-CO') : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Estadísticas de seguimiento */}
                  {(() => {
                    const segs = getSeguimientosObjetivo(selectedObjetivo.id);
                    if (segs.length === 0) return null;
                    const valores = segs.map(s => s.porcentajeCumplimiento || 0).filter(v => v > 0);
                    const promedio = valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
                    const maximo = valores.length > 0 ? Math.max(...valores) : 0;
                    const minimo = valores.length > 0 ? Math.min(...valores) : 0;

                    return (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[#ECFDF5] p-4 rounded-lg text-center border border-[#D1FAE5]">
                          <p className="text-2xl font-bold text-[#065F46]">{promedio.toFixed(1)}%</p>
                          <p className="text-sm text-[#6B7280]">Promedio</p>
                        </div>
                        <div className="bg-[#EFF6FF] p-4 rounded-lg text-center border border-[#DBEAFE]">
                          <p className="text-2xl font-bold text-[#2563EB]">{maximo.toFixed(1)}%</p>
                          <p className="text-sm text-[#6B7280]">Máximo</p>
                        </div>
                        <div className="bg-[#FFF7ED] p-4 rounded-lg text-center border border-[#FBBF24]/20">
                          <p className="text-2xl font-bold text-[#F97316]">{minimo.toFixed(1)}%</p>
                          <p className="text-sm text-[#6B7280]">Mínimo</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Historial de seguimientos */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#1E3A8A] mb-4">
                      Historial de Seguimientos ({getSeguimientosObjetivo(selectedObjetivo.id).length})
                    </h3>
                    {getSeguimientosObjetivo(selectedObjetivo.id).length === 0 ? (
                      <p className="text-[#6B7280] text-center py-8">No hay seguimientos registrados.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Valor Alcanzado</TableHead>
                            <TableHead>Cumplimiento</TableHead>
                            <TableHead>Observaciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getSeguimientosObjetivo(selectedObjetivo.id)
                            .sort((a, b) => {
                              const da = new Date((a as any).creadoEn || (a as any).fecha_seguimiento || '').getTime();
                              const db = new Date((b as any).creadoEn || (b as any).fecha_seguimiento || '').getTime();
                              return da - db;
                            })
                            .map((seg) => {
                              const valorActual = (seg as any).valorActual ?? (seg as any).valor_actual ?? null;
                              const valorMeta = selectedObjetivo?.valorMeta ?? (selectedObjetivo as any)?.valor_meta ?? null;
                              const porcentaje = typeof (seg as any).porcentajeCumplimiento === 'number'
                                ? (seg as any).porcentajeCumplimiento
                                : (valorMeta && valorActual != null && isFinite(Number(valorActual)))
                                  ? (Number(valorActual) / Number(valorMeta)) * 100
                                  : 0;
                              const porcentajeDisplay = isFinite(Number(porcentaje)) ? Number(porcentaje) : 0;

                              return (
                                <TableRow key={seg.id}>
                                  <TableCell>{new Date((seg as any).creadoEn || (seg as any).fecha_seguimiento || '').toLocaleDateString('es-CO')}</TableCell>
                                  <TableCell>{valorActual ?? '-'}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <span className={`font-bold ${getCumplimientoColor(porcentajeDisplay)}`}>
                                        {porcentajeDisplay.toFixed(1)}%
                                      </span>
                                      <div className="w-24 bg-[#E5E7EB] rounded-full h-2">
                                        <div
                                          className={`h-2 rounded-full transition-all ${porcentajeDisplay >= 90 ? 'bg-[#10B981]' : porcentajeDisplay >= 70 ? 'bg-[#F97316]' : 'bg-[#EF4444]'}`}
                                          style={{ width: `${Math.min(porcentajeDisplay, 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-[#6B7280] max-w-xs">
                                    {seg.observaciones || <span className="italic">Sin observaciones</span>}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
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

        </div>
      </TooltipProvider>
    </div>
  );
};

export default HistorialObjetivos;