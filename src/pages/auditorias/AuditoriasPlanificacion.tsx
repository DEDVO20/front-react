import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Search, Download, Eye, Edit, Trash2, Users, 
  CheckCircle, AlertCircle, Clock, Loader2, Save, FileText, 
  Target, ListChecks, User
} from 'lucide-react';

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Servicio API para Auditorías
const auditoriaService = {
  async getAll(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.tipo_auditoria) params.append('tipo_auditoria', filters.tipo_auditoria);
      if (filters.estado) params.append('estado', filters.estado);
      
      const url = `${API_BASE_URL}/auditorias${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Error en respuesta:', response.status);
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error en getAll auditorias:', error);
      return [];
    }
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
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Error en respuesta usuarios:', response.status);
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error en getAll usuarios:', error);
      return [];
    }
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
  const [modoModal, setModoModal] = useState('create'); // 'create', 'edit', 'view'
  const [auditoriaEditando, setAuditoriaEditando] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo_auditoria: 'interna',
    objetivo: '',
    alcance: '',
    auditor_lider_id: '',
    fecha_planificada: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'planificada'
  });

  // Estado para diálogo de eliminación
  const [deleteDialog, setDeleteDialog] = useState({ open: false, auditoria: null });

  // Cargar datos al montar
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
      console.log('Iniciando carga de datos...');
      setLoading(true);
      setError(null);
      
      const [usuariosData, auditoriasData] = await Promise.all([
        usuarioService.getAll(),
        auditoriaService.getAll({ tipo_auditoria: filtroTipo, estado: filtroEstado })
      ]);
      
      console.log('Usuarios cargados:', usuariosData);
      console.log('Auditorías cargadas:', auditoriasData);
      
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setAuditorias(Array.isArray(auditoriasData) ? auditoriasData : []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('No se pudo conectar con el servidor. Verifica que la API esté funcionando.');
      setUsuarios([]);
      setAuditorias([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarAuditorias = async () => {
    try {
      const data = await auditoriaService.getAll({ tipo_auditoria: filtroTipo, estado: filtroEstado });
      setAuditorias(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar auditorías:', err);
      setError('Error al cargar auditorías');
      setAuditorias([]);
    }
  };

  // Filtrar auditorías localmente
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
    setModoModal('create');
    const year = new Date().getFullYear();
    const nextNumber = auditorias.length + 1;
    const codigo = `AUD-${year}-${String(nextNumber).padStart(3, '0')}`;
    
    setFormData({
      codigo,
      nombre: '',
      tipo_auditoria: 'interna',
      objetivo: '',
      alcance: '',
      auditor_lider_id: '',
      fecha_planificada: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'planificada'
    });
    setAuditoriaEditando(null);
    setMostrarModal(true);
  };

  // Abrir modal para editar
  const abrirModalEditar = (auditoria) => {
    setModoModal('edit');
    setFormData({
      codigo: auditoria.codigo,
      nombre: auditoria.nombre || '',
      tipo_auditoria: auditoria.tipo_auditoria || 'interna',
      objetivo: auditoria.objetivo || '',
      alcance: auditoria.alcance || '',
      auditor_lider_id: auditoria.auditor_lider_id || '',
      fecha_planificada: auditoria.fecha_planificada?.split('T')[0] || '',
      fecha_inicio: auditoria.fecha_inicio?.split('T')[0] || '',
      fecha_fin: auditoria.fecha_fin?.split('T')[0] || '',
      estado: auditoria.estado || 'planificada'
    });
    setAuditoriaEditando(auditoria);
    setMostrarModal(true);
  };

  // Abrir modal para ver
  const abrirModalVer = (auditoria) => {
    setModoModal('view');
    setAuditoriaEditando(auditoria);
    setMostrarModal(true);
  };

  // Guardar auditoría
  const guardarAuditoria = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      if (!formData.codigo.trim()) {
        alert('El código es obligatorio');
        return;
      }

      if (modoModal === 'edit') {
        await auditoriaService.update(auditoriaEditando.id, formData);
        alert('Auditoría actualizada exitosamente');
      } else {
        await auditoriaService.create(formData);
        alert('Auditoría creada exitosamente');
      }

      setMostrarModal(false);
      await cargarAuditorias();
    } catch (err) {
      console.error('Error al guardar auditoría:', err);
      setError(err.message || 'Error al guardar la auditoría');
    } finally {
      setSaving(false);
    }
  };

  // Abrir diálogo de eliminación
  const abrirDialogoEliminar = (auditoria) => {
    setDeleteDialog({ open: true, auditoria });
  };

  // Eliminar auditoría
  const eliminarAuditoria = async () => {
    const auditoria = deleteDialog.auditoria;
    if (!auditoria) return;
    
    try {
      setError(null);
      await auditoriaService.delete(auditoria.id);
      await cargarAuditorias();
      setDeleteDialog({ open: false, auditoria: null });
      alert('Auditoría eliminada exitosamente');
    } catch (err) {
      console.error('Error al eliminar auditoría:', err);
      setError(err.message || 'Error al eliminar la auditoría');
    }
  };

  // Obtener color de estado
  const getEstadoColor = (estado) => {
    const colores = {
      planificada: 'bg-[#DBEAFE] text-[#1E40AF]',
      en_curso: 'bg-[#FEF3C7] text-[#92400E]',
      completada: 'bg-[#D1FAE5] text-[#065F46]',
      cancelada: 'bg-[#FEE2E2] text-[#991B1B]'
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
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Formatear fecha completa
  const formatearFechaCompleta = (fecha) => {
    if (!fecha) return 'No definida';
    try {
      return new Date(fecha).toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Obtener nombre de usuario
  const getNombreUsuario = (id) => {
    if (!id) return 'No asignado';
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2563EB] animate-spin mx-auto mb-4" />
          <p className="text-[#6B7280] text-lg">Cargando auditorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header con título y botón */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-[#2563EB] p-3 rounded-xl shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-[#1E3A8A]">
                    Planificación de Auditorías
                  </h1>
                  <p className="text-[#6B7280] text-lg mt-1">
                    ISO 9001:2015 - Cláusula 9.2 | Gestión del programa de auditorías
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={abrirModalCrear}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg transition-all duration-200 hover:shadow-xl font-medium text-lg"
            >
              <Plus className="w-6 h-6" />
              Nueva Auditoría
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-semibold text-lg">Error de conexión</p>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={cargarDatos}
                className="mt-3 text-sm text-red-800 underline hover:text-red-900 font-medium"
              >
                Reintentar conexión
              </button>
            </div>
          </div>
        )}

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6B7280] text-sm font-medium mb-1">Total de Auditorías</p>
                <p className="text-4xl font-bold text-[#1E3A8A]">{stats.total}</p>
              </div>
              <div className="bg-[#E0EDFF] p-4 rounded-xl">
                <Calendar className="w-8 h-8 text-[#2563EB]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6B7280] text-sm font-medium mb-1">Planificadas</p>
                <p className="text-4xl font-bold text-[#2563EB]">{stats.planificadas}</p>
              </div>
              <div className="bg-[#DBEAFE] p-4 rounded-xl">
                <Clock className="w-8 h-8 text-[#1E40AF]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6B7280] text-sm font-medium mb-1">En Curso</p>
                <p className="text-4xl font-bold text-[#F59E0B]">{stats.enCurso}</p>
              </div>
              <div className="bg-[#FEF3C7] p-4 rounded-xl">
                <AlertCircle className="w-8 h-8 text-[#D97706]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6B7280] text-sm font-medium mb-1">Completadas</p>
                <p className="text-4xl font-bold text-[#059669]">{stats.completadas}</p>
              </div>
              <div className="bg-[#D1FAE5] p-4 rounded-xl">
                <CheckCircle className="w-8 h-8 text-[#047857]" />
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta principal con tabla */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200">
          {/* Header de la tarjeta con filtros */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1E3A8A] flex items-center gap-3">
                  <ListChecks className="w-7 h-7 text-[#2563EB]" />
                  Registro de Auditorías
                </h2>
                <p className="text-[#6B7280] mt-1">
                  Gestiona y programa las auditorías de calidad
                </p>
              </div>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Buscar auditorías..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-base"
                />
              </div>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-base"
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
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-base"
              >
                <option value="">Todos los estados</option>
                <option value="planificada">Planificada</option>
                <option value="en_curso">En Curso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
              <button
                onClick={() => alert('Función de exportar en desarrollo')}
                className="bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium"
              >
                <Download className="w-5 h-5" />
                Exportar
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            {auditoriasFiltradas.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-[#F3F4F6] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-[#9CA3AF]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1F2937] mb-2">
                  No hay auditorías registradas
                </h3>
                <p className="text-[#6B7280] mb-6">
                  {busqueda || filtroTipo || filtroEstado
                    ? 'No se encontraron auditorías con los filtros aplicados'
                    : 'Comienza creando tu primera auditoría del programa'}
                </p>
                {!busqueda && !filtroTipo && !filtroEstado && (
                  <button
                    onClick={abrirModalCrear}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Nueva Auditoría
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#F9FAFB] border-b-2 border-gray-200">
                  <tr>
                    <th className="p-6 text-left text-sm font-bold text-[#374151] uppercase tracking-wider">
                      Código
                    </th>
                    <th className="p-6 text-left text-sm font-bold text-[#374151] uppercase tracking-wider">
                      Nombre/Objetivo
                    </th>
                    <th className="p-6 text-left text-sm font-bold text-[#374151] uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="p-6 text-left text-sm font-bold text-[#374151] uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="p-6 text-left text-sm font-bold text-[#374151] uppercase tracking-wider">
                      Auditor Líder
                    </th>
                    <th className="p-6 text-left text-sm font-bold text-[#374151] uppercase tracking-wider">
                      Fecha Planificada
                    </th>
                    <th className="p-6 text-right text-sm font-bold text-[#374151] uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {auditoriasFiltradas.map((auditoria) => (
                    <tr key={auditoria.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="p-6">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-[#E0EDFF] text-[#2563EB]">
                          {auditoria.codigo}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="font-semibold text-[#1F2937] mb-1">
                          {auditoria.nombre || 'Sin nombre'}
                        </div>
                        <div className="text-sm text-[#6B7280] line-clamp-1">
                          {auditoria.objetivo || <span className="italic text-gray-400">Sin objetivo definido</span>}
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#F3E8FF] text-[#7C3AED] capitalize">
                          {auditoria.tipo_auditoria?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(auditoria.estado)} capitalize`}>
                          {getEstadoIcono(auditoria.estado)}
                          {auditoria.estado?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-[#374151]">
                          <User className="w-4 h-4 text-[#9CA3AF]" />
                          <span className="font-medium">
                            {getNombreUsuario(auditoria.auditor_lider_id)}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-sm text-[#6B7280]">
                        {formatearFecha(auditoria.fecha_planificada)}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => abrirModalVer(auditoria)}
                            className="p-2 text-[#2563EB] hover:bg-[#E0EDFF] rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => abrirModalEditar(auditoria)}
                            className="p-2 text-[#4B5563] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => abrirDialogoEliminar(auditoria)}
                            className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
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
            )}
          </div>
        </div>

        {/* Modal de crear/editar/ver */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header del modal */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
                <h2 className="text-2xl font-bold text-[#1E3A8A] flex items-center gap-3">
                  {modoModal === 'create' && (
                    <>
                      <Plus className="w-7 h-7 text-[#2563EB]" />
                      Nueva Auditoría
                    </>
                  )}
                  {modoModal === 'edit' && (
                    <>
                      <Edit className="w-7 h-7 text-[#2563EB]" />
                      Editar Auditoría
                    </>
                  )}
                  {modoModal === 'view' && (
                    <>
                      <Eye className="w-7 h-7 text-[#2563EB]" />
                      Detalles de la Auditoría
                    </>
                  )}
                </h2>
              </div>

              {/* Contenido del modal */}
              <div className="p-8">
                {modoModal === 'view' && auditoriaEditando ? (
                  <div className="space-y-6">
                    {/* Información principal */}
                    <div className="bg-[#E0EDFF] rounded-xl p-6 border border-[#BFDBFE]">
                      <h3 className="font-bold text-[#1E3A8A] mb-4 text-lg">Información Principal</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-[#6B7280] mb-2">Código</p>
                          <span className="inline-flex items-center px-4 py-2 rounded-lg text-lg font-bold bg-[#2563EB]/10 text-[#2563EB]">
                            {auditoriaEditando.codigo}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-[#6B7280] mb-2">Tipo</p>
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-medium bg-[#F3E8FF] text-[#7C3AED] capitalize">
                            {auditoriaEditando.tipo_auditoria?.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-[#6B7280] mb-2">Nombre</p>
                          <p className="text-xl font-bold text-gray-900">{auditoriaEditando.nombre || 'Sin nombre'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Objetivo */}
                    {auditoriaEditando.objetivo && (
                      <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                        <h3 className="font-bold text-[#1E3A8A] mb-3 flex items-center gap-2 text-lg">
                          <Target className="w-5 h-5" /> Objetivo
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{auditoriaEditando.objetivo}</p>
                      </div>
                    )}

                    {/* Alcance */}
                    {auditoriaEditando.alcance && (
                      <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                        <h3 className="font-bold text-[#1E3A8A] mb-3 flex items-center gap-2 text-lg">
                          <ListChecks className="w-5 h-5" /> Alcance
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{auditoriaEditando.alcance}</p>
                      </div>
                    )}

                    {/* Detalles adicionales */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-xl p-5 border border-[#E5E7EB]">
                        <p className="text-sm text-[#6B7280] mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" /> Auditor Líder
                        </p>
                        <p className="text-lg font-semibold">{getNombreUsuario(auditoriaEditando.auditor_lider_id)}</p>
                      </div>
                      <div className="bg-white rounded-xl p-5 border border-[#E5E7EB]">
                        <p className="text-sm text-[#6B7280] mb-2">Estado</p>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getEstadoColor(auditoriaEditando.estado)} capitalize`}>
                          {getEstadoIcono(auditoriaEditando.estado)}
                          {auditoriaEditando.estado?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="bg-white rounded-xl p-5 border border-[#E5E7EB]">
                        <p className="text-sm text-[#6B7280] mb-2">Fecha Planificada</p>
                        <p className="text-lg font-semibold">{formatearFecha(auditoriaEditando.fecha_planificada)}</p>
                      </div>
                    </div>

                    {/* Fechas de ejecución */}
                    {(auditoriaEditando.fecha_inicio || auditoriaEditando.fecha_fin) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {auditoriaEditando.fecha_inicio && (
                          <div className="bg-white rounded-xl p-5 border border-[#E5E7EB]">
                            <p className="text-sm text-[#6B7280] mb-2">Fecha de Inicio</p>
                            <p className="text-base font-medium">{formatearFechaCompleta(auditoriaEditando.fecha_inicio)}</p>
                          </div>
                        )}
                        {auditoriaEditando.fecha_fin && (
                          <div className="bg-white rounded-xl p-5 border border-[#E5E7EB]">
                            <p className="text-sm text-[#6B7280] mb-2">Fecha de Fin</p>
                            <p className="text-base font-medium">{formatearFechaCompleta(auditoriaEditando.fecha_fin)}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={guardarAuditoria} className="space-y-6">
                    {/* Código y Tipo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-base font-semibold text-[#374151] mb-2">
                          Código <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.codigo}
                          onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-base"
                          placeholder="AUD-2025-001"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-semibold text-[#374151] mb-2">
                          Tipo <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.tipo_auditoria}
                          onChange={(e) => setFormData({...formData, tipo_auditoria: e.target.value})}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-base"
                        >
                          <option value="interna">Interna</option>
                          <option value="externa">Externa</option>
                          <option value="certificacion">Certificación</option>
                          <option value="seguimiento">Seguimiento</option>
                        </select>
                      </div>
                    </div>

                    {/* Nombre */}
                    <div>
                      <label className="block text-base font-semibold text-[#374151] mb-2">
                        Nombre de la Auditoría
                      </label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-base"
                        placeholder="Auditoría Interna de Procesos Operativos"
                      />
                    </div>

                    {/* Objetivo */}
                    <div>
                      <label className="block text-base font-semibold text-[#374151] mb-2 flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#2563EB]" />
                        Objetivo
                      </label>
                      <textarea
                        value={formData.objetivo}
                        onChange={(e) => setFormData({...formData, objetivo: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-base"
                        placeholder="Verificar el cumplimiento de los requisitos ISO 9001:2015 en los procesos de gestión..."
                      />
                    </div>

                    {/* Alcance */}
                    <div>
                      <label className="block text-base font-semibold text-[#374151] mb-2 flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-[#2563EB]" />
                        Alcance
                      </label>
                      <textarea
                        value={formData.alcance}
                        onChange={(e) => setFormData({...formData, alcance: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-base"
                        placeholder="Procesos de gestión de calidad, operaciones, recursos humanos..."
                      />
                    </div>

                    {/* Auditor */}
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-base font-semibold text-[#374151] mb-2">
                          Auditor Líder
                        </label>
                        <select
                          value={formData.auditor_lider_id}
                          onChange={(e) => setFormData({...formData, auditor_lider_id: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-base"
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

                    {/* Fechas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-base font-semibold text-[#374151] mb-2">
                          Fecha Planificada <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.fecha_planificada}
                          onChange={(e) => setFormData({...formData, fecha_planificada: e.target.value})}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-semibold text-[#374151] mb-2">
                          Fecha de Inicio
                        </label>
                        <input
                          type="date"
                          value={formData.fecha_inicio}
                          onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-semibold text-[#374151] mb-2">
                          Fecha de Fin
                        </label>
                        <input
                          type="date"
                          value={formData.fecha_fin}
                          onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-base"
                        />
                      </div>
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block text-base font-semibold text-[#374151] mb-2">
                        Estado
                      </label>
                      <select
                        value={formData.estado}
                        onChange={(e) => setFormData({...formData, estado: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-base"
                      >
                        <option value="planificada">Planificada</option>
                        <option value="en_curso">En Curso</option>
                        <option value="completada">Completada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </div>

                    {/* Botones del formulario */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setMostrarModal(false)}
                        disabled={saving}
                        className="px-6 py-3 border-2 border-gray-300 rounded-xl text-[#374151] hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium text-base"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 flex items-center gap-2 font-medium text-base shadow-lg"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            {modoModal === 'edit' ? 'Actualizar Auditoría' : 'Crear Auditoría'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Botón de cerrar para vista */}
                {modoModal === 'view' && (
                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setMostrarModal(false)}
                      className="px-6 py-3 border-2 border-gray-300 rounded-xl text-[#374151] hover:bg-gray-50 transition-colors font-medium text-base"
                    >
                      Cerrar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Diálogo de confirmación de eliminación */}
        {deleteDialog.open && deleteDialog.auditoria && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1F2937]">¿Eliminar esta auditoría?</h3>
                </div>
              </div>
              <p className="text-[#6B7280] mb-6">
                Se eliminará permanentemente la auditoría{' '}
                <strong className="text-[#1F2937]">{deleteDialog.auditoria.nombre || deleteDialog.auditoria.codigo}</strong>{' '}
                (código: <strong className="text-[#1F2937]">{deleteDialog.auditoria.codigo}</strong>). 
                Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteDialog({ open: false, auditoria: null })}
                  className="px-5 py-2.5 border-2 border-gray-300 rounded-xl text-[#374151] hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarAuditoria}
                  className="px-5 py-2.5 bg-[#EF4444] hover:bg-red-700 text-white rounded-xl transition-colors font-medium"
                >
                  Eliminar Auditoría
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditoriasPlanificacion;