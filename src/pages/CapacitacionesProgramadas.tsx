import { useState, useEffect } from "react";
import {
  CheckCircle,
  Laptop,
  Users,
  Calendar,
  Clock,
  MapPin,
  Link as LinkIcon,
  Tag,
} from "lucide-react";
import { capacitacionService, Capacitacion } from "@/services/capacitacion.service";

const CapacitacionesProgramadas = () => {
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarCapacitaciones();
  }, []);

  const cargarCapacitaciones = async () => {
    try {
      setLoading(true);
      const data = await capacitacionService.getProgramadas();
      setCapacitaciones(data);
    } catch (err: any) {
      console.error("Error al cargar capacitaciones:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const marcarCompletada = async (id: string) => {
    try {
      await capacitacionService.marcarCompletada(id);
      setCapacitaciones((prev) =>
        prev.map((cap) =>
          cap.id === id ? { ...cap, estado: "completada" } : cap
        )
      );
    } catch (err: any) {
      console.error("Error al marcar como completada:", err);
      alert("Error al marcar la capacitación como completada");
    }
  };

  const total = capacitaciones.length;
  const virtuales = capacitaciones.filter(
    (c) => c.modalidad === "Virtual"
  ).length;
  const presenciales = capacitaciones.filter(
    (c) => c.modalidad === "Presencial"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando capacitaciones...</p>
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
      <h1 className="text-2xl font-semibold mb-6">Capacitaciones Programadas</h1>

      {/* Indicadores superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow p-4 text-center border">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-3xl font-bold">{total}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 text-center border">
          <p className="text-sm text-gray-500">Virtuales</p>
          <p className="text-3xl font-bold text-blue-600">{virtuales}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 text-center border">
          <p className="text-sm text-gray-500">Presenciales</p>
          <p className="text-3xl font-bold text-green-600">{presenciales}</p>
        </div>
      </div>

      {/* Lista de capacitaciones */}
      <div className="space-y-4">
        {capacitaciones.map((cap) => (
          <div
            key={cap.id}
            className="bg-white shadow rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center border hover:shadow-md transition"
          >
            <div className="flex-1 w-full">
              <h2 className="text-lg font-semibold text-gray-800">
                {cap.nombre}
              </h2>
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
                {cap.lugar && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{cap.lugar}</span>
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

            <div className="mt-4 md:mt-0 flex flex-col items-center">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold mb-2 ${cap.estado === "programada"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
                  }`}
              >
                {cap.estado === "programada" ? "Pendiente" : cap.estado === "completada" ? "Completada" : cap.estado}
              </span>

              {cap.estado === "programada" ? (
                <button
                  onClick={() => marcarCompletada(cap.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  Marcar como asistida
                </button>
              ) : (
                <div className="flex items-center text-green-600 font-medium text-sm">
                  <CheckCircle className="w-5 h-5 mr-1" />
                  Completada
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CapacitacionesProgramadas;
