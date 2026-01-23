import { useEffect, useState } from "react";
import {
  AlertTriangle, Plus, Users, UserCheck, UserX, AlertCircle,
  Edit, Eye, Trash2, X, Save, Building2, Hash, FileText, Calendar
} from "lucide-react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Area {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  creado_en: string;
  actualizado_en: string;
}

const API_URL = "http://localhost:8000/api/v1";

export default function AreasResponsables() {
  const [areas, setAreas] = useState<Area[]>([]);
  // ... (rest of state variables are the same)
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
        alert("Código y nombre son obligatorios");
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
      alert(dialogMode === 'create' ? 'Área creada con éxito!' : 'Área actualizada!');
    } catch (error: any) {
      alert(error.message || "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (area: Area) => {
    if (!confirm(`¿Eliminar permanentemente "${area.nombre}"?`)) return;

    try {
      const token = getAuthToken();
      if (!token) throw new Error("No hay sesión activa");

      const response = await fetch(`${API_URL}/areas/${area.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al eliminar');

      await fetchAreas();
      alert('Área eliminada');
    } catch (error: any) {
      alert(error.message || "Error al eliminar");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-lg font-medium text-indigo-700">Cargando áreas...</p>
        </div>
      </div>
    );
  }

  const total = areas.length;
  const asignadas = 0;
  const sinAsignar = total;
  const conIncidencias = 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Premium */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <Building2 className="h-10 w-10 text-indigo-600" />
                Gestión de Áreas Responsables
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Administra todas las áreas de tu sistema de calidad ISO 9001
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 font-semibold">
                  {total} {total === 1 ? "área activa" : "áreas activas"}
                </Badge>
              </div>
            </div>
            <Button
              size="lg"
              onClick={handleCreate}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nueva Área
            </Button>
          </div>
        </div>

        {/* Error Card */}
        {error && (
          <Card className="border-red-200 bg-red-50/80 backdrop-blur">
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

        {/* Stats Cards con colores vivos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white/90">Total Áreas</CardTitle>
                <Users className="h-8 w-8 text-white/80" />
              </div>
              <div className="text-4xl font-bold mt-2">{total}</div>
              <p className="text-blue-100 text-sm mt-1">Registradas en el sistema</p>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white/90">Asignadas</CardTitle>
                <UserCheck className="h-8 w-8 text-white/80" />
              </div>
              <div className="text-4xl font-bold mt-2">{asignadas}</div>
              <p className="text-green-100 text-sm mt-1">Con responsables</p>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white/90">Sin Asignar</CardTitle>
                <UserX className="h-8 w-8 text-white/80" />
              </div>
              <div className="text-4xl font-bold mt-2">{sinAsignar}</div>
              <p className="text-amber-100 text-sm mt-1">Pendientes</p>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500 to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white/90">Incidencias</CardTitle>
                <AlertTriangle className="h-8 w-8 text-white/80" />
              </div>
              <div className="text-4xl font-bold mt-2">{conIncidencias}</div>
              <p className="text-rose-100 text-sm mt-1">Requieren atención</p>
            </CardHeader>
          </Card>
        </div>

        {/* Lista de Áreas */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Hash className="h-7 w-7" />
              Listado Completo de Áreas
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Haz clic en los botones para ver, editar o eliminar
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left p-6 text-sm font-bold text-gray-700 uppercase tracking-wider">Código</th>
                    <th className="text-left p-6 text-sm font-bold text-gray-700 uppercase tracking-wider">Nombre del Área</th>
                    <th className="text-left p-6 text-sm font-bold text-gray-700 uppercase tracking-wider">Descripción</th>
                    <th className="text-left p-6 text-sm font-bold text-gray-700 uppercase tracking-wider">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Creado
                    </th>
                    <th className="text-right p-6 text-sm font-bold text-gray-700 uppercase tracking-wider pr-10">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {areas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-gray-400">
                        <div className="flex flex-col items-center">
                          <Building2 className="h-16 w-16 text-gray-300 mb-4" />
                          <p className="text-lg">No hay áreas registradas aún</p>
                          <Button onClick={handleCreate} className="mt-4" variant="outline">
                            <Plus className="mr-2 h-4 w-4" /> Crear la primera área
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    areas.map((area) => (
                      <tr key={area.id} className="hover:bg-indigo-50/50 transition-colors duration-200">
                        <td className="p-6">
                          <Badge className="bg-indigo-100 text-indigo-700 font-bold text-lg">
                            {area.codigo}
                          </Badge>
                        </td>
                        <td className="p-6 font-semibold text-gray-800 text-lg">{area.nombre}</td>
                        <td className="p-6 text-gray-600 max-w-md">
                          {area.descripcion || <span className="italic text-gray-400">Sin descripción</span>}
                        </td>
                        <td className="p-6 text-sm text-gray-500">
                          {new Date(area.creado_en).toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="p-6">
                          <div className="flex items-center justify-end gap-3">
                            <Button size="sm" variant="outline" onClick={() => handleView(area)}
                              className="hover:bg-blue-50 hover:border-blue-400">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(area)}
                              className="hover:bg-emerald-50 hover:border-emerald-400">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(area)}
                              className="text-red-600 hover:bg-red-50 hover:border-red-400">
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

      {/* Dialog Mejorado */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-lg border-2 border-indigo-100">
          <DialogHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl -m-6 p-6 mb-6">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              {dialogMode === 'create' && <><Plus className="h-7 w-7" /> Nueva Área</>}
              {dialogMode === 'edit' && <><Edit className="h-7 w-7" /> Editar Área</>}
              {dialogMode === 'view' && <><Eye className="h-7 w-7" /> Detalles del Área</>}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="codigo" className="text-lg font-semibold flex items-center gap-2">
                  <Hash className="h-5 w-5 text-indigo-600" /> Código *
                </Label>
                <Input
                  id="codigo"
                  value={dialogMode === 'view' ? selectedArea?.codigo ?? '' : formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  placeholder="EJ: CAL, RRHH, SIS"
                  disabled={dialogMode === 'view'}
                  className="mt-2 text-lg font-mono"
                />
              </div>
              <div>
                <Label htmlFor="nombre" className="text-lg font-semibold">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  value={dialogMode === 'view' ? selectedArea?.nombre ?? '' : formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Gestión de Calidad"
                  disabled={dialogMode === 'view'}
                  className="mt-2 text-lg"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="descripcion" className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" /> Descripción
              </Label>
              <Textarea
                id="descripcion"
                value={dialogMode === 'view' ? selectedArea?.descripcion ?? '' : formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe las funciones y responsabilidades de esta área..."
                rows={4}
                disabled={dialogMode === 'view'}
                className="mt-2"
              />
            </div>

            {dialogMode === 'view' && selectedArea && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 border">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Creado:</span>
                  <span className="font-mono">{new Date(selectedArea.creado_en).toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Última actualización:</span>
                  <span className="font-mono">{new Date(selectedArea.actualizado_en).toLocaleString('es-CO')}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" size="lg" onClick={() => setShowDialog(false)} className="px-8">
              <X className="mr-2 h-5 w-5" /> {dialogMode === 'view' ? 'Cerrar' : 'Cancelar'}
            </Button>
            {dialogMode !== 'view' && (
              <Button
                size="lg"
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-10 font-bold"
              >
                {saving ? (
                  <>Guardando...</>
                ) : (
                  <><Save className="mr-2 h-5 w-5" /> Guardar Área</>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}