import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPHVAMetrics } from "@/services/dashboardPhva.service";

interface DashboardPHVAProps {
  metrics?: DashboardPHVAMetrics | null;
}

const PHVA_BLOCKS = (metrics?: DashboardPHVAMetrics | null) => [
  {
    title: "PLAN",
    color: "bg-blue-50 border-blue-200",
    items: [
      `Procesos definidos: ${metrics?.plan.procesosDefinidos ?? "-"}`,
      `Riesgos identificados: ${metrics?.plan.riesgosIdentificados ?? "-"}`,
      `Competencias definidas: ${metrics?.plan.competenciasDefinidas ?? "-"}`,
    ],
  },
  {
    title: "DO",
    color: "bg-emerald-50 border-emerald-200",
    items: [
      `Operaciones ejecutadas: ${metrics?.do.operacionesEjecutadas ?? "-"}`,
      `Capacitaciones realizadas: ${metrics?.do.capacitacionesRealizadas ?? "-"}`,
      `Controles aplicados: ${metrics?.do.controlesAplicados ?? "-"}`,
    ],
  },
  {
    title: "CHECK",
    color: "bg-amber-50 border-amber-200",
    items: [
      `Indicadores medidos: ${metrics?.check.indicadoresMedidos ?? "-"}`,
      `Auditorías ejecutadas: ${metrics?.check.auditoriasEjecutadas ?? "-"}`,
      `Hallazgos detectados: ${metrics?.check.hallazgosDetectados ?? "-"}`,
    ],
  },
  {
    title: "ACT",
    color: "bg-rose-50 border-rose-200",
    items: [
      `Acciones correctivas: ${metrics?.act.accionesCorrectivas ?? "-"}`,
      `Eficacia verificada: ${metrics?.act.eficaciaVerificada ?? "-"}`,
      `Riesgos actualizados: ${metrics?.act.riesgosActualizados ?? "-"}`,
    ],
  },
];

export default function DashboardPHVA({ metrics }: DashboardPHVAProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {PHVA_BLOCKS(metrics).map((block) => (
        <Card key={block.title} className={`border ${block.color}`}>
          <CardHeader>
            <CardTitle className="text-lg">{block.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-700">
              {block.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
