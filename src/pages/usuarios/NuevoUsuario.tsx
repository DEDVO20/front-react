import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  UserPlus,
  ArrowLeft,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Building2,
  Mail,
  User,
  Lock,
  FileText,
  Users,
  Shield,
} from "lucide-react";

interface Area {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

interface Rol {
  id: string;
  nombre: string;
  clave: string;
  descripcion?: string;
}

interface FormData {
  documento: string;
  nombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  correoElectronico: string;
  nombreUsuario: string;
  contrasena: string;
  confirmarContrasena: string;
  areaId: string;
  activo: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function NuevosUsuarios() {
  const [formData, setFormData] = useState<FormData>({
    documento: "",
    nombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    correoElectronico: "",
    nombreUsuario: "",
    contrasena: "",
    confirmarContrasena: "",
    areaId: "",
    activo: true,
  });

  const [areas, setAreas] = useState<Area[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({ open: false, type: "success", message: "" });

  useEffect(() => {
    fetchAreas();
    fetchRoles();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await apiClient.get("/areas");
      const data = response.data;
      setAreas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener áreas:", error);
      setAreas([
        { id: "1", codigo: "CAL", nombre: "Gestión de Calidad" },
        { id: "2", codigo: "SIS", nombre: "Sistemas y Tecnología" },
        { id: "3", codigo: "RRHH", nombre: "Recursos Humanos" },
        { id: "4", codigo: "COM", nombre: "Comercial" },
        { id: "5", codigo: "OPE", nombre: "Operaciones" },
        { id: "6", codigo: "FIN", nombre: "Finanzas" },
      ]);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiClient.get("/roles");
      const data = response.data;
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener roles:", error);
      setRoles([
        { id: "1", nombre: "Administrador", clave: "ADMIN", descripcion: "Acceso total" },
        { id: "2", nombre: "Coordinador de Calidad", clave: "COORD_CALIDAD" },
        { id: "3", nombre: "Auditor Interno", clave: "AUDITOR" },
        { id: "4", nombre: "Usuario Estándar", clave: "USER" },
      ]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.documento.trim()) {
      newErrors.documento = "El documento es obligatorio";
    } else if (!/^\d+$/.test(formData.documento)) {
      newErrors.documento = "El documento debe contener solo números";
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }

    if (!formData.primerApellido.trim()) {
      newErrors.primerApellido = "El primer apellido es obligatorio";
    }

    if (!formData.correoElectronico.trim()) {
      newErrors.correoElectronico = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoElectronico)) {
      newErrors.correoElectronico = "El correo electrónico no es válido";
    }

    if (!formData.nombreUsuario.trim()) {
      newErrors.nombreUsuario = "El nombre de usuario es obligatorio";
    } else if (formData.nombreUsuario.length < 3) {
      newErrors.nombreUsuario = "El nombre de usuario debe tener al menos 3 caracteres";
    }

    if (!formData.contrasena) {
      newErrors.contrasena = "La contraseña es obligatoria";
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.confirmarContrasena) {
      newErrors.confirmarContrasena = "Debe confirmar la contraseña";
    } else if (formData.contrasena !== formData.confirmarContrasena) {
      newErrors.confirmarContrasena = "Las contraseñas no coinciden";
    }

    if (!formData.areaId) {
      newErrors.areaId = "Debe seleccionar un área";
    }

    // Validar roles
    if (selectedRoleIds.length === 0) {
      newErrors.roles = "Debe seleccionar al menos un rol";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        documento: parseInt(formData.documento, 10),
        nombre: formData.nombre.trim(),
        segundo_nombre: formData.segundoNombre.trim() || undefined,
        primer_apellido: formData.primerApellido.trim(),
        segundo_apellido: formData.segundoApellido.trim() || undefined,
        correo_electronico: formData.correoElectronico.trim(),
        nombre_usuario: formData.nombreUsuario.trim(),
        contrasena: formData.contrasena,
        area_id: formData.areaId,
        activo: formData.activo,
        rol_ids: selectedRoleIds, // Enviar roles
      };

      await apiClient.post("/usuarios", dataToSend);

      setDialogState({
        open: true,
        type: "success",
        message: `Usuario "${formData.nombreUsuario}" creado exitosamente`,
      });

      // Limpiar formulario
      setFormData({
        documento: "",
        nombre: "",
        segundoNombre: "",
        primerApellido: "",
        segundoApellido: "",
        correoElectronico: "",
        nombreUsuario: "",
        contrasena: "",
        confirmarContrasena: "",
        areaId: "",
        activo: true,
      });
      setSelectedRoleIds([]);
    } catch (error: any) {
      console.error("Error:", error);
      setDialogState({
        open: true,
        type: "error",
        message: error.message || "Error al crear el usuario. Por favor intente nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("¿Está seguro de que desea cancelar? Se perderán todos los cambios.")) {
      setFormData({
        documento: "",
        nombre: "",
        segundoNombre: "",
        primerApellido: "",
        segundoApellido: "",
        correoElectronico: "",
        nombreUsuario: "",
        contrasena: "",
        confirmarContrasena: "",
        areaId: "",
        activo: true,
      });
      setSelectedRoleIds([]);
      setErrors({});
    }
  };

  const closeDialog = () => {
    setDialogState({ open: false, type: "success", message: "" });
  };

  const removeRole = (id: string) => {
    setSelectedRoleIds(prev => prev.filter(r => r !== id));
    if (errors.roles) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.roles;
        return newErrors;
      });
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 pt-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="h-7 w-7 text-blue-600" />
            </div>
            Nuevo Usuario
          </h1>
          <p className="text-gray-600 mt-2">
            Complete el formulario para registrar un nuevo usuario en el sistema
          </p>
        </div>
        <Button variant="outline" size-="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Información del Usuario
            </CardTitle>
            <CardDescription>
              Los campos marcados con asterisco (*) son obligatorios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Datos Personales
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Documento */}
                <div className="space-y-2">
                  <label htmlFor="documento" className="text-sm font-medium text-gray-700">
                    Documento <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="documento"
                    name="documento"
                    type="text"
                    placeholder="Ej: 12345678"
                    value={formData.documento}
                    onChange={handleInputChange}
                    className={errors.documento ? "border-red-500" : ""}
                  />
                  {errors.documento && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.documento}
                    </p>
                  )}
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                  <label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                    Primer Nombre <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    placeholder="Ej: Juan"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={errors.nombre ? "border-red-500" : ""}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.nombre}
                    </p>
                  )}
                </div>

                {/* Segundo Nombre */}
                <div className="space-y-2">
                  <label htmlFor="segundoNombre" className="text-sm font-medium text-gray-700">
                    Segundo Nombre
                  </label>
                  <Input
                    id="segundoNombre"
                    name="segundoNombre"
                    type="text"
                    placeholder="Ej: Carlos"
                    value={formData.segundoNombre}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Primer Apellido */}
                <div className="space-y-2">
                  <label htmlFor="primerApellido" className="text-sm font-medium text-gray-700">
                    Primer Apellido <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="primerApellido"
                    name="primerApellido"
                    type="text"
                    placeholder="Ej: Pérez"
                    value={formData.primerApellido}
                    onChange={handleInputChange}
                    className={errors.primerApellido ? "border-red-500" : ""}
                  />
                  {errors.primerApellido && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.primerApellido}
                    </p>
                  )}
                </div>

                {/* Segundo Apellido */}
                <div className="space-y-2">
                  <label htmlFor="segundoApellido" className="text-sm font-medium text-gray-700">
                    Segundo Apellido
                  </label>
                  <Input
                    id="segundoApellido"
                    name="segundoApellido"
                    type="text"
                    placeholder="Ej: García"
                    value={formData.segundoApellido}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Área */}
                <div className="space-y-2">
                  <label htmlFor="areaId" className="text-sm font-medium text-gray-700">
                    Área <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      id="areaId"
                      name="areaId"
                      value={formData.areaId}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.areaId ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Seleccione un área</option>
                      {areas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.nombre} ({area.codigo})
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.areaId && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.areaId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Selección de Roles */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Asignación de Roles
              </h3>

              <div className="space-y-2">
                <label htmlFor="roles" className="text-sm font-medium text-gray-700">
                  Roles <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 text-gray-400 w-4 h-4 z-10" />
                  <select
                    id="roles"
                    multiple
                    value={selectedRoleIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setSelectedRoleIds(selected);
                    }}
                    className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 ${errors.roles ? "border-red-500" : "border-gray-300"
                      }`}
                  >
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre} ({rol.clave})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500">
                  Mantén presionada la tecla <kbd className="px-1 bg-gray-200 rounded">Ctrl</kbd> (o <kbd className="px-1 bg-gray-200 rounded">Cmd</kbd>) para seleccionar múltiples roles
                </p>
                {errors.roles && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.roles}
                  </p>
                )}

                {/* Mostrar roles seleccionados como badges */}
                {selectedRoleIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedRoleIds.map((id) => {
                      const rol = roles.find(r => r.id === id);
                      return rol ? (
                        <Badge key={id} variant="secondary" className="flex items-center gap-1">
                          {rol.nombre}
                          <button
                            type="button"
                            onClick={() => removeRole(id)}
                            className="ml-1 text-xs hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Información de Cuenta */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Información de Cuenta
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Correo Electrónico */}
                <div className="space-y-2">
                  <label htmlFor="correoElectronico" className="text-sm font-medium text-gray-700">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="correoElectronico"
                      name="correoElectronico"
                      type="email"
                      placeholder="Ej: juan.perez@sgc.com"
                      value={formData.correoElectronico}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors.correoElectronico ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.correoElectronico && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.correoElectronico}
                    </p>
                  )}
                </div>

                {/* Nombre de Usuario */}
                <div className="space-y-2">
                  <label htmlFor="nombreUsuario" className="text-sm font-medium text-gray-700">
                    Nombre de Usuario <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="nombreUsuario"
                      name="nombreUsuario"
                      type="text"
                      placeholder="Ej: jperez"
                      value={formData.nombreUsuario}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors.nombreUsuario ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.nombreUsuario && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.nombreUsuario}
                    </p>
                  )}
                </div>

                {/* Contraseña */}
                <div className="space-y-2">
                  <label htmlFor="contrasena" className="text-sm font-medium text-gray-700">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="contrasena"
                      name="contrasena"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.contrasena}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors.contrasena ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.contrasena && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.contrasena}
                    </p>
                  )}
                </div>

                {/* Confirmar Contraseña */}
                <div className="space-y-2">
                  <label htmlFor="confirmarContrasena" className="text-sm font-medium text-gray-700">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="confirmarContrasena"
                      name="confirmarContrasena"
                      type="password"
                      placeholder="Repita la contraseña"
                      value={formData.confirmarContrasena}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors.confirmarContrasena ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.confirmarContrasena && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.confirmarContrasena}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="activo" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  Usuario Activo
                  <Badge variant="outline" className={formData.activo ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-700 border-gray-200"}>
                    {formData.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </label>
              </div>
              <p className="text-sm text-gray-500">
                Los usuarios activos pueden iniciar sesión en el sistema
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-6 border-t">
              <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Usuario
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Dialog de Resultado */}
      <AlertDialog open={dialogState.open} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {dialogState.type === "success" ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Usuario Creado
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Error
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {dialogState.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={closeDialog}>
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}