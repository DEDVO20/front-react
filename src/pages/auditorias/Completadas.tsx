import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Search, Eye, Edit, Trash2, 
  Users, CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp,
  XCircle, Filter, FileText, Activity, CheckCircle
} from 'lucide-react';
import { auditoriaService } from '@/services/auditoria.service';

// === MOCK DATA (Solo auditorías completadas) ===
const MOCK_AUDITORIAS_COMPLETADAS: Auditoria[] = [
  {
    id: '3',
    codigo: 'AUD-2024-015',
    tipo: 'seguimiento',
    objetivo: 'Verificar corrección de no conformidades',
    alcance: 'Áreas con hallazgos previos',
    normaReferencia: 'ISO 9001:2015',
    fechaPlanificada: '2024-12-10',
    fechaInicio: '2024-12-11',
    fechaFin: '2024-12-12',
    estado: 'completada',
    creadoEn: '2024-11-15T09:00:00Z',
    auditorLider: { id: '4', nombre: 'Miguel Torres', email: 'miguel@empresa.com' },
    creadoPorUsuario: { id: '2', nombre: 'Carlos Mendoza', email: 'carlos@empresa.com' }
  },
  {
    id: '5',
    codigo: 'AUD-2024-010',
    tipo: 'interna',
    objetivo: 'Auditoría anual de calidad',
    alcance: 'Todos los departamentos',
    normaReferencia: 'ISO 9001:2015',
    fechaPlanificada: '2024-11-01',
    fechaInicio: '2024-11-02',
    fechaFin: '2024-11-05',
    estado: 'completada',
    creadoEn: '2024-10-20T11:00:00Z',
    auditorLider: { id: '1', nombre: 'Ana García', email: 'ana@empresa.com' }
  },
  {
    id: '6',
    codigo: 'AUD-2024-005',
    tipo: 'certificacion',
    objetivo: 'Renovación de certificación ISO 9001',
    alcance: 'Sistema de gestión completo',
    normaReferencia: 'ISO 9001:2015',
    fechaPlanificada: '2024-08-15',
    fechaInicio: '2024-08-16',
    fechaFin: '2024-08-18',
    estado: 'completada',
    creadoEn: '2024-07-01T09:30:00Z',
    auditorLider: { id: '3', nombre: 'Laura Pérez', email: 'laura@empresa.com' }
  }
];

// === INTERFACES ===
import { Auditoria as AuditoriaService } from '@/services/auditoria.service';

type Auditoria = AuditoriaService;

