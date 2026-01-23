import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Search } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function Gestion_Documental() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("todos");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [open, setOpen] = useState(false);

  // Datos simulados de documentos
  const documentos = [
    { id: 1, nombre: "Manual de Calidad", version: "3.2", responsable: "Juan Pérez", estado: "Vigente" },
    { id: 2, nombre: "Procedimiento de Auditoría", version: "1.1", responsable: "Ana Gómez", estado: "En Revisión" },
    { id: 3, nombre: "Registro de Cambios", version: "2.0", responsable: "Carlos Ruiz", estado: "Finalizado" },
    { id: 4, nombre: "Plan de Mejora", version: "1.0", responsable: "María López", estado: "Vigente" },
  ];

  const filteredDocs = documentos.filter(
    (doc) =>
      (filter === "todos" || doc.estado === filter) &&
      doc.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Datos para la gráfica
  const data = [
    { name: "Vigente", cantidad: documentos.filter((d) => d.estado === "Vigente").length },
    { name: "En Revisión", cantidad: documentos.filter((d) => d.estado === "En Revisión").length },
    { name: "Finalizado", cantidad: documentos.filter((d) => d.estado === "Finalizado").length },
  ];

  // Colores por estado
  const colorEstado = (estado: string) => {
    if (estado === "Vigente") return "text-green-600 font-semibold";
    if (estado === "En Revisión") return "text-orange-500 font-semibold";
    if (estado === "Finalizado") return "text-red-500 font-semibold";
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Gestión Documental</h1>

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <Input
            placeholder="Buscar documento por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Button variant="default">
            <Search className="h-4 w-4 mr-1" /> Buscar
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Vigente">🟢 Vigente</SelectItem>
              <SelectItem value="En Revisión">🟠 En Revisión</SelectItem>
              <SelectItem value="Finalizado">🔴 Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla de documentos */}
      <div className="border rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Versión</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocs.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.nombre}</TableCell>
                <TableCell>{doc.version}</TableCell>
                <TableCell>{doc.responsable}</TableCell>
                <TableCell className={colorEstado(doc.estado)}>{doc.estado}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDoc(doc);
                      setOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Ver
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Gráfica de barras */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4 text-center">Resumen de Estados de Documentos</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#0f1013ff" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Modal flotante para trazabilidad */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Trazabilidad del Documento</DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-3">
              <p><strong>Nombre:</strong> {selectedDoc.nombre}</p>
              <p><strong>Versión:</strong> {selectedDoc.version}</p>
              <p><strong>Responsable:</strong> {selectedDoc.responsable}</p>
              <p><strong>Estado actual:</strong> <span className={colorEstado(selectedDoc.estado)}>{selectedDoc.estado}</span></p>

              <div className="border-t pt-3">
                <p className="font-semibold mb-2">📋 Historial de Cambios:</p>
                <ul className="text-sm space-y-1">
                  <li>✅ Documento creado</li>
                  <li>🔄 En revisión por el área de calidad</li>
                  <li>🟢 Aprobado y vigente</li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
