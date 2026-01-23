import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle, Users, Monitor, Building, Download } from "lucide-react";
import { capacitacionService, Capacitacion } from "@/services/capacitacion.service";

const CapacitacionesAsistencia: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedCapacitacion, setSelectedCapacitacion] = useState<any>(null);
  const [asistencias, setAsistencias] = useState<Capacitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarAsistencias();
  }, []);

  const cargarAsistencias = async () => {
    try {
      setLoading(true);
      const data = await capacitacionService.getHistorial();
      setAsistencias(data);
    } catch (err: any) {
      console.error("Error al cargar asistencias:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Datos simulados de asistencia (respaldo)
  const asistenciasBackup = [
    {
      id: 1,
      nombre: "Seguridad Industrial Avanzada",
      modalidad: "Presencial",
      fecha: "2025-10-10",
      hora: "09:00 AM",
      encargado: "Carlos Castro",
      estado: "Completada",
      observaciones: "Capacitación exitosa, todos los asistentes aprobaron.",
    },
    {
      id: 2,
      nombre: "Actualización en Normas ISO 9001",
      modalidad: "Virtual",
      fecha: "2025-09-25",
      hora: "02:00 PM",
      encargado: "Laura Martínez",
      estado: "Completada",
      observaciones: "Excelente participación grupal.",
    },
    {
      id: 3,
      nombre: "Primeros Auxilios Empresariales",
      modalidad: "Presencial",
      fecha: "2025-09-05",
      hora: "11:30 AM",
      encargado: "Andrés Pérez",
      estado: "Completada",
      observaciones: "Requiere refuerzo práctico.",
    },
  ];

  const openDialog = (capacitacion: any) => {
    setSelectedCapacitacion(capacitacion);
    setOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Título principal */}
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Historial de Asistencias a Capacitaciones
      </h1>

      {/* Indicadores superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md bg-white">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-500">
              Total Asistencias
            </CardTitle>
            <Users className="text-blue-500" size={22} />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600 text-center">
              {asistencias.length}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-white">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-500">
              Capacitaciones Virtuales
            </CardTitle>
            <Monitor className="text-purple-500" size={22} />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600 text-center">
              {asistencias.filter((a) => a.modalidad === "Virtual").length}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-white">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-500">
              Capacitaciones Presenciales
            </CardTitle>
            <Building className="text-green-500" size={22} />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600 text-center">
              {asistencias.filter((a) => a.modalidad === "Presencial").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de asistencias */}
      <Card className="shadow-md bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">
            Registro de Asistencias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full border border-gray-200 text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Modalidad</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Duración</th>
                <th className="p-3">Instructor</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asistencias.map((item) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 font-medium text-gray-700">{item.nombre}</td>
                  <td className="p-3">{item.modalidad}</td>
                  <td className="p-3">{item.fechaProgramada ? new Date(item.fechaProgramada).toLocaleDateString() : 'N/A'}</td>
                  <td className="p-3">{item.duracionHoras ? `${item.duracionHoras}h` : 'N/A'}</td>
                  <td className="p-3">{item.instructor || 'N/A'}</td>
                  <td className="p-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
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
              Certificado de Asistencia
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              🎓 Has completado la capacitación{" "}
              <strong>{selectedCapacitacion?.nombre}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 text-gray-700 text-sm space-y-2">
            <p>
              <strong>Fecha:</strong> {selectedCapacitacion?.fechaProgramada ? new Date(selectedCapacitacion.fechaProgramada).toLocaleString() : 'N/A'}
            </p>
            <p>
              <strong>Instructor:</strong> {selectedCapacitacion?.instructor || 'N/A'}
            </p>
            <p>
              <strong>Duración:</strong> {selectedCapacitacion?.duracionHoras ? `${selectedCapacitacion.duracionHoras} horas` : 'N/A'}
            </p>
            {selectedCapacitacion?.descripcion && (
              <p>{selectedCapacitacion.descripcion}</p>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => alert("Descargando certificado...")}
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar Certificado
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CapacitacionesAsistencia;
