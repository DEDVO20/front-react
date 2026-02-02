import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/auth";
import { SectionCards } from "@/components/section-cards";
import { DataTable } from "@/components/data-table";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import tableData from "@/app/dashboard/data.json";
import { Badge } from "@/components/ui/badge";
import { Activity, ShieldCheck, User, Mail, Smartphone, Globe } from "lucide-react";

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
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-slate-200" />
          <p className="text-slate-400 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Welcome Section */}
      <div className="premium-gradient p-8 md:p-12 rounded-3xl shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 bg-white/40 rounded-full blur-3xl group-hover:bg-white/60 transition-all duration-700" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 bg-blue-400/10 rounded-full blur-3xl group-hover:bg-blue-400/20 transition-all duration-700" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="bg-blue-600/10 text-blue-700 border-blue-200 backdrop-blur-md rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
                Sistema Activo
              </Badge>
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-slate-900">
              Hola, {user.nombre}
            </h1>
            <p className="text-slate-600 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
              Gestión estratégica para ISO 9001:2015. Tienes <span className="text-blue-700 font-bold underline decoration-blue-500/30">3 tareas</span> pendientes que requieren tu atención hoy.
            </p>
          </div>
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-4 rounded-2xl flex items-center gap-4 group-hover:scale-105 transition-transform duration-500 shadow-sm">
            <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-tighter">Estado de Calidad</p>
              <p className="text-3xl font-black text-blue-900">96%</p>
            </div>
          </div>
        </div>
      </div>

      <SectionCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 premium-card rounded-2xl p-1">
          <ChartAreaInteractive />
        </div>

        <div className="premium-card rounded-3xl p-8 bg-slate-50 dark:bg-slate-900/50 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" /> Mi Perfil
            </h3>
            <Badge className={user.activo ? "bg-green-500/10 text-green-600 border-none" : "bg-red-500/10 text-red-600 border-none"}>
              {user.activo ? "En línea" : "Inactivo"}
            </Badge>
          </div>

          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <User size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Nombre Completo</p>
                <p className="font-bold text-slate-700 dark:text-slate-200">
                  {user.nombre} {user.primerApellido}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                <Mail size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Correo Institucional</p>
                <p className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
                  {user.correoElectronico}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                <Smartphone size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Identificación</p>
                <p className="font-bold text-slate-700 dark:text-slate-200">{user.documento}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <Globe size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Usuario</p>
                <p className="font-bold text-slate-700 dark:text-slate-200">@{user.nombreUsuario}</p>
              </div>
            </div>
          </div>

          <button className="mt-8 w-full py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
            Ver Configuración <Globe className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="premium-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-500" /> Registro de Seguimiento
          </h3>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700">Ver todo</button>
        </div>
        <div className="p-0 overflow-x-auto">
          <DataTable data={tableData} />
        </div>
      </div>
    </div>
  );
}

