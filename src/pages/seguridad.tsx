import { useState } from "react";
import { ShieldCheck, KeyRound, Smartphone, LogOut, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Seguridad() {
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    return (
        <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Profesional */}
                <div className="bg-gradient-to-br from-[#E0EDFF] to-[#C7D2FE] rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
                                <Shield className="h-9 w-9 text-[#2563EB]" />
                                Seguridad
                            </h1>
                            <p className="text-[#6B7280] mt-2 text-lg">
                                Administra la seguridad y el acceso a tu cuenta
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        {/* Cambio de contraseña */}
                        <Card className="rounded-2xl shadow-sm border-[#E5E7EB] overflow-hidden">
                            <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB] flex flex-row items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <KeyRound className="h-5 w-5 text-blue-600" />
                                </div>
                                <CardTitle className="text-lg text-[#1E3A8A]">Cambiar contraseña</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid gap-2">
                                    <Label className="font-semibold text-gray-700">Contraseña actual</Label>
                                    <Input type="password" placeholder="••••••••" className="rounded-xl" />
                                </div>

                                <div className="grid gap-2">
                                    <Label className="font-semibold text-gray-700">Nueva contraseña</Label>
                                    <Input type="password" placeholder="Mínimo 8 caracteres" className="rounded-xl" />
                                </div>

                                <div className="grid gap-2">
                                    <Label className="font-semibold text-gray-700">Confirmar nueva contraseña</Label>
                                    <Input type="password" placeholder="Repite la contraseña" className="rounded-xl" />
                                </div>

                                <Button className="mt-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl px-6 py-5 h-auto font-bold w-full md:w-auto">
                                    Actualizar contraseña
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Verificación en dos pasos */}
                        <Card className="rounded-2xl shadow-sm border-[#E5E7EB] overflow-hidden">
                            <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB] flex flex-row items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                                </div>
                                <CardTitle className="text-lg text-[#1E3A8A]">Verificación en dos pasos</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-gray-800">
                                        Autenticación en dos pasos (2FA)
                                    </p>
                                    <p className="text-sm text-[#6B7280]">
                                        Añade una capa extra de seguridad a tu cuenta
                                    </p>
                                </div>
                                <Switch
                                    checked={twoFactorEnabled}
                                    onCheckedChange={setTwoFactorEnabled}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sesiones activas */}
                    <Card className="rounded-2xl shadow-sm border-[#E5E7EB] overflow-hidden h-fit">
                        <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB] flex flex-row items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Smartphone className="h-5 w-5 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg text-[#1E3A8A]">Sesiones activas</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Sesión actual */}
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div>
                                    <p className="text-sm font-bold text-blue-900">
                                        Windows · Chrome
                                    </p>
                                    <p className="text-xs text-blue-700">
                                        Bogotá, Colombia · Activa ahora
                                    </p>
                                </div>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full border border-green-200">
                                    Sesión actual
                                </span>
                            </div>

                            <Separator className="bg-gray-100" />

                            {/* Otra sesión */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <p className="text-sm font-bold text-gray-800">
                                        Android · Chrome
                                    </p>
                                    <p className="text-xs text-[#6B7280]">
                                        Medellín, Colombia · Hace 2 días
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="flex items-center gap-2 rounded-xl"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Cerrar sesión
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
