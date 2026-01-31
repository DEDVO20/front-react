import { UserCircle, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Configuracion() {
    return (
        <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Profesional */}
                <div className="bg-gradient-to-br from-[#E0EDFF] to-[#C7D2FE] rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
                                <Settings className="h-9 w-9 text-[#2563EB]" />
                                Configuración
                            </h1>
                            <p className="text-[#6B7280] mt-2 text-lg">
                                Administra la información básica de tu cuenta y preferencias
                            </p>
                        </div>
                    </div>
                </div>

                {/* PERFIL DEL USUARIO */}
                <Card className="rounded-2xl shadow-sm border-[#E5E7EB] overflow-hidden">
                    <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB] flex flex-row items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <UserCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg text-[#1E3A8A]">Perfil del Usuario</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Nombre */}
                            <div className="space-y-2">
                                <Label className="font-semibold text-gray-700">Nombre completo</Label>
                                <Input defaultValue="Administrador Sistema" className="rounded-xl px-4 py-5 h-auto" />
                            </div>

                            {/* Teléfono */}
                            <div className="space-y-2">
                                <Label className="font-semibold text-gray-700">Teléfono</Label>
                                <Input placeholder="+57 300 000 0000" className="rounded-xl px-4 py-5 h-auto" />
                            </div>

                            {/* Correo principal */}
                            <div className="space-y-2">
                                <Label className="font-semibold text-gray-700">Correo electrónico</Label>
                                <Input value="admin@sgc.com" disabled className="rounded-xl px-4 py-5 h-auto bg-gray-50 border-gray-200" />
                            </div>

                            {/* Correo de contacto */}
                            <div className="space-y-2">
                                <Label className="font-semibold text-gray-700">Correo de contacto</Label>
                                <Input placeholder="contacto@empresa.com" className="rounded-xl px-4 py-5 h-auto" />
                            </div>

                            {/* Rol */}
                            <div className="space-y-2">
                                <Label className="font-semibold text-gray-700">Rol</Label>
                                <Input value="Administrador" disabled className="rounded-xl px-4 py-5 h-auto bg-gray-50 border-gray-200" />
                            </div>

                            {/* Área */}
                            <div className="space-y-2">
                                <Label className="font-semibold text-gray-700">Área asignada</Label>
                                <Input value="Gestión de Calidad" disabled className="rounded-xl px-4 py-5 h-auto bg-gray-50 border-gray-200" />
                            </div>

                            {/* Idioma */}
                            <div className="space-y-2">
                                <Label className="font-semibold text-gray-700">Idioma</Label>
                                <Select defaultValue="es">
                                    <SelectTrigger className="rounded-xl px-4 py-5 h-auto">
                                        <SelectValue placeholder="Selecciona un idioma" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="es">Español</SelectItem>
                                        <SelectItem value="en">Inglés</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Zona horaria */}
                            <div className="space-y-2">
                                <Label className="font-semibold text-gray-700">Zona horaria</Label>
                                <Select defaultValue="America/Bogota">
                                    <SelectTrigger className="rounded-xl px-4 py-5 h-auto">
                                        <SelectValue placeholder="Selecciona una zona horaria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="America/Bogota">
                                            (GMT-5) América / Bogotá
                                        </SelectItem>
                                        <SelectItem value="America/Mexico_City">
                                            (GMT-6) México
                                        </SelectItem>
                                        <SelectItem value="America/Argentina/Buenos_Aires">
                                            (GMT-3) Buenos Aires
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl px-8 py-6 h-auto font-bold shadow-sm">
                                Guardar cambios
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
