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
  const [pendingCount] = React.useState(5); // Simulado, conecta a tu API

  // Cargar perfil completo del usuario al montar
  React.useEffect(() => {
    const cargarPerfilCompleto = async () => {
      const currentUser = getCurrentUser();
      const token = getToken();
      if (currentUser?.id && token) {
        try {
          const res = await axios.get(`${API_URL}/usuarios/${currentUser.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const updatedUser = {
            ...currentUser,
            ...res.data,
          };
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
    const handleStorageChange = () => {
      setUser(getCurrentUser());
    };

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

  const data = {
    user: {
      name: user ? `${user.nombre} ${user.primerApellido}` : "Usuario",
      email: user?.correoElectronico || "usuario@example.com",
      avatar: "/avatars/user.jpg",
      fotoUrl: user?.fotoUrl || "",
    },
    navMain: [
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
          {
            title: "Gestionar Áreas",
            url: "/gestionar_areas",
          },
          {
            title: "Asignar Responsables",
            url: "/Asignar_Responsables",
          },
        ],
      },
      {
        title: "Usuarios",
        url: "#",
        icon: Users,
        items: [
          {
            title: "Lista de Usuarios",
            url: "/ListaDeUsuarios",
          },
          {
            title: "Nuevo Usuario",
            url: "/NuevoUsuario",
          },
          {
            title: "Roles y Permisos",
            url: "/Roles_y_Permisos",
          },
        ],
      },
      {
        title: "Documentos",
        url: "#",
        icon: FileText,
        badge: pendingCount > 0 ? pendingCount.toString() : undefined,
        badgeVariant: "destructive" as const,
        items: [
          {
            title: "Gestión Documental",
            url: "/documentos",
          },
          {
            title: "Control de Versiones",
            url: "/control-versiones",
          },
          {
            title: "Aprobaciones Pendientes",
            url: "/Aprobaciones_Pendientes",
            badge: pendingCount > 0 ? pendingCount.toString() : undefined,
          },
          {
            title: "Documentos Obsoletos",
            url: "/Documentos_Obsoletos",
          },
        ],
      },
      {
        title: "Procesos",
        url: "#",
        icon: FolderOpen,
        items: [
          {
            title: "Mapa de Procesos",
            url: "#",
          },
          {
            title: "Gestionar Procesos",
            url: "#",
          },
          {
            title: "Instancias Activas",
            url: "#",
          },
        ],
      },
    ],
    navQuality: [
      {
        title: "Acciones Correctivas",
        icon: AlertTriangle,
        url: "#",
        badge: "3",
        badgeVariant: "destructive" as const,
        items: [
          {
            title: "Nuevas",
            url: "/Acciones_correctivas_Nuevas",
            badge: "3",
          },
          {
            title: "En Proceso",
            url: "/Acciones_correctivas_EnProceso",
          },
          {
            title: "Cerradas",
            url: "/Acciones_correctivas_Cerradas",
          },
          {
            title: "Verificadas",
            url: "/Acciones_correctivas_Verificadas",
          },
        ],
      },
      {
        title: "No Conformidades",
        icon: ClipboardCheck,
        url: "#",
        badge: "2",
        badgeVariant: "default" as const,
        items: [
          {
            title: "Abiertas",
            url: "/No_conformidades_Abiertas",
            badge: "2",
          },
          {
            title: "En Tratamiento",
            url: "/No_conformidades_EnTratamiento",
          },
          {
            title: "Cerradas",
            url: "/No_conformidades_Cerradas",
          },
        ],
      },
      {
        title: "Auditorías",
        icon: FileCheck,
        url: "#",
        items: [
          {
            title: "Planificación",
            url: "/AuditoriasPlanificacion",
          },
          {
            title: "En Curso",
            url: "/AuditoriasEnCurso",
            badge: "1",
          },
          {
            title: "Completadas",
            url: "/AuditoriasCompletas",
          },
          {
            title: "Hallazgos",
            url: "/AuditoriasHallazgosView",
          },
        ],
      },
      {
        title: "Riesgos",
        icon: Shield,
        url: "#",
        items: [
          {
            title: "Matriz de Riesgos",
            url: "/riesgos/matriz",
          },
          {
            title: "Controles",
            url: "/riesgos/controles",
          },
          {
            title: "Tratamiento",
            url: "/riesgos/tratamiento",
          },
        ],
      },
      {
        title: "Objetivos de Calidad",
        icon: Target,
        url: "#",
        items: [
          {
            title: "Objetivos Activos",
            url: "/Activos",
          },
          {
            title: "Seguimiento",
            url: "/Seguimiento",
          },
          {
            title: "Historial",
            url: "#",
          },
        ],
      },
      {
        title: "Indicadores",
        icon: TrendingUp,
        url: "#",
        items: [
          {
            title: "Tablero de Indicadores",
            url: "/indicadores/tablero",
          },
          {
            title: "Eficacia",
            url: "/indicadores/eficacia",
          },
          {
            title: "Eficiencia",
            url: "/indicadores/eficiencia",
          },
          {
            title: "Cumplimiento",
            url: "/indicadores/cumplimiento",
          },
        ],
      },
      {
        title: "Capacitaciones",
        icon: GraduationCap,
        url: "#",
        items: [
          {
            title: "Programadas",
            url: "/capacitaciones/programadas",
          },
          {
            title: "Historial",
            url: "/capacitaciones/historial",
          },
          {
            title: "Asistencias",
            url: "/capacitaciones/asistencias",
          },
          {
            title: "Competencias",
            url: "/capacitaciones/competencias",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Reportes",
        url: "/reportes",
        icon: BarChart3,
      },
      {
        title: "Manual de Usuario",
        url: "#",
        icon: BookOpen,
      },
    ],
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