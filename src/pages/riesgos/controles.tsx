import { useEffect, useState } from "react";
import { Shield, Plus, Eye, Search, CheckCircle, AlertCircle, Save, X } from "lucide-react";
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

interface ControlRiesgo {
  id: string;
  riesgoId: string;
  descripcion?: string;
  tipo?: string;
  responsableId?: string;
  frecuencia?: string;
  efectividad?: string;
  creadoEn: string;
}

interface Riesgo {
  id: string;
  codigo: string;
  descripcion?: string;
}

export default function ControlesRiesgos() {
  const [controles, setControles] = useState<ControlRiesgo[]>([]);
  const [riesgos, setRiesgos] = useState<Riesgo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedControl, setSelectedControl] = useState<ControlRiesgo | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    riesgoId: "",
    descripcion: "",
    tipo: "",
    frecuencia: "",
    efectividad: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error("No hay sesión activa");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [controlesRes, riesgosRes] = await Promise.all([
        fetch(`${API_URL}/controles-riesgo`, { headers }),
        fetch(`${API_URL}/riesgos`, { headers }),
      ]);

      if (!controlesRes.ok || !riesgosRes.ok) {
        throw new Error("Error al cargar datos");
      }

      const [controlesData, riesgosData] = await Promise.all([
        controlesRes.json(),
        riesgosRes.json(),
      ]);

      setControles(controlesData);
      setRiesgos(riesgosData);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateControl = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.riesgoId || !formData.descripcion) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    try {
      setSaving(true);
      const token = getAuthToken();

      if (!token) {
        throw new Error("No hay sesión activa");
      }

      const response = await fetch(`${API_URL}/controles-riesgo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al crear control");
      }

      alert("Control creado exitosamente");
      setShowNewDialog(false);
      setFormData({
        riesgoId: "",
        descripcion: "",
        tipo: "",
        frecuencia: "",
        efectividad: "",
      });
      fetchData();
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Error al crear control");
    } finally {
      setSaving(false);
    }
  };

  const getTipoBadge = (tipo?: string) => {
    const tipos: Record<string, { label: string; class: string }> = {
      preventivo: { label: "Preventivo", class: "bg-blue-500" },
      correctivo: { label: "Correctivo", class: "bg-amber-500" },
      detectivo: { label: "Detectivo", class: "bg-purple-500" },
    };
    const config = tipos[tipo || ""] || { label: tipo || "Sin tipo", class: "bg-gray-500" };
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const getEfectividadBadge = (efectividad?: string) => {
    const efectividades: Record<string, { label: string; class: string }> = {
      alta: { label: "Alta", class: "bg-green-500" },
      media: { label: "Media", class: "bg-amber-500" },
      baja: { label: "Baja", class: "bg-red-500" },
    };
    const config = efectividades[efectividad || ""] || { label: efectividad || "N/A", class: "bg-gray-500" };
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const handleViewControl = (control: ControlRiesgo) => {
    setSelectedControl(control);
    setShowViewDialog(true);
  };

  const filteredControles = controles.filter(
    (control) =>
      control.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estadísticas
  const totalControles = controles.length;
  const controlesPreventivos = controles.filter((c) => c.tipo === "preventivo").length;
  const controlesCorrectivos = controles.filter((c) => c.tipo === "correctivo").length;
  const controlesAltaEfectividad = controles.filter((c) => c.efectividad === "alta").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-gray-500">Cargando controles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-sky-500" />
            Controles de Riesgos
          </h1>
          <p className="text-gray-500">Implemente medidas preventivas</p>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Control
        </Button>
      </div>

      {error && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Error de conexión</p>
                <p className="text-sm">{error}</p>
                <button className="text-sm underline mt-1 inline-block" onClick={fetchData}>
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
              <CardTitle className="text-sm font-medium">Total Controles</CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{totalControles}</div>
          </CardHeader>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-800">Preventivos</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-700">{controlesPreventivos}</div>
          </CardHeader>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-amber-800">Correctivos</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">{controlesCorrectivos}</div>
          </CardHeader>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-800">Alta Efectividad</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-700">{controlesAltaEfectividad}</div>
          </CardHeader>
        </Card>
      </div>

      {/* Lista de controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Controles Implementados</CardTitle>
              <CardDescription>Medidas preventivas y correctivas para mitigar riesgos</CardDescription>
            </div>
            <div className="w-72">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar controles..."
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
                    <th className="text-left p-3 text-sm font-medium">Descripción</th>
                    <th className="text-left p-3 text-sm font-medium w-32">Tipo</th>
                    <th className="text-left p-3 text-sm font-medium w-32">Frecuencia</th>
                    <th className="text-left p-3 text-sm font-medium w-32">Efectividad</th>
                    <th className="text-right p-3 text-sm font-medium w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredControles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-12 text-gray-500">
                        {searchTerm ? "No se encontraron resultados" : "No hay controles registrados"}
                      </td>
                    </tr>
                  ) : (
                    filteredControles.map((control) => (
                      <tr key={control.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="max-w-md">
                            <p className="line-clamp-2">{control.descripcion || "Sin descripción"}</p>
                          </div>
                        </td>
                        <td className="p-3">{getTipoBadge(control.tipo)}</td>
                        <td className="p-3">
                          <span className="text-sm">{control.frecuencia || "No definida"}</span>
                        </td>
                        <td className="p-3">{getEfectividadBadge(control.efectividad)}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleViewControl(control)}
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

      {/* Dialog Nuevo Control */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nuevo Control de Riesgo</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateControl}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="riesgoId">Riesgo Asociado *</Label>
                <Select
                  value={formData.riesgoId}
                  onValueChange={(value) => setFormData({ ...formData, riesgoId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un riesgo" />
                  </SelectTrigger>
                  <SelectContent>
                    {riesgos.map((riesgo) => (
                      <SelectItem key={riesgo.id} value={riesgo.id}>
                        [{riesgo.codigo}] {riesgo.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción del Control *</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe el control de riesgo..."
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo de Control</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventivo">Preventivo</SelectItem>
                      <SelectItem value="correctivo">Correctivo</SelectItem>
                      <SelectItem value="detectivo">Detectivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="frecuencia">Frecuencia</Label>
                  <Select
                    value={formData.frecuencia}
                    onValueChange={(value) => setFormData({ ...formData, frecuencia: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="continuo">Continuo</SelectItem>
                      <SelectItem value="diario">Diario</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensual">Mensual</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="efectividad">Efectividad</Label>
                <Select
                  value={formData.efectividad}
                  onValueChange={(value) => setFormData({ ...formData, efectividad: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona efectividad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
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
                    Crear Control
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Ver Detalles */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles del Control</DialogTitle>
          </DialogHeader>

          {selectedControl && (
            <div className="grid gap-4 py-4">
              <div>
                <Label className="text-gray-500">Descripción</Label>
                <p className="mt-1">{selectedControl.descripcion || "Sin descripción"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Tipo</Label>
                  <div className="mt-1">{getTipoBadge(selectedControl.tipo)}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Efectividad</Label>
                  <div className="mt-1">{getEfectividadBadge(selectedControl.efectividad)}</div>
                </div>
              </div>

              <div>
                <Label className="text-gray-500">Frecuencia</Label>
                <p className="mt-1 font-medium">{selectedControl.frecuencia || "No definida"}</p>
              </div>

              <div className="pt-2 border-t">
                <Label className="text-gray-500">Creado el</Label>
                <p className="mt-1">{new Date(selectedControl.creadoEn).toLocaleString("es-CO")}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}