import { useEffect, useState } from "react";
import { Shield, CheckCircle, XCircle, AlertTriangle, FileCheck } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { indicadorService, Indicador } from "@/services/indicador.service";

export default function CumplimientoIndicadores() {
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
      const data = await indicadorService.getAll({ tipo: "cumplimiento" });
      setIndicadores(data);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
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

  const totalIndicadores = indicadores.length;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-sky-500" />
            Cumplimiento
          </h1>
          <p className="text-gray-500">
            Verifique adherencia a estándares y regulaciones
          </p>
        </div>
      </div>

      {error && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
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

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Indicadores</CardTitle>
              <FileCheck className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{totalIndicadores}</div>
            <p className="text-xs text-gray-500 mt-1">Indicadores de cumplimiento</p>
          </CardHeader>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-800">Totalmente Cumplidos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-700">0</div>
            <p className="text-xs text-green-600 mt-1">Sin datos</p>
          </CardHeader>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-amber-800">Cumplimiento Parcial</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">0</div>
            <p className="text-xs text-amber-600 mt-1">Sin datos</p>
          </CardHeader>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-800">Incumplidos</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-700">0</div>
            <p className="text-xs text-red-600 mt-1">Sin datos</p>
          </CardHeader>
        </Card>
      </div>

      {/* Tabla de indicadores de cumplimiento */}
      <Card>
        <CardHeader>
          <CardTitle>Indicadores de Cumplimiento</CardTitle>
          <CardDescription>
            Seguimiento de adherencia a normativas, estándares y regulaciones
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
                    <th className="text-left p-3 text-sm font-medium w-32">Cumplimiento</th>
                    <th className="text-left p-3 text-sm font-medium w-32">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {indicadores.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-12 text-gray-500">
                        No hay indicadores de cumplimiento registrados
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
                          <Badge className="bg-gray-500 flex items-center gap-1 w-fit">
                            <FileCheck className="h-3 w-3" />
                            Pendiente
                          </Badge>
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

      {/* Información adicional */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-2">Importancia del Cumplimiento</h3>
              <p className="text-sm text-purple-800">
                Los indicadores de cumplimiento verifican que la organización sigue las normativas, estándares
                y regulaciones aplicables (ISO 9001, leyes laborales, normas ambientales, etc.).
                Un alto cumplimiento reduce riesgos legales y mejora la reputación organizacional.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}