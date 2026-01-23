import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Award, Brain, Users, TrendingUp } from "lucide-react";
import { capacitacionService, Capacitacion } from "@/services/capacitacion.service";

const CapacitacionesCompetencias: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([]);

  useEffect(() => {
    cargarCapacitaciones();
  }, []);

  const cargarCapacitaciones = async () => {
    try {
      setLoading(true);
      const data = await capacitacionService.getAll();
      setCapacitaciones(data);
    } catch (err) {
      console.error("Error al cargar capacitaciones:", err);
    } finally {
      setLoading(false);
    }
  };
  const [open, setOpen] = useState(false);
  const [selectedCompetencia, setSelectedCompetencia] = useState<any>(null);

  // Datos simulados de competencias
  const competencias = [
    {
      id: 1,
      nombre: "Liderazgo y Toma de Decisiones",
      capacitacion: "Formación de Líderes de Equipo",
      responsable: "Laura Martínez",
      fecha: "2025-08-15",
      estado: "Reforzada",
      nivel: "Avanzado",
      descripcion: "Se evidenció una mejora significativa en la autonomía y liderazgo del equipo.",
    },
    {
      id: 2,
      nombre: "Trabajo en Equipo",
      capacitacion: "Comunicación y Colaboración",
      responsable: "Carlos Castro",
      fecha: "2025-07-12",
      estado: "Desarrollada",
      nivel: "Intermedio",
      descripcion: "Los participantes demostraron mejor coordinación en tareas conjuntas.",
    },
    {
      id: 3,
      nombre: "Gestión del Tiempo",
      capacitacion: "Productividad y Eficiencia Personal",
      responsable: "Ana Gómez",
      fecha: "2025-06-20",
      estado: "Pendiente de Refuerzo",
      nivel: "Básico",
      descripcion: "Se identificó la necesidad de seguimiento para consolidar la mejora.",
    },
  ];

  // Datos para gráfico de resumen
  const data = [
    { name: "Reforzada", value: competencias.filter((c) => c.estado === "Reforzada").length },
    { name: "Desarrollada", value: competencias.filter((c) => c.estado === "Desarrollada").length },
    { name: "Pendiente", value: competencias.filter((c) => c.estado === "Pendiente de Refuerzo").length },
  ];

  // Colores por estado
  const getColor = (estado: string) => {
    if (estado === "Reforzada") return "text-green-600 font-semibold";
    if (estado === "Desarrollada") return "text-blue-600 font-semibold";
    return "text-orange-600 font-semibold";
  };

  const openDialog = (competencia: any) => {
    setSelectedCompetencia(competencia);
    setOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Título principal */}
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Competencias Desarrolladas en Capacitaciones
      </h1>

      {/* Indicadores superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md bg-white">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-500">
              Total de Competencias Evaluadas
            </CardTitle>
            <Brain className="text-blue-500" size={22} />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600 text-center">
              {competencias.length}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-white">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-500">
              Competencias Reforzadas
            </CardTitle>
            <Award className="text-green-500" size={22} />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600 text-center">
              {competencias.filter((c) => c.estado === "Reforzada").length}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-white">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-500">
              Competencias Pendientes
            </CardTitle>
            <TrendingUp className="text-orange-500" size={22} />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600 text-center">
              {competencias.filter((c) => c.estado === "Pendiente de Refuerzo").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de competencias */}
      <Card className="shadow-md bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">
            Evaluación de Competencias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full border border-gray-200 text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-3">Competencia</th>
                <th className="p-3">Capacitación Asociada</th>
                <th className="p-3">Responsable</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Nivel</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {competencias.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium text-gray-700">{item.nombre}</td>
                  <td className="p-3">{item.capacitacion}</td>
                  <td className="p-3">{item.responsable}</td>
                  <td className="p-3">{item.fecha}</td>
                  <td className="p-3">{item.nivel}</td>
                  <td className="p-3">
                    <Badge
                      variant="secondary"
                      className={
                        item.estado === "Reforzada"
                          ? "bg-green-100 text-green-700"
                          : item.estado === "Desarrollada"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }
                    >
                      {item.estado}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      onClick={() => openDialog(item)}
                    >
                      Ver Detalles
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      

      {/* Modal flotante */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-blue-700">
              Detalles de Competencia
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Información detallada sobre la competencia seleccionada.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 text-gray-700 text-sm space-y-2">
            <p><strong>Competencia:</strong> {selectedCompetencia?.nombre}</p>
            <p><strong>Capacitación:</strong> {selectedCompetencia?.capacitacion}</p>
            <p><strong>Responsable:</strong> {selectedCompetencia?.responsable}</p>
            <p><strong>Fecha:</strong> {selectedCompetencia?.fecha}</p>
            <p><strong>Nivel:</strong> {selectedCompetencia?.nivel}</p>
            <p><strong>Estado:</strong> <span className={getColor(selectedCompetencia?.estado || "")}>{selectedCompetencia?.estado}</span></p>
            <p>{selectedCompetencia?.descripcion}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CapacitacionesCompetencias;
