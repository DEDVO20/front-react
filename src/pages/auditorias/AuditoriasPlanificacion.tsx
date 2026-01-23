import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Download, Eye, Edit, Trash2, Users, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Servicio API para Auditorías
const auditoriaService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.estado) params.append('estado', filters.estado);
    
    const url = `${API_BASE_URL}/auditorias${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Error al cargar auditorías');
    return response.json();
  },

  async create(data) {
    const response = await fetch(`${API_BASE_URL}/auditorias`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Error al crear auditoría');
    return response.json();
  },

  async update(id, data) {
    const response = await fetch(`${API_BASE_URL}/auditorias/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Error al actualizar auditoría');
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/auditorias/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) throw new Error('Error al eliminar auditoría');
    return true;
  }
};

// Servicio API para Usuarios
const usuarioService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Error al cargar usuarios');
    return response.json();
  }
};

const AuditoriasPlanificacion = () => {
  // Estados
  const [auditorias, setAuditorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Estados para modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [auditoriaEditando, setAuditoriaEditando] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo: 'interna',
    objetivo: '',
    alcance: '',
    normaReferencia: 'ISO 9001:2015',
    auditorLiderId: '',
    fechaPlanificada: '',
    fechaInicio: '',
    fechaFin: '',
    estado: 'planificada'
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // Cargar auditorías cuando cambien los filtros
  useEffect(() => {
    if (!loading) {
      cargarAuditorias();
    }
  }, [filtroTipo, filtroEstado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar usuarios y auditorías en paralelo
      const [usuariosData, auditoriasData] = await Promise.all([
        usuarioService.getAll(),
        auditoriaService.getAll({ tipo: filtroTipo, estado: filtroEstado })
      ]);
      
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setAuditorias(Array.isArray(auditoriasData) ? auditoriasData : []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const cargarAuditorias = async () => {
    try {
      const data = await auditoriaService.getAll({ tipo: filtroTipo, estado: filtroEstado });
      setAuditorias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar auditorías:', err);
      setError('Error al cargar auditorías');
    }
  };

  // Filtrar auditorías localmente por búsqueda
  const auditoriasFiltradas = auditorias.filter(aud => {
    if (!busqueda) return true;
    
    const searchLower = busqueda.toLowerCase();
    return (
      aud.codigo?.toLowerCase().includes(searchLower) ||
      aud.nombre?.toLowerCase().includes(searchLower) ||
      aud.objetivo?.toLowerCase().includes(searchLower)
    );
  });

  // Abrir modal para crear
  const abrirModalCrear = () => {
    setAuditoriaEditando(null);
    
    // Generar código automático
    const year = new Date().getFullYear();
    const nextNumber = auditorias.length + 1;
    const codigo = `AUD-${year}-${String(nextNumber).padStart(3, '0')}`;
    
    setFormData({
      codigo,
      nombre: '',
      tipo: 'interna',
      objetivo: '',
      alcance: '',
      normaReferencia: 'ISO 9001:2015',
      auditorLiderId: '',
      fechaPlanificada: '',
      fechaInicio: '',
      fechaFin: '',
      estado: 'planificada'
    });
    setMostrarModal(true);
  };

  // Abrir modal para editar
  const abrirModalEditar = (auditoria) => {
    setAuditoriaEditando(auditoria);
    setFormData({
      codigo: auditoria.codigo,
      nombre: auditoria.nombre || '',
      tipo: auditoria.tipo || 'interna',
      objetivo: auditoria.objetivo || '',
      alcance: auditoria.alcance || '',
      normaReferencia: auditoria.normaReferencia || 'ISO 9001:2015',
      auditorLiderId: auditoria.auditorLiderId || '',
      fechaPlanificada: auditoria.fechaPlanificada?.split('T')[0] || '',
      fechaInicio: auditoria.fechaInicio?.split('T')[0] || '',
      fechaFin: auditoria.fechaFin?.split('T')[0] || '',
      estado: auditoria.estado || 'planificada'
    });
    setMostrarModal(true);
  };

  // Guardar auditoría
  const guardarAuditoria = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      if (auditoriaEditando) {
        await auditoriaService.update(auditoriaEditando.id, formData);
      } else {
        await auditoriaService.create(formData);
      }

      setMostrarModal(false);
      await cargarAuditorias();
      
      // Mostrar mensaje de éxito
      alert(auditoriaEditando ? 'Auditoría actualizada exitosamente' : 'Auditoría creada exitosamente');
    } catch (err) {
      console.error('Error al guardar auditoría:', err);
      setError(err.message || 'Error al guardar la auditoría');
    } finally {
      setSaving(false);
    }
  };

  // Eliminar auditoría
  const eliminarAuditoria = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta auditoría?')) return;
    
    try {
      setError(null);
      await auditoriaService.delete(id);
      await cargarAuditorias();
      alert('Auditoría eliminada exitosamente');
    } catch (err) {
      console.error('Error al eliminar auditoría:', err);
      setError(err.message || 'Error al eliminar la auditoría');
    }
  };

  // Obtener color de estado
  const getEstadoColor = (estado) => {
    const colores = {
      planificada: 'bg-blue-100 text-blue-800',
      en_curso: 'bg-yellow-100 text-yellow-800',
      completada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  // Obtener icono de estado
  const getEstadoIcono = (estado) => {
    const iconos = {
      planificada: <Clock className="w-4 h-4" />,
      en_curso: <AlertCircle className="w-4 h-4" />,
      completada: <CheckCircle className="w-4 h-4" />,
      cancelada: <Trash2 className="w-4 h-4" />
    };
    return iconos[estado] || <Clock className="w-4 h-4" />;
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'No definida';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Obtener nombre completo usuario
  const getNombreUsuario = (id) => {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return 'No asignado';
    return `${usuario.nombre} ${usuario.primerApellido} ${usuario.segundoApellido || ''}`.trim();
  };

  // Calcular estadísticas
  const stats = {
    total: auditorias.length,
    planificadas: auditorias.filter(a => a.estado === 'planificada').length,
    enCurso: auditorias.filter(a => a.estado === 'en_curso').length,
    completadas: auditorias.filter(a => a.estado === 'completada').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando auditorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Planificación de Auditorías
                </h1>
                <p className="text-sm text-gray-600">
                  ISO 9001:2015 - Cláusula 9.2
                </p>
              </div>
            </div>
            <button
              onClick={abrirModalCrear}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Auditoría
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Filtros y búsqueda */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar auditorías..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              <option value="interna">Interna</option>
              <option value="externa">Externa</option>
              <option value="certificacion">Certificación</option>
              <option value="seguimiento">Seguimiento</option>
            </select>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="planificada">Planificada</option>
              <option value="en_curso">En Curso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
            <button
              onClick={() => alert('Función de exportar en desarrollo')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              Exportar
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Planificadas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.planificadas}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Curso</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.enCurso}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.completadas}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Lista de auditorías */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {auditoriasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay auditorías
              </h3>
              <p className="text-gray-600 mb-4">
                {busqueda || filtroTipo || filtroEstado
                  ? 'No se encontraron auditorías con los filtros aplicados'
                  : 'Comienza creando tu primera auditoría'}
              </p>
              {!busqueda && !filtroTipo && !filtroEstado && (
                <button
                  onClick={abrirModalCrear}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nueva Auditoría
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre/Objetivo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auditor Líder
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Planificada
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditoriasFiltradas.map((auditoria) => (
                    <tr key={auditoria.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {auditoria.codigo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {auditoria.nombre || 'Sin nombre'}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {auditoria.objetivo || 'Sin objetivo definido'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                          {auditoria.tipo?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(auditoria.estado)} capitalize`}>
                          {getEstadoIcono(auditoria.estado)}
                          {auditoria.estado?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {getNombreUsuario(auditoria.auditorLiderId)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatearFecha(auditoria.fechaPlanificada)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => alert('Vista detallada en desarrollo')}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => abrirModalEditar(auditoria)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => eliminarAuditoria(auditoria.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de crear/editar */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {auditoriaEditando ? 'Editar Auditoría' : 'Nueva Auditoría'}
                </h2>
              </div>
              <form onSubmit={guardarAuditoria} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.codigo}
                      onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="AUD-2025-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="interna">Interna</option>
                      <option value="externa">Externa</option>
                      <option value="certificacion">Certificación</option>
                      <option value="seguimiento">Seguimiento</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Auditoría Interna de Procesos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objetivo
                  </label>
                  <textarea
                    value={formData.objetivo}
                    onChange={(e) => setFormData({...formData, objetivo: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Verificar el cumplimiento de los requisitos ISO 9001:2015..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alcance
                  </label>
                  <textarea
                    value={formData.alcance}
                    onChange={(e) => setFormData({...formData, alcance: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Procesos de gestión de calidad, operaciones..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Norma de Referencia
                    </label>
                    <input
                      type="text"
                      value={formData.normaReferencia}
                      onChange={(e) => setFormData({...formData, normaReferencia: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ISO 9001:2015"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Auditor Líder
                    </label>
                    <select
                      value={formData.auditorLiderId}
                      onChange={(e) => setFormData({...formData, auditorLiderId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar auditor...</option>
                      {usuarios.map(usuario => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.nombre} {usuario.primerApellido}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Planificada <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.fechaPlanificada}
                      onChange={(e) => setFormData({...formData, fechaPlanificada: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Fin
                    </label>
                    <input
                      type="date"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="planificada">Planificada</option>
                    <option value="en_curso">En Curso</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    disabled={saving}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? 'Guardando...' : (auditoriaEditando ? 'Actualizar' : 'Crear') + ' Auditoría'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditoriasPlanificacion;