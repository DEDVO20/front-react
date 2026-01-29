import { useState, useEffect } from "react";
import { Plus, Search, Filter, LifeBuoy, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import ticketService, { Ticket, TicketCreate } from "@/services/ticket.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MesaDeAyuda() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [newTicket, setNewTicket] = useState<TicketCreate>({
        titulo: "",
        descripcion: "",
        tipo: "soporte",
        prioridad: "media",
    });

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await ticketService.getAll();
            setTickets(data);
        } catch (error) {
            console.error("Error cargando tickets:", error);
            toast.error("Error al cargar los tickets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleCreate = async () => {
        if (!newTicket.titulo || !newTicket.descripcion) {
            toast.error("Por favor complete los campos obligatorios");
            return;
        }

        try {
            await ticketService.create(newTicket);
            toast.success("Ticket creado exitosamente");
            setOpenDialog(false);
            setNewTicket({
                titulo: "",
                descripcion: "",
                tipo: "soporte",
                prioridad: "media",
            });
            fetchTickets();
        } catch (error) {
            console.error("Error creando ticket:", error);
            toast.error("Error al crear el ticket");
        }
    };

    const getStatusBadge = (estado: string) => {
        switch (estado) {
            case "abierto":
                return <Badge variant="destructive">Abierto</Badge>;
            case "en_progreso":
                return <Badge variant="default" className="bg-blue-500">En Progreso</Badge>;
            case "resuelto":
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Resuelto</Badge>;
            case "cerrado":
                return <Badge variant="secondary">Cerrado</Badge>;
            default:
                return <Badge variant="outline">{estado}</Badge>;
        }
    };

    const getPriorityBadge = (prioridad: string) => {
        switch (prioridad) {
            case "critica":
                return <Badge variant="destructive">Crítica</Badge>;
            case "alta":
                return <Badge variant="destructive" className="bg-orange-500">Alta</Badge>;
            case "media":
                return <Badge variant="secondary" className="bg-yellow-500 text-black">Media</Badge>;
            case "baja":
                return <Badge variant="secondary" className="bg-green-200 text-green-800">Baja</Badge>;
            default:
                return <Badge variant="outline">{prioridad}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Mesa de Ayuda</h1>
                    <p className="text-muted-foreground">
                        Gestione sus solicitudes de soporte y consultas.
                    </p>
                </div>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Crear Nuevo Ticket</DialogTitle>
                            <DialogDescription>
                                Describa su problema o solicitud detalladamente.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="titulo">Título</Label>
                                <Input
                                    id="titulo"
                                    value={newTicket.titulo}
                                    onChange={(e) =>
                                        setNewTicket({ ...newTicket, titulo: e.target.value })
                                    }
                                    placeholder="Ej: Error al iniciar sesión..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tipo">Tipo</Label>
                                <Select
                                    value={newTicket.tipo}
                                    onValueChange={(value) =>
                                        setNewTicket({ ...newTicket, tipo: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="soporte">Soporte Técnico</SelectItem>
                                        <SelectItem value="consulta">Consulta (ISO/Procesos)</SelectItem>
                                        <SelectItem value="mejora">Solicitud de Mejora</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="prioridad">Prioridad</Label>
                                <Select
                                    value={newTicket.prioridad}
                                    onValueChange={(value) =>
                                        setNewTicket({ ...newTicket, prioridad: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione prioridad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="baja">Baja</SelectItem>
                                        <SelectItem value="media">Media</SelectItem>
                                        <SelectItem value="alta">Alta</SelectItem>
                                        <SelectItem value="critica">Crítica</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="descripcion">Descripción</Label>
                                <Textarea
                                    id="descripcion"
                                    value={newTicket.descripcion}
                                    onChange={(e) =>
                                        setNewTicket({ ...newTicket, descripcion: e.target.value })
                                    }
                                    placeholder="Detalle los pasos para reproducir el problema..."
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenDialog(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleCreate}>Enviar Ticket</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">Cargando tickets...</div>
            ) : tickets.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <LifeBuoy className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <CardHeader>
                        <CardTitle>No hay tickets registrados</CardTitle>
                        <CardDescription>Cras un nuevo ticket para comenzar.</CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Prioridad</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{ticket.titulo}</span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                {ticket.descripcion}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize">{ticket.tipo}</TableCell>
                                    <TableCell>{getPriorityBadge(ticket.prioridad)}</TableCell>
                                    <TableCell>{getStatusBadge(ticket.estado)}</TableCell>
                                    <TableCell>
                                        {new Date(ticket.creado_en).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => toast.info("Detalle en construcción")}
                                                >
                                                    Ver Detalle
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    );
}
