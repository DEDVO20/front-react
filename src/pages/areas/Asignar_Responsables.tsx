import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import {
  UserPlus,
  Users,
  Building2,
  AlertCircle,
  Eye,
  Trash2,
  X,
  Save,
  Search,
  UserCheck,
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
  DialogDescription,
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

interface Area {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
}

interface Usuario {
  id: string;
  nombre: string;
  email: string;
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



  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [asignacionesRes, areasRes, usuariosRes] = await Promise.all([
        apiClient.get("/asignaciones"),
        apiClient.get("/areas"),
        apiClient.get("/usuarios"),
      ]);

      const [asignacionesData, areasData, usuariosData] = [
        asignacionesRes.data,
        areasRes.data,
        usuariosRes.data,
      ];

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
      const [areasRes, usuariosRes] = await Promise.all([
        apiClient.get("/areas"),
        apiClient.get("/usuarios"),
      ]);

      const [areasData, usuariosData] = [
        areasRes.data,
        usuariosRes.data
      ];
      setAreas(areasData);
      setUsuarios(usuariosData);
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
      if (!formData.area_id || !formData.usuario_id) {
        toast.error("Selecciona un área y un usuario");
        return;
      }

      await apiClient.post("/asignaciones", formData);

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
      await apiClient.delete(`/asignaciones/${asignacion.id}`);

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
          <p className="mt-4 text-lg font-semibold text-teal-700">Cargando asignaciones...</p>
        </div>
      </div>
    );
  }

  const totalAsignaciones = asignaciones.length;
  const areasConResponsable = new Set(asignaciones.map((a) => a.area_id)).size;
  const areasSinResponsable = areas.length - areasConResponsable;
  const responsablesPrincipales = asignaciones.filter((a) => a.es_principal).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Premium */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/60 p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
                <UserPlus className="h-10 w-10 text-teal-600" />
                Asignación de Responsables
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Vincula usuarios a áreas del sistema de gestión de calidad
              </p>
              <div className="flex items-center gap-3 mt-4">
                <Badge className="bg-teal-100 text-teal-700 text-lg font-bold px-4 py-2">
                  {totalAsignaciones} asignaciones activas
                </Badge>
                {responsablesPrincipales > 0 && (
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold">
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    {responsablesPrincipales} principales
                  </Badge>
                )}
              </div>
            </div>
            <Button
              size="lg"
              onClick={handleCreate}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <UserPlus className="mr-2 h-6 w-6" />
              Nueva Asignación
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <p className="font-bold">Error de conexión</p>
                  <p className="text-sm">{error}</p>
                  <button onClick={fetchData} className="text-sm font-bold underline mt-1">
                    Reintentar
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards con colores vibrantes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white/90 text-lg">Total Asignaciones</CardTitle>
                <Users className="h-9 w-9 text-white/80" />
              </div>
              <div className="text-5xl font-extrabold mt-3">{totalAsignaciones}</div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white/90 text-lg">Áreas Cubiertas</CardTitle>
                <Building2 className="h-9 w-9 text-white/80" />
              </div>
              <div className="text-5xl font-extrabold mt-3">{areasConResponsable}</div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white/90 text-lg">Sin Responsable</CardTitle>
                <AlertCircle className="h-9 w-9 text-white/80" />
              </div>
              <div className="text-5xl font-extrabold mt-3">{areasSinResponsable}</div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white/90 text-lg">Principales</CardTitle>
                <ShieldCheck className="h-9 w-9 text-white/80" />
              </div>
              <div className="text-5xl font-extrabold mt-3">{responsablesPrincipales}</div>
            </CardHeader>
          </Card>
        </div>

        {/* Tabla de Asignaciones */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Hash className="h-7 w-7" />
                  Asignaciones Actuales
                </CardTitle>
                <CardDescription className="text-teal-100 text-base">
                  Busca y administra responsables por área
                </CardDescription>
              </div>
              <div className="w-full md:w-96">
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Buscar área, código o usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/50"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left p-6 text-sm font-bold text-gray-700 uppercase tracking-wider">Código</th>
                    <th className="text-left p-6 text-sm font-bold text-gray-700 uppercase tracking-wider">Área</th>
                    <th className="text-left p-6 text-sm font-bold text-gray-700 uppercase tracking-wider">Responsable</th>
                    <th className="text-left p-6 text-sm font-bold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="text-left p-6 text-sm font-bold text-gray-700 uppercase tracking-wider">Tipo</th>
                    <th className="text-left p-6 text-sm font-bold text-gray-700 uppercase tracking-wider">
                      <Calendar className="inline h-4 w-4 mr-1" /> Fecha
                    </th>
                    <th className="text-right p-6 text-sm font-bold text-gray-700 uppercase tracking-wider pr-10">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredAsignaciones.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-20 text-gray-400">
                        <div className="flex flex-col items-center">
                          <UserPlus className="h-16 w-16 text-gray-300 mb-4" />
                          <p className="text-xl font-medium">
                            {searchTerm ? "No se encontraron resultados" : "Aún no hay asignaciones"}
                          </p>
                          {!searchTerm && (
                            <Button onClick={handleCreate} className="mt-6" size="lg">
                              <UserPlus className="mr-2 h-5 w-5" /> Hacer primera asignación
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAsignaciones.map((asignacion) => (
                      <tr key={asignacion.id} className="hover:bg-teal-50/50 transition-all duration-200">
                        <td className="p-6">
                          <Badge className="bg-teal-100 text-teal-700 font-bold text-lg">
                            {asignacion.area.codigo}
                          </Badge>
                        </td>
                        <td className="p-6 font-semibold text-gray-800 text-lg">
                          {asignacion.area.nombre}
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                              {asignacion.usuario.nombre.charAt(0)}
                            </div>
                            <span className="font-medium">{asignacion.usuario.nombre}</span>
                          </div>
                        </td>
                        <td className="p-6 text-gray-600">{asignacion.usuario.email}</td>
                        <td className="p-6">
                          {asignacion.es_principal ? (
                            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold">
                              <ShieldCheck className="h-4 w-4 mr-1" /> Principal
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                              Apoyo
                            </Badge>
                          )}
                        </td>
                        <td className="p-6 text-sm text-gray-500">
                          {new Date(asignacion.creado_en).toLocaleDateString("es-CO", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-6">
                          <div className="flex items-center justify-end gap-3">
                            <Button size="sm" variant="outline" onClick={() => handleView(asignacion)}
                              className="hover:bg-cyan-50 hover:border-cyan-400">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => openDeleteDialog(asignacion)}
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

      {/* Diálogo de Crear/Ver */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-lg border-2 border-teal-100">
          <DialogHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-t-xl -m-6 p-6 mb-6">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              {dialogMode === "create" ? (
                <>Nueva Asignación</>
              ) : (
                <>Detalles de Asignación</>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {dialogMode === "create" ? (
              <>
                <div>
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    Área a Asignar *
                  </Label>
                  <Select value={formData.area_id} onValueChange={(v) => setFormData({ ...formData, area_id: v })}>
                    <SelectTrigger className="mt-2 text-lg">
                      <SelectValue placeholder="Selecciona un área" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>[{area.codigo}] {area.nombre}</span>
                            {asignaciones.some((a) => a.area_id === area.id) && (
                              <Badge variant="secondary" className="ml-2">Ya asignado</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    Responsable *
                  </Label>
                  <Select value={formData.usuario_id} onValueChange={(v) => setFormData({ ...formData, usuario_id: v })}>
                    <SelectTrigger className="mt-2 text-lg">
                      <SelectValue placeholder="Selecciona un usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.nombre} — {u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-teal-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="principal"
                    checked={formData.es_principal}
                    onChange={(e) => setFormData({ ...formData, es_principal: e.target.checked })}
                    className="h-5 w-5 rounded border-teal-300 text-teal-600 focus:ring-teal-500"
                  />
                  <Label htmlFor="principal" className="cursor-pointer text-lg font-medium">
                    Marcar como Responsable Principal
                  </Label>
                </div>
              </>
            ) : selectedAsignacion && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border-2 border-teal-200">
                  <h3 className="font-bold text-xl text-teal-800 mb-4">Área Asignada</h3>
                  <p className="text-2xl font-bold text-teal-900">[{selectedAsignacion.area.codigo}] {selectedAsignacion.area.nombre}</p>
                  {selectedAsignacion.area.descripcion && (
                    <p className="text-gray-700 mt-2">{selectedAsignacion.area.descripcion}</p>
                  )}
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
                  <h3 className="font-bold text-xl text-emerald-800 mb-4">Responsable</h3>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                      {selectedAsignacion.usuario.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{selectedAsignacion.usuario.nombre}</p>
                      <p className="text-gray-600">{selectedAsignacion.usuario.email}</p>
                      <p className="text-sm text-gray-500">Rol: {selectedAsignacion.usuario.rol}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  {selectedAsignacion.es_principal ? (
                    <Badge className="text-lg px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                      Responsable Principal
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-lg px-6 py-3">Responsable de Apoyo</Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3 mt-6">
            <Button variant="outline" size="lg" onClick={() => setShowDialog(false)}>
              <X className="mr-2 h-5 w-5" /> {dialogMode === "view" ? "Cerrar" : "Cancelar"}
            </Button>
            {dialogMode === "create" && (
              <Button
                size="lg"
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 font-bold px-10"
              >
                {saving ? "Asignando..." : "Asignar Responsable"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* AlertDialog de Eliminación */}
      <AlertDialog open={deleteDialog.open} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">¿Eliminar esta asignación?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {deleteDialog.asignacion && (
                <>Se eliminará la asignación de <strong>{deleteDialog.asignacion.usuario.nombre}</strong> al área <strong>{deleteDialog.asignacion.area.nombre}</strong>. Esta acción no se puede deshacer.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar Asignación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}