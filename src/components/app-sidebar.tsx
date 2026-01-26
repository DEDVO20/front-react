import * as React from "react";
import {
  Building2,
  Users,
  FileText,
  AlertTriangle,
  ClipboardCheck,
  FolderOpen,
  BarChart3,
  LayoutDashboard,
  Shield,
  Target,
  GraduationCap,
  TrendingUp,
  FileCheck,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getCurrentUser, getToken } from "@/services/auth";
import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState(getCurrentUser());
  const [pendingCount] = React.useState(5); // Simulado

  // Cargar perfil completo al montar
  React.useEffect(() => {
    const cargarPerfilCompleto = async () => {
      const currentUser = getCurrentUser();
      const token = getToken();
      if (currentUser?.id && token) {
        try {
          const res = await axios.get(`${API_URL}/usuarios/${currentUser.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const updatedUser = { ...currentUser, ...res.data };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        } catch (error) {
          console.error("Error cargando perfil completo:", error);
        }
      }
    };
    cargarPerfilCompleto();
  }, []);

  // Actualizar usuario cuando cambie en localStorage
  React.useEffect(() => {
    const handleStorageChange = () => setUser(getCurrentUser());
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      const updatedUser = getCurrentUser();
      if (JSON.stringify(updatedUser) !== JSON.stringify(user)) {
        setUser(updatedUser);
      }
    }, 1000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  // Lógica de Permisos Detallada
  const userPermisos = user?.permisos || [];
  const isAdmin = userPermisos.includes("sistema.admin");

  const hasPermission = (permiso?: string) => {
    if (!permiso || isAdmin) return true;
    return userPermisos.includes(permiso);
  };

  // Función para filtrar menús recursivamente
  const filterMenuItems = (items: any[]) => {
    return items
      .map(item => {
        // Generar lista de sub-items permitidos
        const filteredSubItems = item.items ? filterMenuItems(item.items) : undefined;

        // Un ítem es visible si:
        // 1. Tiene permiso directo y lo tiene el usuario
        // 2. O NO tiene permiso directo pero tiene hijos permitidos
        // 3. O no tiene ni permiso ni hijos (ej. Dashboard)
        const isVisible = hasPermission(item.permiso) || (filteredSubItems && filteredSubItems.length > 0);

        if (isVisible) {
          return { ...item, items: filteredSubItems };
        }
        return null;
      })
      .filter(item => item !== null);
  };

  const data = {
    user: {
      name: user ? (user.nombre_completo || `${user.nombre || ""} ${user.primer_apellido || ""}`.trim() || "Usuario") : "Usuario",
      email: user?.correoElectronico || user?.email || "usuario@example.com",
      avatar: "/avatars/user.jpg",
      fotoUrl: user?.fotoUrl || user?.foto_url || "",
    },
    navMain: filterMenuItems([
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        badge: "Nuevo",
        badgeVariant: "default" as const,
      },
      {
        title: "Áreas",
        url: "#",
        icon: Building2,
        items: [
          { title: "Gestionar Áreas", url: "/gestionar_areas", permiso: "areas.ver" },
          { title: "Asignar Responsables", url: "/Asignar_Responsables", permiso: "areas.gestionar" },
        ],
      },
      {
        title: "Usuarios",
        url: "#",
        icon: Users,
        items: [
          { title: "Lista de Usuarios", url: "/ListaDeUsuarios", permiso: "usuarios.ver" },
          { title: "Nuevo Usuario", url: "/NuevoUsuario", permiso: "usuarios.crear" },
          { title: "Roles y Permisos", url: "/Roles_y_Permisos", permiso: "roles.administrar" },
        ],
      },
      {
        title: "Documentos",
        url: "#",
        icon: FileText,
        badge: pendingCount > 0 ? pendingCount.toString() : undefined,
        badgeVariant: "destructive" as const,
        items: [
          { title: "Gestionar Documentos", url: "/documentos", permiso: "documentos.ver" },
          { title: "Control de Versiones", url: "/control-versiones", permiso: "documentos.editar" },
          {
            title: "Aprobaciones Pendientes",
            url: "/Aprobaciones_Pendientes",
            permiso: "documentos.aprobar",
            badge: pendingCount > 0 ? pendingCount.toString() : undefined,
          },
          { title: "Documentos Obsoletos", url: "/Documentos_Obsoletos", permiso: "documentos.eliminar" },
        ],
      },
      {
        title: "Procesos",
        url: "#",
        icon: FolderOpen,
        items: [
          { title: "Mapa de Procesos", url: "#", permiso: "procesos.gestionar" },
          { title: "Gestionar Procesos", url: "#", permiso: "procesos.gestionar" },
          { title: "Instancias Activas", url: "#", permiso: "procesos.gestionar" },
        ],
      },
    ]),
    navQuality: filterMenuItems([
      {
        title: "Acciones Correctivas",
        icon: AlertTriangle,
        url: "#",
        items: [
          { title: "Nuevas", url: "/Acciones_correctivas_Nuevas", permiso: "acciones_correctivas.gestionar" },
          { title: "En Proceso", url: "/Acciones_correctivas_EnProceso", permiso: "acciones_correctivas.gestionar" },
          { title: "Cerradas", url: "/Acciones_correctivas_Cerradas", permiso: "acciones_correctivas.gestionar" },
          { title: "Verificadas", url: "/Acciones_correctivas_Verificadas", permiso: "acciones_correctivas.gestionar" },
        ],
      },
      {
        title: "No Conformidades",
        icon: ClipboardCheck,
        url: "#",
        items: [
          { title: "Abiertas", url: "/No_conformidades_Abiertas", permiso: "no_conformidades.gestionar" },
          { title: "En Tratamiento", url: "/No_conformidades_EnTratamiento", permiso: "no_conformidades.gestionar" },
          { title: "Cerradas", url: "/No_conformidades_Cerradas", permiso: "no_conformidades.gestionar" },
        ],
      },
      {
        title: "Auditorías",
        icon: FileCheck,
        url: "#",
        items: [
          { title: "Planificación", url: "/AuditoriasPlanificacion", permiso: "auditorias.planificar" },
          { title: "En Curso", url: "/AuditoriasEnCurso", permiso: "auditorias.ejecutar" },
          { title: "Completadas", url: "/AuditoriasCompletas", permiso: "auditorias.ejecutar" },
          { title: "Hallazgos", url: "/AuditoriasHallazgosView", permiso: "auditorias.ejecutar" },
        ],
      },
      {
        title: "Riesgos",
        icon: Shield,
        url: "#",
        items: [
          { title: "Matriz de Riesgos", url: "/riesgos/matriz", permiso: "riesgos.administrar" },
          { title: "Controles", url: "/riesgos/controles", permiso: "riesgos.administrar" },
        ],
      },
      {
        title: "Objetivos de Calidad",
        icon: Target,
        url: "#",
        items: [
          { title: "Objetivos Activos", url: "/Activos", permiso: "objetivos.seguimiento" },
          { title: "Seguimiento", url: "/Seguimiento", permiso: "objetivos.seguimiento" },
        ],
      },
      {
        title: "Indicadores",
        icon: TrendingUp,
        url: "#",
        items: [
          { title: "Tablero", url: "/indicadores/tablero", permiso: "indicadores.ver" },
          { title: "Mediciones", url: "#", permiso: "indicadores.medir" },
        ],
      },
      {
        title: "Capacitaciones",
        icon: GraduationCap,
        url: "#",
        items: [
          { title: "Programadas", url: "/capacitaciones/programadas", permiso: "capacitaciones.gestionar" },
          { title: "Historial", url: "/capacitaciones/historial", permiso: "capacitaciones.gestionar" },
        ],
      },
    ]),
    navSecondary: filterMenuItems([
      {
        title: "Sistema",
        url: "#",
        icon: Shield,
        items: [
          { title: "Configuración Global", url: "#", permiso: "sistema.configurar" },
          { title: "Migraciones de BD", url: "/sistema/migraciones", permiso: "sistema.migraciones" },
        ],
      },
      {
        title: "Reportes",
        url: "/reportes",
        icon: BarChart3,
        permiso: "indicadores.ver",
      },
      {
        title: "Manual de Usuario",
        url: "#",
        icon: BookOpen,
      },
    ]),
  };

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-sidebar-border bg-gradient-to-b from-sidebar to-sidebar/95">
      <SidebarHeader className="border-b border-sidebar-border/50 bg-gradient-to-r from-blue-600 to-cyan-600">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-white/10 data-[state=open]:bg-white/10">
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-blue-600 shadow-lg">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-white">SGC ISO 9001</span>
                  <span className="truncate text-xs text-blue-100">Sistema de Calidad</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <div className="mb-3 px-3">
          <p className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">Gestión</p>
        </div>
        <NavMain items={data.navMain} />

        <div className="my-4 mx-3 border-t border-sidebar-border/50" />

        <div className="mb-3 px-3">
          <p className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">Calidad</p>
        </div>
        <NavMain items={data.navQuality} />

        <div className="mt-6">
          <NavSecondary items={data.navSecondary} className="mt-auto" />
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/50 bg-sidebar/50">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}