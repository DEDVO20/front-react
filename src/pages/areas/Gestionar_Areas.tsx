import { useEffect, useState } from "react";
import {
  AlertTriangle, Plus, Users, UserCheck, UserX, AlertCircle,
  Eye, Trash2, Save, Building2, Hash, FileText, Calendar, Search, Edit
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Area {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  creado_en: string;
  actualizado_en: string;
}

const API_URL = "/api/v1";

export default function AreasResponsables() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: ''
  });
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; area: Area | null }>({
    open: false,
    area: null,
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  const getAuthToken = () => localStorage.getItem("token");

  const fetchAreas = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) throw new Error("No hay sesión activa. Por favor, inicia sesión.");

      const response = await fetch(`${API_URL}/areas`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada.");
        throw new Error(`Error: ${response.status}`);
      }

      const data: Area[] = await response.json();
      setAreas(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setDialogMode('create');
    setFormData({ codigo: '', nombre: '', descripcion: '' });
    setSelectedArea(null);
    setShowDialog(true);
  };

  const handleEdit = (area: Area) => {
    setDialogMode('edit');
    setFormData({
      codigo: area.codigo,
      nombre: area.nombre,
      descripcion: area.descripcion || ''
    });
    setSelectedArea(area);
    setShowDialog(true);
  };

  const handleView = (area: Area) => {
    setDialogMode('view');
    setSelectedArea(area);
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = getAuthToken();
      if (!token) throw new Error("No hay sesión activa");
      if (!formData.codigo.trim() || !formData.nombre.trim()) {
        toast.error("Código y nombre son obligatorios");
        return;
      }

      const url = dialogMode === 'create' ? `${API_URL}/areas` : `${API_URL}/areas/${selectedArea?.id}`;
      const method = dialogMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Error al guardar');
      }

      await fetchAreas();
      setShowDialog(false);
      toast.success(dialogMode === 'create' ? 'Área creada con éxito!' : 'Área actualizada con éxito!');
    } catch (error: any) {
      toast.error(error.message || "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (area: Area) => {
    setDeleteDialog({ open: true, area });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, area: null });
  };

  const handleDelete = async () => {
    const area = deleteDialog.area;
    if (!area) return;

    try {
      const token = getAuthToken();
      if (!token) throw new Error("No hay sesión activa");

      const response = await fetch(`${API_URL}/areas/${area.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al eliminar');

      await fetchAreas();
      toast.success('Área eliminada correctamente');
      closeDeleteDialog();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar");
    }
  };

  const filteredAreas = areas.filter(
    (a) =>
      a.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-lg font-medium text-gray-700">Cargando áreas...</p>
        </div>
      </div>
    );
  }

  const total = areas.length;
  const asignadas = 0; // Placeholder – puedes conectar con asignaciones reales más adelante
  const sinAsignar = total - asignadas;
  const conIncidencias = 0;
  const coveragePercentage = total === 0 ? 0 : Math.round((asignadas / total) * 100);

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <TooltipProvider>
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header Profesional */}
          <div className="bg-gradient-to-br from-[#E0EDFF] to-[#C7D2FE] rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
                  <Building2 className="h-9 w-9 text-[#2563EB]" />
                  Gestión de Áreas Responsables
                </h1>
                <p className="text-[#6B7280] mt-2 text-lg">
                  Administra todas las áreas de tu sistema de calidad ISO 9001
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Badge className="bg-white text-[#2563EB] border border-[#E5E7EB]">
                    {total} {total === 1 ? "área activa" : "áreas activas"}
                  </Badge>
                  {sinAsignar > 0 && (
                    <Badge className="bg-[#FFF7ED] text-[#F59E0B] border border-[#F59E0B]/30">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {sinAsignar} sin responsable
                    </Badge>
                  )}
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    onClick={handleCreate}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium shadow-sm"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Nueva Área
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Crear una nueva área responsable</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Error Card */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-red-700">
                  <AlertCircle className="h-6 w-6" />
                  <div>
                    <p className="font-semibold">Error de conexión</p>
                    <p className="text-sm">{error}</p>
                    <button onClick={fetchAreas} className="text-sm font-medium underline mt-1">
                      Reintentar conexión
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tarjetas de métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[#E0EDFF] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#1E3A8A]">Total Áreas</CardTitle>
                  <Users className="h-8 w-8 text-[#2563EB]" />
                </div>
                <div className="text-4xl font-bold text-[#1E3A8A] mt-4">{total}</div>
                <p className="text-[#6B7280] text-sm mt-1">Registradas en el sistema</p>
              </CardHeader>
            </Card>

            <Card className="bg-[#ECFDF5] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#1E3A8A]">Asignadas</CardTitle>
                  <UserCheck className="h-8 w-8 text-[#22C55E]" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-4xl font-bold text-[#1E3A8A] mb-2">{asignadas}</div>
                <p className="text-sm text-[#6B7280] mb-3">Con responsables asignados</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Cobertura</span>
                    <span className="font-semibold text-[#22C55E]">{coveragePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-[#22C55E] h-3 rounded-full transition-all duration-700"
                      style={{ width: `${coveragePercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#FFF7ED] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#1E3A8A]">Sin Asignar</CardTitle>
                  <UserX className="h-8 w-8 text-[#F59E0B]" />
                </div>
                <div className="text-4xl font-bold text-[#1E3A8A] mt-4">{sinAsignar}</div>
                <p className="text-[#6B7280] text-sm mt-1">Pendientes de responsable</p>
              </CardHeader>
            </Card>

            <Card className="bg-[#FEF2F2] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#1E3A8A]">Incidencias</CardTitle>
                  <AlertTriangle className="h-8 w-8 text-[#EF4444]" />
                </div>
                <div className="text-4xl font-bold text-[#1E3A8A] mt-4">{conIncidencias}</div>
                <p className="text-[#6B7280] text-sm mt-1">Requieren atención inmediata</p>
              </CardHeader>
            </Card>
          </div>

          {/* Tabla de Áreas */}
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-[#F1F5F9]">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl text-[#1E3A8A] flex items-center gap-3">
                    <Hash className="h-7 w-7" />
                    Listado Completo de Áreas
                  </CardTitle>
                  <CardDescription className="text-[#6B7280]">
                    Busca, visualiza, edita o elimina áreas
                  </CardDescription>
                </div>
                <div className="w-full md:w-96">
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-5 w-5 text-[#6B7280]" />
                    <Input
                      placeholder="Buscar por código, nombre o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F1F5F9] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="text-left p-6 text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider">Código</th>
                      <th className="text-left p-6 text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider">Nombre del Área</th>
                      <th className="text-left p-6 text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider">Descripción</th>
                      <th className="text-left p-6 text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider">
                        <Calendar className="inline h-4 w-4 mr-1" /> Creado
                      </th>
                      <th className="text-right p-6 text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider pr-10">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#E5E7EB]">
                    {filteredAreas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-20 text-[#6B7280]">
                          <div className="flex flex-col items-center">
                            <Building2 className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-xl font-medium">
                              {searchTerm ? "No se encontraron resultados" : "No hay áreas registradas aún"}
                            </p>
                            {!searchTerm && (
                              <Button onClick={handleCreate} variant="outline" className="mt-6">
                                <Plus className="mr-2 h-5 w-5" /> Crear la primera área
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAreas.map((area) => (
                        <tr key={area.id} className="hover:bg-[#EFF6FF] transition-colors">
                          <td className="p-6">
                            <Badge className="bg-[#E0EDFF] text-[#2563EB] font-bold">
                              {area.codigo}
                            </Badge>
                          </td>
                          <td className="p-6 font-medium text-gray-900">{area.nombre}</td>
                          <td className="p-6 text-[#6B7280] max-w-md">
                            {area.descripcion || <span className="italic text-gray-400">Sin descripción</span>}
                          </td>
                          <td className="p-6 text-sm text-[#6B7280]">
                            {new Date(area.creado_en).toLocaleDateString('es-CO', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="p-6">
                            <div className="flex items-center justify-end gap-3">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" variant="ghost" onClick={() => handleView(area)}>
                                    <Eye className="h-4 w-4 text-[#2563EB]" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Ver detalles</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" variant="ghost" onClick={() => handleEdit(area)}>
                                    <Edit className="h-4 w-4 text-[#4B5563]" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Editar área</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" variant="ghost" onClick={() => openDeleteDialog(area)}>
                                    <Trash2 className="h-4 w-4 text-[#EF4444]" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Eliminar área</p></TooltipContent>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>

      {/* Dialog de Crear/Editar/Ver */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#1E3A8A] flex items-center gap-3">
              {dialogMode === 'create' && <><Plus className="h-7 w-7 text-[#2563EB]" /> Nueva Área</>}
              {dialogMode === 'edit' && <><Edit className="h-7 w-7 text-[#2563EB]" /> Editar Área</>}
              {dialogMode === 'view' && <><Eye className="h-7 w-7 text-[#2563EB]" /> Detalles del Área</>}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {dialogMode === 'view' && selectedArea ? (
              <>
                <div className="bg-[#E0EDFF] rounded-xl p-6 border border-[#E5E7EB]">
                  <h3 className="font-semibold text-[#1E3A8A] mb-3">Información Principal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-[#6B7280] mb-1">Código</p>
                      <Badge className="text-lg px-4 py-2 bg-[#2563EB]/10 text-[#2563EB]">
                        {selectedArea.codigo}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-[#6B7280] mb-1">Nombre</p>
                      <p className="text-xl font-bold text-gray-900">{selectedArea.nombre}</p>
                    </div>
                  </div>
                </div>

                {selectedArea.descripcion && (
                  <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                    <h3 className="font-semibold text-[#1E3A8A] mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5" /> Descripción
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{selectedArea.descripcion}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-5 border border-[#E5E7EB]">
                    <p className="text-sm text-[#6B7280] mb-1">Fecha de Creación</p>
                    <p className="text-lg font-medium">
                      {new Date(selectedArea.creado_en).toLocaleDateString('es-CO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-[#E5E7EB]">
                    <p className="text-sm text-[#6B7280] mb-1">Última Actualización</p>
                    <p className="text-lg font-medium">
                      {new Date(selectedArea.actualizado_en).toLocaleDateString('es-CO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="codigo" className="text-base font-medium">
                      <Hash className="inline h-4 w-4 mr-1 text-[#2563EB]" /> Código *
                    </Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                      placeholder="EJ: CAL, RRHH, SIS"
                      disabled={dialogMode === 'view'}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nombre" className="text-base font-medium">Nombre Completo *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Gestión de Calidad"
                      disabled={dialogMode === 'view'}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descripcion" className="text-base font-medium">
                    <FileText className="inline h-4 w-4 mr-1 text-[#2563EB]" /> Descripción
                  </Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Describe las funciones y responsabilidades de esta área..."
                    rows={5}
                    disabled={dialogMode === 'view'}
                    className="mt-2"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {dialogMode === 'view' ? 'Cerrar' : 'Cancelar'}
            </Button>
            {dialogMode !== 'view' && (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              >
                {saving ? 'Guardando...' : <><Save className="mr-2 h-5 w-5" /> Guardar Área</>}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Eliminación */}
      <AlertDialog open={deleteDialog.open} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta área?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.area && (
                <>Se eliminará permanentemente el área <strong>{deleteDialog.area.nombre}</strong> (código: <strong>{deleteDialog.area.codigo}</strong>). Esta acción no se puede deshacer.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#EF4444] hover:bg-red-700">
              Eliminar Área
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}