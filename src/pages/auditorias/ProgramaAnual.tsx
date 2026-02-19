import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { auditoriaService, ProgramaAuditoria } from '@/services/auditoria.service';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ProgramaAnual: React.FC = () => {
    const [programas, setProgramas] = useState<ProgramaAuditoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<ProgramaAuditoria>>({
        anio: new Date().getFullYear(),
        objetivo: '',
        estado: 'borrador',
        criterioRiesgo: ''
    });

    useEffect(() => {
        cargarProgramas();
    }, []);

    const cargarProgramas = async () => {
        try {
            setLoading(true);
            const data = await auditoriaService.getAllProgramas();
            setProgramas(data);
        } catch (error: any) {
            console.error('Error cargando programas:', error);
            toast.error('Error al cargar programas de auditoría');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingId(null);
        setFormData({
            anio: new Date().getFullYear() + 1,
            objetivo: '',
            estado: 'borrador',
            criterioRiesgo: ''
        });
        setShowModal(true);
    };

    const handleEdit = (programa: ProgramaAuditoria) => {
        setEditingId(programa.id);
        setFormData({
            anio: programa.anio,
            objetivo: programa.objetivo || '',
            estado: programa.estado,
            criterioRiesgo: programa.criterioRiesgo || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await auditoriaService.updatePrograma(editingId, formData);
                toast.success('Programa actualizado correctamente');
            } else {
                await auditoriaService.createPrograma(formData);
                toast.success('Programa creado correctamente');
            }
            setShowModal(false);
            cargarProgramas();
        } catch (error: any) {
            console.error('Error guardando programa:', error);
            toast.error(error.message || 'Error al guardar el programa');
        }
    };

    const getEstadoBadgeColor = (estado: string) => {
        switch (estado) {
            case 'aprobado': return 'bg-green-100 text-green-800';
            case 'en_ejecucion': return 'bg-amber-100 text-amber-800';
            case 'finalizado': return 'bg-emerald-100 text-emerald-800';
            case 'borrador': return 'bg-gray-100 text-gray-800';
            case 'cerrado': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Programa Anual de Auditorías</h1>
                    <p className="text-gray-500 mt-2">Gestión de la planificación anual de auditorías.</p>
                </div>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Programa
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Programas Registrados</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <LoadingSpinner message="Cargando" />
                    ) : programas.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">No hay programas registrados.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Año</TableHead>
                                    <TableHead>Objetivo</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Fecha Creación</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {programas.map((prog) => (
                                    <TableRow key={prog.id}>
                                        <TableCell className="font-medium text-lg">{prog.anio}</TableCell>
                                        <TableCell className="max-w-md truncate">{prog.objetivo || 'Sin objetivo definido'}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoBadgeColor(prog.estado)}`}>
                                                {prog.estado.toUpperCase()}
                                            </span>
                                        </TableCell>
                                        <TableCell>{prog.creadoEn ? new Date(prog.creadoEn).toLocaleDateString() : '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(prog)}>
                                                    <Edit className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                {/* Aquí se podría añadir un botón para ver las auditorías de este programa */}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Editar Programa' : 'Nuevo Programa Anual'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="anio">Año</Label>
                                <Input
                                    id="anio"
                                    type="number"
                                    required
                                    value={formData.anio}
                                    onChange={(e) => setFormData({ ...formData, anio: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estado">Estado</Label>
                                <Select
                                    value={formData.estado}
                                    onValueChange={(value) => setFormData({ ...formData, estado: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="borrador">Borrador</SelectItem>
                                        <SelectItem value="aprobado">Aprobado</SelectItem>
                                        <SelectItem value="en_ejecucion">En ejecución</SelectItem>
                                        <SelectItem value="finalizado">Finalizado</SelectItem>
                                        <SelectItem value="cerrado">Cerrado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="objetivo">Objetivo General</Label>
                            <Textarea
                                id="objetivo"
                                value={formData.objetivo}
                                onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                                placeholder="Describa el objetivo general del programa anual..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="criterioRiesgo">Criterios de Riesgo</Label>
                            <Textarea
                                id="criterioRiesgo"
                                value={formData.criterioRiesgo}
                                onChange={(e) => setFormData({ ...formData, criterioRiesgo: e.target.value })}
                                placeholder="Defina los criterios de riesgo utilizados para la planificación..."
                                rows={3}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProgramaAnual;
