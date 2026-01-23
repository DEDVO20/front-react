import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Plus, Calendar, FileText, AlertTriangle, CheckCircle, XCircle,
  Eye, Edit, Trash2, Users, Clock, TrendingUp, ChevronDown, ChevronUp, AlertCircle, X
} from 'lucide-react';
import { auditoriaService } from '@/services/auditoria.service';

const API_URL = 'http://localhost:3000/api';

// Tipos de datos
interface Auditoria {
  id: string;
  codigo: string;
  nombre?: string;
  tipo?: string;
  objetivo?: string;
  alcance?: string;
  normaReferencia?: string;
  auditorLiderId?: string;
  fechaPlanificada?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: string;
  creadoPor?: string;
  creadoEn: string;
  auditorLider?: { id: string; nombre: string; email: string };
  hallazgos?: Hallazgo[];
}

interface Hallazgo {
  id: string;
  auditoriaId: string;
  tipo?: string;
  descripcion?: string;
  clausulaIso?: string;
  procesoId?: string;
  areaId?: string;
  evidencia?: string;
  responsableId?: string;
  creadoEn: string;
  auditoria?: { codigo: string; nombre: string };
}

interface FormData {
  codigo: string;
  nombre: string;
  tipo: string;
  objetivo: string;
  alcance: string;
  normaReferencia: string;
  auditorLiderId: string;
  fechaPlanificada: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  creadoPor: string;
}

interface HallazgoFormData {
  auditoriaId: string;
  tipo: string;
  descripcion: string;
  clausulaIso: string;
  procesoId: string;
  areaId: string;
  evidencia: string;
  responsableId: string;
}

