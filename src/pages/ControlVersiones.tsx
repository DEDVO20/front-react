// src/pages/ControlVersiones.tsx
import React, { useMemo, useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Search, Eye, Filter, FileText, Layers, Star, Clock } from "lucide-react";

/**
 * ControlVersiones (componente completo)
 *
 * - Indicadores arriba (resumen)
 * - Buscador + botón Filtrar (por fecha)
 * - Tabla de documentos
 * - Modal "Ver" con: info básica + historial de versiones
 *    - En historial: botón "Ver versión" que carga el PDF en el mismo modal
 *
 * Nota: las URLs de los PDFs en cada versión son de ejemplo; reemplázalas por las reales.
 */

type Version = {
  id: string;
  numero: string;
  fecha: string;
  cambios?: string;
  usuario?: string;
  url?: string; // link del PDF para esa versión
};

type Documento = {
  id: number;
  nombre: string;
  estado?: string;
  fecha: string;
  autor?: string;
  versionesVigentes: number;
  versiones?: Version[];
  url?: string;
};

export default function ControlVersiones() {
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  // Datos de ejemplo (reemplazar cuando se conecte con backend)
  const documentos: Documento[] = [
    {
      id: 1,
      nombre: "Manual de Calidad",
      estado: "Aprobado",
      fecha: "2025-09-15",
      autor: "Juan Pérez",
      versionesVigentes: 3,
      versiones: [
        { id: "1a", numero: "1.0", fecha: "2024-01-15", cambios: "Creación", usuario: "Juan", url: "/docs/manual_v1.pdf" },
        { id: "1b", numero: "2.0", fecha: "2025-02-10", cambios: "Revisión", usuario: "María", url: "/docs/manual_v2.pdf" },
        { id: "1c", numero: "3.1", fecha: "2025-09-15", cambios: "Ajustes", usuario: "Carlos", url: "/docs/manual_v3_1.pdf" },
      ],
      url: "/docs/manual_calidad.pdf",
    },
    {
      id: 2,
      nombre: "Procedimiento de Auditoría",
      estado: "En Proceso",
      fecha: "2025-08-10",
      autor: "Coordinador de Calidad",
      versionesVigentes: 2,
      versiones: [
        { id: "2a", numero: "1.0", fecha: "2024-04-02", cambios: "Inicial", usuario: "Ana", url: "/docs/auditoria_v1.pdf" },
        { id: "2b", numero: "2.0", fecha: "2025-08-10", cambios: "Actualización", usuario: "Luis", url: "/docs/auditoria_v2.pdf" },
      ],
      url: "/docs/auditoria.pdf",
    },
  ];

  // filtros
  const filtrados = useMemo(() => {
    return documentos.filter((doc) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        doc.nombre.toLowerCase().includes(term) ||
        (doc.autor && doc.autor.toLowerCase().includes(term));
      const matchesDate = !filterDate || doc.fecha === filterDate;
      return matchesSearch && matchesDate;
    });
  }, [documentos, search, filterDate]);

  // indicadores (usados en tarjetas superiores)
  const totalDocumentos = documentos.length;
  const totalVersiones = documentos.reduce((s, d) => s + (d.versionesVigentes || 0), 0);
  const masVersiones = documentos.reduce(
    (best, cur) => (cur.versionesVigentes > (best?.versionesVigentes ?? 0) ? cur : best),
    documentos[0]
  );
  const ultimoDocumento = documentos.reduce(
    (last, cur) => (new Date(cur.fecha) > new Date(last.fecha) ? cur : last),
    documentos[0]
  );

  const openDoc = (doc: Documento) => {
    setSelectedDoc(doc);
    setSelectedVersion(null);
  };

  const verVersion = (v: Version) => {
    setSelectedVersion(v);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Control de Versiones</h1>

      {/* Tarjetas resumen con indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Documentos</p>
              <p className="text-2xl font-bold">{totalDocumentos}</p>
            </div>
            <FileText className="h-7 w-7 text-gray-500" />
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Versiones</p>
              <p className="text-2xl font-bold text-purple-600">{totalVersiones}</p>
            </div>
            <Layers className="h-7 w-7 text-purple-600" />
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div>
            <p className="text-sm text-gray-500">Más Versiones</p>
            <p className="text-base font-semibold">{masVersiones?.nombre ?? "-"}</p>
            <p className="text-xs text-gray-400">
              ({masVersiones?.versionesVigentes ?? 0} versiones)
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div>
            <p className="text-sm text-gray-500">Último Actualizado</p>
            <p className="text-base font-semibold">{ultimoDocumento?.nombre ?? "-"}</p>
            <p className="text-xs text-gray-400">{ultimoDocumento?.fecha}</p>
          </div>
        </div>
      </div>

      {/* Buscador + Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-2/3">
          <Input
            placeholder="Buscar por nombre, responsable o área..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
          <Button variant="outline">
            <Search className="h-4 w-4 mr-1" /> Buscar
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filtrar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3">
              <label className="block text-sm text-gray-600 mb-1">Filtrar por fecha</label>
              <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" onClick={() => setFilterDate("")} className="w-full">Limpiar</Button>
                <Button className="w-full">Aplicar</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="bg-white rounded-lg shadow-md p-4 border">
        <h2 className="text-lg font-semibold mb-4">Lista de Documentos</h2>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="text-center">Versiones</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.nombre}</TableCell>
                <TableCell>{doc.estado ?? "-"}</TableCell>
                <TableCell>{doc.fecha}</TableCell>
                <TableCell>{doc.autor ?? "-"}</TableCell>
                <TableCell className="text-center">{doc.versionesVigentes}</TableCell>
                <TableCell className="text-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => openDoc(doc)}
                        className="bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-500"
                      >
                        <Eye className="h-4 w-4 mr-1" /> Ver
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-5xl">
                      <DialogHeader>
                        <DialogTitle>Detalles del Documento</DialogTitle>
                      </DialogHeader>

                      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* izquierda: info + historial */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="bg-gray-50 border rounded-lg p-4">
                            <p><strong>Nombre:</strong> {selectedDoc?.nombre}</p>
                            <p><strong>Estado:</strong> {selectedDoc?.estado}</p>
                            <p><strong>Fecha:</strong> {selectedDoc?.fecha}</p>
                            <p><strong>Responsable:</strong> {selectedDoc?.autor}</p>
                          </div>

                          <div className="bg-white border rounded-lg p-3">
                            <h4 className="font-semibold mb-2">Historial de versiones</h4>

                            <table className="w-full text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="p-2 text-left">Versión</th>
                                  <th className="p-2 text-left">Fecha</th>
                                  <th className="p-2 text-left">Usuario</th>
                                  <th className="p-2 text-center">Acción</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedDoc?.versiones?.map((v) => (
                                  <tr key={v.id} className="hover:bg-gray-50">
                                    <td className="p-2">{v.numero}</td>
                                    <td className="p-2">{v.fecha}</td>
                                    <td className="p-2">{v.usuario ?? "-"}</td>
                                    <td className="p-2 text-center">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => verVersion(v)}
                                        className="text-blue-600"
                                      >
                                        Ver versión
                                      </Button>
                                    </td>
                                  </tr>
                                ))}

                                {!selectedDoc?.versiones?.length && (
                                  <tr>
                                    <td colSpan={4} className="p-2 text-center text-gray-500">No hay versiones</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* derecha: visor PDF */}
                        <div className="lg:col-span-1">
                          <div className="bg-white border rounded-lg overflow-hidden">
                            <div className="p-3 border-b">
                              <p className="font-semibold">Vista previa</p>
                              <p className="text-xs text-gray-500">Selecciona una versión para previsualizar</p>
                            </div>

                            <div style={{ height: 420 }} className="w-full">
                              {selectedVersion?.url || selectedDoc?.url ? (
                                <iframe
                                  title="visor-version"
                                  src={selectedVersion?.url || selectedDoc?.url}
                                  className="w-full h-full"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                  <p>Vista previa no disponible</p>
                                </div>
                              )}
                            </div>

                            <div className="p-3 flex gap-2 border-t">
                              <a
                                href={selectedVersion?.url || selectedDoc?.url || "#"}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Button size="sm">Abrir/Descargar</Button>
                              </a>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedVersion(null)}
                              >
                                Quitar versión
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
