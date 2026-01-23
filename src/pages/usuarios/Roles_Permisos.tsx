import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
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
  Shield,
  ShieldCheck,
  Search,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Plus,
  CheckCircle,
  Lock,
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
interface Permiso {
  id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  creado_en: string;
}

interface Rol {
  id: string;
  nombre: string;
  clave: string;
  descripcion?: string;
  creado_en: string;
}

interface RolConPermisos extends Rol {
  permisos?: Permiso[];
  cantidad_permisos?: number;
}

export default function GestionRolesPermisos() {
  const [roles, setRoles] = useState<RolConPermisos[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [rolesFiltrados, setRolesFiltrados] = useState<RolConPermisos[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para modales
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    type: "ver" | "eliminar" | "crear" | "editar" | "permisos" | null;
    rol: RolConPermisos | null;
  }>({ open: false, type: null, rol: null });

  // Estados para formularios
  const [formData, setFormData] = useState({
    nombre: "",
    clave: "",
    descripcion: "",
  });

  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filtrarRoles();
  }, [searchTerm, roles]);

  const fetchData = async () => {
    setLoading(true);
    try {


      // Obtener roles
      // Obtener roles
      const rolesRes = await apiClient.get("/roles");
      const rolesData = rolesRes.data;

      // Obtener permisos
      const permisosRes = await apiClient.get("/permisos");
      const permisosData = permisosRes.data;

      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermisos(Array.isArray(permisosData) ? permisosData : []);
    } catch (error) {
      console.error("Error:", error);

      // Datos de ejemplo
      const ejemploRoles: RolConPermisos[] = [
        {
          id: "1",
          nombre: "Administrador",
          clave: "ADMIN",
          descripcion: "Acceso completo al sistema",
          creado_en: "2024-01-15T10:30:00",
          cantidad_permisos: 45,
        },
        {
          id: "2",
          nombre: "Coordinador de Calidad",
          clave: "COORD_CALIDAD",
          descripcion: "Gestión del sistema de calidad",
          creado_en: "2024-02-20T09:15:00",
          cantidad_permisos: 28,
        },
        {
          id: "3",
          nombre: "Auditor Interno",
          clave: "AUDITOR",
          descripcion: "Realización de auditorías",
          creado_en: "2024-03-10T16:00:00",
          cantidad_permisos: 15,
        },
      ];

      const ejemploPermisos: Permiso[] = [
        { id: "1", nombre: "Ver usuarios", codigo: "USUARIOS_VER", descripcion: "Visualizar lista de usuarios", creado_en: "2024-01-01" },
        { id: "2", nombre: "Crear usuarios", codigo: "USUARIOS_CREAR", descripcion: "Crear nuevos usuarios", creado_en: "2024-01-01" },
        { id: "3", nombre: "Editar usuarios", codigo: "USUARIOS_EDITAR", descripcion: "Modificar usuarios", creado_en: "2024-01-01" },
        { id: "4", nombre: "Eliminar usuarios", codigo: "USUARIOS_ELIMINAR", descripcion: "Eliminar usuarios", creado_en: "2024-01-01" },
        { id: "5", nombre: "Ver documentos", codigo: "DOCUMENTOS_VER", creado_en: "2024-01-01" },
      ];

      setRoles(ejemploRoles);
      setPermisos(ejemploPermisos);
    } finally {
      setLoading(false);
    }
  };

  const filtrarRoles = () => {
    let resultado = [...roles];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(
        (rol) =>
          rol.nombre.toLowerCase().includes(term) ||
          rol.clave.toLowerCase().includes(term) ||
          (rol.descripcion && rol.descripcion.toLowerCase().includes(term))
      );
    }

    setRolesFiltrados(resultado);
  };

  const openDialog = (type: "ver" | "eliminar" | "crear" | "editar" | "permisos", rol: RolConPermisos | null = null) => {
    setDialogState({ open: true, type, rol });

    if (type === "editar" && rol) {
      setFormData({
        nombre: rol.nombre,
        clave: rol.clave,
        descripcion: rol.descripcion || "",
      });
    } else if (type === "crear") {
      setFormData({ nombre: "", clave: "", descripcion: "" });
    }
  };

  const closeDialog = () => {
    setDialogState({ open: false, type: null, rol: null });
    setFormData({ nombre: "", clave: "", descripcion: "" });
    setPermisosSeleccionados([]);
  };

  const handleSubmit = async () => {
    const { type, rol } = dialogState;

    try {
      const url = type === "crear" ? "/roles" : `/roles/${rol?.id}`;
      const method = type === "crear" ? "post" : "put";

      const response = await (apiClient as any)[method](url, formData);

      alert(`✓ Rol ${type === "crear" ? "creado" : "actualizado"} correctamente`);
      await fetchData();
      closeDialog();
    } catch (error) {
      console.error("Error:", error);
      alert("✗ Error al guardar el rol");
    }
  };

  const handleEliminar = async () => {
    const rol = dialogState.rol;
    if (!rol) return;

    try {
      await apiClient.delete(`/roles/${rol.id}`);

      alert(`✓ Rol "${rol.nombre}" eliminado correctamente`);
      await fetchData();
      closeDialog();
    } catch (error) {
      console.error("Error:", error);
      alert("✗ Error al eliminar el rol");
    }
  };

  const handleGuardarPermisos = async () => {
    const rol = dialogState.rol;
    if (!rol) return;

    try {


      // Agregar permisos seleccionados
      // Agregar permisos seleccionados
      await apiClient.post(`/roles/${rol.id}/permisos`, { permisoIds: permisosSeleccionados });

      alert(`✓ Permisos asignados correctamente al rol "${rol.nombre}"`);
      await fetchData();
      closeDialog();
    } catch (error) {
      console.error("Error:", error);
      alert("✗ Error al asignar permisos");
    }
  };

  const togglePermiso = (permisoId: string) => {
    setPermisosSeleccionados(prev =>
      prev.includes(permisoId)
        ? prev.filter(id => id !== permisoId)
        : [...prev, permisoId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-blue-500" />
          <p className="text-gray-600">Cargando roles y permisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 pt-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-7 w-7 text-purple-600" />
            </div>
            Roles y Permisos
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona los roles y permisos del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => openDialog("crear")}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Rol
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow border-purple-100">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-purple-600">
              <Shield className="w-4 h-4" />
              Total Roles
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-purple-600">
              {roles.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Roles configurados</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-blue-100">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-blue-600">
              <Lock className="w-4 h-4" />
              Total Permisos
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-blue-600">
              {permisos.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Permisos disponibles</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-green-100">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-green-600">
              <ShieldCheck className="w-4 h-4" />
              Roles Activos
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-green-600">
              {roles.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              100% activos
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="w-4 h-4" />
            Búsqueda de Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nombre, clave o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Mostrando {rolesFiltrados.length} de {roles.length} roles
          </p>
        </CardContent>
      </Card>

      {/* Lista de roles */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rolesFiltrados.map((rol) => (
          <Card key={rol.id} className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{rol.nombre}</CardTitle>
                    <CardDescription className="text-xs font-mono">
                      {rol.clave}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-2">
                {rol.descripcion || "Sin descripción"}
              </p>

              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {rol.cantidad_permisos || 0} permisos
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 hover:bg-blue-50"
                  onClick={() => openDialog("ver", rol)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Ver
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 hover:bg-purple-50"
                  onClick={() => openDialog("permisos", rol)}
                >
                  <Lock className="w-3 h-3 mr-1" />
                  Permisos
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 hover:bg-amber-50"
                  onClick={() => openDialog("editar", rol)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 hover:bg-red-50 hover:text-red-700"
                  onClick={() => openDialog("eliminar", rol)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rolesFiltrados.length === 0 && (
        <Card>
          <CardContent className="text-center py-16">
            <Shield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No se encontraron roles</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? `No hay roles que coincidan con "${searchTerm}"` : "No hay roles registrados"}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Limpiar búsqueda
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog Ver Detalles */}
      <AlertDialog open={dialogState.open && dialogState.type === "ver"} onOpenChange={closeDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Detalles del Rol
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.rol && (
                <div className="mt-4 space-y-4 text-left">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Shield className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {dialogState.rol.nombre}
                      </h3>
                      <p className="text-sm font-mono text-gray-600">
                        {dialogState.rol.clave}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Descripción</p>
                      <p className="text-sm text-gray-900">
                        {dialogState.rol.descripcion || "Sin descripción"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Permisos Asignados</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {dialogState.rol.cantidad_permisos || 0} permisos
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Fecha de Creación</p>
                      <p className="text-sm text-gray-900">
                        {new Date(dialogState.rol.creado_en).toLocaleDateString("es-ES", {
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

      {/* Dialog Crear/Editar */}
      <AlertDialog open={dialogState.open && (dialogState.type === "crear" || dialogState.type === "editar")} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              {dialogState.type === "crear" ? "Crear Nuevo Rol" : "Editar Rol"}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-left">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre del Rol *</label>
                <Input
                  placeholder="Ej: Coordinador de Calidad"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Clave *</label>
                <Input
                  placeholder="Ej: COORD_CALIDAD"
                  value={formData.clave}
                  onChange={(e) => setFormData({ ...formData, clave: e.target.value.toUpperCase() })}
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Descripción</label>
                <Input
                  placeholder="Describe las responsabilidades del rol..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="mt-1"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              <CheckCircle className="w-4 h-4 mr-2" />
              {dialogState.type === "crear" ? "Crear Rol" : "Guardar Cambios"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Eliminar */}
      <AlertDialog open={dialogState.open && dialogState.type === "eliminar"} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              ¿Eliminar rol?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left">
              {dialogState.rol && (
                <>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-900">{dialogState.rol.nombre}</p>
                    <p className="text-sm text-gray-600 font-mono">{dialogState.rol.clave}</p>
                  </div>
                  <p className="text-red-600 font-medium">
                    ⚠️ Esta acción eliminará el rol y todas sus asignaciones
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminar} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar Rol
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Gestión de Permisos */}
      <AlertDialog open={dialogState.open && dialogState.type === "permisos"} onOpenChange={closeDialog}>
        <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-600" />
              Gestionar Permisos - {dialogState.rol?.nombre}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-left">
              <p className="text-sm text-gray-600">
                Selecciona los permisos que deseas asignar a este rol
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2">
                {permisos.map((permiso) => (
                  <div
                    key={permiso.id}
                    onClick={() => togglePermiso(permiso.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${permisosSeleccionados.includes(permiso.id)
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {permisosSeleccionados.includes(permiso.id) ? (
                          <CheckCircle className="w-5 h-5 text-purple-600" />
                        ) : (
                          <div className="w-5 h-5 rounded border-2 border-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{permiso.nombre}</p>
                        <p className="text-xs font-mono text-gray-500">{permiso.codigo}</p>
                        {permiso.descripcion && (
                          <p className="text-xs text-gray-600 mt-1">{permiso.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{permisosSeleccionados.length}</strong> permisos seleccionados
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleGuardarPermisos}>
              <ShieldCheck className="w-4 h-4 mr-2" />
              Guardar Permisos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}