const AuditoriasHallazgosView: React.FC = () => {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [hallazgos, setHallazgos] = useState<Hallazgo[]>([]);
  const [filteredAuditorias, setFilteredAuditorias] = useState<Auditoria[]>([]);
  const [filteredHallazgos, setFilteredHallazgos] = useState<Hallazgo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'auditorias' | 'hallazgos'>('auditorias');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showHallazgoModal, setShowHallazgoModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAuditoria, setSelectedAuditoria] = useState<Auditoria | null>(null);
  const [selectedHallazgo, setSelectedHallazgo] = useState<Hallazgo | null>(null);
  const [expandedAuditoria, setExpandedAuditoria] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
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
    estado: 'planificada',
    creadoPor: ''
  });

  const [hallazgoFormData, setHallazgoFormData] = useState<HallazgoFormData>({
    auditoriaId: '',
    tipo: 'no_conformidad_menor',
    descripcion: '',
    clausulaIso: '',
    procesoId: '',
    areaId: '',
    evidencia: '',
    responsableId: ''
  });

  // Token simulado
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

  useEffect(() => {
    fetchAuditorias();
    fetchHallazgos();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchTerm, filterTipo, filterEstado, auditorias, hallazgos, activeTab]);

  const fetchAuditorias = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auditorias`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAuditorias(data.auditorias || data);
      }
    } catch (error) {
      console.error('Error al cargar auditorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHallazgos = async () => {
    try {
      const response = await fetch(`${API_URL}/hallazgos-auditoria`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setHallazgos(data);
      }
    } catch (error) {
      console.error('Error al cargar hallazgos:', error);
    }
  };

  const filterData = () => {
    if (activeTab === 'auditorias') {
      let filtered = auditorias;
      if (searchTerm) {
        filtered = filtered.filter(a =>
          a.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.objetivo?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (filterTipo) {
        filtered = filtered.filter(a => a.tipo === filterTipo);
      }
      if (filterEstado) {
        filtered = filtered.filter(a => a.estado === filterEstado);
      }
      setFilteredAuditorias(filtered);
    } else {
      let filtered = hallazgos;
      if (searchTerm) {
        filtered = filtered.filter(h =>
          h.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.clausulaIso?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.evidencia?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (filterTipo) {
        filtered = filtered.filter(h => h.tipo === filterTipo);
      }
      setFilteredHallazgos(filtered);
    }
  };

  const handleCreateAuditoria = () => {
    setModalMode('create');
    setFormData({
      codigo: `AUD-${new Date().getFullYear()}-${String(auditorias.length + 1).padStart(3, '0')}`,
      nombre: '',
      tipo: 'interna',
      objetivo: '',
      alcance: '',
      normaReferencia: 'ISO 9001:2015',
      auditorLiderId: '1',
      fechaPlanificada: '',
      fechaInicio: '',
      fechaFin: '',
      estado: 'planificada',
      creadoPor: '1'
    });
    setShowModal(true);
  };

  const handleEditAuditoria = (auditoria: Auditoria) => {
    setModalMode('edit');
    setSelectedAuditoria(auditoria);
    setFormData({
      codigo: auditoria.codigo || '',
      nombre: auditoria.nombre || '',
      tipo: auditoria.tipo || 'interna',
      objetivo: auditoria.objetivo || '',
      alcance: auditoria.alcance || '',
      normaReferencia: auditoria.normaReferencia || 'ISO 9001:2015',
      auditorLiderId: auditoria.auditorLiderId || '',
      fechaPlanificada: auditoria.fechaPlanificada || '',
      fechaInicio: auditoria.fechaInicio || '',
      fechaFin: auditoria.fechaFin || '',
      estado: auditoria.estado || 'planificada',
      creadoPor: auditoria.creadoPor || ''
    });
    setShowModal(true);
  };

  const handleViewAuditoria = (auditoria: Auditoria) => {
    setModalMode('view');
    setSelectedAuditoria(auditoria);
    setShowModal(true);
  };

  const handleSubmitAuditoria = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = modalMode === 'create'
        ? `${API_URL}/auditorias`
        : `${API_URL}/auditorias/${selectedAuditoria?.id}`;

      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowModal(false);
        fetchAuditorias();
      }
    } catch (error) {
      console.error('Error al guardar auditoría:', error);
    }
  };

  const handleDeleteAuditoria = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta auditoría?')) return;
    try {
      const response = await fetch(`${API_URL}/auditorias/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAuditorias();
      }
    } catch (error) {
      console.error('Error al eliminar auditoría:', error);
    }
  };

  const handleCreateHallazgo = (auditoriaId?: string) => {
    setModalMode('create');
    setHallazgoFormData({
      auditoriaId: auditoriaId || '',
      tipo: 'no_conformidad_menor',
      descripcion: '',
      clausulaIso: '',
      procesoId: '',
      areaId: '',
      evidencia: '',
      responsableId: ''
    });
    setShowHallazgoModal(true);
  };

  const handleEditHallazgo = (hallazgo: Hallazgo) => {
    setModalMode('edit');
    setSelectedHallazgo(hallazgo);
    setHallazgoFormData({
      auditoriaId: hallazgo.auditoriaId,
      tipo: hallazgo.tipo || 'no_conformidad_menor',
      descripcion: hallazgo.descripcion || '',
      clausulaIso: hallazgo.clausulaIso || '',
      procesoId: hallazgo.procesoId || '',
      areaId: hallazgo.areaId || '',
      evidencia: hallazgo.evidencia || '',
      responsableId: hallazgo.responsableId || ''
    });
    setShowHallazgoModal(true);
  };

  const handleSubmitHallazgo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = modalMode === 'create'
        ? `${API_URL}/hallazgos-auditoria`
        : `${API_URL}/hallazgos-auditoria/${selectedHallazgo?.id}`;

      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hallazgoFormData)
      });
      if (response.ok) {
        setShowHallazgoModal(false);
        fetchHallazgos();
      }
    } catch (error) {
      console.error('Error al guardar hallazgo:', error);
    }
  };

  const handleDeleteHallazgo = async (id: string) => {
    if (!confirm('¿Eliminar este hallazgo?')) return;
    try {
      const response = await fetch(`${API_URL}/hallazgos-auditoria/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchHallazgos();
      }
    } catch (error) {
      console.error('Error al eliminar hallazgo:', error);
    }
  };

  const getEstadoBadge = (estado?: string) => {
    const badges: Record<string, { color: string; icon: React.FC<any> }> = {
      planificada: { color: 'bg-blue-100 text-blue-800', icon: Calendar },
      en_curso: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      completada: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelada: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const badge = badges[estado || 'planificada'];
    const Icon = badge.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {estado?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getTipoHallazgoBadge = (tipo?: string) => {
    const badges: Record<string, { color: string; icon: React.FC<any> }> = {
      no_conformidad_mayor: { color: 'bg-red-100 text-red-800', icon: XCircle },
      no_conformidad_menor: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      observacion: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      oportunidad_mejora: { color: 'bg-green-100 text-green-800', icon: TrendingUp }
    };

    const badge = badges[tipo || 'observacion'];
    const Icon = badge.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {tipo?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = {
    totalAuditorias: auditorias.length,
    planificadas: auditorias.filter(a => a.estado === 'planificada').length,
    enCurso: auditorias.filter(a => a.estado === 'en_curso').length,
    completadas: auditorias.filter(a => a.estado === 'completada').length,
    totalHallazgos: hallazgos.length,
    noConformidadesMayores: hallazgos.filter(h => h.tipo === 'no_conformidad_mayor').length,
    noConformidadesMenores: hallazgos.filter(h => h.tipo === 'no_conformidad_menor').length,
    observaciones: hallazgos.filter(h => h.tipo === 'observacion').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Auditorías y Hallazgos</h1>
          <p className="text-gray-600">Sistema de Gestión de Calidad ISO 9001:2015 - Cláusula 9.2</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Auditorías</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAuditorias}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500" />
            </div>
            <div className="mt-4 flex gap-2 text-xs">
              <span className="text-blue-600">Planificadas: {stats.planificadas}</span>
              <span className="text-yellow-600">En curso: {stats.enCurso}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-3xl font-bold text-green-600">{stats.completadas}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-600">
                {stats.totalAuditorias > 0
                  ? `${((stats.completadas / stats.totalAuditorias) * 100).toFixed(1)}% del total`
                  : '0% del total'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hallazgos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalHallazgos}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-500" />
            </div>
            <div className="mt-4 flex gap-2 text-xs">
              <span className="text-red-600">NC Mayor: {stats.noConformidadesMayores}</span>
              <span className="text-yellow-600">NC Menor: {stats.noConformidadesMenores}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Observaciones</p>
                <p className="text-3xl font-bold text-blue-600">{stats.observaciones}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-blue-500" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-600">
                {stats.totalHallazgos > 0
                  ? `${((stats.observaciones / stats.totalHallazgos) * 100).toFixed(1)}% del total`
                  : '0% del total'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('auditorias')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'auditorias'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Auditorías ({filteredAuditorias.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('hallazgos')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'hallazgos'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Hallazgos ({filteredHallazgos.length})
              </div>
            </button>
          </div>

          {/* Filters and Search */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              {activeTab === 'auditorias' ? (
                <>
                  <select
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="interna">Interna</option>
                    <option value="externa">Externa</option>
                    <option value="certificacion">Certificación</option>
                  </select>
                  <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Todos los estados</option>
                    <option value="planificada">Planificada</option>
                    <option value="en_curso">En Curso</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </>
              ) : (
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Todos los tipos</option>
                  <option value="no_conformidad_mayor">NC Mayor</option>
                  <option value="no_conformidad_menor">NC Menor</option>
                  <option value="observacion">Observación</option>
                  <option value="oportunidad_mejora">Oportunidad de Mejora</option>
                </select>
              )}
              <button
                onClick={activeTab === 'auditorias' ? handleCreateAuditoria : () => handleCreateHallazgo()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 shadow-md"
              >
                <Plus className="w-5 h-5" />
                Nueva {activeTab === 'auditorias' ? 'Auditoría' : 'Hallazgo'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando...</p>
              </div>
            ) : activeTab === 'auditorias' ? (
              filteredAuditorias.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No se encontraron auditorías</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAuditorias.map((auditoria) => (
                    <div key={auditoria.id} className="border border-gray-200 rounded-xl hover:shadow-lg transition-shadow bg-white">
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {auditoria.codigo}
                              </h3>
                              {getEstadoBadge(auditoria.estado)}
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                {auditoria.tipo?.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">{auditoria.nombre || 'Sin nombre'}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Planificada:</span>
                                <p className="font-medium">{formatDate(auditoria.fechaPlanificada)}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Inicio:</span>
                                <p className="font-medium">{formatDate(auditoria.fechaInicio)}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Fin:</span>
                                <p className="font-medium">{formatDate(auditoria.fechaFin)}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Norma:</span>
                                <p className="font-medium">{auditoria.normaReferencia || '-'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setExpandedAuditoria(expandedAuditoria === auditoria.id ? null : auditoria.id)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                              title="Ver hallazgos"
                            >
                              {expandedAuditoria === auditoria.id ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleViewAuditoria(auditoria)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Ver detalles"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEditAuditoria(auditoria)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                              title="Editar"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAuditoria(auditoria.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Eliminar"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {expandedAuditoria === auditoria.id && (
                        <div className="border-t bg-gray-50 p-4 rounded-b-xl">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5" />
                              Hallazgos de esta Auditoría
                            </h4>
                            <button
                              onClick={() => handleCreateHallazgo(auditoria.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              Agregar Hallazgo
                            </button>
                          </div>

                          <div className="space-y-2">
                            {hallazgos.filter(h => h.auditoriaId === auditoria.id).length === 0 ? (
                              <p className="text-gray-600 text-sm text-center py-4">
                                No hay hallazgos registrados para esta auditoría
                              </p>
                            ) : (
                              hallazgos
                                .filter(h => h.auditoriaId === auditoria.id)
                                .map(hallazgo => (
                                  <div key={hallazgo.id} className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          {getTipoHallazgoBadge(hallazgo.tipo)}
                                          <span className="text-xs text-gray-500">
                                            {formatDate(hallazgo.creadoEn)}
                                          </span>
                                        </div>
                                        <p className="text-gray-900 font-medium">{hallazgo.descripcion}</p>
                                        {hallazgo.clausulaIso && (
                                          <p className="text-sm text-gray-600 mt-1">
                                            Cláusula ISO: <span className="font-medium">{hallazgo.clausulaIso}</span>
                                          </p>
                                        )}
                                        {hallazgo.evidencia && (
                                          <p className="text-sm text-gray-600 mt-1">
                                            Evidencia: <span className="italic">{hallazgo.evidencia}</span>
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => handleEditHallazgo(hallazgo)}
                                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteHallazgo(hallazgo.id)}
                                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              filteredHallazgos.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No se encontraron hallazgos</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHallazgos.map((hallazgo) => {
                    const auditoria = auditorias.find(a => a.id === hallazgo.auditoriaId);
                    return (
                      <div key={hallazgo.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getTipoHallazgoBadge(hallazgo.tipo)}
                              <span className="text-xs text-gray-500">
                                {formatDate(hallazgo.creadoEn)}
                              </span>
                            </div>
                            <p className="font-semibold text-gray-900 mb-1">{hallazgo.descripcion}</p>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                <span className="font-medium">Auditoría:</span> {auditoria?.codigo} - {auditoria?.nombre}
                              </p>
                              {hallazgo.clausulaIso && (
                                <p>
                                  <span className="font-medium">Cláusula:</span> {hallazgo.clausulaIso}
                                </p>
                              )}
                              {hallazgo.evidencia && (
                                <p className="italic">
                                  "{hallazgo.evidencia}"
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditHallazgo(hallazgo)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteHallazgo(hallazgo.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>

        {/* Modal Auditoría */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {modalMode === 'view' ? 'Detalles de Auditoría' : modalMode === 'edit' ? 'Editar Auditoría' : 'Nueva Auditoría'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmitAuditoria} className="p-6 space-y-5">
                {modalMode === 'view' ? (
                  <div className="space-y-4">
                    <div><strong>Código:</strong> {selectedAuditoria?.codigo}</div>
                    <div><strong>Nombre:</strong> {selectedAuditoria?.nombre}</div>
                    <div><strong>Tipo:</strong> {selectedAuditoria?.tipo}</div>
                    <div><strong>Objetivo:</strong> {selectedAuditoria?.objetivo}</div>
                    <div><strong>Alcance:</strong> {selectedAuditoria?.alcance}</div>
                    <div><strong>Norma:</strong> {selectedAuditoria?.normaReferencia}</div>
                    <div><strong>Estado:</strong> {selectedAuditoria?.estado}</div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <input type="text" placeholder="Código" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} required className="w-full px-4 py-3 border rounded-xl" />
                      <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} className="w-full px-4 py-3 border rounded-xl">
                        <option value="interna">Interna</option>
                        <option value="externa">Externa</option>
                        <option value="certificacion">Certificación</option>
                      </select>
                    </div>
                    <input type="text" placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />
                    <textarea placeholder="Objetivo" value={formData.objetivo} onChange={e => setFormData({...formData, objetivo: e.target.value})} rows={3} className="w-full px-4 py-3 border rounded-xl resize-none" />
                    <textarea placeholder="Alcance" value={formData.alcance} onChange={e => setFormData({...formData, alcance: e.target.value})} rows={3} className="w-full px-4 py-3 border rounded-xl resize-none" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <input type="text" placeholder="Norma" value={formData.normaReferencia} onChange={e => setFormData({...formData, normaReferencia: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />
                      <select value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} className="w-full px-4 py-3 border rounded-xl">
                        <option value="planificada">Planificada</option>
                        <option value="en_curso">En Curso</option>
                        <option value="completada">Completada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <input type="date" value={formData.fechaPlanificada} onChange={e => setFormData({...formData, fechaPlanificada: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />
                      <input type="date" value={formData.fechaInicio} onChange={e => setFormData({...formData, fechaInicio: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />
                      <input type="date" value={formData.fechaFin} onChange={e => setFormData({...formData, fechaFin: e.target.value})} className="w-full px-4 py-3 border rounded-xl" />
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 border rounded-xl text-gray-700 hover:bg-gray-50">
                    {modalMode === 'view' ? 'Cerrar' : 'Cancelar'}
                  </button>
                  {modalMode !== 'view' && (
                    <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                      {modalMode === 'edit' ? 'Actualizar' : 'Crear'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Hallazgo */}
        {showHallazgoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {modalMode === 'edit' ? 'Editar Hallazgo' : 'Nuevo Hallazgo'}
                </h2>
                <button onClick={() => setShowHallazgoModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmitHallazgo} className="p-6 space-y-5">
                <select
                  value={hallazgoFormData.tipo}
                  onChange={e => setHallazgoFormData({...hallazgoFormData, tipo: e.target.value})}
                  className="w-full px-4 py-3 border rounded-xl"
                >
                  <option value="no_conformidad_mayor">No Conformidad Mayor</option>
                  <option value="no_conformidad_menor">No Conformidad Menor</option>
                  <option value="observacion">Observación</option>
                  <option value="oportunidad_mejora">Oportunidad de Mejora</option>
                </select>
                <textarea
                  placeholder="Descripción del hallazgo"
                  value={hallazgoFormData.descripcion}
                  onChange={e => setHallazgoFormData({...hallazgoFormData, descripcion: e.target.value})}
                  rows={3}
                  required
                  className="w-full px-4 py-3 border rounded-xl resize-none"
                />
                <input
                  type="text"
                  placeholder="Cláusula ISO (ej: 7.1.3)"
                  value={hallazgoFormData.clausulaIso}
                  onChange={e => setHallazgoFormData({...hallazgoFormData, clausulaIso: e.target.value})}
                  className="w-full px-4 py-3 border rounded-xl"
                />
                <textarea
                  placeholder="Evidencia"
                  value={hallazgoFormData.evidencia}
                  onChange={e => setHallazgoFormData({...hallazgoFormData, evidencia: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-xl resize-none"
                />
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button type="button" onClick={() => setShowHallazgoModal(false)} className="px-6 py-3 border rounded-xl text-gray-700 hover:bg-gray-50">
                    Cancelar
                  </button>
                  <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                    {modalMode === 'edit' ? 'Actualizar' : 'Crear'} Hallazgo
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

export default AuditoriasHallazgosView;