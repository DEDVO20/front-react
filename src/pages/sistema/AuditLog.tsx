import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auditLogService, AuditLogEntry } from "@/services/auditLog.service";
import { getCurrentUser } from "@/services/auth";

export default function AuditLogPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [tabla, setTabla] = useState("");
  const [accion, setAccion] = useState("");

  const user = getCurrentUser();
  const permisos: string[] = user?.permisos || [];
  const canView = permisos.includes("sistema.admin") || user?.roles?.some((r: any) => ["ADMIN", "admin"].includes(r?.rol?.clave));

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await auditLogService.getAll({ limit: 200 });
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

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const byTabla = !tabla || log.tabla.toLowerCase().includes(tabla.toLowerCase());
      const byAccion = !accion || log.accion.toLowerCase().includes(accion.toLowerCase());
      return byTabla && byAccion;
    });
  }, [logs, tabla, accion]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="Filtrar por tabla" value={tabla} onChange={(e) => setTabla(e.target.value)} />
            <Input placeholder="Filtrar por acción" value={accion} onChange={(e) => setAccion(e.target.value)} />
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
                {filtered.map((log) => (
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
                {filtered.length === 0 && (
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
