import { useEffect, useState } from "react";
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
  Users,
  Search,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Filter,
  UserCheck,
  UserX,
  Building2,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
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
import { apiClient } from "@/lib/api";

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
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    type: "ver" | "eliminar" | null;
    usuario: Usuario | null;
  }>({ open: false, type: null, usuario: null });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    filtrarUsuarios();
  }, [searchTerm, filtroEstado, usuarios]);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<Usuario[]>("/usuarios");
      const data = response.data;
      setUsuarios(Array.isArray(data) ? data : []);
      setTotal(Array.isArray(data) ? data.length : 0);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setUsuarios([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const filtrarUsuarios = () => {
    let resultado = [...usuarios];

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(
        (user) =>
          user.nombre.toLowerCase().includes(term) ||
          user.primer_apellido.toLowerCase().includes(term) ||
          user.correo_electronico.toLowerCase().includes(term) ||
          user.nombre_usuario.toLowerCase().includes(term) ||
          user.documento.toString().includes(term) ||
          user.area?.nombre.toLowerCase().includes(term),
      );
    }

    // Filtrar por estado
    if (filtroEstado === "activos") {
      resultado = resultado.filter((user) => user.activo);
    } else if (filtroEstado === "inactivos") {
      resultado = resultado.filter((user) => !user.activo);
    }

    setUsuariosFiltrados(resultado);
  };

  const openDialog = (type: "ver" | "eliminar", usuario: Usuario) => {
    setDialogState({ open: true, type, usuario });
  };

  const closeDialog = () => {
    setDialogState({ open: false, type: null, usuario: null });
  };

  const handleEliminar = async () => {
    const usuario = dialogState.usuario;
    if (!usuario) return;

    try {
      await apiClient.delete(`/usuarios/${usuario.id}`);

      alert(`✓ Usuario "${usuario.nombre_usuario}" eliminado correctamente`);
      await fetchUsuarios();
      closeDialog();
    } catch (error) {
      console.error("Error:", error);
      alert("✗ Error al eliminar el usuario. Por favor intente nuevamente.");
    }
  };

  const getNombreCompleto = (usuario: Usuario) => {
    const partes = [
      usuario.nombre,
      usuario.segundo_nombre,
      usuario.primer_apellido,
      usuario.segundo_apellido,
    ].filter(Boolean);
    return partes.join(" ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-blue-500" />
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  const usuariosActivos = usuarios.filter((u) => u.activo).length;
  const usuariosInactivos = usuarios.filter((u) => !u.activo).length;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 pt-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-7 w-7 text-blue-600" />
            </div>
            Lista De Usuarios
          </h1>
          <p className="text-gray-600 mt-2">
            {total} usuario{total !== 1 ? "s" : ""} registrado
            {total !== 1 ? "s" : ""} en el sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsuarios}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Usuarios
            </CardDescription>
            <CardTitle className="text-4xl font-bold">{total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Registrados en el sistema</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-green-100">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-green-600">
              <UserCheck className="w-4 h-4" />
              Usuarios Activos
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-green-600">
              {usuariosActivos}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              {((usuariosActivos / total) * 100 || 0).toFixed(0)}% del total
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-red-100">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-red-600">
              <UserX className="w-4 h-4" />
              Usuarios Inactivos
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-red-600">
              {usuariosInactivos}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className="bg-red-50 text-red-700 border-red-200"
            >
              {((usuariosInactivos / total) * 100 || 0).toFixed(0)}% del total
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-purple-100">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-purple-600">
              <Shield className="w-4 h-4" />
              Con Roles
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-purple-600">
              {total}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 border-purple-200"
            >
              Roles asignados
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda y filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="w-4 h-4" />
            Búsqueda y Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, usuario, email, documento o área..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filtroEstado === "todos" ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroEstado("todos")}
              >
                <Filter className="w-4 h-4 mr-1" />
                Todos
              </Button>
              <Button
                variant={filtroEstado === "activos" ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroEstado("activos")}
                className={
                  filtroEstado === "activos"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                <UserCheck className="w-4 h-4 mr-1" />
                Activos
              </Button>
              <Button
                variant={filtroEstado === "inactivos" ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroEstado("inactivos")}
                className={
                  filtroEstado === "inactivos"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
                }
              >
                <UserX className="w-4 h-4 mr-1" />
                Inactivos
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Mostrando {usuariosFiltrados.length} de {total} usuarios
          </p>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">
                  Usuario
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">
                  Documento
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">
                  Área
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">
                  Contacto
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">
                  Estado
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="border-b transition-colors hover:bg-gray-50"
                >
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {usuario.nombre.charAt(0)}
                        {usuario.primer_apellido.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {getNombreCompleto(usuario)}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{usuario.nombre_usuario}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <span className="font-mono text-sm">
                      {usuario.documento.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    {usuario.area ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-sm">
                            {usuario.area.nombre}
                          </div>
                          <div className="text-xs text-gray-500">
                            {usuario.area.codigo}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin área</span>
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-700">
                          {usuario.correo_electronico}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    {usuario.activo ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactivo
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                        onClick={() => openDialog("ver", usuario)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                        onClick={() => openDialog("eliminar", usuario)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {usuariosFiltrados.length === 0 && (
            <div className="text-center py-16">
              <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                No se encontraron usuarios
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? `No hay usuarios que coincidan con "${searchTerm}"`
                  : "No hay usuarios registrados en el sistema"}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Dialog de detalles */}
      <AlertDialog
        open={dialogState.open && dialogState.type === "ver"}
        onOpenChange={closeDialog}
      >
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Detalles del Usuario
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.usuario && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                      {dialogState.usuario.nombre.charAt(0)}
                      {dialogState.usuario.primer_apellido.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getNombreCompleto(dialogState.usuario)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        @{dialogState.usuario.nombre_usuario}
                      </p>
                    </div>
                    <div className="ml-auto">
                      {dialogState.usuario.activo ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactivo
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Documento</p>
                      <p className="font-mono font-semibold text-gray-900">
                        {dialogState.usuario.documento.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Correo Electrónico
                      </p>
                      <p className="text-sm text-gray-900">
                        {dialogState.usuario.correo_electronico}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Área</p>
                      <p className="text-sm font-medium text-gray-900">
                        {dialogState.usuario.area?.nombre || "Sin área"}
                      </p>
                      {dialogState.usuario.area && (
                        <p className="text-xs text-gray-600">
                          {dialogState.usuario.area.codigo}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Fecha de Registro
                      </p>
                      <p className="text-sm text-gray-900">
                        {new Date(
                          dialogState.usuario.creado_en,
                        ).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cerrar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de eliminación */}
      <AlertDialog
        open={dialogState.open && dialogState.type === "eliminar"}
        onOpenChange={closeDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              ¿Eliminar usuario?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {dialogState.usuario && (
                <>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <p className="font-semibold text-gray-900">
                      {getNombreCompleto(dialogState.usuario)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Usuario: @{dialogState.usuario.nombre_usuario}
                    </p>
                    <p className="text-sm text-gray-600">
                      Documento: {dialogState.usuario.documento}
                    </p>
                  </div>
                  <p className="text-red-600 font-medium">
                    ⚠️ Esta acción eliminará permanentemente el usuario del
                    sistema.
                  </p>
                  <p className="text-sm">
                    El usuario ya no podrá acceder al sistema y toda su
                    información será eliminada.
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar Usuario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
