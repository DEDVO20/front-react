import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Home, Settings, Shield, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/GlobalSearch";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NotificationBell } from "./notifications/NotificationBell";

export function SiteHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    setMobileSearchOpen(false);
  }, [location.pathname]);

  // Obtener el nombre de la página actual desde la ruta
  const getPageName = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Panel de Control";
    if (path.includes("/perfil")) return "Mi Perfil";
    if (path.includes("/usuarios")) return "Usuarios";
    if (path.includes("/documentos")) return "Documentos";
    if (path.includes("/control-versiones")) return "Control de Versiones";
    if (path.includes("/procesos")) return "Procesos";
    if (path.includes("/auditorias") || path.includes("/Auditorias") || path.includes("/Auditoria"))
      return "Auditorías";
    if (path.includes("/Activos")) return "Objetivos Activos";
    if (path.includes("/Seguimiento")) return "Seguimiento de Objetivos";
    if (path.includes("/Historial")) return "Historial de Objetivos";

    // Gestión de Áreas
    if (path.includes("/gestionar_areas")) return "Gestionar Áreas";
    if (path.includes("/Asignar_Responsables")) return "Asignar Responsables";

    //usuarios 
    if (path.includes("/ListaDeUsuarios")) return "Lista de Usuarios";
    if (path.includes("/NuevoUsuario")) return "Nuevo Usuario";

    // No Conformidades - rutas específicas
    if (path.includes("/No_conformidades_Abiertas"))
      return "No Conformidades Abiertas";
    if (path.includes("/No_conformidades_EnTratamiento"))
      return "No Conformidades en Tratamiento";
    if (path.includes("/No_conformidades_Cerradas"))
      return "No Conformidades Cerradas";
    if (path.includes("/no-conformidades")) return "No Conformidades";

    if (path.includes("/Acciones_correctivas_Cerradas"))
      return "Acciones Correctivas Cerradas";

    if (path.includes("/Acciones_correctivas_Verificadas"))
      return "Acciones Correctivas Verificadas";

    if (path.includes("/acciones-correctivas")) return "Acciones Correctivas";
    // Rutas específicas de riesgos
    if (path.includes("/riesgos/matriz")) return "Matriz de Riesgo";
    if (path.includes("/riesgos/controles")) return "Controles de Riesgos";
    if (path.includes("/riesgos/tratamiento")) return "Tratamiento";

    if (path.includes("/indicadores")) return "Indicadores";

    if (path.includes("/capacitaciones/programadas")) return "Capacitaciones Programadas";
    if (path.includes("/capacitaciones/historial")) return "Capacitaciones Historial";
    if (path.includes("/capacitaciones/asistencias")) return "Capacitaciones Asistencias";
    if (path.includes("/capacitaciones/competencias")) return "Capacitaciones Competencias";

    // Ajustes y Seguridad
    if (path.includes("/configuracion")) return "Ajustes";
    if (path.includes("/seguridad")) return "Seguridad";
    if (path.includes("/manual-usuario")) return "Manual de Usuario";
    if (path.includes("/mesa-ayuda")) return "Mesa de Ayuda";
    if (path.includes("/reportes")) return "Reportes";

    return "Panel de Control";
  };
  return (
    <header className="sticky top-0 z-50 flex min-h-12 shrink-0 flex-col border-b bg-background">
      <div className="flex w-full min-w-0 items-center gap-1 px-2 sm:px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator
          orientation="vertical"
          className="mx-1 hidden sm:block data-[orientation=vertical]:h-4"
        />

        <Breadcrumb className="min-w-0 flex-1 overflow-hidden">
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem className="hidden xl:block">
              <BreadcrumbLink asChild>
                <Link to="/dashboard" className="flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" />
                  SGC ISO 9001
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden xl:block" />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="block max-w-[46vw] truncate font-medium sm:max-w-[280px] md:max-w-none">
                {getPageName()}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-muted-foreground lg:hidden"
            onClick={() => setMobileSearchOpen((open) => !open)}
            aria-label="Buscar"
          >
            <Search className="h-4 w-4" />
          </Button>

          <div className="hidden lg:block">
            <GlobalSearch compact placeholder="Buscar documentos, auditorías..." />
          </div>

          <div className="flex items-center gap-0.5 border-l pl-1 sm:gap-1 sm:pl-2 sm:ml-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
                    onClick={() => navigate("/perfil")}
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mi Perfil</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden lg:inline-flex h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
                    onClick={() => navigate("/configuracion")}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ajustes</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden lg:inline-flex h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
                    onClick={() => navigate("/seguridad")}
                  >
                    <Shield className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Seguridad</TooltipContent>
              </Tooltip>

              <Tooltip open={notificationOpen ? false : undefined}>
                <TooltipTrigger asChild>
                  <div>
                    <NotificationBell onOpenChange={setNotificationOpen} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Notificaciones</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t px-3 py-2 lg:hidden">
          <GlobalSearch
            fullWidth
            placeholder="Buscar módulos..."
            inputClassName="h-10 w-full pl-8 rounded-xl"
          />
        </div>
      )}
    </header>
  );
}
