import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, Home } from "lucide-react";
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
import { useLocation, Link } from "react-router-dom";

export function SiteHeader() {
  const location = useLocation();

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
    if (path.includes("/riesgos")) return "Riesgos";
    if (path.includes("/indicadores")) return "Indicadores";
    if (path.includes("/capacitaciones")) return "Capacitaciones";
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
              className="w-64 pl-8 h-9"
            />
          </div>

          {/* Notificaciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative h-9 w-9"
              >
                <Bell className="h-4 w-4" />
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Nueva No Conformidad</p>
                  <p className="text-xs text-muted-foreground">
                    NC-2024-003 requiere atención inmediata
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hace 5 minutos
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Auditoría Programada</p>
                  <p className="text-xs text-muted-foreground">
                    AUD-2024-004 inicia el 15 de noviembre
                  </p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Documento Aprobado</p>
                  <p className="text-xs text-muted-foreground">
                    Manual de Calidad Rev. 3.0 aprobado
                  </p>
                  <p className="text-xs text-muted-foreground">Hace 4 horas</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-sm">
                Ver todas las notificaciones
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
