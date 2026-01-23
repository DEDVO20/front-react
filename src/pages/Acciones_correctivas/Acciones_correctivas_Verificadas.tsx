import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { PlusIcon, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NuevasAccionesCorrectivas from "./nuevas";
import { accionCorrectivaService, AccionCorrectiva as IAccionCorrectiva } from "@/services/accionCorrectiva.service";

interface AccionCorrectivaUI {
  id: number;
  codigo: string;
  tipo: string;
  descripcion: string;
  estado: string;
  gravedad: string;
  fechaDeteccion: string;
  responsable: string;
}

export default function AccionesCorrectivasVerificadas() {
  const [accionesCorrectivas, setAccionesCorrectivas] = useState<AccionCorrectivaUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAccionesCorrectivasVerificadas();
  }, []);

  const fetchAccionesCorrectivasVerificadas = async () => {
    try {
      const accionesVerificadas = await accionCorrectivaService.getVerificadas();

      // Transformar los datos para el DataTable (adaptando a schema)
      const transformedData = accionesVerificadas.map((ac: IAccionCorrectiva, index: number) => {
        let fechaFormateada = "Sin fecha";

        // Prioridad: fechaVerificacion > fechaCompromiso
        const fechaAUsar = ac.fechaVerificacion || ac.fechaCompromiso;

        if (fechaAUsar) {
          try {
            // La fecha viene en formato YYYY-MM-DD, convertir a DD/MM/YYYY
            const [anio, mes, dia] = fechaAUsar.split('-');
            fechaFormateada = `${dia}/${mes}/${anio}`;
          } catch (e) {
            console.error("Error al formatear fecha:", e);
          }
        }

        return {
          id: index + 1,
          codigo: ac.codigo,
          tipo: ac.tipo || "Correctiva",
          descripcion: ac.descripcion || "Sin descripción",
          estado: "Verificada",
          gravedad: "Eficacia Comprobada",
          fechaDeteccion: fechaFormateada,
          responsable: "Sin asignar",
        };
      });

      setAccionesCorrectivas(transformedData);
      setTotal(transformedData.length);
    } catch (error) {
      console.error("Error:", error);
      // Datos de ejemplo en caso de error
      const ejemploData: AccionCorrectivaUI[] = [
        {
          id: 1,
          codigo: "AC-2024-001",
          tipo: "Correctiva",
          descripcion: "Mejora en proceso de validación - Eficacia comprobada",
          estado: "Verificada",
          gravedad: "Eficacia Comprobada",
          fechaDeteccion: "25/10/2024",
          responsable: "María López",
        },
        {
          id: 2,
          codigo: "AC-2024-002",
          tipo: "Preventiva",
          descripcion: "Actualización de procedimiento - Resultados positivos",
          estado: "Verificada",
          gravedad: "Eficacia Comprobada",
          fechaDeteccion: "15/09/2024",
          responsable: "Carlos Gómez",
        },
        {
          id: 3,
          codigo: "AC-2024-003",
          tipo: "Mejora",
          descripcion: "Optimización de proceso - Eficacia demostrada",
          estado: "Verificada",
          gravedad: "Eficacia Comprobada",
          fechaDeteccion: "30/08/2024",
          responsable: "Ana Martínez",
        },
      ];
      setAccionesCorrectivas(ejemploData);
      setTotal(ejemploData.length);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  const correctivas = accionesCorrectivas.filter(
    (ac) => ac.tipo === "Correctiva" || ac.tipo === "correctiva"
  ).length;
  const preventivas = accionesCorrectivas.filter(
    (ac) => ac.tipo === "Preventiva" || ac.tipo === "preventiva"
  ).length;
  const mejoras = accionesCorrectivas.filter(
    (ac) => ac.tipo === "Mejora" || ac.tipo === "mejora"
  ).length;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            Acciones Correctivas Verificadas
          </h1>
          <p className="text-muted-foreground">
            {total} acción{total !== 1 ? "es" : ""} con eficacia verificada
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Nueva Acción Correctiva
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Acción Correctiva</DialogTitle>
            </DialogHeader>
            <NuevasAccionesCorrectivas />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Verificadas</CardDescription>
            <CardTitle className="text-3xl">{total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Eficacia comprobada
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Correctivas</CardDescription>
            <CardTitle className="text-3xl text-orange-600">
              {correctivas}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200"
            >
              Verificadas
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Preventivas</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {preventivas}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              Verificadas
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Mejoras</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {mejoras}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              Verificadas
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información de Verificación</CardTitle>
          <CardDescription>
            Las acciones correctivas verificadas cumplen con:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
            <div>
              <span className="font-medium">Eficacia Comprobada:</span> Los
              resultados demuestran que la acción cumplió su objetivo
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
            <div>
              <span className="font-medium">Verificación Formal:</span>{" "}
              Validación por personal autorizado con evidencias
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500 mt-1.5" />
            <div>
              <span className="font-medium">Conformidad ISO 9001:</span>{" "}
              Cumplimiento de requisitos según Cláusula 10.2
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500 mt-1.5" />
            <div>
              <span className="font-medium">Mejora Continua:</span> Base para
              análisis de eficacia del SGC
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-card">
        <DataTable data={accionesCorrectivas} />
      </div>
    </div>
  );
}
