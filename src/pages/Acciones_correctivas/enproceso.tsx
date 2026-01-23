import { useEffect, useState } from "react";
import { ClipboardList, Search, Eye, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";



import { accionCorrectivaService, AccionCorrectiva } from "@/services/accionCorrectiva.service";

export default function EnProcesoAccionesCorrectivas() {
  const [acciones, setAcciones] = useState<AccionCorrectiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAccion, setSelectedAccion] = useState<AccionCorrectiva | null>(null);

  useEffect(() => {
    fetchAcciones();
  }, []);

  const fetchAcciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const enProceso = await accionCorrectivaService.getEnProceso();
      setAcciones(enProceso);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (accion: AccionCorrectiva) => {
    setSelectedAccion(accion);
    setShowDialog(true);
  };

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pendiente: { label: "Pendiente", variant: "secondary" },
      en_proceso: { label: "En Proceso", variant: "default" },
      en_ejecucion: { label: "En Ejecución", variant: "default" },
    };

    const config = estados[estado] || { label: estado, variant: "outline" };
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const tipos: Record<string, string> = {
      correctiva: "Correctiva",
      preventiva: "Preventiva",
      mejora: "Mejora",
    };

    return tipos[tipo] || tipo;
  };

  const filteredAcciones = acciones.filter(
    (accion) =>
      accion.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accion.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accion.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-gray-500">Cargando acciones en proceso...</p>
        </div>
      </div>
    );
  }

  const totalEnProceso = acciones.length;
  const porVencer = acciones.filter(a => {
    if (!a.fechaCompromiso) return false;
    const diff = new Date(a.fechaCompromiso).getTime() - new Date().getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days <= 7 && days > 0;
  }).length;
  const vencidas = acciones.filter(a => {
    if (!a.fechaCompromiso) return false;
    return new Date(a.fechaCompromiso) < new Date();
  }).length;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-sky-500" />
            Acciones Correctivas en Proceso
          </h1>
          <p className="text-gray-500">
            {totalEnProceso} {totalEnProceso === 1 ? "acción en proceso" : "acciones en proceso"}
          </p>
        </div>
      </div>

      {error && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Error de conexión</p>
                <p className="text-sm">{error}</p>
                <button
                  className="text-sm underline mt-1 inline-block"
                  onClick={fetchAcciones}
                >
                  Intentar nuevamente
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total En Proceso</CardTitle>
              <ClipboardList className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{totalEnProceso}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Por Vencer (7 días)</CardTitle>
              <Calendar className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold">{porVencer}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold">{vencidas}</div>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Listado de Acciones en Proceso</CardTitle>
              <CardDescription>
                Gestiona y da seguimiento a las acciones correctivas en curso
              </CardDescription>
            </div>
            <div className="w-72">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar por código o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium w-32">Código</th>
                    <th className="text-left p-3 text-sm font-medium w-28">Tipo</th>
                    <th className="text-left p-3 text-sm font-medium">Descripción</th>
                    <th className="text-left p-3 text-sm font-medium w-32">Fecha Compromiso</th>
                    <th className="text-left p-3 text-sm font-medium w-32">Estado</th>
                    <th className="text-right p-3 text-sm font-medium w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAcciones.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-12 text-gray-500">
                        {searchTerm
                          ? "No se encontraron resultados"
                          : "No hay acciones correctivas en proceso"}
                      </td>
                    </tr>
                  ) : (
                    filteredAcciones.map((accion) => {
                      const isVencida = accion.fechaCompromiso &&
                        new Date(accion.fechaCompromiso) < new Date();

                      return (
                        <tr key={accion.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{accion.codigo}</td>
                          <td className="p-3">
                            <span className="text-sm text-gray-600">
                              {getTipoBadge(accion.tipo)}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="max-w-md">
                              <p className="line-clamp-2">
                                {accion.descripcion || "Sin descripción"}
                              </p>
                            </div>
                          </td>
                          <td className="p-3">
                            {accion.fechaCompromiso ? (
                              <div className="flex items-center gap-1">
                                {isVencida && (
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className={isVencida ? "text-red-600 font-medium" : "text-sm text-gray-600"}>
                                  {new Date(accion.fechaCompromiso).toLocaleDateString("es-CO")}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">No definida</span>
                            )}
                          </td>
                          <td className="p-3">
                            {getEstadoBadge(accion.estado)}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleView(accion)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Acción Correctiva</DialogTitle>
            <DialogDescription>
              Información completa de la acción correctiva en proceso
            </DialogDescription>
          </DialogHeader>

          {selectedAccion && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-500">Código</Label>
                    <p className="font-bold text-lg mt-1">{selectedAccion.codigo}</p>
                  </div>
                  <div className="flex gap-2">
                    {getEstadoBadge(selectedAccion.estado)}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Tipo</Label>
                    <p className="font-medium mt-1">{getTipoBadge(selectedAccion.tipo)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Fecha de Compromiso</Label>
                    <p className="font-medium mt-1">
                      {selectedAccion.fechaCompromiso
                        ? new Date(selectedAccion.fechaCompromiso).toLocaleDateString("es-CO")
                        : "No definida"}
                    </p>
                  </div>
                </div>

                {selectedAccion.descripcion && (
                  <div>
                    <Label className="text-gray-500">Descripción</Label>
                    <p className="mt-1 text-sm">{selectedAccion.descripcion}</p>
                  </div>
                )}

                {selectedAccion.analisisCausaRaiz && (
                  <div>
                    <Label className="text-gray-500">Análisis de Causa Raíz</Label>
                    <p className="mt-1 text-sm">{selectedAccion.analisisCausaRaiz}</p>
                  </div>
                )}

                {selectedAccion.planAccion && (
                  <div>
                    <Label className="text-gray-500">Plan de Acción</Label>
                    <p className="mt-1 text-sm">{selectedAccion.planAccion}</p>
                  </div>
                )}

                {selectedAccion.observacion && (
                  <div>
                    <Label className="text-gray-500">Observaciones</Label>
                    <p className="mt-1 text-sm">{selectedAccion.observacion}</p>
                  </div>
                )}
              </div>

              <div className="grid gap-2 pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Creada el:</span>
                  <span>{new Date(selectedAccion.creadoEn).toLocaleString("es-CO")}</span>
                </div>
                {selectedAccion.fechaImplementacion && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fecha de Implementación:</span>
                    <span>{new Date(selectedAccion.fechaImplementacion).toLocaleDateString("es-CO")}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}