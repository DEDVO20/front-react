import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { PlusIcon, CheckCircle } from "lucide-react";
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

export default function AccionesCorrectivasCerradas() {
  const [accionesCorrectivas, setAccionesCorrectivas] = useState<AccionCorrectivaUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAccionesCorrectivasCerradas();
  }, []);

  const fetchAccionesCorrectivasCerradas = async () => {
    try {
      const accionesCerradas = await accionCorrectivaService.getCerradas();

      // Transformar los datos para el DataTable
      const transformedData = accionesCerradas.map((ac: IAccionCorrectiva, index: number) => {
        let fechaFormateada = "Sin fecha";
        if (ac.fechaCompromiso) {
          try {
            // La fecha viene en formato YYYY-MM-DD, convertir a DD/MM/YYYY
            const [anio, mes, dia] = ac.fechaCompromiso.split('-');
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
          estado: "Cerrada",
          gravedad: ac.eficaciaVerificada ? "Verificada" : "Pendiente Verificación",
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
          descripcion: "Mejora en proceso de validación de documentos",
          estado: "Cerrada",
          gravedad: "Verificada",
          fechaDeteccion: "15/10/2024",
          responsable: "María López",
        },
        {
          id: 2,
          codigo: "AC-2024-002",
          tipo: "Preventiva",
          descripcion: "Actualización de procedimiento de auditoría",
          estado: "Cerrada",
          gravedad: "Verificada",
          fechaDeteccion: "01/09/2024",
          responsable: "Carlos Gómez",
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
  const verificadas = accionesCorrectivas.filter(
    (ac) => ac.gravedad === "Verificada"
  ).length;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Acciones Correctivas Cerradas
          </h1>
          <p className="text-muted-foreground">
            {total} acción{total !== 1 ? "es" : ""} completamente implementada{total !== 1 ? "s" : ""}
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
            <CardDescription>Total Cerradas</CardDescription>
            <CardTitle className="text-3xl">{total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Acciones completadas
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
              Corrección
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
              Prevención
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Eficacia Verificada</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {verificadas}
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
          <CardTitle className="text-base">Información de Registro</CardTitle>
          <CardDescription>
            Las acciones correctivas cerradas son aquellas que:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
            <div>
              <span className="font-medium">Implementadas:</span> Todas las
              acciones planificadas fueron ejecutadas según lo programado
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
            <div>
              <span className="font-medium">Documentadas:</span> Registro
              completo de implementación y resultados
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500 mt-1.5" />
            <div>
              <span className="font-medium">Historial:</span> Disponibles para
              análisis de mejora continua
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
