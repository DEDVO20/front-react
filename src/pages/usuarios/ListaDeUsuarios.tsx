import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  RefreshCw,
  Plus,
  FileSpreadsheet,
  UserCheck,
  UserX,
  Building2,
  Mail,
  Users,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Usuario {
  id: string;
  documento: number;
  nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  correo_electronico: string;
  nombre_usuario: string;
  area_id?: string;
  activo: boolean;
  foto_url?: string;
  area?: {
    id: string;
    codigo: string;
    nombre: string;
    descripcion?: string;
  };
  creado_en: string;
  actualizado_en: string;
}

export default function ListaUsuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; usuario: Usuario | null }>({
    open: false,
    usuario: null,
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    filtrarUsuarios();
  }, [searchTerm, filtroEstado, usuarios]);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al obtener usuarios");

      const data = await response.json();
      setUsuarios(Array.isArray(data) ? data : []);
      setTotal(Array.isArray(data) ? data.length : 0);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar la lista de usuarios");
      setUsuarios([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const filtrarUsuarios = () => {
    let resultado = [...usuarios];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(
        (user) =>
          user.nombre.toLowerCase().includes(term) ||
          (user.primer_apellido?.toLowerCase().includes(term)) ||
          user.correo_electronico.toLowerCase().includes(term) ||
          user.nombre_usuario.toLowerCase().includes(term) ||
          user.documento.toString().includes(term) ||
          user.area?.nombre?.toLowerCase().includes(term) ||
          user.area?.codigo?.toLowerCase().includes(term)
      );
    }

    if (filtroEstado === "activos") resultado = resultado.filter((u) => u.activo);
    if (filtroEstado === "inactivos") resultado = resultado.filter((u) => !u.activo);

    setUsuariosFiltrados(resultado);
  };

  const openViewDialog = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setViewDialogOpen(true);
  };

  const openDeleteDialog = (usuario: Usuario) => {
    setDeleteDialog({ open: true, usuario });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, usuario: null });
  };

  const handleEliminar = async () => {
    const usuario = deleteDialog.usuario;
    if (!usuario) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/v1/usuarios/${usuario.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al eliminar usuario");

      toast.success(`Usuario "${usuario.nombre_usuario}" eliminado`);
      await fetchUsuarios();
      closeDeleteDialog();
    } catch (error) {
      toast.error("Error al eliminar el usuario");
    }
  };

  const handleToggleEstado = async (id: string, nuevoEstado: boolean) => {
    // Optimistic update
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: nuevoEstado } : u));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/v1/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ activo: nuevoEstado }),
      });

      if (!response.ok) throw new Error("Error al actualizar estado");

      toast.success(`Usuario ${nuevoEstado ? "activado" : "desactivado"}`);
    } catch (error) {
      toast.error("Error al cambiar el estado");
      // Rollback
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: !nuevoEstado } : u));
    }
  };

  const getNombreCompleto = (usuario: Usuario) => {
    const partes = [usuario.nombre, usuario.segundo_nombre, usuario.primer_apellido, usuario.segundo_apellido].filter(Boolean);
    return partes.join(" ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F7FA]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent" />
          <p className="mt-4 text-lg font-medium text-[#6B7280]">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  const usuariosActivos = usuarios.filter((u) => u.activo).length;
  const usuariosInactivos = usuarios.filter((u) => !u.activo).length;
  const conArea = usuarios.filter((u) => u.area).length;
  const activePercentage = total === 0 ? 0 : Math.round((usuariosActivos / total) * 100);
  const areaPercentage = total === 0 ? 0 : Math.round((conArea / total) * 100);

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <TooltipProvider>
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header Profesional */}
          <div className="bg-gradient-to-br from-[#E0EDFF] to-[#C7D2FE] rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
                  <Users className="h-9 w-9 text-[#2563EB]" />
                  Gestión de Usuarios
                </h1>
                <p className="text-[#6B7280] mt-2 text-lg">
                  Administra usuarios, roles y permisos del sistema de calidad ISO 9001
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Badge className="bg-white text-[#2563EB] border border-[#E5E7EB]">
                    {total} usuarios totales
                  </Badge>
                  <Badge className="bg-[#ECFDF5] text-[#22C55E]">
                    <UserCheck className="h-4 w-4 mr-1" />
                    {usuariosActivos} activos
                  </Badge>
                  {usuariosInactivos > 0 && (
                    <Badge className="bg-[#FFF7ED] text-[#F59E0B] border border-[#F59E0B]/30">
                      <UserX className="h-4 w-4 mr-1" />
                      {usuariosInactivos} inactivos
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={() => navigate("/usuarios/importar")}>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Importar Usuarios
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Importar usuarios desde archivo Excel</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => navigate("/NuevoUsuario")}
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Nuevo Usuario
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Crear un nuevo usuario manualmente</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={fetchUsuarios} disabled={loading}>
                      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                      Actualizar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Recargar lista de usuarios</p></TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Tarjetas de métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[#E0EDFF] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#1E3A8A]">Total Usuarios</CardTitle>
                  <Users className="h-8 w-8 text-[#2563EB]" />
                </div>
                <div className="text-4xl font-bold text-[#1E3A8A] mt-4">{total}</div>
                <p className="text-[#6B7280] text-sm mt-1">Registrados en el sistema</p>
              </CardHeader>
            </Card>

            <Card className="bg-[#ECFDF5] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#1E3A8A]">Usuarios Activos</CardTitle>
                  <UserCheck className="h-8 w-8 text-[#22C55E]" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-4xl font-bold text-[#1E3A8A] mb-2">{usuariosActivos}</div>
                <p className="text-sm text-[#6B7280] mb-3">Usuarios con acceso activo</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Porcentaje</span>
                    <span className="font-semibold text-[#22C55E]">{activePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-[#22C55E] h-3 rounded-full transition-all duration-700"
                      style={{ width: `${activePercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#FFF7ED] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#1E3A8A]">Usuarios Inactivos</CardTitle>
                  <UserX className="h-8 w-8 text-[#F59E0B]" />
                </div>
                <div className="text-4xl font-bold text-[#1E3A8A] mt-4">{usuariosInactivos}</div>
                <p className="text-[#6B7280] text-sm mt-1">Sin acceso al sistema</p>
              </CardHeader>
            </Card>

            <Card className="bg-[#E0EDFF] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#1E3A8A]">Con Área Asignada</CardTitle>
                  <Building2 className="h-8 w-8 text-[#2563EB]" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-4xl font-bold text-[#1E3A8A] mb-2">{conArea}</div>
                <p className="text-sm text-[#6B7280] mb-3">Vinculados a un área</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Cobertura</span>
                    <span className="font-semibold text-[#2563EB]">{areaPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-[#2563EB] h-3 rounded-full transition-all duration-700"
                      style={{ width: `${areaPercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Búsqueda y filtros */}
          <Card className="shadow-sm">
            <CardHeader className="bg-[#F1F5F9]">
              <CardTitle className="text-xl text-[#1E3A8A] flex items-center gap-2">
                <Search className="h-5 w-5" />
                Búsqueda y Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-[#6B7280]" />
                  <Input
                    placeholder="Buscar por nombre, usuario, email, documento o área..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filtroEstado === "todos" ? "default" : "outline"}
                    onClick={() => setFiltroEstado("todos")}
                  >
                    Todos
                  </Button>
                  <Button
                    variant={filtroEstado === "activos" ? "default" : "outline"}
                    onClick={() => setFiltroEstado("activos")}
                    className={filtroEstado === "activos" ? "bg-[#22C55E] hover:bg-green-700" : ""}
                  >
                    <UserCheck className="mr-1 h-4 w-4" />
                    Activos
                  </Button>
                  <Button
                    variant={filtroEstado === "inactivos" ? "default" : "outline"}
                    onClick={() => setFiltroEstado("inactivos")}
                    className={filtroEstado === "inactivos" ? "bg-[#EF4444] hover:bg-red-700" : ""}
                  >
                    <UserX className="mr-1 h-4 w-4" />
                    Inactivos
                  </Button>
                </div>
              </div>
              <p className="text-sm text-[#6B7280] mt-4">
                Mostrando {usuariosFiltrados.length} de {total} usuarios
              </p>
            </CardContent>
          </Card>

          {/* Tabla de usuarios */}
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-[#F1F5F9]">
              <CardTitle className="text-2xl text-[#1E3A8A]">Listado de Usuarios</CardTitle>
              <CardDescription className="text-[#6B7280]">Haz clic en las acciones para ver, editar o eliminar</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F1F5F9] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="text-left p-6 text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider">Usuario</th>
                      <th className="text-left p-6 text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider">Documento</th>
                      <th className="text-left p-6 text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider">Área</th>
                      <th className="text-left p-6 text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider">Contacto</th>
                      <th className="text-left p-6 text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider">Estado</th>
                      <th className="text-right p-6 text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider pr-10">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#E5E7EB]">
                    {usuariosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-20 text-[#6B7280]">
                          <div className="flex flex-col items-center">
                            <Users className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-xl font-medium">
                              {searchTerm ? `No se encontraron resultados para "${searchTerm}"` : "No hay usuarios registrados"}
                            </p>
                            {searchTerm && (
                              <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-6">
                                Limpiar búsqueda
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      usuariosFiltrados.map((usuario) => (
                        <tr key={usuario.id} className="hover:bg-[#EFF6FF] transition-colors">
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold">
                                {usuario.nombre.charAt(0).toUpperCase()}
                                {usuario.primer_apellido?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{getNombreCompleto(usuario)}</div>
                                <div className="text-sm text-[#6B7280]">@{usuario.nombre_usuario}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-6 text-[#6B7280] font-mono">{usuario.documento.toLocaleString()}</td>
                          <td className="p-6">
                            {usuario.area ? (
                              <div>
                                <div className="font-medium text-gray-900">{usuario.area.nombre}</div>
                                <div className="text-sm text-[#6B7280]">[{usuario.area.codigo}]</div>
                              </div>
                            ) : (
                              <span className="text-[#6B7280] italic">Sin área</span>
                            )}
                          </td>
                          <td className="p-6 text-[#6B7280]">{usuario.correo_electronico}</td>
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={usuario.activo}
                                onCheckedChange={(checked) => handleToggleEstado(usuario.id, checked)}
                              />
                              <span className={usuario.activo ? "text-[#22C55E] font-medium" : "text-[#6B7280]"}>
                                {usuario.activo ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center justify-end gap-3">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" variant="ghost" onClick={() => openViewDialog(usuario)}>
                                    <Eye className="h-4 w-4 text-[#2563EB]" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Ver detalles</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" variant="ghost" onClick={() => navigate(`/usuarios/${usuario.id}/editar`)}>
                                    <Edit className="h-4 w-4 text-[#4B5563]" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Editar usuario</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" variant="ghost" onClick={() => openDeleteDialog(usuario)}>
                                    <Trash2 className="h-4 w-4 text-[#EF4444]" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Eliminar usuario</p></TooltipContent>
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

          {/* Dialog Ver Detalles */}
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#1E3A8A] flex items-center gap-3">
                  <Eye className="h-7 w-7 text-[#2563EB]" />
                  Detalles del Usuario
                </DialogTitle>
              </DialogHeader>
              {selectedUsuario && (
                <div className="space-y-6 py-4">
                  <div className="flex items-center gap-5">
                    <div className="h-20 w-20 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-3xl font-bold">
                      {selectedUsuario.nombre.charAt(0).toUpperCase()}
                      {selectedUsuario.primer_apellido?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">{getNombreCompleto(selectedUsuario)}</h3>
                      <p className="text-lg text-[#6B7280]">@{selectedUsuario.nombre_usuario}</p>
                    </div>
                    <Badge className={`text-base px-4 py-2 ${selectedUsuario.activo ? "bg-[#ECFDF5] text-[#22C55E]" : "bg-gray-100 text-gray-600"}`}>
                      {selectedUsuario.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F8FAFC] rounded-xl p-6 border border-[#E5E7EB]">
                    <div>
                      <p className="text-sm text-[#6B7280] mb-1">Documento</p>
                      <p className="text-xl font-mono font-semibold">{selectedUsuario.documento.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#6B7280] mb-1">Correo Electrónico</p>
                      <p className="text-xl font-medium">{selectedUsuario.correo_electronico}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#6B7280] mb-1">Área Asignada</p>
                      <p className="text-xl font-medium">
                        {selectedUsuario.area ? (
                          <span>{selectedUsuario.area.nombre} <Badge variant="outline">[{selectedUsuario.area.codigo}]</Badge></span>
                        ) : (
                          <span className="italic text-[#6B7280]">Sin área asignada</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#6B7280] mb-1">Fecha de Registro</p>
                      <p className="text-lg font-medium">
                        {new Date(selectedUsuario.creado_en).toLocaleDateString("es-CO", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#F1F5F9] rounded-xl p-5 border border-[#E5E7EB]">
                    <p className="text-sm text-[#6B7280] mb-1">Última Actualización</p>
                    <p className="text-lg font-medium">
                      {new Date(selectedUsuario.actualizado_en).toLocaleString("es-CO", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog Eliminar */}
          <AlertDialog open={deleteDialog.open} onOpenChange={closeDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[#1E3A8A]">¿Eliminar usuario?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  {deleteDialog.usuario && (
                    <>
                      <div className="bg-[#F1F5F9] p-5 rounded-lg border border-[#E5E7EB]">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold">
                            {deleteDialog.usuario.nombre.charAt(0).toUpperCase()}
                            {deleteDialog.usuario.primer_apellido?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{getNombreCompleto(deleteDialog.usuario)}</p>
                            <p className="text-sm text-[#6B7280]">@{deleteDialog.usuario.nombre_usuario}</p>
                            <p className="text-sm text-[#6B7280]">Documento: {deleteDialog.usuario.documento.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-[#EF4444] font-medium">
                        Esta acción es permanente y no se puede deshacer.
                      </p>
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleEliminar} className="bg-[#EF4444] hover:bg-red-700">
                  Eliminar Usuario
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TooltipProvider>
    </div>
  );
}
