import React, { useState } from 'react';
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
  PieChart,
  Users,
  FileCheck,
  Target,
  Activity
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ReportesView = () => {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedPeriod, setSelectedPeriod] = useState('mes');

  const reportCategories = [
    { id: 'todos', name: 'Todos los Reportes', icon: FileText, count: 24 },
    { id: 'auditorias', name: 'Auditorías', icon: FileCheck, count: 8 },
    { id: 'noconformidades', name: 'No Conformidades', icon: AlertCircle, count: 5 },
    { id: 'objetivos', name: 'Objetivos de Calidad', icon: Target, count: 6 },
    { id: 'indicadores', name: 'Indicadores', icon: TrendingUp, count: 5 }
  ];

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

  const stats = [
    { label: 'Reportes Generados', value: '156', change: '+12%', icon: FileText, color: 'bg-blue-500' },
    { label: 'Auditorías Realizadas', value: '24', change: '+8%', icon: FileCheck, color: 'bg-green-500' },
    { label: 'NC Cerradas', value: '18', change: '+15%', icon: CheckCircle, color: 'bg-purple-500' },
    { label: 'En Proceso', value: '7', change: '-3%', icon: Clock, color: 'bg-orange-500' }
  ];

  const quickActions = [
    { icon: BarChart3, label: 'Reporte Ejecutivo', color: 'bg-blue-500' },
    { icon: PieChart, label: 'Dashboard Analítico', color: 'bg-purple-500' },
    { icon: Users, label: 'Reporte de Personal', color: 'bg-green-500' },
    { icon: Activity, label: 'Métricas en Tiempo Real', color: 'bg-orange-500' }
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

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Profesional */}
        <div className="bg-gradient-to-br from-[#E0EDFF] to-[#C7D2FE] rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
                <BarChart3 className="h-9 w-9 text-[#2563EB]" />
                Reportes y Análisis
              </h1>
              <p className="text-[#6B7280] mt-2 text-lg">
                Sistema de Gestión de Calidad ISO 9001:2015
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Badge className="bg-white text-[#2563EB] border border-[#E5E7EB]">
                  Total {filteredReports.length} reportes
                </Badge>
                <Badge className="bg-[#ECFDF5] text-[#22C55E]">
                  Cumplimiento Normativo
                </Badge>
              </div>
            </div>
            <button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm rounded-xl px-6 py-6 h-auto font-bold flex items-center gap-2 transition-all">
              <Download size={20} />
              Generar Reporte
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <Card key={stat.label} className="bg-white border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="font-semibold text-[#6B7280]">{stat.label}</CardDescription>
                    <div className="p-2 bg-[#E0EDFF] rounded-lg">
                      <StatIcon className="text-[#2563EB]" size={20} />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold text-[#1E3A8A]">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} vs mes anterior
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions & Filters Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categorías y Filtros (Izquierda) */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-2xl shadow-sm border-[#E5E7EB]">
              <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <CardTitle className="text-lg text-[#1E3A8A] flex items-center gap-2">
                  <Filter size={18} />
                  Filtrar por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-col gap-2">
                  {reportCategories.map((cat) => {
                    const CatIcon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full p-3 rounded-xl font-medium flex items-center justify-between transition-all ${selectedCategory === cat.id
                          ? 'bg-[#2563EB] text-white shadow-md'
                          : 'bg-white text-slate-700 hover:bg-[#EFF6FF]'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <CatIcon size={18} />
                          {cat.name}
                        </div>
                        <Badge className={`${selectedCategory === cat.id ? 'bg-white/20' : 'bg-[#E0EDFF] text-[#2563EB] border-none'}`}>
                          {cat.count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm border-[#E5E7EB]">
              <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <CardTitle className="text-lg text-[#1E3A8A] flex items-center gap-2">
                  <Calendar size={18} />
                  Rango de Tiempo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all font-medium text-[#1E3A8A]"
                >
                  <option value="semana">Última Semana</option>
                  <option value="mes">Último Mes</option>
                  <option value="trimestre">Último Trimestre</option>
                  <option value="año">Último Año</option>
                </select>
              </CardContent>
            </Card>
          </div>

          {/* Listado de Reportes (Derecha) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
              <div className="bg-[#F8FAFC] border-b border-[#E5E7EB] px-8 py-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1E3A8A]">Reportes Disponibles</h2>
                <Badge variant="outline" className="bg-white text-[#6B7280]">
                  Registrados: {filteredReports.length}
                </Badge>
              </div>

              <div className="divide-y divide-[#E5E7EB]">
                {filteredReports.map((report) => (
                  <div key={report.id} className="p-6 hover:bg-[#EFF6FF] transition-colors duration-200 group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="bg-[#E0EDFF] p-3 rounded-xl">
                            <FileText className="text-[#2563EB]" size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-[#111827] text-lg group-hover:text-[#2563EB] transition-colors">
                              {report.title}
                            </h3>
                            <p className="text-[#6B7280] text-sm mt-1">
                              {report.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-6 text-sm">
                          <span className="flex items-center gap-2 text-[#6B7280] font-medium">
                            <Clock size={16} />
                            {new Date(report.date).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <Badge className="bg-[#F8FAFC] border-[#E5E7EB] text-[#1E3A8A] font-bold">
                            {report.format}
                          </Badge>
                          <span className="text-[#6B7280] font-mono">{report.size}</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${report.status === 'completado' ? 'bg-[#ECFDF5] text-[#10B981] border-[#10B981]/20' :
                            report.status === 'procesando' ? 'bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]/20' :
                              'bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/20'
                            }`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <button className="p-4 rounded-xl bg-[#F8FAFC] hover:bg-[#2563EB] text-[#6B7280] hover:text-white border border-[#E5E7EB] transition-all">
                        <Download size={22} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="mt-8 border-none bg-transparent shadow-none">
              <CardContent className="p-0 text-center">
                <p className="text-sm text-[#6B7280] italic flex items-center justify-center gap-2">
                  <AlertCircle size={14} />
                  Todos los reportes son generados automáticamente y cumplen con los requisitos de ISO 9001:2015
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportesView;