import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/auth";
import { SectionCards } from "@/components/section-cards";
import { DataTable } from "@/components/data-table";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import tableData from "@/app/dashboard/data.json";

interface User {
  id: string;
  documento: string;
  nombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  correoElectronico: string;
  nombreUsuario: string;
  areaId?: string;
  activo: boolean;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Obtener datos del usuario
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenido, {user.nombre} {user.primerApellido}
        </h1>
        <p className="text-muted-foreground">
          Sistema de Gestión de Calidad ISO 9001
        </p>
      </div>

      <SectionCards />

      <div className="grid auto-rows-min gap-4 lx:grid-cols-2">
        <div className="rounded-xl border bg-card">
          <ChartAreaInteractive />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold mb-4">Información del Usuario</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Nombre completo:</dt>
              <dd className="font-medium">
                {user.nombre} {user.segundoNombre || ""} {user.primerApellido}{" "}
                {user.segundoApellido || ""}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Documento:</dt>
              <dd className="font-medium">{user.documento}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Usuario:</dt>
              <dd className="font-medium">{user.nombreUsuario}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email:</dt>
              <dd className="font-medium">{user.correoElectronico}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Estado:</dt>
              <dd>
                {user.activo ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                    Inactivo
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <DataTable data={tableData} />
      </div>
    </>
  );
}
