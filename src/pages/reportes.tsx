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
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
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
                <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
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

      {/* Filters and Categories */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Categories */}
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

          {/* Period Filter */}
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
              ({filteredReports.length} reportes)
            </span>
          </h2>
        </div>
        
        <div className="divide-y divide-slate-200">
          {filteredReports.map((report) => (
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
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-slate-600 text-sm">
        <p>Todos los reportes son generados automáticamente y cumplen con los requisitos de ISO 9001:2015</p>
      </div>
    </div>
  );
};

export default ReportesView;