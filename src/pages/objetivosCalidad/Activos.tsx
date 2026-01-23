import React, { useState, useEffect } from 'react';
import { Plus, Target, TrendingUp, Calendar, User, Filter, Search, Edit, Trash2, Eye, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { objetivoCalidadService, ObjetivoCalidad } from '@/services/objetivoCalidad.service';

const ObjetivosActivos: React.FC = () => {
  const [objetivos, setObjetivos] = useState<ObjetivoCalidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalTipo, setModalTipo] = useState<'crear' | 'editar' | 'ver'>('crear');
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState<ObjetivoCalidad | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    procesoId: '',
    areaId: '',
    responsableId: '',
    meta: '',
    indicadorId: '',
    valorMeta: '',
    periodoInicio: '',
    periodoFin: '',
    estado: 'planificado'
  });

  // Cargar objetivos
  useEffect(() => {
    cargarObjetivos();
  }, []);

  const cargarObjetivos = async () => {
    setLoading(true);
    try {
      const data = await objetivoCalidadService.getActivos();
      setObjetivos(data);
    } catch (error: any) {
      console.error('Error al cargar objetivos:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar objetivos
  const objetivosFiltrados = objetivos.filter(obj => {
    const cumpleBusqueda = obj.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          obj.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const cumpleEstado = estadoFiltro === 'todos' || obj.estado === estadoFiltro;
    return cumpleBusqueda && cumpleEstado;
  });

  // Estadísticas
  const stats = {
    total: objetivos.length,
    enCurso: objetivos.filter(o => o.estado === 'en_curso').length,
    cumplidos: objetivos.filter(o => o.estado === 'cumplido').length,
    planificados: objetivos.filter(o => o.estado === 'planificado').length
  };

  // Handlers
  const abrirModal = (tipo: 'crear' | 'editar' | 'ver', objetivo?: ObjetivoCalidad) => {
    setModalTipo(tipo);
    if (objetivo) {
      setObjetivoSeleccionado(objetivo);
      setFormData({
        codigo: objetivo.codigo,
        descripcion: objetivo.descripcion || '',
        procesoId: objetivo.procesoId || '',
        areaId: objetivo.areaId || '',
        responsableId: objetivo.responsableId || '',
        meta: objetivo.meta || '',
        indicadorId: objetivo.indicadorId || '',
        valorMeta: objetivo.valorMeta?.toString() || '',
        periodoInicio: objetivo.periodoInicio || '',
        periodoFin: objetivo.periodoFin || '',
        estado: objetivo.estado || 'planificado'
      });
    } else {
      setObjetivoSeleccionado(null);
      setFormData({
        codigo: '',
        descripcion: '',
        procesoId: '',
        areaId: '',
        responsableId: '',
        meta: '',
        indicadorId: '',
        valorMeta: '',
        periodoInicio: '',
        periodoFin: '',
        estado: 'planificado'
      });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setObjetivoSeleccionado(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Aquí iría la llamada a la API
      console.log('Guardando objetivo:', formData);
      if (modalTipo === 'crear') {
        const nuevoObjetivo: ObjetivoCalidad = {
          id: Date.now().toString(),
          codigo: formData.codigo,
          descripcion: formData.descripcion,
          meta: formData.meta,
          valorMeta: parseFloat(formData.valorMeta) || undefined,
          periodoInicio: formData.periodoInicio,
          periodoFin: formData.periodoFin,
          estado: formData.estado,
          creadoEn: new Date().toISOString().split('T')[0],
          area: formData.areaId ? { id: formData.areaId, nombre: getNombreArea(formData.areaId) } : undefined,
          responsable: formData.responsableId ? { id: formData.responsableId, nombre: getNombreResponsable(formData.responsableId) } : undefined,
          indicador: formData.indicadorId ? { id: formData.indicadorId, nombre: getNombreIndicador(formData.indicadorId) } : undefined
        };
        setObjetivos(prev => [...prev, nuevoObjetivo]);
      } else if (modalTipo === 'editar' && objetivoSeleccionado) {
        setObjetivos(prev => prev.map(obj =>
          obj.id === objetivoSeleccionado.id
            ? {
                ...obj,
                codigo: formData.codigo,
                descripcion: formData.descripcion,
                meta: formData.meta,
                valorMeta: parseFloat(formData.valorMeta) || undefined,
                periodoInicio: formData.periodoInicio,
                periodoFin: formData.periodoFin,
                estado: formData.estado,
                area: formData.areaId ? { id: formData.areaId, nombre: getNombreArea(formData.areaId) } : undefined,
                responsable: formData.responsableId ? { id: formData.responsableId, nombre: getNombreResponsable(formData.responsableId) } : undefined,
                indicador: formData.indicadorId ? { id: formData.indicadorId, nombre: getNombreIndicador(formData.indicadorId) } : undefined
              }
            : obj
        ));
      }
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar objetivo:', error);
    }
  };

  const handleEliminar = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este objetivo?')) {
      try {
        setObjetivos(prev => prev.filter(obj => obj.id !== id));
      } catch (error) {
        console.error('Error al eliminar objetivo:', error);
      }
    }
  };

  const getEstadoBadge = (estado?: string) => {
    const badges = {
      planificado: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock },
      en_curso: { bg: 'bg-blue-100', text: 'text-blue-700', icon: TrendingUp },
      cumplido: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      no_cumplido: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
      cancelado: { bg: 'bg-gray-100', text: 'text-gray-500', icon: X }
    };
    const badge = badges[estado as keyof typeof badges] || badges.planificado;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {estado?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const calcularProgreso = (objetivo: ObjetivoCalidad) => {
    if (objetivo.estado === 'cumplido') return 100;
    if (objetivo.estado === 'no_cumplido') return 0;
    if (objetivo.estado === 'planificado') return 0;
   
    const inicio = new Date(objetivo.periodoInicio || '');
    const fin = new Date(objetivo.periodoFin || '');
    const hoy = new Date();
   
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return 0;
   
    const total = fin.getTime() - inicio.getTime();
    const transcurrido = hoy.getTime() - inicio.getTime();
   
    return Math.min(Math.max((transcurrido / total) * 100, 0), 100);
  };

  // Helpers para nombres
  const getNombreArea = (id: string) => {
    const areas: Record<string, string> = {
      '1': 'Gestión de Calidad',
      '2': 'Operaciones',
      '3': 'Recursos Humanos',
      '4': 'Comercial'
    };
    return areas[id] || 'Desconocido';
  };

  const getNombreResponsable = (id: string) => {
    const responsables: Record<string, string> = {
      '1': 'Juan Pérez',
      '2': 'María García',
      '3': 'Carlos López',
      '4': 'Ana Martínez'
    };
    return responsables[id] || 'Desconocido';
  };

  const getNombreIndicador = (id: string) => {
    const indicadores: Record<string, string> = {
      '1': 'Satisfacción del Cliente',
      '2': 'Índice de No Conformidades',
      '3': 'Eficacia de Capacitación'
    };
    return indicadores[id] || 'Sin indicador';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando objetivos de calidad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-600" />
              Objetivos de Calidad
            </h1>
            <p className="mt-2 text-gray-600">Gestión de objetivos de calidad según ISO 9001 Cláusula 6.2</p>
          </div>
          <button
            onClick={() => abrirModal('crear')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Nuevo Objetivo
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Objetivos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Curso</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.enCurso}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cumplidos</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.cumplidos}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Planificados</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{stats.planificados}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por código o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
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

      {/* Lista de Objetivos */}
      <div className="space-y-4">
        {objetivosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron objetivos</h3>
            <p className="text-gray-600">No hay objetivos que coincidan con los filtros seleccionados.</p>
          </div>
        ) : (
          objetivosFiltrados.map((objetivo) => {
            const progreso = calcularProgreso(objetivo);
            return (
              <div key={objetivo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {objetivo.codigo}
                      </span>
                      {getEstadoBadge(objetivo.estado)}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {objetivo.descripcion}
                    </h3>
                    {objetivo.meta && (
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Meta:</strong> {objetivo.meta}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => abrirModal('ver', objetivo)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => abrirModal('editar', objetivo)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEliminar(objetivo.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Barra de progreso */}
                {objetivo.estado === 'en_curso' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Progreso temporal</span>
                      <span className="font-medium">{progreso.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progreso}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Info adicional */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {objetivo.area && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Target className="w-4 h-4" />
                      <span><strong>Área:</strong> {objetivo.area.nombre}</span>
                    </div>
                  )}
                  {objetivo.responsable && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span><strong>Responsable:</strong> {objetivo.responsable.nombre}</span>
                    </div>
                  )}
                  {objetivo.periodoFin && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span><strong>Vence:</strong> {new Date(objetivo.periodoFin).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalTipo === 'crear' && 'Nuevo Objetivo de Calidad'}
                {modalTipo === 'editar' && 'Editar Objetivo de Calidad'}
                {modalTipo === 'ver' && 'Detalles del Objetivo'}
              </h2>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="OBJ-2024-001"
                    required
                    disabled={modalTipo === 'ver'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado *
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={modalTipo === 'ver'}
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
                  Descripción *
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descripción del objetivo de calidad"
                  required
                  disabled={modalTipo === 'ver'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta
                </label>
                <textarea
                  value={formData.meta}
                  onChange={(e) => setFormData({...formData, meta: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Meta específica a alcanzar"
                  disabled={modalTipo === 'ver'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Meta
                  </label>
                  <input
                    type="number"
                    value={formData.valorMeta}
                    onChange={(e) => setFormData({...formData, valorMeta: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="90"
                    disabled={modalTipo === 'ver'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Indicador
                  </label>
                  <select
                    value={formData.indicadorId}
                    onChange={(e) => setFormData({...formData, indicadorId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalTipo === 'ver'}
                  >
                    <option value="">Seleccionar indicador</option>
                    <option value="1">Satisfacción del Cliente</option>
                    <option value="2">Índice de No Conformidades</option>
                    <option value="3">Eficacia de Capacitación</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Periodo Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.periodoInicio}
                    onChange={(e) => setFormData({...formData, periodoInicio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalTipo === 'ver'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Periodo Fin
                  </label>
                  <input
                    type="date"
                    value={formData.periodoFin}
                    onChange={(e) => setFormData({...formData, periodoFin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalTipo === 'ver'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Área
                  </label>
                  <select
                    value={formData.areaId}
                    onChange={(e) => setFormData({...formData, areaId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalTipo === 'ver'}
                  >
                    <option value="">Seleccionar área</option>
                    <option value="1">Gestión de Calidad</option>
                    <option value="2">Operaciones</option>
                    <option value="3">Recursos Humanos</option>
                    <option value="4">Comercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsable
                  </label>
                  <select
                    value={formData.responsableId}
                    onChange={(e) => setFormData({...formData, responsableId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalTipo === 'ver'}
                  >
                    <option value="">Seleccionar responsable</option>
                    <option value="1">Juan Pérez</option>
                    <option value="2">María García</option>
                    <option value="3">Carlos López</option>
                    <option value="4">Ana Martínez</option>
                  </select>
                </div>
              </div>

              {modalTipo !== 'ver' && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {modalTipo === 'crear' ? 'Crear' : 'Actualizar'} Objetivo
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjetivosActivos;