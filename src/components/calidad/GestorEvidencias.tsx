import { useState, useEffect } from 'react';
import { Plus, Trash2, Link as LinkIcon, ExternalLink, FileText, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Evidencia {
    id: string;
    url: string;
    descripcion: string;
    tipo: 'link' | 'file' | 'text';
}

interface GestorEvidenciasProps {
    value?: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
}

export default function GestorEvidencias({ value, onChange, readOnly = false }: GestorEvidenciasProps) {
    const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
    const [nuevaUrl, setNuevaUrl] = useState("");
    const [nuevaDescripcion, setNuevaDescripcion] = useState("");
    const [error, setError] = useState("");

    // Cargar evidencias iniciales
    useEffect(() => {
        if (!value) {
            setEvidencias([]);
            return;
        }

        try {
            // Intentar parsear como JSON
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                setEvidencias(parsed);
            } else {
                throw new Error("Formato no array");
            }
        } catch (e) {
            // Si falla, es texto plano (formato antiguo)
            if (value.trim()) {
                setEvidencias([{
                    id: 'legacy-1',
                    url: '',
                    descripcion: value,
                    tipo: 'text'
                }]);
            }
        }
    }, []);

    // Actualizar padre cuando cambian evidencias
    const actualizarEvidencias = (nuevasEvidencias: Evidencia[]) => {
        setEvidencias(nuevasEvidencias);
        onChange(JSON.stringify(nuevasEvidencias));
    };

    const handleAgregar = () => {
        setError("");

        if (!nuevaDescripcion.trim()) {
            setError("La descripción es obligatoria");
            return;
        }

        const nuevaEvidencia: Evidencia = {
            id: crypto.randomUUID(),
            url: nuevaUrl,
            descripcion: nuevaDescripcion,
            tipo: nuevaUrl ? 'link' : 'text'
        };

        const nuevas = [...evidencias, nuevaEvidencia];
        actualizarEvidencias(nuevas);

        // Limpiar campos
        setNuevaUrl("");
        setNuevaDescripcion("");
    };

    const handleEliminar = (id: string) => {
        const nuevas = evidencias.filter(e => e.id !== id);
        actualizarEvidencias(nuevas);
    };

    const abrirEnlace = (url: string) => {
        if (!url) return;
        // Asegurar protocolo
        const href = url.match(/^https?:\/\//) ? url : `https://${url}`;
        window.open(href, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {evidencias.map((evidencia) => (
                    <div
                        key={evidencia.id}
                        className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm group hover:border-blue-200 transition-colors"
                    >
                        <div className={`mt-0.5 p-1.5 rounded-md ${evidencia.tipo === 'link' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                            {evidencia.tipo === 'link' ? <LinkIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 break-words">
                                {evidencia.descripcion}
                            </p>
                            {evidencia.url && (
                                <button
                                    type="button"
                                    onClick={() => abrirEnlace(evidencia.url)}
                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 mt-0.5 truncate max-w-full"
                                >
                                    {evidencia.url} <ExternalLink className="h-3 w-3" />
                                </button>
                            )}
                        </div>

                        {!readOnly && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEliminar(evidencia.id)}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}

                {evidencias.length === 0 && readOnly && (
                    <p className="text-sm text-gray-500 italic">No hay evidencias registradas.</p>
                )}
            </div>

            {!readOnly && (
                <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Agregar Nueva Evidencia
                    </h4>

                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="evidencia-desc" className="text-xs">Descripción *</Label>
                            <Input
                                id="evidencia-desc"
                                value={nuevaDescripcion}
                                onChange={(e) => setNuevaDescripcion(e.target.value)}
                                placeholder="Ej: Acta de capacitación firmada"
                                className="bg-white h-9"
                            />
                        </div>

                        <div>
                            <Label htmlFor="evidencia-url" className="text-xs">Enlace / URL (Drive, SharePoint, etc)</Label>
                            <Input
                                id="evidencia-url"
                                value={nuevaUrl}
                                onChange={(e) => setNuevaUrl(e.target.value)}
                                placeholder="https://..."
                                className="bg-white h-9 font-mono text-xs"
                            />
                        </div>

                        {error && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {error}
                            </p>
                        )}

                        <Button
                            type="button"
                            onClick={handleAgregar}
                            disabled={!nuevaDescripcion.trim()}
                            className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm h-9"
                        >
                            Agregar a la lista
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
