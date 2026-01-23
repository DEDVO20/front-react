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
import { 
  FileCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Eye,
  FileText,
  Calendar,
  User,
  Filter,
  RefreshCw
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
  codigo: string;
  nombreArchivo: string;
  tipo: string;
  version: string;
  estado: string;
  fechaSolicitud: string;
  solicitadoPor: string;
  prioridad: string;
}

interface DocumentoAPI {
  id: string;
  codigoDocumento: string;
  nombreArchivo: string;
  tipoDocumento?: string;
  version: string;
  estado: string;
  creadoEn: string;
  creadoPor?: {
    nombre: string;
    primerApellido: string;
  };
}

export default function AprobacionesPendientes() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>("todos");
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    type: 'aprobar' | 'rechazar' | null;
    documento: Documento | null;
  }>({ open: false, type: null, documento: null });

  useEffect(() => {
    fetchAprobacionesPendientes();
  }, []);

  const fetchAprobacionesPendientes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Endpoint correcto según tu backend
      const response = await fetch("/api/documentos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener documentos pendientes");
      }

      const data = await response.json();

      // Transformar datos según la estructura de tu API
      const transformedData = data.items?.map((doc: DocumentoAPI) => ({
        id: doc.id,
        codigo: doc.codigoDocumento || "SIN-CÓDIGO",
        nombreArchivo: doc.nombreArchivo,
        tipo: doc.tipoDocumento || "Documento",
        version: doc.version || "1.0",
        estado: "Pendiente de Aprobación",
        fechaSolicitud: doc.creadoEn,
        solicitadoPor: doc.creadoPor
          ? `${doc.creadoPor.nombre} ${doc.creadoPor.primerApellido}`
          : "Usuario desconocido",
        prioridad: calcularPrioridad(doc.creadoEn),
      })) || [];

      setDocumentos(transformedData);
      setTotal(data.total || transformedData.length);
    } catch (error) {
      console.error("Error:", error);
      
      // Datos de ejemplo para desarrollo/testing
      const ejemploData: Documento[] = [
        {
          id: "1",
          codigo: "PRO-SGC-001",
          nombreArchivo: "Procedimiento de Control de Documentos",
          tipo: "Procedimiento",
          version: "2.0",
          estado: "Pendiente de Aprobación",
          fechaSolicitud: "2024-10-20T10:30:00",
          solicitadoPor: "Ana Martínez",
          prioridad: "Alta",
        },
        {
          id: "2",
          codigo: "FOR-CAL-015",
          nombreArchivo: "Formato de Auditoría Interna",
          tipo: "Formato",
          version: "1.5",
          estado: "Pendiente de Aprobación",
          fechaSolicitud: "2024-10-22T14:20:00",
          solicitadoPor: "Carlos Rodríguez",
          prioridad: "Media",
        },
        {
          id: "3",
          codigo: "MAN-SGC-001",
          nombreArchivo: "Manual de Calidad ISO 9001:2015",
          tipo: "Manual",
          version: "3.0",
          estado: "Pendiente de Aprobación",
          fechaSolicitud: "2024-10-18T09:00:00",
          solicitadoPor: "María González",
          prioridad: "Urgente",
        },
      ];
      setDocumentos(ejemploData);
      setTotal(ejemploData.length);
    } finally {
      setLoading(false);
    }
  };

  const calcularPrioridad = (fecha: string): string => {
    const diasTranscurridos = Math.floor(
      (Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diasTranscurridos > 7) return "Urgente";
    if (diasTranscurridos > 3) return "Alta";
    return "Media";
  };

  const openDialog = (type: 'aprobar' | 'rechazar', documento: Documento) => {
    setDialogState({ open: true, type, documento });
  };

  const closeDialog = () => {
    setDialogState({ open: false, type: null, documento: null });
  };

  const handleAprobar = async () => {
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
        throw new Error("Error al aprobar documento");
      }

      // Mostrar mensaje de éxito
      alert(`✓ Documento "${documento.nombreArchivo}" aprobado correctamente`);
      
      // Recargar datos
      await fetchAprobacionesPendientes();
      closeDialog();
    } catch (error) {
      console.error("Error:", error);
      alert("✗ Error al aprobar el documento. Por favor intente nuevamente.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRechazar = async () => {
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
        body: JSON.stringify({ estado: "borrador" }),
      });

      if (!response.ok) {
        throw new Error("Error al rechazar documento");
      }

      // Mostrar mensaje de éxito
      alert(`✓ Documento "${documento.nombreArchivo}" rechazado. Devuelto a borrador.`);
      
      // Recargar datos
      await fetchAprobacionesPendientes();
      closeDialog();
    } catch (error) {
      console.error("Error:", error);
      alert("✗ Error al rechazar el documento. Por favor intente nuevamente.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleVer = (documento: Documento) => {
    // Aquí podrías abrir un modal o redirigir a la vista del documento
    alert(`Ver documento: ${documento.nombreArchivo}\nCódigo: ${documento.codigo}\nVersión: ${documento.version}`);
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "Urgente":
        return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
      case "Alta":
        return "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100";
      case "Media":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
    }
  };

  const getPrioridadIcon = (prioridad: string) => {
    switch (prioridad) {
      case "Urgente":
        return <AlertCircle className="w-3 h-3" />;
      case "Alta":
        return <Clock className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const documentosFiltrados = documentos.filter(doc => {
    if (filtro === "todos") return true;
    return doc.prioridad.toLowerCase() === filtro.toLowerCase();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-blue-500" />
          <p className="text-gray-600">Cargando aprobaciones pendientes...</p>
        </div>
      </div>
    );
  }

  const urgentes = documentos.filter((d) => d.prioridad === "Urgente").length;
  const altas = documentos.filter((d) => d.prioridad === "Alta").length;
  const medias = documentos.filter((d) => d.prioridad === "Media").length;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 pt-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileCheck className="h-7 w-7 text-blue-600" />
            </div>
            Aprobaciones Pendientes
          </h1>
          <p className="text-gray-600 mt-2">
            {total} documento{total !== 1 ? "s" : ""} pendiente
            {total !== 1 ? "s" : ""} de aprobación
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchAprobacionesPendientes}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Total Pendientes
            </CardDescription>
            <CardTitle className="text-4xl font-bold">{total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">
              Requieren revisión y aprobación
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-red-100">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              Prioridad Urgente
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-red-600">{urgentes}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Más de 7 días
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-orange-100">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-orange-600">
              <Clock className="w-4 h-4" />
              Prioridad Alta
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-orange-600">{altas}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              3-7 días
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-yellow-100">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-yellow-600">
              <Clock className="w-4 h-4" />
              Prioridad Media
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-yellow-600">{medias}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Menos de 3 días
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Información del proceso */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-500" />
            Proceso de Aprobación
          </CardTitle>
          <CardDescription>
            Los documentos pendientes pueden ser:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <span className="font-semibold text-green-900">Aprobar:</span>
              <p className="text-green-800">El documento cumple con los requisitos y puede ser publicado</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
            <X className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <span className="font-semibold text-red-900">Rechazar:</span>
              <p className="text-red-800">El documento requiere correcciones antes de ser aprobado</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-900">Revisar:</span>
              <p className="text-blue-800">Visualizar el documento antes de tomar una decisión</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtrar por prioridad
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["todos", "urgente", "alta", "media"].map((f) => (
              <Button
                key={f}
                variant={filtro === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltro(f)}
                className="capitalize"
              >
                {f === "todos" ? "Todos" : f}
                {f !== "todos" && (
                  <Badge className="ml-2" variant="secondary">
                    {f === "urgente" ? urgentes : f === "alta" ? altas : medias}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de documentos */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">
                  Código
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">
                  Nombre del Documento
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">
                  Tipo
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">
                  Versión
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">
                  Prioridad
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">
                  Fecha
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">
                  Solicitado Por
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 text-sm">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {documentosFiltrados.map((doc) => (
                <tr 
                  key={doc.id} 
                  className="border-b transition-colors hover:bg-gray-50"
                >
                  <td className="p-4 align-middle">
                    <div className="font-mono text-sm font-medium">{doc.codigo}</div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="max-w-[300px]">
                      <div className="font-medium truncate">{doc.nombreArchivo}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <FileText className="w-3 h-3" />
                        {doc.estado}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <Badge variant="outline" className="font-normal">
                      {doc.tipo}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      v{doc.version}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    <Badge 
                      variant="outline" 
                      className={`${getPrioridadColor(doc.prioridad)} font-medium`}
                    >
                      {getPrioridadIcon(doc.prioridad)}
                      <span className="ml-1">{doc.prioridad}</span>
                    </Badge>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {new Date(doc.fechaSolicitud).toLocaleDateString("es-ES")}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="text-sm flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-400" />
                      {doc.solicitadoPor}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                        onClick={() => handleVer(doc)}
                        disabled={actionLoading === doc.id}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => openDialog('aprobar', doc)}
                        disabled={actionLoading === doc.id}
                      >
                        {actionLoading === doc.id ? (
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8"
                        onClick={() => openDialog('rechazar', doc)}
                        disabled={actionLoading === doc.id}
                      >
                        {actionLoading === doc.id ? (
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <X className="w-3 h-3 mr-1" />
                        )}
                        Rechazar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {documentosFiltrados.length === 0 && (
            <div className="text-center py-16">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                ¡No hay documentos pendientes!
              </h3>
              <p className="text-gray-600 mb-4">
                {filtro !== "todos" 
                  ? `No hay documentos con prioridad ${filtro}`
                  : "Todos los documentos han sido revisados y aprobados."
                }
              </p>
              {filtro !== "todos" && (
                <Button variant="outline" onClick={() => setFiltro("todos")}>
                  Ver todos los documentos
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Dialog de confirmación */}
      <AlertDialog open={dialogState.open} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {dialogState.type === 'aprobar' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  ¿Aprobar documento?
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-600" />
                  ¿Rechazar documento?
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {dialogState.documento && (
                <>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <p className="font-semibold text-gray-900">
                      {dialogState.documento.nombreArchivo}
                    </p>
                    <p className="text-sm text-gray-600">
                      Código: {dialogState.documento.codigo}
                    </p>
                    <p className="text-sm text-gray-600">
                      Versión: {dialogState.documento.version}
                    </p>
                  </div>
                  {dialogState.type === 'aprobar' ? (
                    <p>
                      El documento será marcado como <strong className="text-green-600">aprobado</strong> y 
                      estará disponible para su uso en el sistema.
                    </p>
                  ) : (
                    <p>
                      El documento será devuelto a estado <strong className="text-orange-600">borrador</strong> y 
                      el solicitante deberá realizar las correcciones necesarias.
                    </p>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading !== null}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={dialogState.type === 'aprobar' ? handleAprobar : handleRechazar}
              disabled={actionLoading !== null}
              className={dialogState.type === 'aprobar' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
              }
            >
              {actionLoading !== null ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {dialogState.type === 'aprobar' ? 'Aprobar' : 'Rechazar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}