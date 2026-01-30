import { useEffect, useState } from "react";
import { Zap, AlertCircle, Activity, TrendingUp } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { indicadorService, Indicador } from "@/services/indicador.service";

export default function EficienciaIndicadores() {
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIndicadores();
  }, []);

  const fetchIndicadores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await indicadorService.getAll({ tipo: "eficiencia" });
      setIndicadores(data);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalIndicadores = indicadores.length;

  const activos = indicadores.filter(i => i.estado === 'activo').length;
  const sinDatos = indicadores.filter(i => i.valor === null || i.valor === undefined).length;
  const conIncidencias = indicadores.filter(i => i.valor !== null && i.meta != null && i.meta !== undefined && i.valor < i.meta).length;

  // Mini-gráfica simple (barra) para mostrar distribución básica
  const MiniBar = ({ counts }: { counts: number[] }) => {
    const total = counts.reduce((s, v) => s + v, 0) || 1;
    const colors = ["#06B6D4", "#3B82F6", "#F97316"];
    return (
      <div className="w-full h-3 rounded-full overflow-hidden bg-gray-100 flex">
        {counts.map((c, i) => (
          <div key={i} style={{ width: `${(c / total) * 100}%`, background: colors[i] }} />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-gray-500">Cargando indicadores de eficiencia...</p>
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
                <Zap className="h-9 w-9 text-[#2563EB]" />
                Eficiencia
              </h1>
              <p className="text-[#6B7280] mt-2 text-lg">Evalúe el uso óptimo de recursos</p>
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
              <Activity className="h-8 w-8 text-[#2563EB]" />
            </div>
            <CardTitle className="text-4xl font-bold text-[#1E3A8A]">{totalIndicadores}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-[#6B7280] font-medium">Indicadores de eficiencia</div>
          </CardContent>
        </Card>

        <Card className="bg-[#ECFDF5] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="font-bold text-[#065F46]">Activos</CardDescription>
              <Activity className="h-8 w-8 text-[#10B981]" />
            </div>
            <CardTitle className="text-4xl font-bold text-[#065F46]">{activos}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-[#6B7280] font-medium mb-2">Cobertura</div>
            <div className="w-full bg-[#E5E7EB] rounded-full h-3">
              <div className="bg-[#10B981] h-3 rounded-full" style={{ width: `${totalIndicadores === 0 ? 0 : Math.round((activos / totalIndicadores) * 100)}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#FFF7ED] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="font-bold text-[#9A3412]">Sin Datos</CardDescription>
              <AlertCircle className="h-8 w-8 text-[#F97316]" />
            </div>
            <CardTitle className="text-4xl font-bold text-[#9A3412]">{sinDatos}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-white/80 text-[#F97316] border-[#F97316]/20 font-bold uppercase text-[10px]">Revisar</Badge>
          </CardContent>
        </Card>

        <Card className="bg-[#FEF2F2] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="font-bold text-[#991B1B]">Con Incidencias</CardDescription>
              <div className="h-6 w-6 rounded-full bg-[#EF4444]/20 flex items-center justify-center"><div className="h-2 w-2 rounded-full bg-[#EF4444] animate-pulse" /></div>
            </div>
            <CardTitle className="text-4xl font-bold text-[#991B1B]">{conIncidencias}</CardTitle>
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
          <CardDescription>Buenas prácticas para definir y mantener indicadores de eficiencia</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start gap-3 p-4 bg-[#EFF6FF] rounded-xl border border-[#DBEAFE]">
              <div className="h-8 w-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div>
                <span className="font-bold text-[#1E3A8A] block mb-1">Definir Métrica</span>
                <span className="text-[#6B7280]">Establece la fórmula, unidad y objetivo de eficiencia.</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-[#ECFDF5] rounded-xl border border-[#D1FAE5]">
              <div className="h-8 w-8 rounded-lg bg-[#10B981] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div>
                <span className="font-bold text-[#065F46] block mb-1">Frecuencia y Fuente</span>
                <span className="text-[#6B7280]">Define cuándo se mide y desde qué sistemas se extraen los datos.</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-[#FFF7ED] rounded-xl border border-[#FBBF24]/20">
              <div className="h-8 w-8 rounded-lg bg-[#F97316] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
              <div>
                <span className="font-bold text-[#9A3412] block mb-1">Analizar y Actuar</span>
                <span className="text-[#6B7280]">Define umbrales, responsables y acciones cuando hay desviaciones.</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de indicadores de eficiencia */}
      <Card>
        <CardHeader>
          <CardTitle>Indicadores de Eficiencia</CardTitle>
          <CardDescription>
            Monitoreo del uso óptimo de recursos y productividad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">ID</th>
                    <th className="text-left p-3 text-sm font-medium">Descripción</th>
                    <th className="text-left p-3 text-sm font-medium w-32">Valor</th>
                    <th className="text-left p-3 text-sm font-medium w-32">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {indicadores.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-12 text-gray-500">
                        No hay indicadores de eficiencia registrados
                      </td>
                    </tr>
                  ) : (
                    indicadores.map((indicador) => (
                      <tr key={indicador.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{indicador.id.substring(0, 8)}...</td>
                        <td className="p-3">
                          {indicador.descripcion || "Sin descripción"}
                        </td>
                        <td className="p-3">
                          <span className="text-sm">N/A</span>
                        </td>
                        <td className="p-3">
                          <Badge className="bg-gray-500">Pendiente</Badge>
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

      <Card className="col-span-4 md:col-span-4">
        <CardContent>
          <div className="mb-2 text-sm font-medium">Distribución (mini-gráfica)</div>
          <MiniBar counts={[0, 0, totalIndicadores]} />
        </CardContent>
      </Card>
      

      {/* Información adicional */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">¿Qué mide la eficiencia?</h3>
              <p className="text-sm text-blue-800">
                Los indicadores de eficiencia miden la relación entre los recursos utilizados y los resultados obtenidos.
                Un proceso eficiente maximiza la producción minimizando el uso de recursos (tiempo, dinero, materiales, personal).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}