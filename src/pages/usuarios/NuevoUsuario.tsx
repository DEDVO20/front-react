import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  UserPlus,
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Building2,
  Mail,
  User,
  Lock,
  FileText,
  Shield,
  Sparkles,
  UserCheck,
} from "lucide-react";
import apiClient from "@/lib/api";

interface Area {
  id: string;
  codigo: string;
  nombre: string;
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

export default function NuevosUsuarios() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

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
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Cargar catálogos y datos del usuario
  useEffect(() => {
    const init = async () => {
      setFetchingUser(true);
      try {
        // 1. Cargar Catálogos Primero
        const [areasRes, rolesRes] = await Promise.all([
          apiClient.get("/areas"),
          apiClient.get("/roles")
        ]);

        setAreas(areasRes.data);
        setRoles(rolesRes.data);

        // 2. Cargar Usuario si estamos editando
        if (isEditing) {
          const userRes = await apiClient.get(`/usuarios/${id}`);
          const data = userRes.data;

          console.log("API User Data received:", data);

          setFormData({
            documento: String(data.documento),
            nombre: data.nombre,
            segundoNombre: data.segundo_nombre || "",
            primerApellido: data.primer_apellido,
            segundoApellido: data.segundo_apellido || "",
            correoElectronico: data.correo_electronico,
            nombreUsuario: data.nombre_usuario,
            contrasena: "",
            confirmarContrasena: "",
            areaId: data.area_id || "",
            activo: data.activo,
          });

          // Mapear roles: data.roles es List[UsuarioRolResponse]
          const roleIds = data.roles?.map((ur: any) => String(ur.rol_id)) || [];
          setSelectedRoleIds(roleIds);
        }
      } catch (error: any) {
        toast.error("Error al cargar datos: " + error.message);
        if (isEditing) navigate("/ListaDeUsuarios");
      } finally {
        setFetchingUser(false);
      }
    };

    init();
  }, [id, isEditing, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAreaChange = (value: string) => {
    setFormData(prev => ({ ...prev, areaId: value }));
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        documento: parseInt(formData.documento, 10),
        nombre: formData.nombre.trim(),
        segundo_nombre: formData.segundoNombre.trim() || null,
        primer_apellido: formData.primerApellido.trim(),
        segundo_apellido: formData.segundoApellido.trim() || null,
        correo_electronico: formData.correoElectronico.trim(),
        nombre_usuario: formData.nombreUsuario.trim(),
        area_id: formData.areaId || null,
        activo: formData.activo,
        rol_ids: selectedRoleIds,
      };

      if (formData.contrasena) {
        payload.contrasena = formData.contrasena;
      }

      if (isEditing) {
        await apiClient.put(`/usuarios/${id}`, payload);
        toast.success("Usuario actualizado correctamente");
      } else {
        if (!formData.contrasena) throw new Error("La contraseña es obligatoria para nuevos usuarios");
        await apiClient.post("/usuarios", payload);
        toast.success("Usuario creado correctamente");
      }

      navigate("/ListaDeUsuarios");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F7FA]">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-gray-500 font-medium">Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <TooltipProvider>
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#E0EDFF] to-[#C7D2FE] rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
                  {isEditing ? <UserCheck className="h-9 w-9 text-[#2563EB]" /> : <UserPlus className="h-9 w-9 text-[#2563EB]" />}
                  {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
                </h1>
                <p className="text-[#6B7280] mt-1 text-lg">
                  {isEditing ? `Perfil de ${formData.nombre} ${formData.primerApellido}` : "Registra un nuevo integrante para ISO 9001"}
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate(-1)} className="bg-white/50 backdrop-blur-sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="shadow-sm border-[#E5E7EB]">
              <CardHeader className="bg-[#F1F5F9] border-b">
                <CardTitle className="text-[#1E3A8A] flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" /> Datos Generales
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-10">

                {/* Sección 1: Identidad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Cédula / Documento *</Label>
                    <Input name="documento" value={formData.documento} onChange={handleInputChange} placeholder="00000000" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Primer Nombre *</Label>
                    <Input name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Ej: Juan" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Segundo Nombre</Label>
                    <Input name="segundoNombre" value={formData.segundoNombre} onChange={handleInputChange} placeholder="Opcional" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Primer Apellido *</Label>
                    <Input name="primerApellido" value={formData.primerApellido} onChange={handleInputChange} placeholder="Ej: Pérez" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Segundo Apellido</Label>
                    <Input name="segundoApellido" value={formData.segundoApellido} onChange={handleInputChange} placeholder="Opcional" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Área de Trabajo *</Label>
                    <Select value={formData.areaId} onValueChange={handleAreaChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el área" />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map(a => (
                          <SelectItem key={a.id} value={a.id}>[{a.codigo}] {a.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Sección 2: Roles */}
                <div className="pt-8 border-t">
                  <div className="flex items-center gap-2 mb-6">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-[#1E3A8A]">Roles y Atribuciones</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roles.map(rol => {
                      const isSel = selectedRoleIds.includes(String(rol.id));
                      return (
                        <div
                          key={rol.id}
                          onClick={() => toggleRole(rol.id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${isSel ? "bg-blue-50 border-blue-600 shadow-sm" : "bg-white border-gray-100 hover:border-blue-200"}`}
                        >
                          <Checkbox checked={isSel} />
                          <div>
                            <p className="font-bold text-gray-900">{rol.nombre}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-tight">{rol.clave}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sección 3: Cuenta */}
                <div className="pt-8 border-t grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Correo Electrónico *</Label>
                    <Input name="correoElectronico" type="email" value={formData.correoElectronico} onChange={handleInputChange} placeholder="usuario@empresa.com" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Nombre de Usuario *</Label>
                    <div className="flex gap-2">
                      <Input name="nombreUsuario" value={formData.nombreUsuario} onChange={handleInputChange} placeholder="ej: jperez" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const n = formData.nombre.toLowerCase().trim();
                              const a = formData.primerApellido.toLowerCase().trim();
                              if (n && a) setFormData(p => ({ ...p, nombreUsuario: `${n.charAt(0)}${a}` }));
                            }}
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Sugerir nombre</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">{isEditing ? "Cambiar Contraseña" : "Contraseña *"}</Label>
                    <Input name="contrasena" type="password" value={formData.contrasena} onChange={handleInputChange} placeholder={isEditing ? "Dejar vacío para no cambiar" : "Mínimo 6 caracteres"} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Confirmar Contraseña</Label>
                    <Input name="confirmarContrasena" type="password" value={formData.confirmarContrasena} onChange={handleInputChange} />
                  </div>
                </div>

                {/* Estado y Acciones */}
                <div className="pt-10 border-t flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-full border border-gray-200">
                    <Switch checked={formData.activo} onCheckedChange={(val) => setFormData(p => ({ ...p, activo: val }))} />
                    <span className="font-bold text-[#1E3A8A]">{formData.activo ? "Acceso Activado" : "Acceso Inactivo"}</span>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto">
                    <Button type="button" variant="outline" className="flex-1 md:flex-none border-gray-300" onClick={() => navigate(-1)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 min-w-[200px]">
                      {loading ? "Procesando..." : (isEditing ? "Guardar Cambios" : "Crear Usuario")}
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          </form>
        </div>
      </TooltipProvider>
    </div>
  );
}