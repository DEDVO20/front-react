import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Download, Eye, Edit, Trash2, Users, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';

const auditoriaService = {
  async getAll(filters: Filters = {}): Promise<Auditoria[]> {
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

  async create(data: AuditoriaFormData): Promise<Auditoria> {
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

  async update(id: string, data: Partial<AuditoriaFormData>): Promise<Auditoria> {
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

  async delete(id: string): Promise<boolean> {
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

const usuarioService = {
  async getAll(): Promise<Usuario[]> {
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

  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [mostrarModal, setMostrarModal] = useState(false);
  const [auditoriaEditando, setAuditoriaEditando] = useState<Auditoria | null>(null);
  const [formData, setFormData] = useState<AuditoriaFormData>({
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

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    cargarAuditorias();
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarAuditorias = async () => {
    try {
      const data = await auditoriaService.getAll({ tipo: filtroTipo, estado: filtroEstado });
      setAuditorias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const auditoriasFiltradas = auditorias.filter(aud => {
    if (!busqueda) return true;

    const searchLower = busqueda.toLowerCase();
    return (
      aud.codigo?.toLowerCase().includes(searchLower) ||
      aud.nombre?.toLowerCase().includes(searchLower) ||
      aud.objetivo?.toLowerCase().includes(searchLower)
    );
  });

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
      await auditoriaService.delete(deleteDialog.id);
      await cargarAuditorias();
      setDeleteDialog({ open: false, id: null });
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
    return usuario ? `${usuario.nombre} ${usuario.primerApellido || ''}`.trim() : 'No asignado';
  };

  const stats = {
    total: auditorias.length,
    planificadas: auditorias.filter(a => a.estado === 'planificada').length,
    enCurso: auditorias.filter(a => a.estado === 'en_curso').length,
    completadas: auditorias.filter(a => a.estado === 'completada').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-[#E0EDFF] to-[#C7D2FE] rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
                <Calendar className="h-9 w-9 text-[#2563EB]" />
                Planificación de Auditorías
              </h1>
              <p className="text-[#6B7280] mt-2 text-lg">
                Programa anual de auditorías internas según ISO 9001:2015
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Badge className="bg-white text-[#2563EB] border border-[#E5E7EB]">
                  {stats.total} totales
                </Badge>
                <Badge className="bg-[#ECFDF5] text-[#22C55E] border border-[#22C55E]/30">
                  {stats.completadas} completadas
                </Badge>
              </div>
            </div>
            <Button
              onClick={abrirModalCrear}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm rounded-xl px-6 py-6 h-auto font-bold"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nueva Auditoría
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#E0EDFF] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-bold text-[#1E3A8A]">Total</CardDescription>
                <Calendar className="h-8 w-8 text-[#2563EB]" />
              </div>
              <CardTitle className="text-4xl font-bold text-[#1E3A8A]">{stats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-[#6B7280] font-medium">Programadas</div>
            </CardContent>
          </Card>

          <Card className="bg-[#FFF7ED] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-bold text-[#9A3412]">Planificadas</CardDescription>
                <Clock className="h-8 w-8 text-[#F97316]/50" />
              </div>
              <CardTitle className="text-4xl font-bold text-[#9A3412]">{stats.planificadas}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-white/80 text-[#F97316] border-[#F97316]/20 font-bold uppercase text-[10px]">
                Pendientes
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-[#FEFCE8] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-bold text-[#854D0E]">En Curso</CardDescription>
                <Activity className="h-8 w-8 text-[#EAB308]" />
              </div>
              <CardTitle className="text-4xl font-bold text-[#854D0E]">{stats.enCurso}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-white/80 text-[#EAB308] border-[#EAB308]/20 font-bold uppercase text-[10px]">
                Ejecutándose
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-[#ECFDF5] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-bold text-[#065F46]">Completadas</CardDescription>
                <CheckCircle className="h-8 w-8 text-[#10B981]" />
              </div>
              <CardTitle className="text-4xl font-bold text-[#065F46]">{stats.completadas}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-white/80 text-[#10B981] border-[#10B981]/20 font-bold uppercase text-[10px]">
                Finalizadas
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl shadow-sm border-[#E5E7EB] overflow-hidden">
          <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
            <CardTitle className="text-lg text-[#1E3A8A]">Proceso de Planificación</CardTitle>
            <CardDescription>Pasos clave según la norma ISO 9001:2015 (Cláusula 9.2)</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-start gap-3 p-4 bg-[#EFF6FF] rounded-xl border border-[#DBEAFE]">
                <div className="h-8 w-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <span className="font-bold text-[#1E3A8A] block mb-1">Definir Objetivos</span>
                  <span className="text-[#6B7280]">Establecer alcance y criterios claros.</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-[#ECFDF5] rounded-xl border border-[#D1FAE5]">
                <div className="h-8 w-8 rounded-lg bg-[#10B981] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <span className="font-bold text-[#065F46] block mb-1">Asignar Recursos</span>
                  <span className="text-[#6B7280]">Seleccionar auditor líder y equipo.</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-[#FFF7ED] rounded-xl border border-[#FBBF24]/20">
                <div className="h-8 w-8 rounded-lg bg-[#F97316] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <span className="font-bold text-[#9A3412] block mb-1">Programar Fechas</span>
                  <span className="text-[#6B7280]">Definir cronograma y seguimiento.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
              <Input
                placeholder="Buscar por código, nombre u objetivo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 py-6 rounded-xl border-[#E5E7EB]"
              />
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                <SelectItem value="interna">Interna</SelectItem>
                <SelectItem value="externa">Externa</SelectItem>
                <SelectItem value="certificacion">Certificación</SelectItem>
                <SelectItem value="seguimiento">Seguimiento</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="planificada">Planificada</SelectItem>
                <SelectItem value="en_curso">En Curso</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
          <div className="p-6 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1E3A8A]">Programa de Auditorías</h2>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={cargarAuditorias}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Badge variant="outline" className="bg-white border-[#E5E7EB] text-[#6B7280]">
                {auditoriasFiltradas.length} resultados
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F8FAFC]">
                <TableRow>
                  <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Código</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Nombre / Objetivo</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Tipo</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Estado</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Auditor Líder</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-[#1E3A8A]">Fecha Planificada</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-[#1E3A8A] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditoriasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-20 text-[#6B7280]">
                      <div className="flex flex-col items-center">
                        <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No hay auditorías programadas</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  auditoriasFiltradas.map((auditoria) => (
                    <TableRow key={auditoria.id} className="hover:bg-[#F5F3FF] transition-colors">
                      <TableCell className="px-6 py-4 font-mono font-bold">{auditoria.codigo}</TableCell>
                      <TableCell className="px-6 py-4">
                        <p className="font-bold">{auditoria.nombre || 'Sin nombre'}</p>
                        <p className="text-sm text-[#6B7280] line-clamp-1">{auditoria.objetivo || 'Sin objetivo'}</p>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="outline" className="capitalize">
                          {auditoria.tipo?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">{getEstadoBadge(auditoria.estado)}</TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-[#E0EDFF] flex items-center justify-center text-[#2563EB] text-xs font-bold">
                            {getNombreUsuario(auditoria.auditorLiderId).charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{getNombreUsuario(auditoria.auditorLiderId)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-[#6B7280]">
                        {new Date(auditoria.fechaPlanificada).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => abrirModalEditar(auditoria)} className="rounded-xl">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setDeleteDialog({ open: true, id: auditoria.id })} className="rounded-xl">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
                        <SelectItem key={usuario.id} value={usuario.id}>
                          {usuario.nombre} {usuario.primerApellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              <DialogFooter className="gap-4">
                <Button variant="outline" type="button" onClick={() => setMostrarModal(false)} className="rounded-xl">
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-bold">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      {auditoriaEditando ? 'Actualizar' : 'Crear'} Auditoría
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, id: null })}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-[#EF4444]" />
                ¿Eliminar auditoría?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción es permanente y no se podrá deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={eliminarAuditoria} className="bg-[#EF4444] hover:bg-[#DC2626] rounded-xl">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div >
    </div >
  );
}