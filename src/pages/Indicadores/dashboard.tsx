import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { indicadorService, Indicador, TendenciaIndicador } from "@/services/indicador.service";
import DashboardPHVA from "@/components/dashboard/DashboardPHVA";
import { dashboardPhvaService, DashboardPHVAMetrics } from "@/services/dashboardPhva.service";

export default function IndicadoresDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [tendencias, setTendencias] = useState<Record<string, TendenciaIndicador>>({});
  const [phvaMetrics, setPhvaMetrics] = useState<DashboardPHVAMetrics | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await indicadorService.getAll();
        setIndicadores(data);

        const tendenciasResp = await Promise.all(
          data.slice(0, 20).map(async (indicador) => {
            try {
              const tendencia = await indicadorService.getTendencia(indicador.id);
              return [indicador.id, tendencia] as const;
            } catch {
              return [indicador.id, {
                indicador_id: indicador.id,
                total_mediciones: 0,
                promedio: 0,
                ultimo_valor: null,
                ultimo_periodo: null,
                tendencia: "sin_datos",
              }] as const;
            }
          })
        );
        setTendencias(Object.fromEntries(tendenciasResp));

        try {
          const metrics = await dashboardPhvaService.getMetrics();
          setPhvaMetrics(metrics);
        } catch {
          setPhvaMetrics(null);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner message="Cargando dashboard de indicadores..." />;

  const activos = indicadores.filter((i) => i.activo).length;
  const cumplimiento = indicadores.filter((i) => (i.meta || 0) >= 80).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Indicadores</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-md border p-4">
            <div className="text-xs text-slate-500">Total</div>
            <div className="text-2xl font-bold">{indicadores.length}</div>
          </div>
          <div className="rounded-md border p-4">
            <div className="text-xs text-slate-500">Activos</div>
            <div className="text-2xl font-bold">{activos}</div>
          </div>
          <div className="rounded-md border p-4">
            <div className="text-xs text-slate-500">Con meta {">="} 80</div>
            <div className="text-2xl font-bold">{cumplimiento}</div>
          </div>
        </CardContent>
      </Card>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Tendencia por Indicador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-2">Código</th>
                  <th className="text-left p-2">Indicador</th>
                  <th className="text-left p-2">Promedio</th>
                  <th className="text-left p-2">Último período</th>
                  <th className="text-left p-2">Último valor</th>
                  <th className="text-left p-2">Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {indicadores.map((indicador) => {
                  const t = tendencias[indicador.id];
                  return (
                    <tr key={indicador.id} className="border-t">
                      <td className="p-2 font-mono text-xs">{indicador.codigo}</td>
                      <td className="p-2">{indicador.nombre}</td>
                      <td className="p-2">{t ? Number(t.promedio).toFixed(2) : "-"}</td>
                      <td className="p-2">{t?.ultimo_periodo || "-"}</td>
                      <td className="p-2">{t?.ultimo_valor ?? "-"}</td>
                      <td className="p-2">{t?.tendencia || "sin_datos"}</td>
                    </tr>
                  );
                })}
                {indicadores.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-500">Sin indicadores</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <DashboardPHVA metrics={phvaMetrics} />
    </div>
  );
}