// === COMPONENTE: AUDITORÍAS COMPLETADAS ===
const AuditoriasCompletadas: React.FC = () => {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [filteredAuditorias, setFilteredAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [selectedAuditoria, setSelectedAuditoria] = useState<Auditoria | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    cargarAuditorias();
  }, []);

  const cargarAuditorias = async () => {
    try {
      setLoading(true);
      const data = await auditoriaService.getCompletadas();
      const auditoriasList = Array.isArray(data) ? data : [];
      setAuditorias(auditoriasList);
      setFilteredAuditorias(auditoriasList);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar auditorías completadas:', err);
      setError('No se pudieron cargar las auditorías. Usando datos de ejemplo.');
      setAuditorias(MOCK_AUDITORIAS_COMPLETADAS);
      setFilteredAuditorias(MOCK_AUDITORIAS_COMPLETADAS);
      setLoading(false);
    }
  };

  const cargarAuditorias_OLD = async () => {
    try {
      setLoading(true);
      const data = await auditoriaService.getCompletadas();
      setAuditorias(data);
      setFilteredAuditorias(data);
    } catch (error) {
      console.error('Error al cargar auditorías:', error);
      setAuditorias(MOCK_AUDITORIAS_COMPLETADAS);
      setFilteredAuditorias(MOCK_AUDITORIAS_COMPLETADAS);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    codigo: '',
    tipo: 'interna',
    objetivo: '',
    alcance: '',
    normaReferencia: 'ISO 9001:2015',
    fechaPlanificada: '',
    fechaInicio: '',
    fechaFin: '',
    estado: 'completada'
  });



  // === CARGA INICIAL ===
  useEffect(() => {
    cargarAuditorias();
  }, []);

  // === FILTRADO ===
  useEffect(() => {
    let filtered = [...auditorias];
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.objetivo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterTipo) filtered = filtered.filter(a => a.tipo === filterTipo);
    setFilteredAuditorias(filtered);
  }, [searchTerm, filterTipo, auditorias]);

  // === CRUD (solo edición y vista) ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      alert('Auditoría completada actualizada (demo)');
      await cargarAuditorias();
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      tipo: 'interna',
      objetivo: '',
      alcance: '',
      normaReferencia: 'ISO 9001:2015',
      fechaPlanificada: '',
      fechaInicio: '',
      fechaFin: '',
      estado: 'completada'
    });
  };

  const openModal = (mode: 'view' | 'edit', auditoria: Auditoria) => {
    setModalMode(mode);
    setSelectedAuditoria(auditoria);
    if (mode === 'edit') {
      setFormData({
        codigo: auditoria.codigo,
        tipo: auditoria.tipo,
        objetivo: auditoria.objetivo || '',
        alcance: auditoria.alcance || '',
        normaReferencia: auditoria.normaReferencia || 'ISO 9001:2015',
        fechaPlanificada: auditoria.fechaPlanificada || '',
        fechaInicio: auditoria.fechaInicio || '',
        fechaFin: auditoria.fechaFin || '',
        estado: 'completada'
      });
    }
    setShowModal(true);
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  // === BADGES ===
  const TipoBadge: React.FC<{ tipo: string }> = ({ tipo }) => {
    const configs: Record<string, { bg: string; text: string; border: string }> = {
      interna: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
      externa: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
      certificacion: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
      seguimiento: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' }
    };
    const config = configs[tipo] || configs.interna;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}>
        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </span>
    );
  };

  const formatDate = (date?: string) => {
    if (!date) return 'No definida';
    return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // === RENDER ===
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando auditorías completadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Auditorías Completadas</h1>
                <p className="text-gray-600 mt-1">
                  ISO 9001:2015 - Cláusula 9.2 | {auditorias.length} auditoría{auditorias.length !== 1 ? 's' : ''} finalizada{auditorias.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-6 py-3 rounded-xl cursor-not-allowed flex items-center gap-2 opacity-60"
              title="No se crean nuevas auditorías aquí"
            >
              <Plus className="w-5 h-5" />
              Nueva Auditoría
            </button>
          </div>
        </div>

        {/* Info */}
        {error && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-emerald-600" />
            <p className="text-sm text-emerald-800">{error}</p>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-green-600">{auditorias.length}</span>
            </div>
            <h3 className="text-gray-700 font-semibold">Total Completadas</h3>
            <p className="text-sm text-gray-500 mt-1">Auditorías finalizadas</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-blue-600">
                {auditorias.filter(a => a.tipo === 'certificacion').length}
              </span>
            </div>
            <h3 className="text-gray-700 font-semibold">Certificaciones</h3>
            <p className="text-sm text-gray-500 mt-1">Renovadas o logradas</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-3xl font-bold text-orange-600">
                {auditorias.filter(a => a.tipo === 'seguimiento').length}
              </span>
            </div>
            <h3 className="text-gray-700 font-semibold">Seguimientos</h3>
            <p className="text-sm text-gray-500 mt-1">Acciones correctivas cerradas</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por código u objetivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">Todos los tipos</option>
              <option value="interna">Interna</option>
              <option value="externa">Externa</option>
              <option value="certificacion">Certificación</option>
              <option value="seguimiento">Seguimiento</option>
            </select>
            <button
              onClick={() => { setSearchTerm(''); setFilterTipo(''); }}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Limpiar
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {filteredAuditorias.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay auditorías completadas</h3>
              <p className="text-gray-600">
                {searchTerm || filterTipo
                  ? 'Ajusta los filtros para ver resultados'
                  : 'Aún no se han completado auditorías'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-50 to-emerald-100 border-b border-green-200">
                  <tr>
                    <th className="w-12 px-6 py-4"></th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Código</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Objetivo</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Finalizada</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAuditorias.map((auditoria) => (
                    <React.Fragment key={auditoria.id}>
                      <tr className="hover:bg-green-50 transition-colors">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleRow(auditoria.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {expandedRows.has(auditoria.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-900">{auditoria.codigo}</span>
                        </td>
                        <td className="px-6 py-4">
                          <TipoBadge tipo={auditoria.tipo} />
                        </td>
                        <td className="px-6 py-4 max-w-md">
                          <p className="text-sm text-gray-700 line-clamp-2">{auditoria.objetivo || 'Sin objetivo'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2 text-green-600" />
                            {formatDate(auditoria.fechaFin)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openModal('view', auditoria)} className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                              <Eye className="w-5 h-5 text-green-600" />
                            </button>
                            <button onClick={() => openModal('edit', auditoria)} className="p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                              <Edit className="w-5 h-5 text-emerald-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows.has(auditoria.id) && (
                        <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                          <td colSpan={6} className="px-6 py-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                              <div>
                                <p className="font-semibold text-gray-700 mb-1">Alcance</p>
                                <p className="text-gray-600">{auditoria.alcance || 'No definido'}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-700 mb-1">Norma</p>
                                <p className="text-gray-600">{auditoria.normaReferencia}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-700 mb-1">Auditor Líder</p>
                                <p className="text-gray-600">{auditoria.auditorLider?.nombre || 'No asignado'}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-700 mb-1">Inicio</p>
                                <p className="text-gray-600">{formatDate(auditoria.fechaInicio)}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-700 mb-1">Fin</p>
                                <p className="text-gray-600">{formatDate(auditoria.fechaFin)}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-700 mb-1">Creada por</p>
                                <p className="text-gray-600">{auditoria.creadoPorUsuario?.nombre || 'Sistema'}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedAuditoria && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalMode === 'edit' ? 'Editar Auditoría Completada' : 'Detalles de Auditoría'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                {modalMode === 'view' ? (
                  <div className="space-y-4 text-sm">
                    <div><strong>Código:</strong> {selectedAuditoria.codigo}</div>
                    <div><strong>Tipo:</strong> <TipoBadge tipo={selectedAuditoria.tipo} /></div>
                    <div><strong>Objetivo:</strong> {selectedAuditoria.objetivo}</div>
                    <div><strong>Alcance:</strong> {selectedAuditoria.alcance}</div>
                    <div><strong>Norma:</strong> {selectedAuditoria.normaReferencia}</div>
                    <div><strong>Inicio:</strong> {formatDate(selectedAuditoria.fechaInicio)}</div>
                    <div><strong>Fin:</strong> {formatDate(selectedAuditoria.fechaFin)}</div>
                    <div><strong>Auditor Líder:</strong> {selectedAuditoria.auditorLider?.nombre}</div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <input type="text" value={formData.codigo} readOnly className="w-full px-4 py-3 border rounded-xl bg-gray-50" />
                    <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} className="w-full px-4 py-3 border rounded-xl">
                      <option value="interna">Interna</option>
                      <option value="externa">Externa</option>
                      <option value="certificacion">Certificación</option>
                      <option value="seguimiento">Seguimiento</option>
                    </select>
                    <textarea value={formData.objetivo} onChange={e => setFormData({...formData, objetivo: e.target.value})} rows={3} className="w-full px-4 py-3 border rounded-xl resize-none" />
                    <textarea value={formData.alcance} onChange={e => setFormData({...formData, alcance: e.target.value})} rows={2} className="w-full px-4 py-3 border rounded-xl resize-none" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="date" value={formData.fechaInicio} onChange={e => setFormData({...formData, fechaInicio: e.target.value})} className="px-4 py-3 border rounded-xl" />
                      <input type="date" value={formData.fechaFin} onChange={e => setFormData({...formData, fechaFin: e.target.value})} className="px-4 py-3 border rounded-xl" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 border rounded-xl text-gray-700 hover:bg-gray-50">
                        Cancelar
                      </button>
                      <button type="submit" className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">
                        Guardar Cambios
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditoriasCompletadas;