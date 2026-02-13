import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { noConformidadService, NoConformidad } from "@/services/noConformidad.service";
import { default as procesoService, Proceso } from "@/services/proceso.service";
import { apiClient } from "@/lib/api";

interface NuevaNoConformidadFormProps {
    onSuccess: () => void;
    onCancel?: () => void;
    initialData?: NoConformidad | null;
}

interface Usuario {
    id: string;
    nombre: string;
    primerApellido: string;
}

export function NuevaNoConformidadForm({ onSuccess, onCancel, initialData }: NuevaNoConformidadFormProps) {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [procesos, setProcesos] = useState<Proceso[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        codigo: "",
        tipo: "",
        descripcion: "",
        fuente: "",
        gravedad: "",
        fecha_deteccion: new Date().toISOString().split("T")[0],
        responsable_id: "",
        proceso_id: "",
        detectado_por: "",
        analisis_causa: "",
        plan_accion: "",
    });

    useEffect(() => {
        fetchUsuarios();
        fetchProcesos();
        if (initialData) {
            setFormData({
                codigo: initialData.codigo,
                tipo: initialData.tipo || "",
                descripcion: initialData.descripcion,
                fuente: (initialData as any).fuente || "",
                gravedad: initialData.gravedad || "",
                fecha_deteccion: initialData.fecha_deteccion ? new Date(initialData.fecha_deteccion).toISOString().split('T')[0] : new Date().toISOString().split("T")[0],
                responsable_id: initialData.responsable?.id || initialData.responsable_id || "",
                proceso_id: initialData.proceso?.id || initialData.proceso_id || "",
                detectado_por: initialData.detector?.id || initialData.detectado_por || "",
                analisis_causa: initialData.analisis_causa || "",
                plan_accion: initialData.plan_accion || "",
            });
        }
    }, [initialData]);

    const fetchProcesos = async () => {
        try {
            const data = await procesoService.listar(); // Ensure listar returns Proceso[] or check response structure
            if (Array.isArray(data)) {
                setProcesos(data);
            } else if ((data as any).data && Array.isArray((data as any).data)) {
                setProcesos((data as any).data);
            } else {
                setProcesos([]); // Fallback
            }
        } catch (error) {
            console.error("Error fetching procesos:", error);
        }
    };

    const fetchUsuarios = async () => {
        try {
            const response = await apiClient.get("/usuarios");
            setUsuarios(response.data);
        } catch (error) {
            console.error("Error fetching usuarios:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.codigo || !formData.tipo || !formData.descripcion || !formData.fuente || !formData.gravedad) {
            setError("Por favor completa los campos obligatorios");
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const payload = {
                ...formData,
                fecha_deteccion: new Date(formData.fecha_deteccion).toISOString(),
                responsable_id: formData.responsable_id && formData.responsable_id !== "none" ? formData.responsable_id : undefined,
                proceso_id: formData.proceso_id && formData.proceso_id !== "none" ? formData.proceso_id : undefined,
                detectado_por: formData.detectado_por && formData.detectado_por !== "none" ? formData.detectado_por : undefined,
                analisis_causa: formData.analisis_causa || undefined,
                plan_accion: formData.plan_accion || undefined,
            };

            if (initialData) {
                await noConformidadService.update(initialData.id, payload);
                toast.success("No conformidad actualizada correctamente");
            } else {
                await noConformidadService.create(payload);
                toast.success("No conformidad creada correctamente");
            }
            onSuccess();
        } catch (error: any) {
            console.error("Error saving no conformidad:", error);
            setError(error.message || "Error al guardar la no conformidad");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="codigo">Código *</Label>
                    <Input
                        id="codigo"
                        placeholder="Ej: NC-2024-001"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                        value={formData.tipo}
                        onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Proceso">Proceso</SelectItem>
                            <SelectItem value="Producto">Producto</SelectItem>
                            <SelectItem value="Servicio">Servicio</SelectItem>
                            <SelectItem value="Auditoría">Auditoría</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="fuente">Fuente *</Label>
                    <Select
                        value={formData.fuente}
                        onValueChange={(value) => setFormData({ ...formData, fuente: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona fuente" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Interna">Interna</SelectItem>
                            <SelectItem value="Externa">Externa</SelectItem>
                            <SelectItem value="Cliente">Cliente</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="gravedad">Gravedad *</Label>
                    <Select
                        value={formData.gravedad}
                        onValueChange={(value) => setFormData({ ...formData, gravedad: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona gravedad" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Menor">Menor</SelectItem>
                            <SelectItem value="Media">Media</SelectItem>
                            <SelectItem value="Mayor">Mayor</SelectItem>
                            <SelectItem value="Critica">Critica</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="fecha_deteccion">Fecha Detección *</Label>
                    <Input
                        id="fecha_deteccion"
                        type="date"
                        value={formData.fecha_deteccion}
                        onChange={(e) => setFormData({ ...formData, fecha_deteccion: e.target.value })}
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="responsable_id">Responsable</Label>
                    <Select
                        value={formData.responsable_id}
                        onValueChange={(value) => setFormData({ ...formData, responsable_id: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona responsable" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Sin asignar</SelectItem>
                            {usuarios.map((u) => (
                                <SelectItem key={u.id} value={u.id}>
                                    {u.nombre} {u.primerApellido}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="proceso_id">Proceso Relacionado</Label>
                    <Select
                        value={formData.proceso_id}
                        onValueChange={(value) => setFormData({ ...formData, proceso_id: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona proceso" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Ninguno</SelectItem>
                            {procesos.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.nombre} {p.codigo ? `(${p.codigo})` : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="detectado_por">Detectado Por</Label>
                    <Select
                        value={formData.detectado_por}
                        onValueChange={(value) => setFormData({ ...formData, detectado_por: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona usuario" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Sin asignar</SelectItem>
                            {usuarios.map((u) => (
                                <SelectItem key={u.id} value={u.id}>
                                    {u.nombre} {u.primerApellido}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                    id="descripcion"
                    placeholder="Describe la no conformidad..."
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    required
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="analisis_causa">Análisis de Causa</Label>
                <Textarea
                    id="analisis_causa"
                    placeholder="Análisis de la causa raíz..."
                    rows={3}
                    value={formData.analisis_causa}
                    onChange={(e) => setFormData({ ...formData, analisis_causa: e.target.value })}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="plan_accion">Plan de Acción</Label>
                <Textarea
                    id="plan_accion"
                    placeholder="Detalles del plan de acción..."
                    rows={3}
                    value={formData.plan_accion}
                    onChange={(e) => setFormData({ ...formData, plan_accion: e.target.value })}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onCancel?.()}
                    disabled={saving}
                >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                    {saving ? (
                        <>Guardando...</>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
