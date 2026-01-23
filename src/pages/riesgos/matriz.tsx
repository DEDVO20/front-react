import { useEffect, useState } from "react";
import { AlertTriangle, Plus, Eye, Save, X } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_URL = "http://localhost:3000/api";

interface Riesgo {
  id: string;
  codigo: string;
  descripcion?: string;
  tipo?: string;
  procesoId?: string;
  areaId?: string;
  probabilidad?: number;
  impacto?: number;
  nivelRiesgo?: number;
  tratamiento?: string;
  responsableId?: string;
  estado?: string;
  fechaIdentificacion?: string;
  fechaRevision?: string;
  creadoEn: string;
}

export default function MatrizRiesgos() {
  const [riesgos, setRiesgos] = useState<Riesgo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedRiesgo, setSelectedRiesgo] = useState<Riesgo | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    codigo: "",
    descripcion: "",
    tipo: "",
    probabilidad: "",
    impacto: "",
    tratamiento: "",
    estado: "identificado",
    fechaIdentificacion: "",
  });

  useEffect(() => {
    fetchRiesgos();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const fetchRiesgos = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error("No hay sesión activa");
      }

      const response = await fetch(`${API_URL}/riesgos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar riesgos");
      }

      const data = await response.json();
      setRiesgos(data);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRiesgo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.codigo || !formData.probabilidad || !formData.impacto) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    try {
      setSaving(true);
      const token = getAuthToken();

      if (!token) {
        throw new Error("No hay sesión activa");
      }

      const probabilidad = parseInt(formData.probabilidad);
      const impacto = parseInt(formData.impacto);
      const nivelRiesgo = probabilidad * impacto;

      const response = await fetch(`${API_URL}/riesgos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          probabilidad,
          impacto,
          nivelRiesgo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al crear riesgo");
      }

      alert("Riesgo creado exitosamente");
      setShowNewDialog(false);
      setFormData({
        codigo: "",
        descripcion: "",
        tipo: "",
        probabilidad: "",
        impacto: "",
        tratamiento: "",
        estado: "identificado",
        fechaIdentificacion: "",
      });
      fetchRiesgos();
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Error al crear riesgo");
    } finally {
      setSaving(false);
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

  const getCeldasMatriz = (probabilidad: number, impacto: number) => {
    return riesgos.filter(
      (r) => r.probabilidad === probabilidad && r.impacto === impacto
    );
  };

  const handleViewRiesgo = (riesgo: Riesgo) => {
    setSelectedRiesgo(riesgo);
    setShowViewDialog(true);
  };

  // Estadísticas
  const totalRiesgos = riesgos.length;
  const riesgosCriticos = riesgos.filter((r) => (r.nivelRiesgo || 0) >= 15).length;
  const riesgosAltos = riesgos.filter((r) => (r.nivelRiesgo || 0) >= 10 && (r.nivelRiesgo || 0) < 15).length;
  const riesgosMedios = riesgos.filter((r) => (r.nivelRiesgo || 0) >= 5 && (r.nivelRiesgo || 0) < 10).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-gray-500">Cargando matriz de riesgos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-sky-500" />
            Matriz de Riesgos
          </h1>
          <p className="text-gray-500">Visualice todos los riesgos identificados</p>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Riesgo
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
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

      {/* Cards superiores */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Riesgos</CardTitle>
            <div className="text-3xl font-bold">{totalRiesgos}</div>
          </CardHeader>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-800">Críticos</CardTitle>
            <div className="text-3xl font-bold text-red-600">{riesgosCriticos}</div>
          </CardHeader>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-800">Altos</CardTitle>
            <div className="text-3xl font-bold text-orange-600">{riesgosAltos}</div>
          </CardHeader>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-800">Medios</CardTitle>
            <div className="text-3xl font-bold text-yellow-600">{riesgosMedios}</div>
          </CardHeader>
        </Card>
      </div>

      {/* Matriz */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Probabilidad vs Impacto</CardTitle>
          <CardDescription>
            Visualización de riesgos según su probabilidad e impacto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border bg-gray-100 p-3 w-24"></th>
                  {[1, 2, 3, 4, 5].map((impacto) => (
                    <th key={impacto} className="border bg-gray-100 p-3 text-center font-medium">
                      Impacto {impacto}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[5, 4, 3, 2, 1].map((probabilidad) => (
                  <tr key={probabilidad}>
                    <td className="border bg-gray-100 p-3 text-center font-medium">
                      Prob. {probabilidad}
                    </td>
                    {[1, 2, 3, 4, 5].map((impacto) => {
                      const nivel = probabilidad * impacto;
                      const riesgosEnCelda = getCeldasMatriz(probabilidad, impacto);
                      let bgColor = "bg-green-100";
                      if (nivel >= 15) bgColor = "bg-red-200";
                      else if (nivel >= 10) bgColor = "bg-orange-200";
                      else if (nivel >= 5) bgColor = "bg-yellow-100";

                      return (
                        <td
                          key={`${probabilidad}-${impacto}`}
                          className={`border p-3 ${bgColor} min-h-[100px] align-top`}
                        >
                          <div className="text-xs font-semibold mb-2">Nivel: {nivel}</div>
                          <div className="space-y-1">
                            {riesgosEnCelda.map((riesgo) => (
                              <div
                                key={riesgo.id}
                                className="text-xs bg-white p-2 rounded shadow cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleViewRiesgo(riesgo)}
                              >
                                <div className="font-medium">{riesgo.codigo}</div>
                                <div className="text-gray-600 truncate">
                                  {riesgo.descripcion?.substring(0, 30)}...
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Leyenda */}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="font-medium">Leyenda:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Bajo (1-4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Medio (5-9)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Alto (10-14)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span>Crítico (15-25)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listado */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Riesgos</CardTitle>
          <CardDescription>
            Todos los riesgos identificados en la organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Código</th>
                    <th className="text-left p-3 text-sm font-medium">Descripción</th>
                    <th className="text-left p-3 text-sm font-medium w-24">Prob.</th>
                    <th className="text-left p-3 text-sm font-medium w-24">Impacto</th>
                    <th className="text-left p-3 text-sm font-medium w-32">Nivel</th>
                    <th className="text-right p-3 text-sm font-medium w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {riesgos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-12 text-gray-500">
                        No hay riesgos registrados
                      </td>
                    </tr>
                  ) : (
                    riesgos.map((riesgo) => (
                      <tr key={riesgo.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{riesgo.codigo}</td>
                        <td className="p-3">{riesgo.descripcion || "Sin descripción"}</td>
                        <td className="p-3 text-center">{riesgo.probabilidad || "N/A"}</td>
                        <td className="p-3 text-center">{riesgo.impacto || "N/A"}</td>
                        <td className="p-3">
                          <Badge className={getNivelRiesgoColor(riesgo.nivelRiesgo)}>
                            {getNivelRiesgoLabel(riesgo.nivelRiesgo)}
                          </Badge>
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

      {/* Dialog Nuevo Riesgo */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nuevo Riesgo</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateRiesgo}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    placeholder="Ej: R-001"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operacional">Operacional</SelectItem>
                      <SelectItem value="financiero">Financiero</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="reputacional">Reputacional</SelectItem>
                      <SelectItem value="estrategico">Estratégico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe el riesgo..."
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="probabilidad">Probabilidad (1-5) *</Label>
                  <Select
                    value={formData.probabilidad}
                    onValueChange={(value) => setFormData({ ...formData, probabilidad: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Muy Baja</SelectItem>
                      <SelectItem value="2">2 - Baja</SelectItem>
                      <SelectItem value="3">3 - Media</SelectItem>
                      <SelectItem value="4">4 - Alta</SelectItem>
                      <SelectItem value="5">5 - Muy Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="impacto">Impacto (1-5) *</Label>
                  <Select
                    value={formData.impacto}
                    onValueChange={(value) => setFormData({ ...formData, impacto: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Muy Bajo</SelectItem>
                      <SelectItem value="2">2 - Bajo</SelectItem>
                      <SelectItem value="3">3 - Medio</SelectItem>
                      <SelectItem value="4">4 - Alto</SelectItem>
                      <SelectItem value="5">5 - Muy Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tratamiento">Tratamiento</Label>
                <Textarea
                  id="tratamiento"
                  placeholder="Plan de tratamiento..."
                  rows={3}
                  value={formData.tratamiento}
                  onChange={(e) => setFormData({ ...formData, tratamiento: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fechaIdentificacion">Fecha de Identificación</Label>
                <Input
                  id="fechaIdentificacion"
                  type="date"
                  value={formData.fechaIdentificacion}
                  onChange={(e) => setFormData({ ...formData, fechaIdentificacion: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewDialog(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Crear Riesgo
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Ver Detalles */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Riesgo</DialogTitle>
          </DialogHeader>

          {selectedRiesgo && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Código</p>
                  <p className="font-bold text-lg">{selectedRiesgo.codigo}</p>
                </div>
                <Badge className={getNivelRiesgoColor(selectedRiesgo.nivelRiesgo)}>
                  {getNivelRiesgoLabel(selectedRiesgo.nivelRiesgo)}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-gray-500">Descripción</p>
                <p className="mt-1">{selectedRiesgo.descripcion || "Sin descripción"}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Probabilidad</p>
                  <p className="font-semibold text-lg">{selectedRiesgo.probabilidad || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Impacto</p>
                  <p className="font-semibold text-lg">{selectedRiesgo.impacto || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nivel</p>
                  <p className="font-semibold text-lg">{selectedRiesgo.nivelRiesgo || "N/A"}</p>
                </div>
              </div>

              {selectedRiesgo.tratamiento && (
                <div>
                  <p className="text-sm text-gray-500">Tratamiento</p>
                  <p className="mt-1">{selectedRiesgo.tratamiento}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}