// src/pages/ControlVersiones.tsx
import React, { useMemo, useState, useEffect } from "react";
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
import { Search, Eye, Filter, FileText, Layers, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { documentoService, type DocumentoResponse } from "@/services/documento.service";

/**
 * ControlVersiones - Vista de control de versiones de documentos
 *
 * - Indicadores arriba (resumen)
 * - Buscador + botón Filtrar (por fecha)
 * - Tabla de documentos
 * - Modal "Ver" con: info básica + historial de versiones
 */

type Version = {
  id: string;
  version: string;
  descripcion_cambios?: string;
  creado_en: string;
  creado_por?: {
    nombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
  };
  ruta_archivo?: string;
};

type Documento = {
  id: string;
  codigo: string;
  nombre: string;
  estado: string;
  creado_en: string;
  version_actual: string;
  creado_por?: {
    nombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
  };
  versiones?: Version[];
  ruta_archivo?: string;
};

export default function ControlVersiones() {
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar documentos desde el backend
  useEffect(() => {
    cargarDocumentos();
  }, []);

  const cargarDocumentos = async () => {
    try {
      setLoading(true);
      const docs = await documentoService.getAll();
      setDocumentos(docs as any);
    } catch (error) {
      console.error("Error al cargar documentos:", error);
      toast.error("Error al cargar los documentos");
    } finally {
      setLoading(false);
    }
  };

  // Cargar versiones de un documento
  const cargarVersiones = async (documentoId: string) => {
    try {
      const versiones = await documentoService.getVersiones(documentoId);
      return versiones;
    } catch (error) {
      console.error("Error al cargar versiones:", error);
      toast.error("Error al cargar las versiones del documento");
      return [];
    }
  };

  // Filtros
  const filtrados = useMemo(() => {
    return documentos.filter((doc) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        doc.nombre.toLowerCase().includes(term) ||
        doc.codigo.toLowerCase().includes(term) ||
        (doc.creado_por &&
          `${doc.creado_por.nombre} ${doc.creado_por.primerApellido}`.toLowerCase().includes(term));

      const docFecha = new Date(doc.creado_en).toISOString().split('T')[0];
      const matchesDate = !filterDate || docFecha === filterDate;

      return matchesSearch && matchesDate;
    });
  }, [documentos, search, filterDate]);

  // Indicadores (usados en tarjetas superiores)
  const totalDocumentos = documentos.length;
  const totalVersiones = documentos.reduce((s, d) => s + (d.versiones?.length || 0), 0);
  const masVersiones = documentos.reduce(
    (best, cur) => ((cur.versiones?.length || 0) > (best?.versiones?.length ?? 0) ? cur : best),
    documentos[0]
  );
  const ultimoDocumento = documentos.reduce(
    (last, cur) => (new Date(cur.creado_en) > new Date(last?.creado_en || 0) ? cur : last),
    documentos[0]
  );

  const openDoc = async (doc: Documento) => {
    setSelectedDoc(doc);
    setSelectedVersion(null);

    // Cargar versiones si no están cargadas
    if (!doc.versiones || doc.versiones.length === 0) {
      const versiones = await cargarVersiones(doc.id);
      setSelectedDoc({ ...doc, versiones });
    }
  };

  const verVersion = (v: Version) => {
    setSelectedVersion(v);
  };

  // Función para formatear estados
  const formatearEstado = (estado: string): string => {
    const estadosMap: Record<string, string> = {
      'borrador': 'Borrador',
      'en_revision': 'En Revisión',
      'aprobado': 'Aprobado',
      'vigente': 'Vigente',
      'obsoleto': 'Obsoleto',
      'archivado': 'Archivado'
    };
    return estadosMap[estado] || estado;
  };

  // Función para obtener nombre completo del usuario
  const obtenerNombreCompleto = (usuario?: { nombre?: string; primerApellido?: string; segundoApellido?: string }): string => {
    if (!usuario) return '-';

    // Validar que los campos requeridos existan
    const nombre = usuario.nombre || '';
    const primerApellido = usuario.primerApellido || '';
    const segundoApellido = usuario.segundoApellido || '';

    // Si no hay nombre ni apellido, retornar guión
    if (!nombre && !primerApellido) return '-';

    return `${nombre} ${primerApellido}${segundoApellido ? ' ' + segundoApellido : ''}`.trim();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

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
              ({masVersiones?.versiones?.length ?? 0} versiones)
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div>
            <p className="text-sm text-gray-500">Último Actualizado</p>
            <p className="text-base font-semibold">{ultimoDocumento?.nombre ?? "-"}</p>
            <p className="text-xs text-gray-400">
              {ultimoDocumento?.creado_en ? new Date(ultimoDocumento.creado_en).toLocaleDateString('es-ES') : '-'}
            </p>
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
                <TableCell>
                  <span className="capitalize">{formatearEstado(doc.estado)}</span>
                </TableCell>
                <TableCell>
                  {new Date(doc.creado_en).toLocaleDateString('es-ES')}
                </TableCell>
                <TableCell>
                  {obtenerNombreCompleto(doc.creado_por)}
                </TableCell>
                <TableCell className="text-center">{doc.versiones?.length || 0}</TableCell>
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
                            <p><strong>Código:</strong> {selectedDoc?.codigo}</p>
                            <p><strong>Nombre:</strong> {selectedDoc?.nombre}</p>
                            <p>
                              <strong>Estado:</strong>{' '}
                              <span className="capitalize">{selectedDoc?.estado ? formatearEstado(selectedDoc.estado) : '-'}</span>
                            </p>
                            <p><strong>Fecha:</strong> {selectedDoc?.creado_en ? new Date(selectedDoc.creado_en).toLocaleDateString('es-ES') : '-'}</p>
                            <p><strong>Responsable:</strong> {obtenerNombreCompleto(selectedDoc?.creado_por)}</p>
                            <p><strong>Versión Actual:</strong> {selectedDoc?.version_actual}</p>
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
                                    <td className="p-2">{v.version}</td>
                                    <td className="p-2">
                                      {new Date(v.creado_en).toLocaleDateString('es-ES')}
                                    </td>
                                    <td className="p-2">
                                      {obtenerNombreCompleto(v.creado_por)}
                                    </td>
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
                              {selectedVersion?.ruta_archivo || selectedDoc?.ruta_archivo ? (
                                <iframe
                                  title="visor-version"
                                  src={selectedVersion?.ruta_archivo || selectedDoc?.ruta_archivo}
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
                                href={selectedVersion?.ruta_archivo || selectedDoc?.ruta_archivo || "#"}
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
