import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import notificacionService, { Notificacion } from "@/services/notificacion.service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface NotificationBellProps {
  onOpenChange?: (open: boolean) => void;
}

export function NotificationBell({ onOpenChange }: NotificationBellProps) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Cargar notificaciones y contador
  const cargarNotificaciones = async () => {
    try {
      const [lista, count] = await Promise.all([
        notificacionService.getNotificaciones(false),
        notificacionService.getNoLeidas(),
      ]);
      setNotificaciones(lista.slice(0, 10)); // Solo las 10 más recientes
      setNoLeidas(count);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    }
  };

  useEffect(() => {
    cargarNotificaciones();

    // Actualizar cada 30 segundos
    const interval = setInterval(cargarNotificaciones, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarcarLeida = async (notificacion: Notificacion) => {
    try {
      if (!notificacion.leida) {
        await notificacionService.marcarComoLeida(notificacion.id);
        await cargarNotificaciones();
      }

      // Navegar según el tipo de referencia
      if (notificacion.referencia_tipo && notificacion.referencia_id) {
        const rutas: Record<string, string> = {
          ticket: `/mesa-ayuda?ticket_id=${notificacion.referencia_id}`,
          documento: `/documentos/${notificacion.referencia_id}`,
          auditoria: `/AuditoriasPlanificacion`, // Temporalmente a la lista principal
        };

        const ruta = rutas[notificacion.referencia_tipo];
        if (ruta) {
          navigate(ruta);
          setOpen(false);
        }
      }
    } catch (error: any) {
      console.error("Error marcando notificación:", error);

      // Manejar errores específicos
      if (error.response?.status === 403) {
        console.warn(`Notificación ${notificacion.id} no pertenece al usuario actual`);
        // Recargar notificaciones para actualizar la lista
        await cargarNotificaciones();
      } else if (error.response?.status === 404) {
        console.warn(`Notificación ${notificacion.id} no encontrada`);
        // Recargar notificaciones para actualizar la lista
        await cargarNotificaciones();
      } else {
        toast.error(error.response?.data?.detail || "Error al marcar notificación");
      }
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      await notificacionService.marcarTodasLeidas();
      await cargarNotificaciones();
      toast.success("Todas las notificaciones marcadas como leídas");
    } catch (error) {
      console.error("Error marcando todas como leídas:", error);
      toast.error("Error al marcar notificaciones");
    }
  };

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      asignacion: "📋",
      revision: "📝",
      aprobacion: "✅",
    };
    return icons[tipo] || "🔔";
  };

  return (
    <DropdownMenu open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      onOpenChange?.(isOpen);
    }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {noLeidas > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {noLeidas > 9 ? "9+" : noLeidas}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {noLeidas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarcarTodasLeidas}
              className="h-auto p-1 text-xs"
            >
              Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="h-[400px] overflow-y-auto">
          {notificaciones.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No tienes notificaciones
            </div>
          ) : (
            notificaciones.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${!notif.leida ? "bg-accent/50" : ""
                  }`}
                onClick={() => handleMarcarLeida(notif)}
              >
                <div className="flex items-start gap-2 w-full">
                  <span className="text-lg">{getTipoIcon(notif.tipo)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{notif.titulo}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notif.mensaje}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notif.creado_en), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                  {!notif.leida && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
