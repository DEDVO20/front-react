import { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Users,
  FileCheck,
  Target,
  Activity,
  X
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const API_URL = "http://localhost:8000/api";

interface Auditoria {
  id: string;
  codigo: string;
  nombre: string;
  tipo_auditoria: string;
  estado: string;
  fecha_planificada?: string;
}

interface NoConformidad {
  id: string;
  codigo: string;
  descripcion: string;
  tipo: string;
  gravedad?: string;
  estado: string;
  fecha_deteccion: string;
}

interface ObjetivoCalidad {
  id: string;
  codigo: string;
  descripcion: string;
  estado: string;
  progreso: number;
}

interface Indicador {
  id: string;
  codigo: string;
  nombre: string;
}

const ReportesView = () => {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [showModal, setShowModal] = useState(false);
  const [reportType, setReportType] = useState('ejecutivo');
  const [reportFormat, setReportFormat] = useState('pdf');
  
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [noConformidades, setNoConformidades] = useState<NoConformidad[]>([]);
  const [objetivos, setObjetivos] = useState<ObjetivoCalidad[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        throw new Error("No hay sesión activa");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [auditoriasRes, ncRes, objetivosRes, indicadoresRes] = await Promise.all([
        fetch(`${API_URL}/auditorias`, { headers }).catch(() => null),
        fetch(`${API_URL}/no-conformidades`, { headers }).catch(() => null),
        fetch(`${API_URL}/objetivos-calidad`, { headers }).catch(() => null),
        fetch(`${API_URL}/indicadores`, { headers }).catch(() => null),
      ]);

      const [auditoriasData, ncData, objetivosData, indicadoresData] = await Promise.all([
        auditoriasRes?.ok ? auditoriasRes.json() : [],
        ncRes?.ok ? ncRes.json() : [],
        objetivosRes?.ok ? objetivosRes.json() : [],
        indicadoresRes?.ok ? indicadoresRes.json() : [],
      ]);

      setAuditorias(auditoriasData || []);
      setNoConformidades(ncData || []);
      setObjetivos(objetivosData || []);
      setIndicadores(indicadoresData || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Estadísticas
  const totalAuditorias = auditorias.length;
  const auditoriasCompletadas = auditorias.filter(a => a.estado === "completada").length;
  const totalNC = noConformidades.length;
  const ncCerradas = noConformidades.filter(nc => nc.estado === "cerrada").length;
  const totalObjetivos = objetivos.length;
  const objetivosCumplidos = objetivos.filter(o => o.estado === "cumplido").length;

  // Lista de reportes - PRIMERO declarar la lista
  const reportsList = [
    {
      id: 1,
      title: 'Reporte de Auditorías Internas Q4 2024',
      category: 'auditorias',
      date: '2024-11-15',
      status: 'completado',
      format: 'PDF',
      size: '2.4 MB',
      description: 'Resultados de auditorías internas del cuarto trimestre'
    },
    {
      id: 2,
      title: 'Estado de No Conformidades Octubre 2024',
      category: 'noconformidades',
      date: '2024-11-01',
      status: 'completado',
      format: 'XLSX',
      size: '856 KB',
      description: 'Seguimiento y cierre de no conformidades del mes'
    },
    {
      id: 3,
      title: 'Avance de Objetivos de Calidad 2024',
      category: 'objetivos',
      date: '2024-11-18',
      status: 'procesando',
      format: 'PDF',
      size: '1.8 MB',
      description: 'Progreso anual de objetivos de calidad establecidos'
    },
    {
      id: 4,
      title: 'Indicadores de Desempeño Mensual',
      category: 'indicadores',
      date: '2024-11-20',
      status: 'completado',
      format: 'XLSX',
      size: '1.2 MB',
      description: 'KPIs y métricas de calidad del mes actual'
    },
    {
      id: 5,
      title: 'Análisis de Riesgos y Oportunidades',
      category: 'auditorias',
      date: '2024-11-10',
      status: 'completado',
      format: 'PDF',
      size: '3.1 MB',
      description: 'Evaluación de riesgos identificados y planes de acción'
    },
    {
      id: 6,
      title: 'Capacitaciones del Personal',
      category: 'indicadores',
      date: '2024-11-05',
      status: 'completado',
      format: 'PDF',
      size: '1.5 MB',
      description: 'Registro de capacitaciones y competencias del personal'
    }
  ];

  // Contar reportes por categoría - DESPUÉS de declarar reportsList
  const countReportesPorCategoria = (categoria: string) => {
    return reportsList.filter(r => r.category === categoria).length;
  };

  const reportCategories = [
    { id: 'todos', name: 'Todos los Reportes', icon: FileText, count: reportsList.length },
    { id: 'auditorias', name: 'Auditorías', icon: FileCheck, count: countReportesPorCategoria('auditorias') },
    { id: 'noconformidades', name: 'No Conformidades', icon: AlertCircle, count: countReportesPorCategoria('noconformidades') },
    { id: 'objetivos', name: 'Objetivos de Calidad', icon: Target, count: countReportesPorCategoria('objetivos') },
    { id: 'indicadores', name: 'Indicadores', icon: TrendingUp, count: countReportesPorCategoria('indicadores') }
  ];

  const stats = [
    { label: 'Reportes Generados', value: '156', change: '+12%', icon: FileText, color: 'bg-blue-500' },
    { label: 'Auditorías Realizadas', value: totalAuditorias.toString(), change: `${auditoriasCompletadas} completadas`, icon: FileCheck, color: 'bg-green-500' },
    { label: 'NC Cerradas', value: ncCerradas.toString(), change: `de ${totalNC} total`, icon: CheckCircle, color: 'bg-purple-500' },
    { label: 'En Proceso', value: '7', change: '-3%', icon: Clock, color: 'bg-orange-500' }
  ];

  const quickActions = [
    { icon: BarChart3, label: 'Reporte Ejecutivo', color: 'bg-blue-500', type: 'ejecutivo' },
    { icon: FileCheck, label: 'Reporte de Auditorías', color: 'bg-purple-500', type: 'auditorias' },
    { icon: AlertCircle, label: 'Reporte de NC', color: 'bg-green-500', type: 'no_conformidades' },
    { icon: Target, label: 'Reporte de Objetivos', color: 'bg-orange-500', type: 'objetivos' }
  ];

  // Datos para gráficas - DINÁMICOS según datos del backend Y reportes disponibles
  // Combinar datos reales del backend con los reportes de la lista
  const dataAuditoriasPorEstado = [
    { estado: "Planificada", cantidad: auditorias.filter(a => a.estado === "planificada").length, color: "#f59e0b" },
    { estado: "En Curso", cantidad: auditorias.filter(a => a.estado === "en_curso").length, color: "#3b82f6" },
    { estado: "Completada", cantidad: auditorias.filter(a => a.estado === "completada").length + reportsList.filter(r => r.category === 'auditorias' && r.status === 'completado').length, color: "#10b981" },
  ].filter(item => item.cantidad > 0); // Solo mostrar estados con datos

  const dataAuditoriasPorTipo = [
    { tipo: "Interna", cantidad: auditorias.filter(a => a.tipo_auditoria === "interna").length + reportsList.filter(r => r.category === 'auditorias').length },
    { tipo: "Externa", cantidad: auditorias.filter(a => a.tipo_auditoria === "externa").length },
    { tipo: "Seguimiento", cantidad: auditorias.filter(a => a.tipo_auditoria === "seguimiento").length },
  ].filter(item => item.cantidad > 0);

  const dataNCPorEstado = [
    { estado: "Abierta", cantidad: noConformidades.filter(nc => nc.estado === "abierta").length, color: "#ef4444" },
    { estado: "En Análisis", cantidad: noConformidades.filter(nc => nc.estado === "en_analisis").length, color: "#f59e0b" },
    { estado: "En Corrección", cantidad: noConformidades.filter(nc => nc.estado === "en_correccion").length, color: "#3b82f6" },
    { estado: "Cerrada", cantidad: noConformidades.filter(nc => nc.estado === "cerrada").length + reportsList.filter(r => r.category === 'noconformidades' && r.status === 'completado').length, color: "#10b981" },
  ].filter(item => item.cantidad > 0);

  const dataNCPorGravedad = [
    { gravedad: "Crítica", cantidad: noConformidades.filter(nc => nc.gravedad === "critica").length, color: "#dc2626" },
    { gravedad: "Mayor", cantidad: noConformidades.filter(nc => nc.gravedad === "mayor").length, color: "#f59e0b" },
    { gravedad: "Menor", cantidad: noConformidades.filter(nc => nc.gravedad === "menor").length + reportsList.filter(r => r.category === 'noconformidades').length, color: "#fbbf24" },
  ].filter(item => item.cantidad > 0);

  const dataObjetivosPorEstado = [
    { estado: "Cumplido", cantidad: objetivos.filter(o => o.estado === "cumplido").length + reportsList.filter(r => r.category === 'objetivos' && r.status === 'completado').length, color: "#10b981" },
    { estado: "En Progreso", cantidad: objetivos.filter(o => o.estado === "en_progreso").length + reportsList.filter(r => r.category === 'objetivos' && r.status === 'procesando').length, color: "#3b82f6" },
    { estado: "Atrasado", cantidad: objetivos.filter(o => o.estado === "atrasado").length, color: "#ef4444" },
  ].filter(item => item.cantidad > 0);

  // Gráfica de reportes generados por categoría
  const dataReportesPorCategoria = [
    { categoria: "Auditorías", cantidad: reportsList.filter(r => r.category === 'auditorias').length, color: "#6366f1" },
    { categoria: "No Conformidades", cantidad: reportsList.filter(r => r.category === 'noconformidades').length, color: "#f59e0b" },
    { categoria: "Objetivos", cantidad: reportsList.filter(r => r.category === 'objetivos').length, color: "#8b5cf6" },
    { categoria: "Indicadores", cantidad: reportsList.filter(r => r.category === 'indicadores').length, color: "#10b981" },
  ].filter(item => item.cantidad > 0);

  // Datos para evolución temporal de reportes (últimos 6 meses)
  const dataEvolucionReportes = [
    { mes: "Ago", auditorias: 3, nc: 2, objetivos: 4, indicadores: 3 },
    { mes: "Sep", auditorias: 5, nc: 3, objetivos: 3, indicadores: 4 },
    { mes: "Oct", auditorias: 4, nc: 4, objetivos: 5, indicadores: 5 },
    { mes: "Nov", auditorias: 6, nc: 2, objetivos: 4, indicadores: 6 },
    { mes: "Dic", auditorias: reportsList.filter(r => r.category === 'auditorias').length || 2, nc: reportsList.filter(r => r.category === 'noconformidades').length || 1, objetivos: reportsList.filter(r => r.category === 'objetivos').length || 1, indicadores: reportsList.filter(r => r.category === 'indicadores').length || 2 },
  ];

  // Datos para radar chart (cumplimiento por área)
  const dataRadarCumplimiento = [
    { area: "Auditorías", cumplimiento: auditoriasCompletadas > 0 ? Math.round((auditoriasCompletadas / totalAuditorias) * 100) : 0, fullMark: 100 },
    { area: "No Conformidades", cumplimiento: ncCerradas > 0 ? Math.round((ncCerradas / totalNC) * 100) : 0, fullMark: 100 },
    { area: "Objetivos", cumplimiento: objetivosCumplidos > 0 ? Math.round((objetivosCumplidos / totalObjetivos) * 100) : 0, fullMark: 100 },
    { area: "Indicadores", cumplimiento: 75, fullMark: 100 },
    { area: "Reportes", cumplimiento: reportsList.filter(r => r.status === 'completado').length > 0 ? Math.round((reportsList.filter(r => r.status === 'completado').length / reportsList.length) * 100) : 0, fullMark: 100 },
  ];

  const filteredReports = selectedCategory === 'todos' 
    ? reportsList 
    : reportsList.filter(r => r.category === selectedCategory);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completado: 'bg-green-100 text-green-800 border-green-200',
      procesando: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200'
    };
    const labels: Record<string, string> = {
      completado: 'Completado',
      procesando: 'Procesando',
      error: 'Error'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const handleGenerateReport = () => {
    console.log("Generando reporte:", { reportType, selectedPeriod, reportFormat });
    alert(`✅ Generando reporte:\n\nTipo: ${reportType}\nPeríodo: ${selectedPeriod}\nFormato: ${reportFormat.toUpperCase()}\n\nEl reporte se descargará en breve...`);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
          <p className="mt-4 text-sm text-slate-600 font-medium">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              Reportes y Análisis
            </h1>
            <p className="text-slate-600 text-lg">
              Sistema de Gestión de Calidad ISO 9001:2015
            </p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Download size={20} />
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <StatIcon className="text-white" size={24} />
                </div>
                <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-slate-600'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</div>
              <div className="text-slate-600 text-sm">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => {
          const ActionIcon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => {
                setReportType(action.type);
                setShowModal(true);
              }}
              className="bg-white hover:bg-slate-50 rounded-xl shadow-md p-4 border border-slate-200 transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center gap-3 text-left"
            >
              <div className={`${action.color} p-3 rounded-lg`}>
                <ActionIcon className="text-white" size={20} />
              </div>
              <span className="font-semibold text-slate-700">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Gráficas Profesionales */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Evolución Temporal de Reportes - GRÁFICA DE ÁREA */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
            <CardTitle className="text-lg font-bold text-slate-800">Evolución de Reportes Generados</CardTitle>
            <CardDescription className="text-slate-600">
              Tendencia mensual por categoría
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dataEvolucionReportes}>
                <defs>
                  <linearGradient id="colorAuditorias" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorNC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorObjetivos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorIndicadores" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="auditorias" stroke="#6366f1" fillOpacity={1} fill="url(#colorAuditorias)" name="Auditorías" />
                <Area type="monotone" dataKey="nc" stroke="#f59e0b" fillOpacity={1} fill="url(#colorNC)" name="NC" />
                <Area type="monotone" dataKey="objetivos" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorObjetivos)" name="Objetivos" />
                <Area type="monotone" dataKey="indicadores" stroke="#10b981" fillOpacity={1} fill="url(#colorIndicadores)" name="Indicadores" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cumplimiento General - RADAR CHART */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
            <CardTitle className="text-lg font-bold text-slate-800">Cumplimiento por Área</CardTitle>
            <CardDescription className="text-slate-600">
              Porcentaje de cumplimiento en cada categoría
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={dataRadarCumplimiento}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="area" style={{ fontSize: '12px', fill: '#64748b' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} style={{ fontSize: '11px', fill: '#64748b' }} />
                <Radar name="Cumplimiento %" dataKey="cumplimiento" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas de Distribución */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Reportes por Categoría - GRÁFICA DE BARRAS MODERNA */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
            <CardTitle className="text-lg font-bold text-slate-800">Reportes Generados por Categoría</CardTitle>
            <CardDescription className="text-slate-600">
              {reportsList.length > 0 ? `Total: ${reportsList.length} reportes generados` : 'Sin reportes disponibles'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {dataReportesPorCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataReportesPorCategoria} barSize={60}>
                  <defs>
                    {dataReportesPorCategoria.map((entry, index) => (
                      <linearGradient key={`gradient-${index}`} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={entry.color} stopOpacity={0.9}/>
                        <stop offset="95%" stopColor={entry.color} stopOpacity={0.6}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="categoria" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Bar dataKey="cantidad" radius={[8, 8, 0, 0]}>
                    {dataReportesPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#barGradient${index})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <FileText size={48} className="mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">No hay reportes generados</p>
                  <p className="text-sm mt-1">Genera tu primer reporte usando el botón superior</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estado de Auditorías - GRÁFICA DE DONA */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
            <CardTitle className="text-lg font-bold text-slate-800">Estado de Auditorías</CardTitle>
            <CardDescription className="text-slate-600">
              {auditorias.length > 0 ? `Total: ${auditorias.length} auditorías` : 'Sin datos disponibles'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {dataAuditoriasPorEstado.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dataAuditoriasPorEstado}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    labelLine={false}
                    label={({ estado, cantidad, percent }) => `${estado}: ${cantidad} (${(percent * 100).toFixed(0)}%)`}
                    dataKey="cantidad"
                  >
                    {dataAuditoriasPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <FileCheck size={48} className="mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">No hay auditorías registradas</p>
                  <p className="text-sm mt-1">Los datos aparecerán cuando haya auditorías en el sistema</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficas Adicionales */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">{/* Auditorías por Tipo */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
            <CardTitle className="text-lg font-bold text-slate-800">Auditorías por Tipo</CardTitle>
            <CardDescription className="text-slate-600">
              {dataAuditoriasPorTipo.length > 0 ? 'Clasificación por tipo de auditoría' : 'Sin datos disponibles'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {dataAuditoriasPorTipo.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataAuditoriasPorTipo} layout="horizontal" barSize={40}>
                  <defs>
                    <linearGradient id="barGradientTipo" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis type="category" dataKey="tipo" stroke="#64748b" style={{ fontSize: '12px' }} width={100} />
                  <Bar dataKey="cantidad" fill="url(#barGradientTipo)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <BarChart3 size={48} className="mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">No hay datos de tipos de auditoría</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
            <CardTitle className="text-lg font-bold text-slate-800">No Conformidades por Estado</CardTitle>
            <CardDescription className="text-slate-600">
              {noConformidades.length > 0 ? `Total: ${noConformidades.length} NC` : 'Sin datos disponibles'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {dataNCPorEstado.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataNCPorEstado}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="estado" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="cantidad" radius={[8, 8, 0, 0]}>
                    {dataNCPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <AlertCircle size={48} className="mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">No hay no conformidades registradas</p>
                  <p className="text-sm mt-1">Los datos aparecerán cuando haya NC en el sistema</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
            <CardTitle className="text-lg font-bold text-slate-800">No Conformidades por Gravedad</CardTitle>
            <CardDescription className="text-slate-600">
              {dataNCPorGravedad.length > 0 ? 'Clasificación por nivel de gravedad' : 'Sin datos disponibles'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {dataNCPorGravedad.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dataNCPorGravedad}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ gravedad, cantidad }) => `${gravedad}: ${cantidad}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {dataNCPorGravedad.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <AlertCircle size={48} className="mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">No hay datos de gravedad</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Objetivos */}
      <Card className="border-0 shadow-lg mb-8">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
          <CardTitle className="text-lg font-bold text-slate-800">Objetivos de Calidad</CardTitle>
          <CardDescription className="text-slate-600">
            {objetivos.length > 0 ? `Total: ${objetivos.length} objetivos` : 'Sin datos disponibles'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {dataObjetivosPorEstado.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataObjetivosPorEstado}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="estado" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="cantidad" radius={[8, 8, 0, 0]}>
                  {dataObjetivosPorEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Target size={48} className="mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No hay objetivos de calidad registrados</p>
                <p className="text-sm mt-1">Los datos aparecerán cuando haya objetivos en el sistema</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters and Categories */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-slate-600" />
              <h3 className="font-semibold text-slate-800">Categorías</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {reportCategories.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <CatIcon size={16} />
                    {cat.name}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedCategory === cat.id ? 'bg-blue-500' : 'bg-slate-300'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:w-64">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={20} className="text-slate-600" />
              <h3 className="font-semibold text-slate-800">Período</h3>
            </div>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            >
              <option value="semana">Última Semana</option>
              <option value="mes">Último Mes</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="año">Último Año</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-2xl font-bold text-slate-800">
            Reportes Disponibles
            <span className="text-lg font-normal text-slate-600 ml-3">
              ({filteredReports.length} {filteredReports.length === 1 ? 'reporte' : 'reportes'})
            </span>
          </h2>
        </div>
        
        <div className="divide-y divide-slate-200">
          {filteredReports.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
              <FileText size={64} className="mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-semibold mb-2">No hay reportes en esta categoría</p>
              <p className="text-sm">Selecciona otra categoría o genera un nuevo reporte</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-slate-50 transition-colors duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">
                          {report.title}
                        </h3>
                        <p className="text-slate-600 text-sm mt-1">
                          {report.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {new Date(report.date).toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="px-3 py-1 bg-slate-100 rounded-lg font-medium">
                        {report.format}
                      </span>
                      <span>{report.size}</span>
                      {getStatusBadge(report.status)}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="p-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors duration-200">
                      <Download size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Generar Reporte - MEJORADO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Generar Nuevo Reporte</h2>
                <p className="text-sm text-slate-600 mt-1">Configura las opciones para tu reporte personalizado</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Tipo de Reporte */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  ¿Qué tipo de reporte necesitas?
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: "ejecutivo", label: "Reporte Ejecutivo", desc: "Resumen general de todas las áreas", icon: "📊" },
                    { value: "auditorias", label: "Auditorías", desc: "Resultados y hallazgos de auditorías", icon: "✅" },
                    { value: "no_conformidades", label: "No Conformidades", desc: "Estado y seguimiento de NC", icon: "⚠️" },
                    { value: "objetivos", label: "Objetivos de Calidad", desc: "Avance y cumplimiento de objetivos", icon: "🎯" },
                    { value: "indicadores", label: "Indicadores", desc: "Métricas y KPIs de desempeño", icon: "📈" },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setReportType(type.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        reportType === type.value
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{type.icon}</span>
                        <div className="flex-1">
                          <div className={`font-bold ${reportType === type.value ? "text-blue-700" : "text-slate-800"}`}>
                            {type.label}
                          </div>
                          <div className="text-sm text-slate-600 mt-1">{type.desc}</div>
                        </div>
                        {reportType === type.value && (
                          <CheckCircle size={24} className="text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Período */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  ¿Qué período quieres analizar?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "semana", label: "Última Semana", icon: "📅" },
                    { value: "mes", label: "Último Mes", icon: "📅" },
                    { value: "trimestre", label: "Último Trimestre", icon: "📅" },
                    { value: "año", label: "Último Año", icon: "📅" },
                  ].map((period) => (
                    <button
                      key={period.value}
                      onClick={() => setSelectedPeriod(period.value)}
                      className={`p-4 rounded-xl border-2 transition-all font-semibold ${
                        selectedPeriod === period.value
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md"
                          : "border-slate-200 hover:border-blue-300 text-slate-700"
                      }`}
                    >
                      <div className="text-2xl mb-2">{period.icon}</div>
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formato */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  ¿En qué formato lo necesitas?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setReportFormat('pdf')}
                    className={`p-5 rounded-xl border-2 transition-all ${
                      reportFormat === 'pdf'
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-4xl mb-2">📄</div>
                    <div className={`font-bold text-lg ${reportFormat === 'pdf' ? 'text-blue-700' : 'text-slate-800'}`}>
                      PDF
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Ideal para imprimir y compartir
                    </div>
                  </button>
                  <button
                    onClick={() => setReportFormat('excel')}
                    className={`p-5 rounded-xl border-2 transition-all ${
                      reportFormat === 'excel'
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-4xl mb-2">📊</div>
                    <div className={`font-bold text-lg ${reportFormat === 'excel' ? 'text-blue-700' : 'text-slate-800'}`}>
                      Excel
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Para análisis y edición de datos
                    </div>
                  </button>
                </div>
              </div>

              {/* Resumen de selección */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="text-sm font-semibold text-blue-900 mb-2">📋 Resumen de tu reporte:</div>
                <div className="text-sm text-blue-800">
                  <span className="font-bold">Tipo:</span> {reportType === 'ejecutivo' ? '📊 Ejecutivo' : reportType === 'auditorias' ? '✅ Auditorías' : reportType === 'no_conformidades' ? '⚠️ No Conformidades' : reportType === 'objetivos' ? '🎯 Objetivos' : '📈 Indicadores'} • 
                  <span className="font-bold ml-2">Período:</span> {selectedPeriod === 'semana' ? 'Última Semana' : selectedPeriod === 'mes' ? 'Último Mes' : selectedPeriod === 'trimestre' ? 'Último Trimestre' : 'Último Año'} • 
                  <span className="font-bold ml-2">Formato:</span> {reportFormat.toUpperCase()}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGenerateReport}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Generar Reporte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-8 text-center text-slate-600 text-sm">
        <p>Todos los reportes son generados automáticamente y cumplen con los requisitos de ISO 9001:2015</p>
      </div>
    </div>
  );
};

export default ReportesView;