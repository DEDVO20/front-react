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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F7FA]">
        <div className="text-center">
          <Activity className="w-12 h-12 text-[#2563EB] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando auditorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Profesional */}
        <div className="bg-gradient-to-br from-[#E0EDFF] to-[#C7D2FE] rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
                <Activity className="h-9 w-9 text-[#2563EB]" />
                Auditorías en Curso
              </h1>
              <p className="text-[#6B7280] mt-2 text-lg">
                Supervisión activa del programa de auditorías del sistema de gestión
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Badge className="bg-white text-[#2563EB] border border-[#E5E7EB]">
                  {totalAuditorias} auditorías activas
                </Badge>
                <Badge className="bg-[#ECFDF5] text-[#22C55E]">
                  Progreso Promedio: {progresoPromedio}%
                </Badge>
              </div>
            </div>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm rounded-xl px-6 py-6 h-auto font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Programar Auditoría
            </Button>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#E0EDFF] border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-semibold text-[#1E3A8A]">Total en Curso</CardDescription>
                <Activity className="h-6 w-6 text-[#2563EB]" />
              </div>
              <CardTitle className="text-4xl font-bold text-[#1E3A8A]">{totalAuditorias}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-white border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-semibold text-[#6B7280]">Auditorías Internas</CardDescription>
                <FileText className="h-6 w-6 text-[#2563EB]" />
              </div>
              <CardTitle className="text-4xl font-bold text-[#1E3A8A]">{auditoriasInternas}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-white border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-semibold text-[#6B7280]">Hallazgos Totales</CardDescription>
                <AlertCircle className="h-6 w-6 text-[#2563EB]" />
              </div>
              <CardTitle className="text-4xl font-bold text-[#1E3A8A]">{totalHallazgos}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-[#C7D2FE]/20 border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-semibold text-[#1E3A8A]">Progreso General</CardDescription>
                <TrendingUp className="h-6 w-6 text-[#2563EB]" />
              </div>
              <CardTitle className="text-4xl font-bold text-[#1E3A8A]">{progresoPromedio}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-5 h-5" />
            <Input
              placeholder="Buscar por código o nombre de auditoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-6 border-[#E5E7EB] rounded-xl focus:ring-[#2563EB]/20 shadow-none border"
            />
          </div>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-4 py-4 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#2563EB]/20 outline-none bg-[#F8FAFC] font-bold text-[#1E3A8A] w-full md:w-64 cursor-pointer"
          >
            <option value="todas">Todos los tipos</option>
            <option value="interna">Interna</option>
            <option value="externa">Externa</option>
            <option value="certificacion">Certificación</option>
            <option value="seguimiento">Seguimiento</option>
          </select>
        </div>

        {/* Lista de Auditorías */}
        <div className="grid grid-cols-1 gap-8">
          {auditoriasFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-20 text-center border border-[#E5E7EB]">
              <Activity className="w-20 h-20 text-gray-200 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-[#1E3A8A] mb-2">No se encontraron auditorías</h3>
              <p className="text-[#6B7280]">Prueba ajustando tus filtros de búsqueda</p>
            </div>
          ) : (
            auditoriasFiltradas.map((auditoria) => {
              const diasRestantes = getDiasRestantes(auditoria.fechaFin);

              return (
                <div
                  key={auditoria.id}
                  className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] hover:shadow-md transition-all group overflow-hidden"
                >
                  <div className="p-8">
                    {/* Header Card */}
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-bold text-[#1E3A8A]">
                            {auditoria.codigo}
                          </h3>
                          <Badge variant="outline" className="bg-[#E0EDFF] text-[#2563EB] border-[#2563EB]/20 font-bold px-3">
                            {auditoria.tipo.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-[#111827] text-lg font-semibold">{auditoria.nombre}</p>
                        <p className="text-[#6B7280] max-w-2xl italic leading-relaxed">
                          "{auditoria.objetivo}"
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="ghost" className="p-3 bg-[#F8FAFC] hover:bg-[#E0EDFF] text-[#2563EB] rounded-xl transition-all border border-[#E5E7EB]">
                          <Eye className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" className="p-3 bg-[#F8FAFC] hover:bg-[#E0EDFF] text-[#2563EB] rounded-xl transition-all border border-[#E5E7EB]">
                          <Edit className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Información y Progreso */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E7EB]">
                          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">Fecha Inicio</p>
                          <div className="flex items-center gap-2 text-[#1E3A8A] font-bold">
                            <Calendar className="w-4 h-4" />
                            {new Date(auditoria.fechaInicio).toLocaleDateString()}
                          </div>
                        </div>

                        <div className={`p-4 rounded-xl border ${diasRestantes <= 3 ? 'bg-red-50 border-red-100' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
                          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">Días Restantes</p>
                          <div className={`flex items-center gap-2 font-bold ${diasRestantes <= 3 ? 'text-red-600' : 'text-[#1E3A8A]'}`}>
                            <Clock className="w-4 h-4" />
                            {diasRestantes} días
                          </div>
                        </div>

                        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E7EB]">
                          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">Auditor Líder</p>
                          <div className="flex items-center gap-2 text-[#1E3A8A] font-bold truncate">
                            <Users className="w-4 h-4" />
                            {auditoria.auditorLider?.nombre}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-sm text-[#1E3A8A]">Avance de Ejecución</span>
                          <span className="text-xl text-[#2563EB]">{auditoria.progreso}%</span>
                        </div>
                        <div className="w-full bg-[#F3F4F6] rounded-full h-4 overflow-hidden border border-[#E5E7EB]">
                          <div
                            className="h-full bg-[#2563EB] rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                            style={{ width: `${auditoria.progreso}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Hallazgos */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-[#E5E7EB]">
                      <div className="flex items-center gap-4 text-[#4B5563] font-medium">
                        <div className="bg-[#FEFCE8] text-[#854D0E] font-bold px-4 py-1 rounded-lg border border-[#EAB308]/20 flex items-center gap-2">
                          <AlertCircle size={14} />
                          {auditoria.hallazgosCount} Hallazgos Registrados
                        </div>
                      </div>

                      <Button variant="ghost" className="mt-4 sm:mt-0 px-6 py-2 bg-[#F8FAFC] hover:bg-[#2563EB] text-[#1E3A8A] hover:text-white font-bold rounded-xl transition-all flex items-center gap-2 border border-[#E5E7EB]">
                        Gestionar Evidencia
                        <CheckCircle2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}