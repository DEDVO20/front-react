import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  TrendingUp,
  Target,
  Calendar,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Eye,
  X
} from 'lucide-react';
import { objetivoCalidadService, ObjetivoCalidad, SeguimientoObjetivo } from '@/services/objetivoCalidad.service';

interface Seguimiento extends SeguimientoObjetivo {}

const API_URL = 'http://localhost:3000/api';

const ObjetivosCalidadSeguimiento: React.FC = () => {
  // Estados principales
  const [objetivos, setObjetivos] = useState<ObjetivoCalidad[]>([]);
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para modales
  const [showObjetivoModal, setShowObjetivoModal] = useState(false);
  const [showSeguimientoModal, setShowSeguimientoModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingObjetivo, setEditingObjetivo] = useState<ObjetivoCalidad | null>(null);
  const [selectedObjetivo, setSelectedObjetivo] = useState<ObjetivoCalidad | null>(null);

  // Estados para formularios
  const [objetivoForm, setObjetivoForm] = useState({
    codigo: '',
    descripcion: '',
    meta: '',
    valorMeta: '',
    periodoInicio: '',
    periodoFin: '',
    estado: 'planificado'
  });

  const [seguimientoForm, setSeguimientoForm] = useState({
    periodo: '',
    valorAlcanzado: '',
    observaciones: ''
  });

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');

  // Cargar datos
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const objetivosData = await objetivoCalidadService.getAll();
      setObjetivos(objetivosData);
      
      // Cargar todos los seguimientos
      const allSeguimientos: Seguimiento[] = [];
      for (const obj of objetivosData) {
        try {
          const segs = await objetivoCalidadService.getSeguimientos(obj.id);
          allSeguimientos.push(...segs);
        } catch (err) {
          console.error(`Error al cargar seguimientos del objetivo ${obj.id}:`, err);
        }
      }
      setSeguimientos(allSeguimientos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Crear/Actualizar Objetivo
  const handleSaveObjetivo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingObjetivo
        ? `${API_URL}/objetivos-calidad/${editingObjetivo.id}`
        : `${API_URL}/objetivos-calidad`;

      const response = await fetch(url, {
        method: editingObjetivo ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...objetivoForm,
          valorMeta: parseFloat(objetivoForm.valorMeta) || null
        })
      });

      if (!response.ok) throw new Error('Error al guardar el objetivo');
      await cargarDatos();
      cerrarModalObjetivo();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  // Crear Seguimiento
  const handleSaveSeguimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObjetivo) return;

    try {
      const token = localStorage.getItem('token');
      const valorAlcanzado = parseFloat(seguimientoForm.valorAlcanzado);
      const porcentajeCumplimiento = selectedObjetivo.valorMeta
        ? (valorAlcanzado / selectedObjetivo.valorMeta) * 100
        : 0;

      const response = await fetch(`${API_URL}/seguimientos-objetivo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          objetivoId: selectedObjetivo.id,
          periodo: seguimientoForm.periodo,
          valorAlcanzado,
          porcentajeCumplimiento: Math.round(porcentajeCumplimiento * 100) / 100,
          observaciones: seguimientoForm.observaciones
        })
      });

      if (!response.ok) throw new Error('Error al guardar el seguimiento');
      await cargarDatos();
      cerrarModalSeguimiento();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  // Eliminar Objetivo
  const handleDeleteObjetivo = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este objetivo?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/objetivos-calidad/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al eliminar');
      await cargarDatos();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  // Funciones auxiliares
  const abrirModalObjetivo = (objetivo?: ObjetivoCalidad) => {
    if (objetivo) {
      setEditingObjetivo(objetivo);
      setObjetivoForm({
        codigo: objetivo.codigo,
        descripcion: objetivo.descripcion || '',
        meta: objetivo.meta || '',
        valorMeta: objetivo.valorMeta?.toString() || '',
        periodoInicio: objetivo.periodoInicio || '',
        periodoFin: objetivo.periodoFin || '',
        estado: objetivo.estado || 'planificado'
      });
    } else {
      setEditingObjetivo(null);
      setObjetivoForm({
        codigo: '',
        descripcion: '',
        meta: '',
        valorMeta: '',
        periodoInicio: '',
        periodoFin: '',
        estado: 'planificado'
      });
    }
    setShowObjetivoModal(true);
  };

  const cerrarModalObjetivo = () => {
    setShowObjetivoModal(false);
    setEditingObjetivo(null);
  };

  const abrirModalSeguimiento = (objetivo: ObjetivoCalidad) => {
    setSelectedObjetivo(objetivo);
    setSeguimientoForm({
      periodo: new Date().toISOString().split('T')[0],
      valorAlcanzado: '',
      observaciones: ''
    });
    setShowSeguimientoModal(true);
  };

  const cerrarModalSeguimiento = () => {
    setShowSeguimientoModal(false);
    setSelectedObjetivo(null);
  };

  const verDetalle = (objetivo: ObjetivoCalidad) => {
    setSelectedObjetivo(objetivo);
    setShowDetailModal(true);
  };

  const getSeguimientosObjetivo = (objetivoId: string) => {
    return seguimientos.filter(s => s.objetivoId === objetivoId);
  };

  const getUltimoSeguimiento = (objetivoId: string) => {
    const segs = getSeguimientosObjetivo(objetivoId);
    return segs.sort((a, b) =>
      new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
    )[0];
  };

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'planificado': 'bg-blue-100 text-blue-800',
      'en_curso': 'bg-yellow-100 text-yellow-800',
      'cumplido': 'bg-green-100 text-green-800',
      'no_cumplido': 'bg-red-100 text-red-800',
      'cancelado': 'bg-gray-100 text-gray-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  const getCumplimientoColor = (porcentaje: number) => {
    if (porcentaje >= 90) return 'text-green-600';
    if (porcentaje >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Filtrar objetivos
  const objetivosFiltrados = objetivos.filter(obj => {
    const matchSearch = obj.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       obj.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filterEstado === 'todos' || obj.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-8 h-8 text-blue-600" />
              Objetivos de Calidad
            </h1>
            <p className="text-gray-600 mt-1">ISO 9001:2015 - Cláusula 6.2</p>
          </div>
          <button
            onClick={() => abrirModalObjetivo()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Nuevo Objetivo
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por código o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos los estados</option>
              <option value="planificado">Planificado</option>
              <option value="en_curso">En Curso</option>
              <option value="cumplido">Cumplido</option>
              <option value="no_cumplido">No Cumplido</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Grid de Objetivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {objetivosFiltrados.map((objetivo) => {
          const ultimoSeguimiento = getUltimoSeguimiento(objetivo.id);
          const totalSeguimientos = getSeguimientosObjetivo(objetivo.id).length;

          return (
            <div key={objetivo.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
              {/* Header Card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-blue-600">{objetivo.codigo}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(objetivo.estado || '')}`}>
                      {objetivo.estado?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium line-clamp-2">{objetivo.descripcion}</p>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => abrirModalObjetivo(objetivo)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteObjetivo(objetivo.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Meta */}
              {objetivo.valorMeta && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Meta:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {objetivo.valorMeta}%
                    </span>
                  </div>
                </div>
              )}

              {/* Último Seguimiento */}
              {ultimoSeguimiento && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Último seguimiento:</span>
                    <span className={`text-lg font-bold ${getCumplimientoColor(Number(ultimoSeguimiento.porcentajeCumplimiento) || 0)}`}>
                      {Number(ultimoSeguimiento.porcentajeCumplimiento || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        (Number(ultimoSeguimiento.porcentajeCumplimiento) || 0) >= 90 ? 'bg-green-500' :
                        (Number(ultimoSeguimiento.porcentajeCumplimiento) || 0) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(Number(ultimoSeguimiento.porcentajeCumplimiento) || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Periodo */}
              {(objetivo.periodoInicio || objetivo.periodoFin) && (
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {objetivo.periodoInicio && new Date(objetivo.periodoInicio).toLocaleDateString()}
                    {objetivo.periodoInicio && objetivo.periodoFin && ' - '}
                    {objetivo.periodoFin && new Date(objetivo.periodoFin).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Estadísticas */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{totalSeguimientos} seguimiento(s)</span>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <button
                  onClick={() => abrirModalSeguimiento(objetivo)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                >
                  <TrendingUp className="w-4 h-4" />
                  Registrar Seguimiento
                </button>
                <button
                  onClick={() => verDetalle(objetivo)}
                  className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {objetivosFiltrados.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron objetivos</p>
          <button
            onClick={() => abrirModalObjetivo()}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Crear el primer objetivo
          </button>
        </div>
      )}

      {/* Modal Objetivo */}
      {showObjetivoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingObjetivo ? 'Editar Objetivo' : 'Nuevo Objetivo'}
                </h2>
                <button
                  onClick={cerrarModalObjetivo}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSaveObjetivo} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código *
                    </label>
                    <input
                      type="text"
                      required
                      value={objetivoForm.codigo}
                      onChange={(e) => setObjetivoForm({ ...objetivoForm, codigo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="OBJ-2024-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={objetivoForm.estado}
                      onChange={(e) => setObjetivoForm({ ...objetivoForm, estado: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="planificado">Planificado</option>
                      <option value="en_curso">En Curso</option>
                      <option value="cumplido">Cumplido</option>
                      <option value="no_cumplido">No Cumplido</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={objetivoForm.descripcion}
                    onChange={(e) => setObjetivoForm({ ...objetivoForm, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe el objetivo de calidad..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta
                  </label>
                  <textarea
                    value={objetivoForm.meta}
                    onChange={(e) => setObjetivoForm({ ...objetivoForm, meta: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe la meta a alcanzar..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Meta (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={objetivoForm.valorMeta}
                    onChange={(e) => setObjetivoForm({ ...objetivoForm, valorMeta: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="95.00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Periodo Inicio
                    </label>
                    <input
                      type="date"
                      value={objetivoForm.periodoInicio}
                      onChange={(e) => setObjetivoForm({ ...objetivoForm, periodoInicio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Periodo Fin
                    </label>
                    <input
                      type="date"
                      value={objetivoForm.periodoFin}
                      onChange={(e) => setObjetivoForm({ ...objetivoForm, periodoFin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingObjetivo ? 'Actualizar' : 'Crear'} Objetivo
                  </button>
                  <button
                    type="button"
                    onClick={cerrarModalObjetivo}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Seguimiento */}
      {showSeguimientoModal && selectedObjetivo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Registrar Seguimiento</h2>
                <button
                  onClick={cerrarModalSeguimiento}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Objetivo:</p>
                <p className="font-semibold text-gray-900">{selectedObjetivo.codigo}</p>
                <p className="text-sm text-gray-700 mt-1">{selectedObjetivo.descripcion}</p>
                {selectedObjetivo.valorMeta && (
                  <p className="text-sm text-blue-600 mt-2">
                    Meta: {selectedObjetivo.valorMeta}%
                  </p>
                )}
              </div>
              <form onSubmit={handleSaveSeguimiento} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Periodo *
                  </label>
                  <input
                    type="date"
                    required
                    value={seguimientoForm.periodo}
                    onChange={(e) => setSeguimientoForm({ ...seguimientoForm, periodo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Alcanzado * {selectedObjetivo.valorMeta && `(Meta: ${selectedObjetivo.valorMeta}%)`}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={seguimientoForm.valorAlcanzado}
                    onChange={(e) => setSeguimientoForm({ ...seguimientoForm, valorAlcanzado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="85.50"
                  />
                  {seguimientoForm.valorAlcanzado && selectedObjetivo.valorMeta && (
                    <p className="mt-1 text-sm text-gray-600">
                      Cumplimiento: {((parseFloat(seguimientoForm.valorAlcanzado) / selectedObjetivo.valorMeta) * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    value={seguimientoForm.observaciones}
                    onChange={(e) => setSeguimientoForm({ ...seguimientoForm, observaciones: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Notas sobre el seguimiento..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Guardar Seguimiento
                  </button>
                  <button
                    type="button"
                    onClick={cerrarModalSeguimiento}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Completo */}
      {showDetailModal && selectedObjetivo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-7 h-7 text-blue-600" />
                  Detalle del Objetivo
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Información del Objetivo */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Código</p>
                    <p className="font-semibold text-lg">{selectedObjetivo.codigo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(selectedObjetivo.estado || '')}`}>
                      {selectedObjetivo.estado?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-600">Descripción</p>
                  <p className="text-gray-900">{selectedObjetivo.descripcion}</p>
                </div>
                {selectedObjetivo.meta && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">Meta</p>
                    <p className="text-gray-900">{selectedObjetivo.meta}</p>
                  </div>
                )}
                {selectedObjetivo.valorMeta && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">Valor Meta</p>
                    <p className="text-lg font-bold text-blue-600">{selectedObjetivo.valorMeta}%</p>
                  </div>
                )}
                {(selectedObjetivo.periodoInicio || selectedObjetivo.periodoFin) && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {selectedObjetivo.periodoInicio && new Date(selectedObjetivo.periodoInicio).toLocaleDateString()}
                      {selectedObjetivo.periodoInicio && selectedObjetivo.periodoFin && ' - '}
                      {selectedObjetivo.periodoFin && new Date(selectedObjetivo.periodoFin).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Estadísticas */}
              {(() => {
                const segs = getSeguimientosObjetivo(selectedObjetivo.id);
                if (segs.length === 0) return null;

                const valores = segs.map(s => s.porcentajeCumplimiento || 0).filter(v => v > 0);
                const promedio = valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
                const maximo = valores.length > 0 ? Math.max(...valores) : 0;
                const minimo = valores.length > 0 ? Math.min(...valores) : 0;

                return (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{promedio.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">Promedio</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">{maximo.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">Máximo</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-yellow-600">{minimo.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">Mínimo</p>
                    </div>
                  </div>
                );
              })()}

              {/* Historial de Seguimientos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Historial de Seguimientos ({getSeguimientosObjetivo(selectedObjetivo.id).length})
                </h3>
                {getSeguimientosObjetivo(selectedObjetivo.id).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay seguimientos registrados aún.</p>
                ) : (
                  <div className="space-y-4">
                    {getSeguimientosObjetivo(selectedObjetivo.id)
                      .sort((a, b) => new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime())
                      .map((seg) => (
                        <div key={seg.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                  {new Date(seg.creadoEn).toLocaleDateString()} {new Date(seg.creadoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                  {seg.periodo}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-600">
                                  Valor: <strong>{seg.valorAlcanzado}</strong>
                                </span>
                                <span className={`font-bold ${getCumplimientoColor(seg.porcentajeCumplimiento || 0)}`}>
                                  {seg.porcentajeCumplimiento?.toFixed(1)}%
                                </span>
                              </div>
                              {seg.observaciones && (
                                <p className="mt-2 text-sm text-gray-600 italic">"{seg.observaciones}"</p>
                              )}
                            </div>
                            <div className="w-32 ml-4">
                              <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 rounded-full ${
                                    (seg.porcentajeCumplimiento || 0) >= 90
                                      ? 'bg-green-500'
                                      : (seg.porcentajeCumplimiento || 0) >= 70
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(seg.porcentajeCumplimiento || 0, 100)}%` }}
                                >
                                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                                    {seg.porcentajeCumplimiento?.toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Botón cerrar */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjetivosCalidadSeguimiento;