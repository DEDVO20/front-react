import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AccionCorrectiva } from "@/services/accionCorrectiva.service";

interface GraficosAccionesProps {
    acciones: AccionCorrectiva[];
}

const COLORS = {
    correctiva: '#EF4444', // Rojo
    preventiva: '#F59E0B', // Naranja
    mejora: '#10B981',     // Verde
    pendiente: '#94A3B8',  // Gris azulado
    en_proceso: '#3B82F6', // Azul
    implementada: '#8B5CF6', // Violeta
    verificada: '#10B981', // Verde
    cerrada: '#64748B',    // Gris
};

export default function GraficosAcciones({ acciones }: GraficosAccionesProps) {
    // Datos para gráfico por Estado
    const datosEstado = useMemo(() => {
        const counts = acciones.reduce((acc, curr) => {
            acc[curr.estado] = (acc[curr.estado] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return [
            { name: 'Pendiente', valor: counts['pendiente'] || 0, fill: COLORS.pendiente },
            { name: 'En Proceso', valor: counts['en_proceso'] || 0, fill: COLORS.en_proceso },
            { name: 'Implementada', valor: counts['implementada'] || 0, fill: COLORS.implementada },
            { name: 'Verificada', valor: counts['verificada'] || 0, fill: COLORS.verificada },
            { name: 'Cerrada', valor: counts['cerrada'] || 0, fill: COLORS.cerrada },
        ];
    }, [acciones]);

    // Datos para gráfico por Tipo
    const datosTipo = useMemo(() => {
        const counts = acciones.reduce((acc, curr) => {
            acc[curr.tipo] = (acc[curr.tipo] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return [
            { name: 'Correctiva', value: counts['correctiva'] || 0, color: COLORS.correctiva },
            { name: 'Preventiva', value: counts['preventiva'] || 0, color: COLORS.preventiva },
            { name: 'Mejora', value: counts['mejora'] || 0, color: COLORS.mejora },
        ].filter(item => item.value > 0);
    }, [acciones]);

    // Datos para tendencia mensual (últimos 6 meses)
    const datosTendencia = useMemo(() => {
        const hoy = new Date();
        const ultimos6Meses = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(hoy.getFullYear(), hoy.getMonth() - 5 + i, 1);
            return {
                mes: d.toLocaleString('es-CO', { month: 'short' }), // Ene, Feb, etc.
                key: `${d.getFullYear()}-${d.getMonth()}`,
                total: 0,
                cerradas: 0
            };
        });

        acciones.forEach(accion => {
            const fecha = new Date(accion.creadoEn);
            const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
            const mesData = ultimos6Meses.find(m => m.key === key);

            if (mesData) {
                mesData.total += 1;
                if (accion.estado === 'cerrada' || accion.estado === 'verificada') {
                    mesData.cerradas += 1;
                }
            }
        });

        return ultimos6Meses;
    }, [acciones]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estado de Acciones - Barras */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-1 rounded-2xl shadow-sm border-[#E5E7EB]">
                <CardHeader>
                    <CardTitle className="text-lg text-[#1E3A8A]">Estado de Acciones</CardTitle>
                    <CardDescription>Distribución actual por estado de gestión</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={datosEstado} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#F1F5F9' }}
                                />
                                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                                    {datosEstado.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Tipos de Acciones - Donut */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-1 rounded-2xl shadow-sm border-[#E5E7EB]">
                <CardHeader>
                    <CardTitle className="text-lg text-[#1E3A8A]">Tipos de Acciones</CardTitle>
                    <CardDescription>Clasificación por naturaleza de la acción</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={datosTipo}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {datosTipo.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Tendencia de Creación - Área */}
            <Card className="col-span-1 md:col-span-2 rounded-2xl shadow-sm border-[#E5E7EB]">
                <CardHeader>
                    <CardTitle className="text-lg text-[#1E3A8A]">Tendencia de Gestión (Últimos 6 Meses)</CardTitle>
                    <CardDescription>Volumen de acciones creadas vs cerradas/verificadas</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={datosTendencia} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCerradas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="mes" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    name="Nuevas Acciones"
                                    stroke="#3B82F6"
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="cerradas"
                                    name="Cerradas/Verificadas"
                                    stroke="#10B981"
                                    fillOpacity={1}
                                    fill="url(#colorCerradas)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
