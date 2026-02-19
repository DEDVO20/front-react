import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PHVA_BLOCKS = [
  {
    title: "PLAN",
    color: "bg-blue-50 border-blue-200",
    items: ["Procesos definidos", "Etapas configuradas", "Riesgos identificados", "Competencias definidas"],
  },
  {
    title: "DO",
    color: "bg-emerald-50 border-emerald-200",
    items: ["Operaciones ejecutadas", "Capacitaciones realizadas", "Controles aplicados"],
  },
  {
    title: "CHECK",
    color: "bg-amber-50 border-amber-200",
    items: ["Indicadores medidos", "Auditorías ejecutadas", "Hallazgos detectados"],
  },
  {
    title: "ACT",
    color: "bg-rose-50 border-rose-200",
    items: ["Acciones correctivas", "Eficacia verificada", "Riesgos actualizados"],
  },
];

export default function DashboardPHVA() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {PHVA_BLOCKS.map((block) => (
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
