import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Target, CheckCircle, AlertCircle, Calendar } from "lucide-react";
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

  const getMetaBadge = (meta: number) => {
    if (meta >= 90) return <Badge className="bg-green-500">Excelente</Badge>;
    if (meta >= 70) return <Badge className="bg-blue-500">Bueno</Badge>;
    if (meta >= 50) return <Badge className="bg-amber-500">Regular</Badge>;
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
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-sky-500" />
            Tablero de Indicadores
          </h1>
          <p className="text-gray-500">
            Visualice todos sus KPIs en un solo lugar
          </p>
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

      {/* Cards de resumen */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Indicadores</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{totalIndicadores}</div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{promedioMeta.toFixed(1)}%</div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Indicadores Activos</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{indicadoresActivos}</div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Excelentes (≥90%)</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{excelentes}</div>
          </CardHeader>
        </Card>
      </div>

      {/* Distribución por desempeño */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800">Excelentes (≥90%)</CardTitle>
            <div className="text-3xl font-bold text-green-600">{excelentes}</div>
          </CardHeader>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">Buenos (70-89%)</CardTitle>
            <div className="text-3xl font-bold text-blue-600">{buenos}</div>
          </CardHeader>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-800">Regulares (50-69%)</CardTitle>
            <div className="text-3xl font-bold text-amber-600">{regulares}</div>
          </CardHeader>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-800">Bajos (&lt;50%)</CardTitle>
            <div className="text-3xl font-bold text-red-600">{bajos}</div>
          </CardHeader>
        </Card>
      </div>

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
                  </tr>
                </thead>
                <tbody>
                  {indicadores.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-12 text-gray-500">
                        No hay indicadores registrados
                      </td>
                    </tr>
                  ) : (
                    indicadores.map((indicador) => (
                      <tr key={indicador.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{indicador.clave}</td>
                        <td className="p-3">
                          {indicador.descripcion || "Sin descripción"}
                        </td>
                        <td className="p-3">
                          <span className="text-lg font-bold">
                            {indicador.valor !== null && indicador.valor !== undefined 
                              ? `${indicador.valor.toFixed(1)}%` 
                              : "N/A"}
                          </span>
                        </td>
                        <td className="p-3">
                          {indicador.valor !== null && indicador.valor !== undefined 
                            ? getValorBadge(indicador.valor)
                            : <Badge variant="outline">Sin dato</Badge>}
                        </td>
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}