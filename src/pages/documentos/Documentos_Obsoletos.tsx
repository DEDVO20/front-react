import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Archive,
  Clock, 
  AlertCircle, 
  Search,
  FileText,
  User,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  Download,
  History,
  XCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Documento {
  id: string;
  codigoDocumento: string;
  nombreArchivo: string;
  tipoDocumento: string;
  version: string;
  estado: string;
  creadoEn: string;
  fechaAprobacion?: string;
  proximaRevision?: string;
  creadoPor?: {
    nombre: string;
    primerApellido: string;
  };
  aprobadoPor?: {
    nombre: string;
    primerApellido: string;
  };
  rutaAlmacenamiento?: string;
}

export default function DocumentosObsoletos() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroFecha, setFiltroFecha] = useState<string>("todos");
  
  // Dialog
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    type: 'eliminar' | 'restaurar' | null;
    documento: Documento | null;
  }>({ open: false, type: null, documento: null });

  // CARGAR DOCUMENTOS OBSOLETOS DESDE API
  useEffect(() => {
    fetchDocumentosObsoletos();
  }, []);

  const fetchDocumentosObsoletos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch("/api/documentos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener documentos obsoletos");
      }

      const data = await response.json();

      const transformedData = data.items?.map((doc: any) => ({
        id: doc.id,
        codigoDocumento: doc.codigoDocumento || "SIN-CÓDIGO",
        nombreArchivo: doc.nombreArchivo,
        tipoDocumento: doc.tipoDocumento || "Documento",
        version: doc.version || "1.0",
        estado: doc.estado,
        creadoEn: doc.creadoEn,
        fechaAprobacion: doc.fechaAprobacion,
        proximaRevision: doc.proximaRevision,
        creadoPor: doc.autor
          ? { nombre: doc.autor.nombre, primerApellido: doc.autor.primerApellido }
          : undefined,
        aprobadoPor: doc.aprobador
          ? { nombre: doc.aprobador.nombre, primerApellido: doc.aprobador.primerApellido }
          : undefined,
        rutaAlmacenamiento: doc.rutaAlmacenamiento,
      })) || [];

      setDocumentos(transformedData);
      setTotal(data.total || transformedData.length);
    } catch (error) {
      console.error("Error:", error);
      
      // Datos de ejemplo en caso de error
      const ejemploData: Documento[] = [
        {
          id: "1",
          codigoDocumento: "PRO-SGC-001-V1",
          nombreArchivo: "Procedimiento de Control de Documentos v1.0",
          tipoDocumento: "Procedimiento",
          version: "1.0",
          estado: "obsoleto",
          creadoEn: "2023-01-15T10:30:00",
          fechaAprobacion: "2023-01-20T14:00:00",
          proximaRevision: "2024-01-20",
          creadoPor: { nombre: "Ana", primerApellido: "Martínez" },
          aprobadoPor: { nombre: "Carlos", primerApellido: "Rodríguez" },
          rutaAlmacenamiento: "https://example.com/docs/procedimiento.pdf"
        },
        {
          id: "2",
          codigoDocumento: "FOR-CAL-015-V1",
          nombreArchivo: "Formato de Auditoría Interna v1.5",
          tipoDocumento: "Formato",
          version: "1.5",
          estado: "obsoleto",
          creadoEn: "2023-03-10T09:00:00",
          fechaAprobacion: "2023-03-15T16:00:00",
          creadoPor: { nombre: "María", primerApellido: "González" }
        },
        {
          id: "3",
          codigoDocumento: "MAN-SGC-001-V2",
          nombreArchivo: "Manual de Calidad ISO 9001:2015 v2.0",
          tipoDocumento: "Manual",
          version: "2.0",
          estado: "obsoleto",
          creadoEn: "2022-11-05T08:00:00",
          fechaAprobacion: "2022-11-10T10:00:00",
          proximaRevision: "2023-11-10",
          creadoPor: { nombre: "Juan", primerApellido: "Pérez" },
          aprobadoPor: { nombre: "Ana", primerApellido: "Martínez" }
        },
      ];
      
      setDocumentos(ejemploData);
      setTotal(ejemploData.length);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (type: 'eliminar' | 'restaurar', documento: Documento) => {
    setDialogState({ open: true, type, documento });
  };

  const closeDialog = () => {
    setDialogState({ open: false, type: null, documento: null });
  };

  const handleRestaurar = async () => {
    const documento = dialogState.documento;
    if (!documento) return;

    setActionLoading(documento.id);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/documentos/${documento.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: "aprobado" }),
      });

      if (!response.ok) {
        throw new Error("Error al restaurar documento");
      }

      alert(`✓ Documento "${documento.nombreArchivo}" restaurado correctamente`);
      await fetchDocumentosObsoletos();
      closeDialog();
    } catch (error) {
      console.error("Error:", error);
      alert("✗ Error al restaurar el documento. Por favor intente nuevamente.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEliminarPermanente = async () => {
    const documento = dialogState.documento;
    if (!documento) return;

    setActionLoading(documento.id);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/documentos/${documento.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar documento");
      }

      alert(`✓ Documento "${documento.nombreArchivo}" eliminado permanentemente`);
      await fetchDocumentosObsoletos();
      closeDialog();
    } catch (error) {
      console.error("Error:", error);
      alert("✗ Error al eliminar el documento. Por favor intente nuevamente.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleVer = (documento: Documento) => {
    if (documento.rutaAlmacenamiento) {
      window.open(documento.rutaAlmacenamiento, '_blank');
    } else {
      alert(`Ver documento:\n${documento.nombreArchivo}\nCódigo: ${documento.codigoDocumento}\nVersión: v${documento.version}`);
    }
  };

  const handleDescargar = (documento: Documento) => {
    if (documento.rutaAlmacenamiento) {
      window.open(documento.rutaAlmacenamiento, '_blank');
    } else {
      alert(`Descargar: ${documento.nombreArchivo}`);
    }
  };

  const getTipoColor = (tipo: string) => {
    const colores: Record<string, string> = {
      manual: "bg-purple-50 text-purple-700 border-purple-200",
      procedimiento: "bg-blue-50 text-blue-700 border-blue-200",
      instructivo: "bg-green-50 text-green-700 border-green-200",
      formato: "bg-yellow-50 text-yellow-700 border-yellow-200",
      registro: "bg-orange-50 text-orange-700 border-orange-200",
    };
    return colores[tipo.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const calcularTiempoObsoleto = (fechaAprobacion?: string): string => {
    if (!fechaAprobacion) return "Sin fecha";
    const fecha = new Date(fechaAprobacion);
    const ahora = new Date();
    const dias = Math.floor((ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
    if (dias < 30) return `${dias} día${dias !== 1 ? 's' : ''}`;
    if (dias < 365) return `${Math.floor(dias / 30)} mes${Math.floor(dias / 30) !== 1 ? 'es' : ''}`;
    const años = Math.floor(dias / 365);
    return `${años} año${años !== 1 ? 's' : ''}`;
  };

  const documentosFiltrados = documentos.filter(doc => {
    const matchSearch = searchTerm === "" || 
      doc.nombreArchivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.codigoDocumento.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchTipo = filtroTipo === "todos" || doc.tipoDocumento.toLowerCase() === filtroTipo.toLowerCase();
    
    let matchFecha = true;
    if (filtroFecha !== "todos" && doc.fechaAprobacion) {
      const meses = (new Date().getTime() - new Date(doc.fechaAprobacion).getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (filtroFecha === "reciente") matchFecha = meses <= 6;
      if (filtroFecha === "medio") matchFecha = meses > 6 && meses <= 12;
      if (filtroFecha === "antiguo") matchFecha = meses > 12;
    }
    
    return matchSearch && matchTipo && matchFecha;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-gray-500" />
          <p className="text-gray-600">Cargando documentos obsoletos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 pt-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Archive className="h-7 w-7 text-gray-600" />
            </div>
            Documentos Obsoletos
          </h1>
          <p className="text-gray-600 mt-2">
            {total} documento{total !== 1 ? "s" : ""} obsoleto{total !== 1 ? "s" : ""} archivado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchDocumentosObsoletos}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow border-gray-200">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Total Obsoletos
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-gray-700">{total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Documentos fuera de vigencia</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-purple-100">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-purple-600">
              <FileText className="w-4 h-4" />
              Manuales
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-purple-600">
              {documentos.filter(d => d.tipoDocumento.toLowerCase() === "manual").length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Archivados
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-blue-100">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-blue-600">
              <FileText className="w-4 h-4" />
              Procedimientos
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-blue-600">
              {documentos.filter(d => d.tipoDocumento.toLowerCase() === "procedimiento").length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Archivados
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-orange-100">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-orange-600">
              <History className="w-4 h-4" />
              Antiguos
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-orange-600">
              {documentos.filter(d => {
                if (!d.fechaAprobacion) return false;
                const meses = (new Date().getTime() - new Date(d.fechaAprobacion).getTime()) / (1000 * 60 * 60 * 24 * 30);
                return meses > 12;
              }).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              +1 año obsoletos
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Información */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Gestión de Documentos Obsoletos
          </CardTitle>
          <CardDescription className="text-amber-800">
            Estos documentos han sido marcados como obsoletos y ya no están en uso activo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
            <Archive className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-900">Consulta histórica:</span>
              <p className="text-gray-700">Los documentos obsoletos se mantienen para referencia y auditoría</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
            <History className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-900">Restaurar:</span>
              <p className="text-gray-700">Puedes restaurar un documento si necesita volver a estar activo</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
            <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-900">Eliminar permanentemente:</span>
              <p className="text-gray-700">Una vez eliminado, el documento no podrá recuperarse</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros de búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="procedimiento">Procedimiento</SelectItem>
                <SelectItem value="instructivo">Instructivo</SelectItem>
                <SelectItem value="formato">Formato</SelectItem>
                <SelectItem value="registro">Registro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroFecha} onValueChange={setFiltroFecha}>
              <SelectTrigger>
                <SelectValue placeholder="Antigüedad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las fechas</SelectItem>
                <SelectItem value="reciente">Últimos 6 meses</SelectItem>
                <SelectItem value="medio">6-12 meses</SelectItem>
                <SelectItem value="antiguo">Más de 1 año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">Código</th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">Nombre del Documento</th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">Tipo</th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">Versión</th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">Obsoleto desde</th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">Creado por</th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documentosFiltrados.map((doc) => (
                <tr key={doc.id} className="border-b transition-colors hover:bg-gray-50">
                  <td className="p-4 align-middle">
                    <div className="font-mono text-sm font-medium">{doc.codigoDocumento}</div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="max-w-[300px]">
                      <div className="font-medium truncate">{doc.nombreArchivo}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <XCircle className="w-3 h-3 text-red-500" />
                        Obsoleto
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <Badge variant="outline" className={getTipoColor(doc.tipoDocumento)}>
                      {doc.tipoDocumento}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">v{doc.version}</span>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {calcularTiempoObsoleto(doc.fechaAprobacion)}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="text-sm flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-400" />
                      {doc.creadoPor ? `${doc.creadoPor.nombre} ${doc.creadoPor.primerApellido}` : "Desconocido"}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleVer(doc)} disabled={actionLoading === doc.id}>
                        <Eye className="w-3 h-3 mr-1" /> Ver
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDescargar(doc)} disabled={actionLoading === doc.id}>
                        <Download className="w-3 h-3 mr-1" /> Descargar
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openDialog('restaurar', doc)} disabled={actionLoading === doc.id}>
                        {actionLoading === doc.id ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <History className="w-3 h-3 mr-1" />}
                        Restaurar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => openDialog('eliminar', doc)} disabled={actionLoading === doc.id}>
                        {actionLoading === doc.id ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {documentosFiltrados.length === 0 && (
            <div className="text-center py-16">
              <Archive className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">No hay documentos obsoletos</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filtroTipo !== "todos" || filtroFecha !== "todos"
                  ? "No se encontraron documentos con los filtros aplicados"
                  : "Actualmente no hay documentos marcados como obsoletos."
                }
              </p>
              {(searchTerm || filtroTipo !== "todos" || filtroFecha !== "todos") && (
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setFiltroTipo("todos");
                  setFiltroFecha("todos");
                }}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Dialog */}
      <AlertDialog open={dialogState.open} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {dialogState.type === 'restaurar' ? (
                <> <History className="w-5 h-5 text-blue-600" /> ¿Restaurar documento? </>
              ) : (
                <> <Trash2 className="w-5 h-5 text-red-600" /> ¿Eliminar permanentemente? </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {dialogState.documento && (
                <>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <p className="font-semibold text-gray-900">{dialogState.documento.nombreArchivo}</p>
                    <p className="text-sm text-gray-600">Código: {dialogState.documento.codigoDocumento}</p>
                    <p className="text-sm text-gray-600">Versión: {dialogState.documento.version}</p>
                  </div>
                  {dialogState.type === 'restaurar' ? (
                    <p>El documento será restaurado a estado <strong className="text-blue-600">aprobado</strong>.</p>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-900 font-medium mb-2">Esta acción es irreversible</p>
                      <p className="text-red-800 text-sm">El documento será eliminado permanentemente.</p>
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading !== null}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={dialogState.type === 'restaurar' ? handleRestaurar : handleEliminarPermanente}
              disabled={actionLoading !== null}
              className={dialogState.type === 'restaurar' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {actionLoading !== null ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              {dialogState.type === 'restaurar' ? 'Restaurar' : 'Eliminar permanentemente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}