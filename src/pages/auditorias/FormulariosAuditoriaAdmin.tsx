import React, { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CampoFormulario,
  FormularioDinamico,
  formularioDinamicoService,
} from "@/services/formulario-dinamico.service";
import { procesoService, Proceso } from "@/services/proceso.service";

type FormularioFormState = {
  codigo: string;
  nombre: string;
  descripcion: string;
  modulo: string;
  entidadTipo: string;
  procesoId: string;
  activo: boolean;
};

type CampoFormState = {
  nombre: string;
  etiqueta: string;
  tipoCampo: string;
  requerido: boolean;
  orden: number;
  activo: boolean;
  opcionesRaw: string;
};

const initialFormularioState: FormularioFormState = {
  codigo: "",
  nombre: "",
  descripcion: "",
  modulo: "auditorias",
  entidadTipo: "auditoria",
  procesoId: "",
  activo: true,
};

const initialCampoState: CampoFormState = {
  nombre: "",
  etiqueta: "",
  tipoCampo: "text",
  requerido: false,
  orden: 1,
  activo: true,
  opcionesRaw: "",
};

export default function FormulariosAuditoriaAdmin() {
  const [loading, setLoading] = useState(true);
  const [savingFormulario, setSavingFormulario] = useState(false);
  const [savingCampo, setSavingCampo] = useState(false);

  const [formularios, setFormularios] = useState<FormularioDinamico[]>([]);
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [selectedFormularioId, setSelectedFormularioId] = useState<string>("");
  const [campos, setCampos] = useState<CampoFormulario[]>([]);

  const [showFormularioDialog, setShowFormularioDialog] = useState(false);
  const [editingFormulario, setEditingFormulario] = useState<FormularioDinamico | null>(null);
  const [formularioForm, setFormularioForm] = useState<FormularioFormState>(initialFormularioState);

  const [showCampoDialog, setShowCampoDialog] = useState(false);
  const [editingCampo, setEditingCampo] = useState<CampoFormulario | null>(null);
  const [campoForm, setCampoForm] = useState<CampoFormState>(initialCampoState);

  const selectedFormulario = useMemo(
    () => formularios.find((item) => item.id === selectedFormularioId) || null,
    [formularios, selectedFormularioId]
  );

  useEffect(() => {
    cargarFormularios();
  }, []);

  useEffect(() => {
    if (selectedFormularioId) {
      cargarCampos(selectedFormularioId);
      return;
    }
    setCampos([]);
  }, [selectedFormularioId]);

  const cargarFormularios = async () => {
    try {
      setLoading(true);
      const [data, procesosData] = await Promise.all([
        formularioDinamicoService.getFormularios({
          modulo: "auditorias",
          entidadTipo: "auditoria",
          limit: 200,
        }),
        procesoService.listar({ limit: 300 }),
      ]);
      setFormularios(data);
      setProcesos(Array.isArray(procesosData) ? procesosData : []);
      if (!selectedFormularioId && data.length > 0) {
        setSelectedFormularioId(data[0].id);
      } else if (selectedFormularioId && !data.find((f) => f.id === selectedFormularioId)) {
        setSelectedFormularioId(data[0]?.id || "");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "No se pudieron cargar formularios");
    } finally {
      setLoading(false);
    }
  };

  const cargarCampos = async (formularioId: string) => {
    try {
      const data = await formularioDinamicoService.getCampos({ formularioId });
      setCampos(data);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "No se pudieron cargar campos");
    }
  };

  const openCrearFormulario = () => {
    setEditingFormulario(null);
    setFormularioForm(initialFormularioState);
    setShowFormularioDialog(true);
  };

  const openEditarFormulario = (formulario: FormularioDinamico) => {
    setEditingFormulario(formulario);
    setFormularioForm({
      codigo: formulario.codigo,
      nombre: formulario.nombre,
      descripcion: formulario.descripcion || "",
      modulo: formulario.modulo,
      entidadTipo: formulario.entidadTipo,
      procesoId: formulario.procesoId || "",
      activo: formulario.activo,
    });
    setShowFormularioDialog(true);
  };

  const guardarFormulario = async () => {
    if (!formularioForm.codigo.trim() || !formularioForm.nombre.trim()) {
      toast.error("Código y nombre son obligatorios");
      return;
    }

    try {
      setSavingFormulario(true);
      if (editingFormulario) {
        await formularioDinamicoService.actualizarFormulario(editingFormulario.id, {
          nombre: formularioForm.nombre.trim(),
          descripcion: formularioForm.descripcion.trim() || undefined,
          modulo: formularioForm.modulo.trim(),
          entidadTipo: formularioForm.entidadTipo.trim(),
          procesoId: formularioForm.procesoId || undefined,
          activo: formularioForm.activo,
        });
        toast.success("Formulario actualizado");
      } else {
        const created = await formularioDinamicoService.crearFormulario({
          codigo: formularioForm.codigo.trim(),
          nombre: formularioForm.nombre.trim(),
          descripcion: formularioForm.descripcion.trim() || undefined,
          modulo: formularioForm.modulo.trim(),
          entidadTipo: formularioForm.entidadTipo.trim(),
          procesoId: formularioForm.procesoId || undefined,
          activo: formularioForm.activo,
        });
        setSelectedFormularioId(created.id);
        toast.success("Formulario creado");
      }
      setShowFormularioDialog(false);
      await cargarFormularios();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "No se pudo guardar el formulario");
    } finally {
      setSavingFormulario(false);
    }
  };

  const eliminarFormulario = async (formulario: FormularioDinamico) => {
    if (!window.confirm(`¿Eliminar el formulario "${formulario.nombre}"?`)) return;
    try {
      await formularioDinamicoService.eliminarFormulario(formulario.id);
      toast.success("Formulario eliminado");
      await cargarFormularios();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "No se pudo eliminar el formulario");
    }
  };

  const openCrearCampo = () => {
    if (!selectedFormularioId) {
      toast.error("Selecciona primero un formulario");
      return;
    }
    setEditingCampo(null);
    setCampoForm({
      ...initialCampoState,
      orden: campos.length + 1,
    });
    setShowCampoDialog(true);
  };

  const openEditarCampo = (campo: CampoFormulario) => {
    setEditingCampo(campo);
    setCampoForm({
      nombre: campo.nombre,
      etiqueta: campo.etiqueta,
      tipoCampo: campo.tipoCampo,
      requerido: campo.requerido,
      orden: campo.orden,
      activo: campo.activo,
      opcionesRaw: campo.opciones ? JSON.stringify(campo.opciones, null, 2) : "",
    });
    setShowCampoDialog(true);
  };

  const parseOpciones = (raw: string) => {
    const value = raw.trim();
    if (!value) return undefined;
    try {
      return JSON.parse(value);
    } catch {
      throw new Error("El JSON de opciones no es válido");
    }
  };

  const guardarCampo = async () => {
    if (!selectedFormularioId) {
      toast.error("Selecciona un formulario");
      return;
    }
    if (!campoForm.nombre.trim() || !campoForm.etiqueta.trim()) {
      toast.error("Nombre y etiqueta son obligatorios");
      return;
    }

    try {
      setSavingCampo(true);
      const opciones = parseOpciones(campoForm.opcionesRaw);
      const payload = {
        formularioId: selectedFormularioId,
        nombre: campoForm.nombre.trim(),
        etiqueta: campoForm.etiqueta.trim(),
        tipoCampo: campoForm.tipoCampo,
        requerido: campoForm.requerido,
        orden: Number(campoForm.orden) || 1,
        activo: campoForm.activo,
        opciones,
      };

      if (editingCampo) {
        await formularioDinamicoService.actualizarCampo(editingCampo.id, payload);
        toast.success("Campo actualizado");
      } else {
        await formularioDinamicoService.crearCampo(payload);
        toast.success("Campo creado");
      }

      setShowCampoDialog(false);
      await cargarCampos(selectedFormularioId);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "No se pudo guardar el campo");
    } finally {
      setSavingCampo(false);
    }
  };

  const eliminarCampo = async (campo: CampoFormulario) => {
    if (!window.confirm(`¿Eliminar el campo "${campo.etiqueta}"?`)) return;
    try {
      await formularioDinamicoService.eliminarCampo(campo.id);
      toast.success("Campo eliminado");
      await cargarCampos(selectedFormularioId);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "No se pudo eliminar el campo");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A8A]">Formularios Dinámicos de Auditoría</h1>
          <p className="text-sm text-gray-500">
            Administra formularios y campos para checklists sin tocar la base de datos manualmente.
          </p>
        </div>
        <Button onClick={openCrearFormulario} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo formulario
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Formularios</CardTitle>
            <CardDescription>Catálogo para módulo auditorías</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : formularios.length === 0 ? (
              <p className="text-sm text-gray-500">No hay formularios registrados.</p>
            ) : (
              formularios.map((formulario) => (
                <div
                  key={formulario.id}
                  className={`border rounded-lg p-3 ${
                    selectedFormularioId === formulario.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <button
                      className="text-left flex-1"
                      onClick={() => setSelectedFormularioId(formulario.id)}
                    >
                      <p className="font-medium text-gray-900">{formulario.nombre}</p>
                      <p className="text-xs text-gray-500">{formulario.codigo}</p>
                      <div className="mt-2">
                        <Badge variant={formulario.activo ? "default" : "secondary"}>
                          {formulario.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </button>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditarFormulario(formulario)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => eliminarFormulario(formulario)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Campos del Formulario</CardTitle>
              <CardDescription>
                {selectedFormulario
                  ? `${selectedFormulario.nombre} (${campos.length} campos)`
                  : "Selecciona un formulario para administrar campos"}
              </CardDescription>
            </div>
            <Button onClick={openCrearCampo} disabled={!selectedFormularioId} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo campo
            </Button>
          </CardHeader>
          <CardContent>
            {!selectedFormularioId ? (
              <p className="text-sm text-gray-500">No hay formulario seleccionado.</p>
            ) : campos.length === 0 ? (
              <p className="text-sm text-gray-500">Este formulario aún no tiene campos.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Orden</TableHead>
                    <TableHead>Etiqueta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Req.</TableHead>
                    <TableHead>Activo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campos.map((campo) => (
                    <TableRow key={campo.id}>
                      <TableCell>{campo.orden}</TableCell>
                      <TableCell className="font-medium">{campo.etiqueta}</TableCell>
                      <TableCell>{campo.tipoCampo}</TableCell>
                      <TableCell>{campo.requerido ? "Sí" : "No"}</TableCell>
                      <TableCell>{campo.activo ? "Sí" : "No"}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEditarCampo(campo)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => eliminarCampo(campo)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showFormularioDialog} onOpenChange={setShowFormularioDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFormulario ? "Editar formulario" : "Nuevo formulario"}</DialogTitle>
            <DialogDescription>Define la plantilla que se usará en auditorías.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label>Código</Label>
              <Input
                value={formularioForm.codigo}
                disabled={Boolean(editingFormulario)}
                onChange={(e) => setFormularioForm((prev) => ({ ...prev, codigo: e.target.value }))}
                placeholder="CHK-AUD-ISO9001"
              />
            </div>
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input
                value={formularioForm.nombre}
                onChange={(e) => setFormularioForm((prev) => ({ ...prev, nombre: e.target.value }))}
                placeholder="Checklist Auditoría ISO 9001"
              />
            </div>
            <div className="space-y-1">
              <Label>Descripción</Label>
              <Textarea
                value={formularioForm.descripcion}
                onChange={(e) => setFormularioForm((prev) => ({ ...prev, descripcion: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Módulo</Label>
                <Input
                  value={formularioForm.modulo}
                  onChange={(e) => setFormularioForm((prev) => ({ ...prev, modulo: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Entidad</Label>
                <Input
                  value={formularioForm.entidadTipo}
                  onChange={(e) => setFormularioForm((prev) => ({ ...prev, entidadTipo: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Proceso vinculado</Label>
              <select
                className="w-full p-2 border rounded-md bg-white"
                value={formularioForm.procesoId}
                onChange={(e) => setFormularioForm((prev) => ({ ...prev, procesoId: e.target.value }))}
              >
                <option value="">General (sin proceso específico)</option>
                {procesos.map((proceso) => (
                  <option key={proceso.id} value={proceso.id}>
                    {proceso.codigo} - {proceso.nombre}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formularioForm.activo}
                onChange={(e) => setFormularioForm((prev) => ({ ...prev, activo: e.target.checked }))}
              />
              Formulario activo
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormularioDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarFormulario} disabled={savingFormulario} className="gap-2">
              <Save className="h-4 w-4" />
              {savingFormulario ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCampoDialog} onOpenChange={setShowCampoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCampo ? "Editar campo" : "Nuevo campo"}</DialogTitle>
            <DialogDescription>Configura pregunta, tipo y validaciones del checklist.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label>Nombre técnico</Label>
              <Input
                value={campoForm.nombre}
                onChange={(e) => setCampoForm((prev) => ({ ...prev, nombre: e.target.value }))}
                placeholder="existe_politica_calidad"
              />
            </div>
            <div className="space-y-1">
              <Label>Etiqueta visible</Label>
              <Input
                value={campoForm.etiqueta}
                onChange={(e) => setCampoForm((prev) => ({ ...prev, etiqueta: e.target.value }))}
                placeholder="¿Existe política de calidad documentada?"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tipo de campo</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={campoForm.tipoCampo}
                  onChange={(e) => setCampoForm((prev) => ({ ...prev, tipoCampo: e.target.value }))}
                >
                  <option value="text">Texto</option>
                  <option value="textarea">Texto largo</option>
                  <option value="number">Número</option>
                  <option value="date">Fecha</option>
                  <option value="boolean">Booleano</option>
                  <option value="select">Select</option>
                  <option value="radio">Radio</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Orden</Label>
                <Input
                  type="number"
                  value={campoForm.orden}
                  onChange={(e) => setCampoForm((prev) => ({ ...prev, orden: Number(e.target.value) || 1 }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Opciones (JSON)</Label>
              <Textarea
                value={campoForm.opcionesRaw}
                onChange={(e) => setCampoForm((prev) => ({ ...prev, opcionesRaw: e.target.value }))}
                placeholder={'["Sí","No","N/A"] o [{"label":"Cumple","value":"cumple"}]'}
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={campoForm.requerido}
                  onChange={(e) => setCampoForm((prev) => ({ ...prev, requerido: e.target.checked }))}
                />
                Requerido
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={campoForm.activo}
                  onChange={(e) => setCampoForm((prev) => ({ ...prev, activo: e.target.checked }))}
                />
                Activo
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCampoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarCampo} disabled={savingCampo} className="gap-2">
              <Save className="h-4 w-4" />
              {savingCampo ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
