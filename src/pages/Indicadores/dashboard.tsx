import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { indicadorService, Indicador } from "@/services/indicador.service";
import DashboardPHVA from "@/components/dashboard/DashboardPHVA";

export default function IndicadoresDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await indicadorService.getAll();
        setIndicadores(data);
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

      <DashboardPHVA />
    </div>
  );
}
