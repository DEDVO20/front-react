import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, Home, Settings, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SiteHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener el nombre de la página actual desde la ruta
  const getPageName = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path.includes("/perfil")) return "Mi Perfil";
    if (path.includes("/usuarios")) return "Usuarios";
    if (path.includes("/documentos")) return "Documentos";
    if (path.includes("/control-versiones")) return "Control de Versiones";
    if (path.includes("/procesos")) return "Procesos";
    if (path.includes("/auditorias")) return "Auditorías";
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

    return "Dashboard";
  };
  return (
    <header className="sticky top-0 z-50 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear bg-background">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        {/* Breadcrumb dinámico */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link to="/dashboard" className="flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" />
                  SGC ISO 9001
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">
                {getPageName()}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Barra de búsqueda */}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar documentos, auditorías..."
              className="w-64 pl-8 h-9 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-1 border-l pl-2 ml-2">
            <TooltipProvider>
              {/* Perfil */}
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

              {/* Ajustes */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
                    onClick={() => navigate("/configuracion")}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ajustes</TooltipContent>
              </Tooltip>

              {/* Seguridad */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
                    onClick={() => navigate("/seguridad")}
                  >
                    <Shield className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Seguridad</TooltipContent>
              </Tooltip>

              {/* Notificaciones */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
                      >
                        <Bell className="h-4 w-4" />
                        <Badge
                          variant="destructive"
                          className="absolute right-1 top-1 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center border-2 border-background"
                        >
                          3
                        </Badge>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Notificaciones</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2 shadow-xl border-[#E5E7EB]">
                  <DropdownMenuLabel className="px-4 py-2 font-bold text-[#1E3A8A]">Notificaciones</DropdownMenuLabel>
                  <DropdownMenuSeparator className="mx-2" />
                  <div className="max-h-[300px] overflow-y-auto">
                    <DropdownMenuItem className="rounded-xl p-3 cursor-pointer">
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-bold text-[#1E3A8A]">Nueva No Conformidad</p>
                          <span className="text-[10px] text-muted-foreground">Hace 5 min</span>
                        </div>
                        <p className="text-xs text-[#6B7280]">
                          NC-2024-003 requiere atención inmediata
                        </p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl p-3 cursor-pointer">
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-bold text-[#1E3A8A]">Auditoría Programada</p>
                          <span className="text-[10px] text-muted-foreground">Hace 2 h</span>
                        </div>
                        <p className="text-xs text-[#6B7280]">
                          AUD-2024-004 inicia el 15 de noviembre
                        </p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl p-3 cursor-pointer">
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-bold text-[#1E3A8A]">Documento Aprobado</p>
                          <span className="text-[10px] text-muted-foreground">Hace 4 h</span>
                        </div>
                        <p className="text-xs text-[#6B7280]">
                          Manual de Calidad Rev. 3.0 aprobado
                        </p>
                      </div>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="mx-2" />
                  <DropdownMenuItem className="justify-center text-sm font-medium text-[#2563EB] rounded-xl hover:bg-[#E0EDFF]">
                    Ver todas las notificaciones
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </header>
  );
}
