import { useEffect, useState } from "react";
import { FileText, Eye, Search, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { riesgoService, Riesgo } from "@/services/riesgo.service";

export default function TratamientoRiesgos() {
  const [riesgos, setRiesgos] = useState<Riesgo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRiesgo, setSelectedRiesgo] = useState<Riesgo | null>(null);

  useEffect(() => {
    fetchRiesgos();
  }, []);

  const fetchRiesgos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await riesgoService.getAll();
      setRiesgos(data);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getNivelRiesgoColor = (nivel?: number) => {
    if (!nivel) return "bg-gray-500";
    if (nivel >= 15) return "bg-red-600";
    if (nivel >= 10) return "bg-red-500";
    if (nivel >= 5) return "bg-amber-500";
    return "bg-green-500";
  };

  const getNivelRiesgoLabel = (nivel?: number) => {
    if (!nivel) return "Sin evaluar";
    if (nivel >= 15) return "Crítico";
    if (nivel >= 10) return "Alto";
    if (nivel >= 5) return "Medio";
    return "Bajo";
  };

  const getEstadoBadge = (estado?: string) => {
    const estados: Record<string, { icon: any; class: string }> = {
      identificado: { icon: AlertCircle, class: "bg-blue-500" },
      en_tratamiento: { icon: FileText, class: "bg-amber-500" },
      mitigado: { icon: CheckCircle2, class: "bg-green-500" },
      aceptado: { icon: XCircle, class: "bg-gray-500" },
    };
    const config = estados[estado || ""] || { icon: AlertCircle, class: "bg-gray-500" };
    const Icon = config.icon;
    return (
      <Badge className={`${config.class} flex items-center gap-1 w-fit`}>
        <Icon className="h-3 w-3" />
        {estado || "Sin estado"}
      </Badge>
    );
  };

  const handleViewRiesgo = (riesgo: Riesgo) => {
    setSelectedRiesgo(riesgo);
    setShowDialog(true);
  };

  const filteredRiesgos = riesgos.filter(
    (riesgo) =>
      riesgo.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      riesgo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      riesgo.tratamiento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estadísticas
  const totalRiesgos = riesgos.length;
  const conTratamiento = riesgos.filter(r => r.tratamiento).length;
  const enTratamiento = riesgos.filter(r => r.estado === "en_tratamiento").length;
  const mitigados = riesgos.filter(r => r.estado === "mitigado").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-gray-500">Cargando tratamientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-sky-500" />
            Tratamiento de Riesgos
          </h1>
          <p className="text-gray-500">
            Gestione cómo abordar cada riesgo
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
                  onClick={fetchRiesgos}
                >
                  Intentar nuevamente
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de resumen */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Riesgos</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{totalRiesgos}</div>
          </CardHeader>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-800">Con Tratamiento</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-700">{conTratamiento}</div>
          </CardHeader>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-amber-800">En Tratamiento</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">{enTratamiento}</div>
          </CardHeader>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-800">Mitigados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-700">{mitigados}</div>
          </CardHeader>
        </Card>
      </div>

      {/* Lista de tratamientos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plan de Tratamiento de Riesgos</CardTitle>
              <CardDescription>
                Estrategias definidas para gestionar cada riesgo identificado
              </CardDescription>
            </div>
            <div className="w-72">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar riesgos..."
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
                    <th className="text-left p-3 text-sm font-medium w-28">Código</th>
                    <th className="text-left p-3 text-sm font-medium">Riesgo</th>
                    <th className="text-left p-3 text-sm font-medium">Tratamiento</th>
                    <th className="text-left p-3 text-sm font-medium w-32">Nivel</th>
                    <th className="text-left p-3 text-sm font-medium w-32">Estado</th>
                    <th className="text-right p-3 text-sm font-medium w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRiesgos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-12 text-gray-500">
                        {searchTerm ? "No se encontraron resultados" : "No hay riesgos registrados"}
                      </td>
                    </tr>
                  ) : (
                    filteredRiesgos.map((riesgo) => (
                      <tr key={riesgo.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{riesgo.codigo}</td>
                        <td className="p-3">
                          <div className="max-w-xs">
                            <p className="line-clamp-2">
                              {riesgo.descripcion || "Sin descripción"}
                            </p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="max-w-md">
                            {riesgo.tratamiento ? (
                              <p className="line-clamp-2 text-sm">
                                {riesgo.tratamiento}
                              </p>
                            ) : (
                              <span className="text-sm text-gray-400">Sin tratamiento definido</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={getNivelRiesgoColor(riesgo.nivelRiesgo)}>
                            {getNivelRiesgoLabel(riesgo.nivelRiesgo)}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {getEstadoBadge(riesgo.estado)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleViewRiesgo(riesgo)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de detalles */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Tratamiento</DialogTitle>
          </DialogHeader>

          {selectedRiesgo && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-500">Código</Label>
                  <p className="font-bold text-lg">{selectedRiesgo.codigo}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getNivelRiesgoColor(selectedRiesgo.nivelRiesgo)}>
                    {getNivelRiesgoLabel(selectedRiesgo.nivelRiesgo)}
                  </Badge>
                  {getEstadoBadge(selectedRiesgo.estado)}
                </div>
              </div>

              <div>
                <Label className="text-gray-500">Descripción del Riesgo</Label>
                <p className="mt-1">{selectedRiesgo.descripcion || "Sin descripción"}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-500">Probabilidad</Label>
                  <p className="font-semibold text-lg">{selectedRiesgo.probabilidad || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Impacto</Label>
                  <p className="font-semibold text-lg">{selectedRiesgo.impacto || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Nivel</Label>
                  <p className="font-semibold text-lg">{selectedRiesgo.nivelRiesgo || "N/A"}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-500">Plan de Tratamiento</Label>
                {selectedRiesgo.tratamiento ? (
                  <p className="mt-1">{selectedRiesgo.tratamiento}</p>
                ) : (
                  <p className="mt-1 text-gray-400 italic">No se ha definido un plan de tratamiento</p>
                )}
              </div>

              {selectedRiesgo.tipo && (
                <div>
                  <Label className="text-gray-500">Tipo de Riesgo</Label>
                  <p className="font-medium mt-1">{selectedRiesgo.tipo}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                {selectedRiesgo.fechaIdentificacion && (
                  <div>
                    <Label className="text-gray-500">Fecha de Identificación</Label>
                    <p className="font-medium mt-1">
                      {new Date(selectedRiesgo.fechaIdentificacion).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                )}
                {selectedRiesgo.fechaRevision && (
                  <div>
                    <Label className="text-gray-500">Próxima Revisión</Label>
                    <p className="font-medium mt-1">
                      {new Date(selectedRiesgo.fechaRevision).toLocaleDateString("es-CO")}
                    </p>
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