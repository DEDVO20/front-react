import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Laptop,
  Users,
  Star,
  Tag,
  CheckCircle,
  BarChart2,
} from "lucide-react";
import { capacitacionService, Capacitacion } from "@/services/capacitacion.service";

const CapacitacionesHistorial = () => {
  const [historial, setHistorial] = useState<Capacitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const data = await capacitacionService.getHistorial();
      setHistorial(data);
    } catch (err: any) {
      console.error("Error al cargar historial:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Indicadores
  const total = historial.length;
  const virtuales = historial.filter((c) => c.modalidad === "Virtual").length;
  const presenciales = historial.filter((c) => c.modalidad === "Presencial").length;
  const horasTotales = historial.reduce((acc, cap) => {
    const horas = cap.duracionHoras || 0;
    return acc + horas;
  }, 0);

  const ultimaFecha = historial.length > 0
    ? historial
      .filter(c => c.fechaProgramada)
      .map((c) => new Date(c.fechaProgramada!))
      .sort((a, b) => b.getTime() - a.getTime())[0]
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando historial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Historial de Capacitaciones</h1>

      {/* Indicadores superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow rounded-2xl p-4 text-center border">
          <p className="text-sm text-gray-500">Total Capacitaciones</p>
          <p className="text-3xl font-bold text-indigo-600">{total}</p>
        </div>
        <div className="bg-white shadow rounded-2xl p-4 text-center border">
          <p className="text-sm text-gray-500">Horas Totales</p>
          <p className="text-3xl font-bold text-blue-600">{horasTotales}</p>
        </div>
        <div className="bg-white shadow rounded-2xl p-4 text-center border">
          <p className="text-sm text-gray-500">Virtuales</p>
          <p className="text-3xl font-bold text-purple-600">{virtuales}</p>
        </div>
        <div className="bg-white shadow rounded-2xl p-4 text-center border">
          <p className="text-sm text-gray-500">Presenciales</p>
          <p className="text-3xl font-bold text-green-600">{presenciales}</p>
        </div>
      </div>

      {/* Última capacitación */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-5 rounded-2xl mb-8 shadow-md flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">Última capacitación</p>
          <p className="text-lg font-semibold mt-1">
            {ultimaFecha ? ultimaFecha.toLocaleDateString() : "No disponible"}
          </p>
        </div>
        <BarChart2 className="w-10 h-10 opacity-80" />
      </div>

      {/* Lista de capacitaciones */}
      <div className="space-y-4">
        {historial.map((cap) => (
          <div
            key={cap.id}
            className="bg-white shadow rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center border hover:shadow-md transition"
          >
            <div className="flex-1 w-full">
              <h2 className="text-lg font-semibold text-gray-800">{cap.nombre}</h2>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-500" />
                  <span>{cap.tipoCapacitacion}</span>
                </div>
                <div className="flex items-center gap-2">
                  {cap.modalidad === "Virtual" ? (
                    <Laptop className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Users className="w-4 h-4 text-green-500" />
                  )}
                  <span>{cap.modalidad}</span>
                </div>
                {cap.fechaProgramada && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{new Date(cap.fechaProgramada).toLocaleDateString()}</span>
                  </div>
                )}
                {cap.duracionHoras && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{cap.duracionHoras} horas</span>
                  </div>
                )}
                {cap.instructor && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>Instructor: {cap.instructor}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Estado completada - sin calificación por ahora */}
            <div className="mt-4 md:mt-0 flex flex-col items-center">
              <div className="flex items-center text-green-600 font-medium text-sm">
                <CheckCircle className="w-5 h-5 mr-1" />
                Completada
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CapacitacionesHistorial;
