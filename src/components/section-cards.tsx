import {
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  TrendingUpIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4*:data-[slot=card]:shadow-xs *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>No Conformidades Activas</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            12
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className="flex gap-1 rounded-lg text-xs bg-red-50 text-red-700 border-red-200"
            >
              <AlertTriangle className="size-3" />3 Mayores
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Requiere atención inmediata <AlertTriangle className="size-4" />
          </div>
          <div className="text-muted-foreground">9 menores en tratamiento</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Auditorías Programadas</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            8
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <FileCheck className="size-3" />
              Este mes
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            5 internas, 3 externas <FileCheck className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Próxima: ISO 9001 - 15 Nov
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Índice de Cumplimiento</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            94.5%
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className="flex gap-1 rounded-lg text-xs bg-green-50 text-green-700 border-green-200"
            >
              <TrendingUpIcon className="size-3" />
              +2.5%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Mejora continua <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Supera meta del 92%</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Acciones Correctivas</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            28
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className="flex gap-1 rounded-lg text-xs bg-green-50 text-green-700 border-green-200"
            >
              <CheckCircle2 className="size-3" />
              85% Cerradas
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            24 cerradas, 4 en proceso <CheckCircle2 className="size-4" />
          </div>
          <div className="text-muted-foreground">Efectividad del 91%</div>
        </CardFooter>
      </Card>
    </div>
  );
}
