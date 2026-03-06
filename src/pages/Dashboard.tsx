import { useEffect, useState } from "react";
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  LayoutDashboard,
  Bell,
  Search,
  ChevronRight,
  Target,
  ShieldCheck,
  AlertCircle,
  Plus,
  FileText,
  Users,
  ShieldAlert,
  BarChart3,
  CalendarDays,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import DashboardPHVA from "@/components/dashboard/DashboardPHVA";
import GraficosAcciones from "@/components/calidad/GraficosAcciones";
import { dashboardPhvaService, DashboardPHVAMetrics } from "@/services/dashboardPhva.service";
import { accionCorrectivaService, AccionCorrectiva } from "@/services/accionCorrectiva.service";
import { documentoService } from "@/services/documento.service";
import { auditoriaService } from "@/services/auditoria.service";
import { analyticsService } from "@/services/analytics";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ─── Design System ──────────────────────────────────────────────────────── */
const T = {
  navy: "#0F172A",
  blue: "#3B82F6",
  indigo: "#6366F1",
  emerald: "#10B981",
  amber: "#F59E0B",
  rose: "#F43F5E",
  violet: "#A855F7",
  cyan: "#06B6D4",
  pink: "#EC4899",
  orange: "#F97316",
  slate: "#64748B",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
};

interface GlobalStats {
  docsPendientes: number;
  ncAbiertas: number;
  auditoriasProximas: number;
  riesgosCriticos: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardPHVAMetrics | null>(null);
  const [acciones, setAcciones] = useState<AccionCorrectiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    docsPendientes: 0,
    ncAbiertas: 0,
    auditoriasProximas: 0,
    riesgosCriticos: 0
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("¡Buenos días!");
    else if (hour < 18) setGreeting("¡Buenas tardes!");
    else setGreeting("¡Buenas noches!");

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        metricsRes,
        accionesRes,
        docsRes,
        auditoriasRes,
        calidadRes
      ] = await Promise.all([
        dashboardPhvaService.getMetrics(),
        accionCorrectivaService.getAll({ limit: 1000 }),
        documentoService.getAll(),
        auditoriaService.getAll({ estado: 'planificada' }),
        analyticsService.getCalidadMetrics().catch(() => ({ noconformidades: {} }))
      ]);

      setMetrics(metricsRes);
      setAcciones(accionesRes);

      setGlobalStats({
        docsPendientes: docsRes.filter(d => d.estado === 'revision' || d.estado === 'aprobacion_pendiente').length,
        ncAbiertas: Object.values(calidadRes.noconformidades || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0) as number,
        auditoriasProximas: auditoriasRes.length,
        riesgosCriticos: metricsRes.plan.riesgosIdentificados > 0 ? Math.ceil(metricsRes.plan.riesgosIdentificados * 0.15) : 0 // Estimado si no hay servicio directo
      });

    } catch (error: any) {
      toast.error("Error al sincronizar datos globales");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Sincronizando Sistema de Gestión..." />;

  const stats = [
    {
      label: "Documentos",
      value: `${globalStats.docsPendientes} Pend.`,
      icon: FileText,
      color: T.blue,
      trend: "Revisar",
      bg: "from-blue-500/20 to-cyan-500/20",
      glow: "glow-blue",
      path: "/Aprobaciones_Pendientes"
    },
    {
      label: "No Conformidades",
      value: `${globalStats.ncAbiertas} Activas`,
      icon: ShieldAlert,
      color: T.rose,
      trend: "Gestión NC",
      bg: "from-rose-500/20 to-pink-500/20",
      glow: "glow-rose",
      path: "/No_conformidades_Abiertas"
    },
    {
      label: "Próximas Auditorías",
      value: globalStats.auditoriasProximas,
      icon: CalendarDays,
      color: T.amber,
      trend: "Ver Plan",
      bg: "from-amber-500/20 to-orange-500/20",
      glow: "glow-amber",
      path: "/AuditoriasPlanificacion"
    },
    {
      label: "Riesgos Críticos",
      value: globalStats.riesgosCriticos,
      icon: ShieldCheck,
      color: T.emerald,
      trend: "Matriz",
      bg: "from-emerald-500/20 to-teal-500/20",
      glow: "glow-emerald",
      path: "/riesgos/matriz"
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        
        .db-root { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-syne { font-family: 'Syne', sans-serif; }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04);
        }
        
        .hero-gradient {
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.2), transparent 45%),
                      radial-gradient(circle at bottom left, rgba(6, 182, 212, 0.18), transparent 45%),
                      radial-gradient(circle at center, rgba(168, 85, 247, 0.08), transparent 65%);
        }
        
        .glow-blue { box-shadow: 0 0 20px -5px rgba(59, 130, 246, 0.5); }
        .glow-emerald { box-shadow: 0 0 20px -5px rgba(16, 185, 129, 0.5); }
        .glow-rose { box-shadow: 0 0 20px -5px rgba(244, 63, 94, 0.5); }
        .glow-amber { box-shadow: 0 0 20px -5px rgba(245, 158, 11, 0.5); }
        .glow-indigo { box-shadow: 0 0 25px -5px rgba(99, 102, 241, 0.4); }

        .scroll-hide::-webkit-scrollbar { display: none; }
        .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="db-root max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 hero-gradient">

        {/* ── Header Area ── */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200/50">
                SGC PRO v2.5.0
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10B981]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistema Operativo</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
              {greeting} <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent italic">Admin</span>
            </h1>
            <p className="text-slate-500 font-medium">Pulso global de calidad y cumplimiento organizacional.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <div className="hidden lg:flex items-center px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-indigo-300 group">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar reporte..."
                className="bg-transparent border-none outline-none text-sm px-3 w-48 font-medium"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && toast.info(`Búsqueda: "${searchValue}" (En desarrollo)`)}
              />
              <kbd className="text-[10px] font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">⌘K</kbd>
            </div>
            <Button
              size="icon"
              variant="outline"
              className="rounded-2xl bg-white relative"
              onClick={() => toast.info("No tienes notificaciones pendientes")}
            >
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </Button>
            <Button
              className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:scale-105 transition-all shadow-xl shadow-indigo-200/50 gap-2 px-8 border-none text-white font-bold h-12"
              onClick={() => toast.success("Configuración de diseño guardada")}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Personalizar</span>
            </Button>
          </motion.div>
        </header>

        {/* ── Key Highlights (Pulse Global) ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.03 }}
                onClick={() => navigate(stat.path)}
                className={`glass-card p-5 rounded-3xl transition-all duration-300 hover:border-white/50 cursor-pointer ${stat.glow}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.bg} shadow-inner`} style={{ color: stat.color }}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[11px] font-black text-indigo-500 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-full`}>
                    {stat.trend} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
                <div>
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</h3>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {/* ── Module Health Matrix ── */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 font-syne uppercase italic">
            Matriz de Salud de Módulos
            <div className="h-0.5 w-12 bg-indigo-600 rounded-full" />
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Documentación", icon: FileText, color: "blue", path: "/documentos", status: "88%" },
              { label: "Procesos", icon: LayoutDashboard, color: "indigo", path: "/procesos", status: "Opt" },
              { label: "Auditorías", icon: CheckCircle2, color: "amber", path: "/AuditoriasPlanificacion", status: "Plan" },
              { label: "Riesgos", icon: ShieldAlert, color: "rose", path: "/riesgos/matriz", status: "Crit" },
              { label: "Indicadores", icon: BarChart3, color: "emerald", path: "/indicadores/tablero", status: "OK" },
              { label: "Usuarios", icon: Users, color: "violet", path: "/ListaDeUsuarios", status: "Act" },
            ].map((m) => (
              <button
                key={m.label}
                onClick={() => navigate(m.path)}
                className="group flex flex-col p-4 bg-white/60 hover:bg-white rounded-[2rem] border border-slate-100 transition-all hover:shadow-xl hover:shadow-indigo-50/50"
              >
                <div className={`w-10 h-10 rounded-2xl bg-${m.color}-50 text-${m.color}-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <m.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-slate-800">{m.status}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'Crit' ? 'bg-rose-500 animate-pulse' : m.status === 'Plan' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Main Dashboard Content ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* Left Column: PHVA & Charts */}
          <div className="xl:col-span-8 space-y-8">

            {/* PHVA Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/40 p-1 rounded-[2.5rem] border border-white/60"
            >
              <div className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-slate-100">
                <DashboardPHVA metrics={metrics} />
              </div>
            </motion.div>

            {/* Charts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 font-syne uppercase italic">
                  Analítica QMS
                  <div className="h-0.5 w-12 bg-indigo-600 rounded-full" />
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl"
                  onClick={() => navigate("/indicadores/tablero")}
                >
                  Ver detalle analítico <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <GraficosAcciones acciones={acciones} />
            </motion.div>
          </div>

          {/* Right Column: Feed & Actions */}
          <div className="xl:col-span-4 space-y-8">

            {/* Quick Actions */}
            <button
              onClick={() => navigate("/configuracion")}
              className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] text-white group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                <Settings className="w-20 h-20" />
              </div>
              <div className="z-10 text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Configuración Especial</p>
                <h4 className="text-lg font-black tracking-tight">Panel de Control SGC</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors z-10">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>

            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-bold text-slate-900 px-2">Accesos Rápidos</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Nuevo Proceso", icon: Plus, color: "indigo", path: "/procesos/nuevo" },
                  { label: "Reportar NC", icon: AlertCircle, color: "rose", path: "/No_conformidades_Abiertas" },
                  { label: "Plan Auditoría", icon: Clock, color: "amber", path: "/AuditoriasPlanificacion" },
                  { label: "Aprobaciones", icon: CheckCircle2, color: "emerald", path: "/Aprobaciones_Pendientes" },
                ].map((act) => (
                  <button
                    key={act.label}
                    onClick={() => navigate(act.path)}
                    className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all group"
                  >
                    <div className={`p-3 rounded-2xl bg-${act.color}-50 text-${act.color}-600 group-hover:scale-110 transition-transform`}>
                      <act.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 mt-3">{act.label}</span>
                  </button>
                ))}
              </div>
            </motion.section>

            {/* Recent Activity */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Actividad Reciente</h3>
                <Badge variant="secondary" className="rounded-lg bg-slate-100 text-slate-600">Hoy</Badge>
              </div>

              <div className="space-y-6">
                {acciones.slice(0, 5).map((acc, i) => (
                  <div
                    key={acc.id}
                    className="flex gap-4 relative group cursor-pointer"
                    onClick={() => navigate(`/acciones-correctivas/${acc.id}/solucionar`)}
                  >
                    {i !== 4 && <div className="absolute left-[15px] top-8 bottom-[-24px] w-0.5 bg-slate-100" />}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10 ${acc.estado === 'cerrada' ? 'bg-emerald-100 text-emerald-600' :
                      acc.estado === 'pendiente' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                      {acc.estado === 'cerrada' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                        {acc.descripcion.length > 40 ? acc.descripcion.substring(0, 40) + "..." : acc.descripcion}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{acc.tipo}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-medium text-slate-400">Hace 2 horas</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="w-full mt-8 py-3 bg-slate-50 text-slate-500 text-xs font-bold rounded-2xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                onClick={() => navigate("/Acciones_correctivas_Nuevas")}
              >
                Ver todo el historial <ArrowRight className="w-3 h-3" />
              </button>
            </motion.section>

          </div>
        </div>

      </div>
    </div>
  );
}
