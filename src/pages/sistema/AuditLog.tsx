import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auditLogService, AuditLogEntry } from "@/services/auditLog.service";
import { getCurrentUser } from "@/services/auth";
import { Button } from "@/components/ui/button";

export default function AuditLogPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [tabla, setTabla] = useState("");
  const [accion, setAccion] = useState("");
  const [usuarioId, setUsuarioId] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const user = getCurrentUser();
  const permisos: string[] = user?.permisos || [];
  const canView = permisos.includes("sistema.admin") || user?.roles?.some((r: any) => ["ADMIN", "admin"].includes(r?.rol?.clave));

  const fetchLogs = async (overrides?: {
    tabla?: string;
    accion?: string;
    usuarioId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }) => {
    const tablaVal = overrides?.tabla ?? tabla;
    const accionVal = overrides?.accion ?? accion;
    const usuarioIdVal = overrides?.usuarioId ?? usuarioId;
    const fechaDesdeVal = overrides?.fechaDesde ?? fechaDesde;
    const fechaHastaVal = overrides?.fechaHasta ?? fechaHasta;

    try {
      setLoading(true);
      setError(null);
      const data = await auditLogService.getAll({
        limit: 300,
        tabla: tablaVal || undefined,
        accion: accionVal || undefined,
        usuario_id: usuarioIdVal || undefined,
        fecha_desde: fechaDesdeVal ? `${fechaDesdeVal}T00:00:00` : undefined,
        fecha_hasta: fechaHastaVal ? `${fechaHastaVal}T23:59:59` : undefined,
      });
      setLogs(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (!canView) {
    return <div className="text-sm text-red-600">Acceso restringido: requiere rol ADMIN.</div>;
  }

  if (loading) return <LoadingSpinner message="Cargando audit log..." />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Input placeholder="Filtrar por tabla" value={tabla} onChange={(e) => setTabla(e.target.value)} />
            <Input placeholder="Filtrar por acción" value={accion} onChange={(e) => setAccion(e.target.value)} />
            <Input placeholder="Filtrar por usuario_id" value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} />
            <Input type="date" placeholder="Fecha desde" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
            <Input type="date" placeholder="Fecha hasta" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={fetchLogs} className="flex-1">Aplicar</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setTabla("");
                  setAccion("");
                  setUsuarioId("");
                  setFechaDesde("");
                  setFechaHasta("");
                  fetchLogs({ tabla: "", accion: "", usuarioId: "", fechaDesde: "", fechaHasta: "" });
                }}
                className="flex-1"
              >
                Limpiar
              </Button>
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="overflow-x-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">Tabla</th>
                  <th className="text-left p-2">Acción</th>
                  <th className="text-left p-2">Registro</th>
                  <th className="text-left p-2">Cambios</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t align-top">
                    <td className="p-2 whitespace-nowrap">{new Date(log.fecha).toLocaleString()}</td>
                    <td className="p-2">{log.tabla}</td>
                    <td className="p-2">{log.accion}</td>
                    <td className="p-2 font-mono text-xs">{log.registro_id}</td>
                    <td className="p-2">
                      <details>
                        <summary className="cursor-pointer">Ver JSON</summary>
                        <pre className="mt-2 text-xs bg-slate-100 p-2 rounded overflow-x-auto">{JSON.stringify(log.cambios_json || {}, null, 2)}</pre>
                      </details>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-slate-500" colSpan={5}>Sin registros</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
