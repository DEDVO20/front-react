import { useState, useEffect } from "react";
import { Save, X, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { accionCorrectivaService } from "@/services/accionCorrectiva.service";
import { noConformidadService } from "@/services/noConformidad.service";


interface NoConformidad {
  id: string;
  codigo: string;
  descripcion: string;
}

interface Usuario {
  id: string;
  nombre: string;
  primerApellido: string;
}

export default function NuevasAccionesCorrectivas() {
  const [noConformidades, setNoConformidades] = useState<NoConformidad[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    noConformidadId: "",
    codigo: "",
    tipo: "",
    descripcion: "",
    analisisCausaRaiz: "",
    planAccion: "",
    responsableId: "",
    fechaCompromiso: "",
    fechaImplementacion: "",
    estado: "pendiente",
    observacion: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const noConformidadesData = await noConformidadService.getAll();
      const noConformidadesFormatted = noConformidadesData.map(nc => ({
        id: nc.id.toString(),
        codigo: nc.codigo,
        descripcion: nc.descripcion
      }));

      // Import apiClient locally if not imported at top, or just assumes it's available?
      // Better to import it at top. But for this chunk:
      const { apiClient } = await import("@/lib/api");
      const usuariosRes = await apiClient.get("/usuarios");
      const usuariosData = usuariosRes.data;

      setNoConformidades(noConformidadesFormatted);
      setUsuarios(usuariosData);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.noConformidadId || !formData.codigo || !formData.tipo) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    try {
      setSaving(true);
      await accionCorrectivaService.create(formData);
      alert("Acción correctiva creada exitosamente");

      // Limpiar formulario
      setFormData({
        noConformidadId: "",
        codigo: "",
        tipo: "",
        descripcion: "",
        analisisCausaRaiz: "",
        planAccion: "",
        responsableId: "",
        fechaCompromiso: "",
        fechaImplementacion: "",
        estado: "pendiente",
        observacion: "",
      });
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Error al crear acción correctiva");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("¿Estás seguro de cancelar? Se perderán los datos ingresados.")) {
      setFormData({
        noConformidadId: "",
        codigo: "",
        tipo: "",
        descripcion: "",
        analisisCausaRaiz: "",
        planAccion: "",
        responsableId: "",
        fechaCompromiso: "",
        fechaImplementacion: "",
        estado: "pendiente",
        observacion: "",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-sky-500" />
            Nueva Acción Correctiva
          </h1>
          <p className="text-gray-500">
            Registra una nueva acción correctiva asociada a una no conformidad
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
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información de la Acción Correctiva</CardTitle>
            <CardDescription>
              Completa todos los campos marcados con * para registrar la acción correctiva
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* No Conformidad */}
              <div className="grid gap-2">
                <Label htmlFor="noConformidadId">No Conformidad Asociada *</Label>
                <Select
                  value={formData.noConformidadId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, noConformidadId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una no conformidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {noConformidades.map((nc) => (
                      <SelectItem key={nc.id} value={nc.id}>
                        [{nc.codigo}] {nc.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Código */}
              <div className="grid gap-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  placeholder="Ej: AC-2024-001"
                  value={formData.codigo}
                  onChange={(e) =>
                    setFormData({ ...formData, codigo: e.target.value })
                  }
                  required
                />
              </div>

              {/* Tipo */}
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="correctiva">Correctiva</SelectItem>
                    <SelectItem value="preventiva">Preventiva</SelectItem>
                    <SelectItem value="mejora">Mejora</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Responsable */}
              <div className="grid gap-2">
                <Label htmlFor="responsableId">Responsable</Label>
                <Select
                  value={formData.responsableId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, responsableId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id}>
                        {usuario.nombre} {usuario.primerApellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha Compromiso */}
              <div className="grid gap-2">
                <Label htmlFor="fechaCompromiso">Fecha Compromiso</Label>
                <Input
                  id="fechaCompromiso"
                  type="date"
                  value={formData.fechaCompromiso}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaCompromiso: e.target.value })
                  }
                />
              </div>

              {/* Fecha Implementación */}
              <div className="grid gap-2">
                <Label htmlFor="fechaImplementacion">Fecha Implementación</Label>
                <Input
                  id="fechaImplementacion"
                  type="date"
                  value={formData.fechaImplementacion}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaImplementacion: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe la acción correctiva..."
                rows={3}
                value={formData.descripcion}
                onChange={(e: { target: { value: any; }; }) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
              />
            </div>

            {/* Análisis de Causa Raíz */}
            <div className="grid gap-2">
              <Label htmlFor="analisisCausaRaiz">Análisis de Causa Raíz</Label>
              <Textarea
                id="analisisCausaRaiz"
                placeholder="Describe el análisis de la causa raíz..."
                rows={4}
                value={formData.analisisCausaRaiz}
                onChange={(e: { target: { value: any; }; }) =>
                  setFormData({ ...formData, analisisCausaRaiz: e.target.value })
                }
              />
            </div>

            {/* Plan de Acción */}
            <div className="grid gap-2">
              <Label htmlFor="planAccion">Plan de Acción</Label>
              <Textarea
                id="planAccion"
                placeholder="Detalla el plan de acción..."
                rows={4}
                value={formData.planAccion}
                onChange={(e: { target: { value: any; }; }) =>
                  setFormData({ ...formData, planAccion: e.target.value })
                }
              />
            </div>

            {/* Observaciones */}
            <div className="grid gap-2">
              <Label htmlFor="observacion">Observaciones</Label>
              <Textarea
                id="observacion"
                placeholder="Observaciones adicionales..."
                rows={3}
                value={formData.observacion}
                onChange={(e: { target: { value: any; }; }) =>
                  setFormData({ ...formData, observacion: e.target.value })
                }
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={saving}
              >
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
                    Crear Acción Correctiva
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}