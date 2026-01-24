import { useEffect, useState } from "react";
import {
  UserPlus,
  Users,
  Building2,
  AlertCircle,
  Eye,
  Trash2,
  Save,
  Search,
  ShieldCheck,
  Calendar,
  Hash,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
}

interface Usuario {
  id: string;
  nombre: string;
  correo_electronico: string;
  rol: string;
}

interface Asignacion {
  id: string;
  area_id: string;
  usuario_id: string;
  area: Area;
  usuario: Usuario;
  es_principal: boolean;
  creado_en: string;
}

const API_URL = "/api/v1";

export default function AsignarResponsables() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "view">("create");
  const [selectedAsignacion, setSelectedAsignacion] = useState<Asignacion | null>(null);
  const [formData, setFormData] = useState({
    area_id: "",
    usuario_id: "",
    es_principal: false,
  });
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    asignacion: Asignacion | null;
  }>({ open: false, asignacion: null });

  useEffect(() => {
    fetchData();
  }, []);

  const getAuthToken = () => localStorage.getItem("token");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) throw new Error("No hay sesión activa");

      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      const [asignacionesRes, areasRes, usuariosRes] = await Promise.all([
        fetch(`${API_URL}/asignaciones`, { headers }),
        fetch(`${API_URL}/areas`, { headers }),
        fetch(`${API_URL}/usuarios`, { headers }),
      ]);

      if (!asignacionesRes.ok || !areasRes.ok || !usuariosRes.ok) {
        throw new Error("Error al cargar datos");
      }

      const [asignacionesData, areasData, usuariosData] = await Promise.all([
        asignacionesRes.json(),
        areasRes.json(),
        usuariosRes.json(),
      ]);

      setAsignaciones(asignacionesData);
      setAreas(areasData);
      setUsuarios(usuariosData);
    } catch (error: any) {
      setError(error.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setDialogMode("create");
    setFormData({ area_id: "", usuario_id: "", es_principal: false });
    setSelectedAsignacion(null);

    try {
      const token = getAuthToken();
      if (!token) return alert("Sesión no válida");

      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const [areasRes, usuariosRes] = await Promise.all([
        fetch(`${API_URL}/areas`, { headers }),
        fetch(`${API_URL}/usuarios`, { headers }),
      ]);

      if (areasRes.ok && usuariosRes.ok) {
        const [areasData, usuariosData] = await Promise.all([
          areasRes.json(),
          usuariosRes.json(),
        ]);
        setAreas(areasData);
        setUsuarios(usuariosData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setShowDialog(true);
    }
  };

  const handleView = (asignacion: Asignacion) => {
    setDialogMode("view");
    setSelectedAsignacion(asignacion);
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = getAuthToken();
      if (!token) throw new Error("No hay sesión activa");
      if (!formData.area_id || !formData.usuario_id) {
        toast.error("Selecciona un área y un usuario");
        return;
      }

      const response = await fetch(`${API_URL}/asignaciones`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Error al asignar");
      }

      await fetchData();
      setShowDialog(false);
      toast.success("Responsable asignado con éxito!");
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (asignacion: Asignacion) => {
    setDeleteDialog({ open: true, asignacion });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, asignacion: null });
  };

  const handleDelete = async () => {
    const asignacion = deleteDialog.asignacion;
    if (!asignacion) return;

    try {
      const token = getAuthToken();
      if (!token) throw new Error("No hay sesión");

      const response = await fetch(`${API_URL}/asignaciones/${asignacion.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al eliminar");

      await fetchData();
      toast.success("Asignación eliminada");
      closeDeleteDialog();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar");
    }
  };

  const filteredAsignaciones = asignaciones.filter(
    (a) =>
      a.area.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.area.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-lg font-medium text-gray-700">Cargando asignaciones...</p>
        </div>
      </div>
    );
  }

  const totalAsignaciones = asignaciones.length;
  const areasConResponsable = new Set(asignaciones.map((a) => a.area_id)).size;
  const areasSinResponsable = areas.length - areasConResponsable;
  const responsablesPrincipales = asignaciones.filter((a) => a.es_principal).length;
  const coveragePercentage = areas.length === 0 ? 0 : Math.round((areasConResponsable / areas.length) * 100);

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <TooltipProvider>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Profesional */}
          <div className="bg-gradient-to-br from-[#E0EDFF] to-[#C7D2FE] rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
                  <UserPlus className="h-9 w-9 text-[#2563EB]" />
                  Asignación de Responsables
                </h1>
                <p className="text-[#6B7280] mt-2 text-lg">
                  Vincula usuarios a áreas del sistema de gestión de calidad
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Badge className="bg-white text-[#2563EB] border border-[#E5E7EB]">
                    {totalAsignaciones} asignaciones activas
                  </Badge>
                  {responsablesPrincipales > 0 && (
                    <Badge className="bg-[#ECFDF5] text-[#22C55E]">
                      <ShieldCheck className="h-4 w-4 mr-1" />
                      {responsablesPrincipales} principales
                    </Badge>
                  )}
                  {areasSinResponsable > 0 && (
                    <Badge className="bg-[#FFF7ED] text-[#F59E0B] border border-[#F59E0B]/30">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {areasSinResponsable} sin responsable
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
                    <UserPlus className="mr-2 h-5 w-5" />
                    Nueva Asignación
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Crear nueva asignación de responsable</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-red-700">
                  <AlertCircle className="h-6 w-6" />
                  <div>
                    <p className="font-semibold">Error de conexión</p>
                    <p className="text-sm">{error}</p>
                    <button onClick={fetchData} className="text-sm font-medium underline mt-1">
                      Reintentar
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
                  <CardTitle className="text-[#1E3A8A]">Total Asignaciones</CardTitle>
                  <Users className="h-8 w-8 text-[#2563EB]" />
                </div>
                <div className="text-4xl font-bold text-[#1E3A8A] mt-4">{totalAsignaciones}</div>
              </CardHeader>
            </Card>

            <Card className="bg-[#ECFDF5] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#1E3A8A]">Áreas Cubiertas</CardTitle>
                  <Building2 className="h-8 w-8 text-[#22C55E]" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-4xl font-bold text-[#1E3A8A] mb-2">{areasConResponsable}</div>
                <p className="text-sm text-[#6B7280] mb-3">
                  de {areas.length} áreas totales
                </p>
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
                  <CardTitle className="text-[#1E3A8A]">Sin Responsable</CardTitle>
                  <AlertCircle className="h-8 w-8 text-[#F59E0B]" />
                </div>
                <div className="text-4xl font-bold text-[#1E3A8A] mt-4">{areasSinResponsable}</div>
              </CardHeader>
            </Card>

            <Card className="bg-[#ECFDF5] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#1E3A8A]">Responsables Principales</CardTitle>
                  <ShieldCheck className="h-8 w-8 text-[#22C55E]" />
                </div>
                <div className="text-4xl font-bold text-[#1E3A8A] mt-4">{responsablesPrincipales}</div>
              </CardHeader>
            </Card>
          </div>

          {/* Tabla de Asignaciones */}
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-[#F1F5F9]">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl text-[#1E3A8A] flex items-center gap-3">
                    <Hash className="h-7 w-7" />
                    Asignaciones Actuales
                  </CardTitle>
                  <CardDescription className="text-[#6B7280]">
                    Busca y administra responsables por área
                  </CardDescription>
                </div>
                <div className="w-full md:w-96">
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-5 w-5 text-[#6B7280]" />
                    <Input
                      placeholder="Buscar área, código o usuario..."
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
                      <th className="text-left p-6 text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider">Área</th>
                      <th className="text-left p-6 text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider">Responsable</th>
                      <th className="text-left p-6 text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider">Email</th>
                      <th className="text-left p-6 text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider">Tipo</th>
                      <th className="text-left p-6 text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider">
                        <Calendar className="inline h-4 w-4 mr-1" /> Fecha
                      </th>
                      <th className="text-right p-6 text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider pr-10">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#E5E7EB]">
                    {filteredAsignaciones.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-20 text-[#6B7280]">
                          <div className="flex flex-col items-center">
                            <UserPlus className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-xl font-medium">
                              {searchTerm ? "No se encontraron resultados" : "Aún no hay asignaciones"}
                            </p>
                            {!searchTerm && (
                              <Button onClick={handleCreate} variant="outline" className="mt-6">
                                <UserPlus className="mr-2 h-5 w-5" /> Hacer primera asignación
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAsignaciones.map((asignacion) => (
                        <tr key={asignacion.id} className="hover:bg-[#EFF6FF] transition-colors">
                          <td className="p-6">
                            <Badge className="bg-[#E0EDFF] text-[#2563EB] font-bold">
                              {asignacion.area.codigo}
                            </Badge>
                          </td>
                          <td className="p-6 font-medium text-gray-900">
                            {asignacion.area.nombre}
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold">
                                {asignacion.usuario.nombre.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium">{asignacion.usuario.nombre}</span>
                            </div>
                          </td>
                          <td className="p-6 text-[#6B7280]">{asignacion.usuario.correo_electronico}</td>
                          <td className="p-6">
                            {asignacion.es_principal ? (
                              <Badge className="bg-[#ECFDF5] text-[#22C55E]">
                                <ShieldCheck className="h-4 w-4 mr-1" /> Principal
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Apoyo</Badge>
                            )}
                          </td>
                          <td className="p-6 text-sm text-[#6B7280]">
                            {new Date(asignacion.creado_en).toLocaleDateString("es-CO", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-6">
                            <div className="flex items-center justify-end gap-3">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" variant="ghost" onClick={() => handleView(asignacion)}>
                                    <Eye className="h-4 w-4 text-[#2563EB]" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ver detalles</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" variant="ghost" onClick={() => openDeleteDialog(asignacion)}>
                                    <Trash2 className="h-4 w-4 text-[#EF4444]" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Eliminar asignación</p>
                                </TooltipContent>
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

      {/* Diálogo de Crear/Ver */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#1E3A8A] flex items-center gap-3">
              {dialogMode === "create" ? (
                <><UserPlus className="h-7 w-7 text-[#2563EB]" /> Nueva Asignación</>
              ) : (
                <><Eye className="h-7 w-7 text-[#2563EB]" /> Detalles de Asignación</>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {dialogMode === "create" ? (
              <>
                <div>
                  <Label className="text-base font-medium">Área a Asignar *</Label>
                  <Select value={formData.area_id} onValueChange={(v) => setFormData({ ...formData, area_id: v })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecciona un área" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          [{area.codigo}] {area.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-medium">Responsable *</Label>
                  <Select value={formData.usuario_id} onValueChange={(v) => setFormData({ ...formData, usuario_id: v })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecciona un usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.nombre} — {u.correo_electronico}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-4">
                  <Checkbox
                    id="principal"
                    checked={formData.es_principal}
                    onCheckedChange={(checked) => setFormData({ ...formData, es_principal: !!checked })}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="principal" className="text-base font-medium cursor-pointer">
                      Marcar como Responsable Principal
                    </Label>
                    <p className="text-sm text-[#6B7280]">
                      Otorga permisos adicionales sobre el área
                    </p>
                  </div>
                </div>
              </>
            ) : selectedAsignacion && (
              <div className="space-y-6">
                <div className="bg-[#E0EDFF] rounded-xl p-6 border border-[#E5E7EB]">
                  <h3 className="font-semibold text-[#1E3A8A] mb-2">Área Asignada</h3>
                  <p className="text-xl font-bold text-[#1E3A8A]">[{selectedAsignacion.area.codigo}] {selectedAsignacion.area.nombre}</p>
                  {selectedAsignacion.area.descripcion && (
                    <p className="text-[#6B7280] mt-2">{selectedAsignacion.area.descripcion}</p>
                  )}
                </div>

                <div className="bg-[#ECFDF5] rounded-xl p-6 border border-[#E5E7EB]">
                  <h3 className="font-semibold text-[#1E3A8A] mb-3">Responsable</h3>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xl font-bold">
                      {selectedAsignacion.usuario.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{selectedAsignacion.usuario.nombre}</p>
                      <p className="text-[#6B7280]">{selectedAsignacion.usuario.correo_electronico}</p>
                      <p className="text-sm text-[#6B7280] mt-1">Rol: {selectedAsignacion.usuario.rol}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-[#E5E7EB]">
                  <h3 className="font-semibold text-[#1E3A8A] mb-2">Fecha de Asignación</h3>
                  <p className="text-lg text-[#1E3A8A]">
                    {new Date(selectedAsignacion.creado_en).toLocaleDateString("es-CO", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex justify-center">
                  {selectedAsignacion.es_principal ? (
                    <Badge className="text-base px-6 py-3 bg-[#ECFDF5] text-[#22C55E]">
                      <ShieldCheck className="h-5 w-5 mr-2" /> Responsable Principal
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-base px-6 py-3">
                      Responsable de Apoyo
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {dialogMode === "view" ? "Cerrar" : "Cancelar"}
            </Button>
            {dialogMode === "create" && (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              >
                {saving ? "Asignando..." : <><Save className="mr-2 h-5 w-5" /> Asignar Responsable</>}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Eliminación */}
      <AlertDialog open={deleteDialog.open} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta asignación?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.asignacion && (
                <>Se eliminará la asignación de <strong>{deleteDialog.asignacion.usuario.nombre}</strong> al área <strong>{deleteDialog.asignacion.area.nombre}</strong>. Esta acción no se puede deshacer.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#EF4444] hover:bg-red-700">
              Eliminar Asignación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
