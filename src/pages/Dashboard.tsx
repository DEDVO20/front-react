
import { useEffect, useState } from "react";
import { analyticsService, DashboardMetrics, HeatmapPoint } from "@/services/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Activity,
  Search,
  ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await analyticsService.getAllDashboardData();
        setMetrics(data);
      } catch (error) {
        console.error("Error loading dashboard metrics:", error);
        toast.error("No se pudieron cargar las métricas del tablero.");
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-full">Cargando tablero...</div>;
  }

  // --- Data Transformations for Recharts ---

  // 1. NC Status Data
  const ncData = metrics?.calidad?.noconformidades
    ? Object.entries(metrics.calidad.noconformidades).map(([name, value]) => ({ name: name.replace('_', ' '), value }))
    : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // 2. Document Status Data
  const docData = metrics?.documentos?.por_estado
    ? Object.entries(metrics.documentos.por_estado).map(([name, value]) => ({ name: name.replace('_', ' '), cantidad: value }))
    : [];

  // 3. Risk Heatmap Data
  // Create a 5x5 grid (1-5 for probability and impact)
  const heatmapGrid = [];
  for (let i = 5; i >= 1; i--) { // Impact 5 (top) to 1 (bottom)
    const row = [];
    for (let p = 1; p <= 5; p++) { // Probability 1 (left) to 5 (right)
      const point = metrics?.riesgos?.find((r: HeatmapPoint) => r.probabilidad == p && r.impacto == i);
      row.push({
        prob: p,
        imp: i,
        count: point ? point.cantidad : 0,
        riskLevel: calculateRiskLevel(p, i)
      });
    }
    heatmapGrid.push(row);
  }

  function calculateRiskLevel(prob: number, imp: number) {
    const score = prob * imp;
    if (score >= 15) return "bg-red-500 text-white"; // Critical
    if (score >= 8) return "bg-orange-400 text-white"; // High
    if (score >= 4) return "bg-yellow-300 text-slate-900"; // Medium
    return "bg-green-400 text-slate-900"; // Low
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tablero de Control</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-500">Última actualización: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen Ejecutivo</TabsTrigger>
          <TabsTrigger value="quality">Calidad</TabsTrigger>
          <TabsTrigger value="risks">Riesgos</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Objetivos Activos</CardTitle>
                <TargetIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.calidad?.objetivos_total || 0}</div>
                <p className="text-xs text-muted-foreground">Objetivos de calidad definidos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">No Conformidades</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(metrics?.calidad?.noconformidades || {}).reduce((a, b) => a + b, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Reportadas en total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(metrics?.documentos?.por_estado || {}).reduce((a, b) => a + b, 0)}
                </div>
                <p className="text-xs text-muted-foreground">En el sistema</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hallazgos</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(metrics?.auditorias?.hallazgos_por_tipo || {}).reduce((a, b) => a + b, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Detectados en auditorías</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Estado de Documentos</CardTitle>
                <CardDescription>Distribución de documentos por su estado actual</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={docData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip />
                    <Bar dataKey="cantidad" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>No Conformidades</CardTitle>
                <CardDescription>Distribución por estado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={ncData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                      {ncData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Calor de Riesgos</CardTitle>
              <CardDescription>Visualización de Riesgos por Probabilidad e Impacto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="flex mb-2">
                  <span className="font-bold mr-2 w-20 text-right">Impacto</span>
                </div>
                <div className="grid gap-1" style={{ gridTemplateColumns: 'auto repeat(5, minmax(60px, 1fr))' }}>
                  {/* Y Axis Labels */}
                  <div className="flex flex-col justify-between h-80 py-4 mr-2">
                    {[5, 4, 3, 2, 1].map(n => <span key={n} className="font-bold flex items-center justify-center h-full">{n}</span>)}
                  </div>

                  {/* Grid */}
                  <div className="col-span-5 grid grid-rows-5 gap-1 h-80 w-full max-w-lg">
                    {heatmapGrid.map((row, i) => (
                      row.map((cell, j) => (
                        <div
                          key={`${i}-${j}`}
                          className={`${cell.riskLevel} flex items-center justify-center rounded-md font-bold shadow-sm transition-all hover:scale-105 cursor-pointer relative group`}
                        >
                          {cell.count > 0 ? cell.count : ''}
                          {cell.count > 0 && (
                            <div className="absolute hidden group-hover:block bg-black text-white text-xs p-1 rounded -top-8 w-max z-10">
                              Prob: {cell.prob}, Imp: {cell.imp} ({cell.count} riesgos)
                            </div>
                          )}
                        </div>
                      ))
                    ))}
                  </div>
                </div>
                {/* X Axis Labels */}
                <div className="grid grid-cols-5 gap-1 w-full max-w-lg mt-2 ml-8 pl-1">
                  {[1, 2, 3, 4, 5].map(n => <span key={n} className="font-bold text-center">{n}</span>)}
                </div>
                <div className="mt-2 text-center font-bold">Probabilidad</div>

                <div className="flex gap-4 mt-8 text-sm">
                  <div className="flex items-center"><div className="w-4 h-4 bg-green-400 mr-2 rounded"></div> Bajo (1-3)</div>
                  <div className="flex items-center"><div className="w-4 h-4 bg-yellow-300 mr-2 rounded"></div> Medio (4-6)</div>
                  <div className="flex items-center"><div className="w-4 h-4 bg-orange-400 mr-2 rounded"></div> Alto (8-12)</div>
                  <div className="flex items-center"><div className="w-4 h-4 bg-red-500 mr-2 rounded"></div> Crítico (15-25)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Icon wrapper
function TargetIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
