import { useEffect, useState } from "react";
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  FileText,
  Filter,
  Search,
  Eye,
  Edit,
  TrendingUp,
  Activity
} from "lucide-react";
import { auditoriaService } from "@/services/auditoria.service";

interface Auditoria {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  alcance: string;
  objetivo: string;
  fechaPlanificada: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  auditorLider?: {
    id: string;
    nombre: string;
    primerApellido: string;
    segundoApellido?: string;
  };
  hallazgosCount: number;
  progreso: number;
}

export default function AuditoriasEnCurso() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todas");

  useEffect(() => {
    fetchAuditorias();
  }, []);

  const fetchAuditorias = async () => {
    try {
      const data = await auditoriaService.getEnCurso();
      setAuditorias(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar auditorías:", error);
      console.warn("Usando datos de ejemplo");
      // Fallback a datos de ejemplo
      const ejemploData: Auditoria[] = [
        {
          id: "1",
          codigo: "AUD-2024-015",
          nombre: "Auditoría Interna ISO 9001:2015",
          tipo: "interna",
          alcance: "Procesos de producción y control de calidad",
          objetivo: "Verificar cumplimiento de requisitos ISO 9001:2015",
          fechaPlanificada: "2024-11-01",
          fechaInicio: "2024-11-05",
          fechaFin: "2024-11-15",
          estado: "en_curso",
          auditorLider: {
            id: "u1",
            nombre: "Carlos",
            primerApellido: "Mendoza"
          },
          hallazgosCount: 5,
          progreso: 65
        },
        {
          id: "2",
          codigo: "AUD-2024-016",
          nombre: "Auditoría de Seguimiento Certificación",
          tipo: "seguimiento",
          alcance: "Acciones correctivas del periodo anterior",
          objetivo: "Validar implementación de acciones correctivas",
          fechaPlanificada: "2024-11-03",
          fechaInicio: "2024-11-06",
          fechaFin: "2024-11-13",
          estado: "en_curso",
          auditorLider: {
            id: "u2",
            nombre: "Ana María",
            primerApellido: "Torres"
          },
          hallazgosCount: 2,
          progreso: 40
        },
        {
          id: "3",
          codigo: "AUD-2024-017",
          nombre: "Auditoría Procesos de Compras",
          tipo: "interna",
          alcance: "Área de compras y gestión de proveedores",
          objetivo: "Evaluar eficacia del proceso de compras",
          fechaPlanificada: "2024-11-04",
          fechaInicio: "2024-11-07",
          fechaFin: "2024-11-14",
          estado: "en_curso",
          auditorLider: {
            id: "u3",
            nombre: "Roberto",
            primerApellido: "Silva"
          },
          hallazgosCount: 8,
          progreso: 75
        }
      ];
      setAuditorias(ejemploData);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de auditorías
  const auditoriasFiltradas = auditorias.filter(auditoria => {
    const matchSearch = auditoria.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       auditoria.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === "todas" || auditoria.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  // Estadísticas
  const totalAuditorias = auditorias.length;
  const auditoriasInternas = auditorias.filter(a => a.tipo === "interna").length;
  const auditoriasSeguimiento = auditorias.filter(a => a.tipo === "seguimiento").length;
  const totalHallazgos = auditorias.reduce((sum, a) => sum + a.hallazgosCount, 0);
  const progresoPromedio = totalAuditorias > 0
    ? Math.round(auditorias.reduce((sum, a) => sum + a.progreso, 0) / totalAuditorias)
    : 0;

  // Función para obtener días restantes
  const getDiasRestantes = (fechaFin: string) => {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diff = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Función para color del tipo
  const getTipoColor = (tipo: string) => {
    const colores: Record<string, string> = {
      interna: "bg-blue-100 text-blue-700 border-blue-300",
      externa: "bg-purple-100 text-purple-700 border-purple-300",
      certificacion: "bg-green-100 text-green-700 border-green-300",
      seguimiento: "bg-orange-100 text-orange-700 border-orange-300"
    };
    return colores[tipo] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando auditorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Auditorías en Curso
                </h1>
                <p className="text-gray-600 mt-1">
                  {totalAuditorias} auditoría{totalAuditorias !== 1 ? "s" : ""} en ejecución activa
                </p>
              </div>
            </div>
            
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Programar Auditoría
            </button>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">{totalAuditorias}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total en Curso</h3>
            <p className="text-sm text-gray-500 mt-1">Auditorías activas</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-2xl font-bold text-indigo-600">{auditoriasInternas}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Auditorías Internas</h3>
            <p className="text-sm text-gray-500 mt-1">Evaluaciones internas</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-orange-600">{totalHallazgos}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Hallazgos Totales</h3>
            <p className="text-sm text-gray-500 mt-1">Identificados hasta hoy</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">{progresoPromedio}%</span>
            </div>
            <h3 className="text-gray-600 font-medium">Progreso Promedio</h3>
            <p className="text-sm text-gray-500 mt-1">Avance general</p>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por código o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="todas">Todos los tipos</option>
                <option value="interna">Interna</option>
                <option value="externa">Externa</option>
                <option value="certificacion">Certificación</option>
                <option value="seguimiento">Seguimiento</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Auditorías */}
        <div className="grid grid-cols-1 gap-6">
          {auditoriasFiltradas.map((auditoria) => {
            const diasRestantes = getDiasRestantes(auditoria.fechaFin);
            
            return (
              <div 
                key={auditoria.id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  {/* Header de la tarjeta */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {auditoria.codigo}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTipoColor(auditoria.tipo)}`}>
                          {auditoria.tipo.charAt(0).toUpperCase() + auditoria.tipo.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium mb-2">
                        {auditoria.nombre}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Objetivo:</span> {auditoria.objetivo}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-5 h-5 text-blue-600" />
                      </button>
                      <button className="p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit className="w-5 h-5 text-indigo-600" />
                      </button>
                    </div>
                  </div>

                  {/* Información de fechas y auditor */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Inicio</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(auditoria.fechaInicio).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Días restantes</p>
                        <p className={`text-sm font-semibold ${diasRestantes <= 3 ? 'text-red-600' : 'text-gray-900'}`}>
                          {diasRestantes} días
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <Users className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Auditor Líder</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {auditoria.auditorLider 
                            ? `${auditoria.auditorLider.nombre} ${auditoria.auditorLider.primerApellido}`
                            : 'No asignado'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progreso de la auditoría</span>
                      <span className="text-sm font-bold text-blue-600">{auditoria.progreso}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${auditoria.progreso}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer con hallazgos */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {auditoria.hallazgosCount} hallazgo{auditoria.hallazgosCount !== 1 ? "s" : ""} identificado{auditoria.hallazgosCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
                      Ver detalles
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mensaje cuando no hay resultados */}
        {auditoriasFiltradas.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron auditorías
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterTipo !== "todas" 
                ? "Intenta ajustar los filtros de búsqueda" 
                : "No hay auditorías en curso en este momento"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}