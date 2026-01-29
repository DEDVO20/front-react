import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Target, CheckCircle, AlertCircle, Calendar, Plus, Edit, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { indicadorService, Indicador } from "@/services/indicador.service";

export default function TableroIndicadores() {
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Indicador | null>(null);
  const [form, setForm] = useState<Partial<Indicador>>({});

  useEffect(() => {
    fetchIndicadores();
  }, []);

  const fetchIndicadores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await indicadorService.getAll();
      setIndicadores(data);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setDialogMode('create');
    setForm({});
    setSelected(null);
    setShowDialog(true);
  };

  const handleOpenEdit = (ind: Indicador) => {
    setDialogMode('edit');
    setSelected(ind);
    setForm({
      nombre: ind.nombre,
      descripcion: ind.descripcion,
      tipo: ind.tipo,
      meta: ind.meta,
      unidadMedida: ind.unidadMedida,
      frecuenciaMedicion: ind.frecuenciaMedicion,
      codigo: ind.codigo,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (dialogMode === 'create') {
        await indicadorService.create(form as any);
      } else if (selected) {
        await indicadorService.update(selected.id, form as any);
      }
      await fetchIndicadores();
      setShowDialog(false);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar indicador?')) return;
    try {
      await indicadorService.delete(id);
      await fetchIndicadores();
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  };

  // Calcular estadísticas
  const totalIndicadores = indicadores.length;
  const promedioMeta = indicadores.length > 0
    ? indicadores.reduce((sum, ind) => sum + (ind.meta || 0), 0) / indicadores.length
    : 0;
  const indicadoresActivos = indicadores.filter(ind => ind.estado === "activo").length;

  // Clasificar por rangos de meta
  const excelentes = indicadores.filter(ind => (ind.meta || 0) >= 90).length;
  const buenos = indicadores.filter(ind => (ind.meta || 0) >= 70 && (ind.meta || 0) < 90).length;
  const regulares = indicadores.filter(ind => (ind.meta || 0) >= 50 && (ind.meta || 0) < 70).length;
  const bajos = indicadores.filter(ind => (ind.meta || 0) < 50).length;

  const getValorBadge = (valor: number) => {
    if (valor >= 90) return <Badge className="bg-green-500">Excelente</Badge>;
    if (valor >= 70) return <Badge className="bg-blue-500">Bueno</Badge>;
    if (valor >= 50) return <Badge className="bg-amber-500">Regular</Badge>;
    return <Badge variant="destructive">Bajo</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-gray-500">Cargando indicadores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-[#E0EDFF] to-[#C7D2FE] rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
                <BarChart3 className="h-9 w-9 text-[#2563EB]" />
                Tablero de Indicadores
              </h1>
              <p className="text-[#6B7280] mt-2 text-lg">Visualice todos sus KPIs en un solo lugar</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleOpenCreate} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm rounded-xl px-4 py-3 font-bold flex items-center gap-2">
                <Plus className="h-4 w-4" /> Nuevo indicador
              </button>
            </div>
          </div>
        </div>

        {error && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Error de conexión</p>
                  <p className="text-sm">{error}</p>
                  <button
                    className="text-sm underline mt-1 inline-block"
                    onClick={fetchIndicadores}
                  >
                    Intentar nuevamente
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Métricas (estilo Gestión de Áreas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#E0EDFF] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-bold text-[#1E3A8A]">Total Indicadores</CardDescription>
                <BarChart3 className="h-8 w-8 text-[#2563EB]" />
              </div>
              <CardTitle className="text-4xl font-bold text-[#1E3A8A]">{totalIndicadores}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-[#6B7280] font-medium">Registrados en el sistema</div>
            </CardContent>
          </Card>

          <Card className="bg-[#ECFDF5] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-bold text-[#065F46]">Activos</CardDescription>
                <Target className="h-8 w-8 text-[#10B981]" />
              </div>
              <CardTitle className="text-4xl font-bold text-[#065F46]">{indicadoresActivos}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-[#6B7280] font-medium mb-2">Cobertura de activos</div>
              <div className="w-full bg-[#E5E7EB] rounded-full h-3">
                <div
                  className="bg-[#10B981] h-3 rounded-full transition-all"
                  style={{ width: `${totalIndicadores === 0 ? 0 : Math.round((indicadoresActivos / totalIndicadores) * 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#FFF7ED] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-bold text-[#9A3412]">Sin Datos</CardDescription>
                <AlertCircle className="h-8 w-8 text-[#F97316]" />
              </div>
              <CardTitle className="text-4xl font-bold text-[#9A3412]">{indicadores.filter(ind => ind.valor === null || ind.valor === undefined).length}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-white/80 text-[#F97316] border-[#F97316]/20 font-bold uppercase text-[10px]">Revisar</Badge>
            </CardContent>
          </Card>

          <Card className="bg-[#FEF2F2] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-bold text-[#991B1B]">Con Incidencias</CardDescription>
                <div className="h-6 w-6 rounded-full bg-[#EF4444]/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-[#EF4444] animate-pulse" />
                </div>
              </div>
              <CardTitle className="text-4xl font-bold text-[#991B1B]">{indicadores.filter(ind => ind.valor !== null && ind.meta != null && ind.meta !== undefined && ind.valor < ind.meta).length}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-white/80 text-[#EF4444] border-[#EF4444]/20 font-bold uppercase text-[10px]">Atención requerida</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Guía de Indicadores */}
        <Card className="rounded-2xl shadow-sm border-[#E5E7EB] overflow-hidden">
          <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
            <CardTitle className="text-lg text-[#1E3A8A]">Guía de Indicadores</CardTitle>
            <CardDescription>Recomendaciones para definir, medir y usar indicadores correctamente</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-start gap-3 p-4 bg-[#EFF6FF] rounded-xl border border-[#DBEAFE]">
                <div className="h-8 w-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <span className="font-bold text-[#1E3A8A] block mb-1">Definir Objetivos SMART</span>
                  <span className="text-[#6B7280]">Establezca metas específicas, medibles, alcanzables, relevantes y con plazo.</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-[#ECFDF5] rounded-xl border border-[#D1FAE5]">
                <div className="h-8 w-8 rounded-lg bg-[#10B981] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <span className="font-bold text-[#065F46] block mb-1">Frecuencia y Método</span>
                  <span className="text-[#6B7280]">Defina periodicidad, fuentes de datos y metodología de cálculo.</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-[#FFF7ED] rounded-xl border border-[#FBBF24]/20">
                <div className="h-8 w-8 rounded-lg bg-[#F97316] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <span className="font-bold text-[#9A3412] block mb-1">Calidad y Responsables</span>
                  <span className="text-[#6B7280]">Asigne responsables, valide la calidad de datos y documente supuestos.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de indicadores */}
        <Card>
          <CardHeader>
            <CardTitle>Todos los Indicadores</CardTitle>
            <CardDescription>
              Resumen de todos los indicadores registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Clave</th>
                      <th className="text-left p-3 text-sm font-medium">Descripción</th>
                      <th className="text-left p-3 text-sm font-medium w-32">Valor</th>
                      <th className="text-left p-3 text-sm font-medium w-32">Desempeño</th>
                      <th className="text-left p-3 text-sm font-medium w-40">Período</th>
                      <th className="text-right p-3 text-sm font-medium w-40">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicadores.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-12 text-gray-500">
                          No hay indicadores registrados
                        </td>
                      </tr>
                    ) : (
                      indicadores.map((indicador) => (
                        <tr key={indicador.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{indicador.clave}</td>
                          <td className="p-3">{indicador.descripcion || "Sin descripción"}</td>
                          <td className="p-3">
                            <span className="text-lg font-bold">
                              {indicador.valor !== null && indicador.valor !== undefined ? `${indicador.valor.toFixed(1)}%` : "N/A"}
                            </span>
                          </td>
                          <td className="p-3">{indicador.valor !== null && indicador.valor !== undefined ? getValorBadge(indicador.valor) : <Badge variant="outline">Sin dato</Badge>}</td>
                          <td className="p-3 text-sm text-gray-600">
                            {indicador.periodoInicio && indicador.periodoFin ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(indicador.periodoInicio).toLocaleDateString("es-CO")} - {new Date(indicador.periodoFin).toLocaleDateString("es-CO")}
                              </div>
                            ) : (
                              "Sin período"
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleOpenEdit(indicador)} className="text-sm bg-white border border-[#E5E7EB] px-3 py-2 rounded-lg">
                                <Edit className="h-4 w-4 inline-block mr-1" /> Editar
                              </button>
                              <button onClick={() => handleDelete(indicador.id)} className="text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">
                                <Trash2 className="h-4 w-4 inline-block mr-1" /> Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dialog simple para crear/editar */}
        {showDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{dialogMode === 'create' ? 'Nuevo Indicador' : 'Editar Indicador'}</h3>
                <button onClick={() => setShowDialog(false)} className="text-sm text-gray-500">Cerrar</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="Clave / Código" value={form?.codigo || ''} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className="p-3 border rounded-lg" />
                <input placeholder="Nombre" value={form?.nombre || ''} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="p-3 border rounded-lg" />
                <input placeholder="Descripción" value={form?.descripcion || ''} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="p-3 border rounded-lg md:col-span-2" />
                <input placeholder="Meta (%)" type="number" value={form?.meta ?? ''} onChange={(e) => setForm({ ...form, meta: Number(e.target.value) })} className="p-3 border rounded-lg" />
                <input placeholder="Unidad de medida" value={form?.unidadMedida || ''} onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })} className="p-3 border rounded-lg" />
                <input placeholder="Frecuencia" value={form?.frecuenciaMedicion || ''} onChange={(e) => setForm({ ...form, frecuenciaMedicion: e.target.value })} className="p-3 border rounded-lg" />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setShowDialog(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
                <button onClick={handleSave} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg">Guardar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}