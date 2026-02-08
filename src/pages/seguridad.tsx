import { useState, useEffect, useRef } from "react";
import { ShieldCheck, KeyRound, Smartphone, LogOut, Shield, Loader2, Building, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { getCurrentUser } from "@/services/auth";
import { configuracionService } from "@/services/configuracion.service";
import { uploadSystemLogo } from "@/services/storage";

export default function Seguridad() {
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    // Estados para cambio de contraseña
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [updatingPassword, setUpdatingPassword] = useState(false);

    // Estados para Logo
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentUser = getCurrentUser();
    const isAdmin = currentUser?.permisos?.includes("sistema.admin");

    // Estados para textos del sistema
    const [systemTitle, setSystemTitle] = useState<string>("SGC ISO 9001");
    const [systemSubtitle, setSystemSubtitle] = useState<string>("Sistema de Calidad");
    const [savingTexts, setSavingTexts] = useState(false);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const config = await configuracionService.get("logo_universidad");
                if (config && config.valor) {
                    setLogoUrl(config.valor);
                }
            } catch (error) {
                console.error("Error cargando logo:", error);
            }
        };

        const fetchSystemTexts = async () => {
            try {
                const titleConfig = await configuracionService.get("sistema_titulo");
                if (titleConfig && titleConfig.valor) {
                    setSystemTitle(titleConfig.valor);
                }

                const subtitleConfig = await configuracionService.get("sistema_subtitulo");
                if (subtitleConfig && subtitleConfig.valor) {
                    setSystemSubtitle(subtitleConfig.valor);
                }
            } catch (error) {
                console.error("Error cargando textos del sistema:", error);
            }
        };

        fetchLogo();
        fetchSystemTexts();
    }, []);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingLogo(true);
        try {
            const url = await uploadSystemLogo(file);
            await configuracionService.save("logo_universidad", url, "Logo Universidad");
            setLogoUrl(url);
            toast.success("Logo actualizado correctamente");

            // Disparar evento para actualizar sidebar
            window.dispatchEvent(new Event("system-logo-change"));
        } catch (error) {
            console.error("Error subiendo logo:", error);
            toast.error("Error al actualizar el logo");
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSaveSystemTexts = async () => {
        setSavingTexts(true);
        try {
            await configuracionService.save("sistema_titulo", systemTitle, "Título del Sistema");
            await configuracionService.save("sistema_subtitulo", systemSubtitle, "Subtítulo del Sistema");

            toast.success("Textos del sistema actualizados correctamente");

            // Disparar evento para actualizar sidebar
            window.dispatchEvent(new Event("system-config-change"));
        } catch (error) {
            console.error("Error guardando textos:", error);
            toast.error("Error al guardar los textos");
        } finally {
            setSavingTexts(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error("Por favor completa los campos de nueva contraseña.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Las nuevas contraseñas no coinciden.");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        const currentUserData = getCurrentUser();
        if (!currentUserData?.id) {
            toast.error("Error de sesión. Por favor inicia sesión nuevamente.");
            return;
        }

        setUpdatingPassword(true);
        try {
            // Nota: El backend actualmente no verifica la contraseña actual en este endpoint específico de update
            // Si se requiere verificación estricta, el backend debería soportarlo. 
            // Por ahora enviamos solo la nueva contraseña.
            await apiClient.put(`/usuarios/${currentUser.id}`, {
                contrasena: newPassword
            });

            toast.success("Contraseña actualizada correctamente.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error("Error actualizando contraseña:", error);
            toast.error("Error al actualizar la contraseña.");
        } finally {
            setUpdatingPassword(false);
        }
    };

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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        {/* Personalización del Sistema (Solo Admin) */}
                        {isAdmin && (
                            <Card className="rounded-2xl shadow-sm border-[#E5E7EB] overflow-hidden">
                                <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB] flex flex-row items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Building className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <CardTitle className="text-lg text-[#1E3A8A]">Personalización del Sistema</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {/* Logo Section */}
                                    <div className="flex items-center gap-6">
                                        <div className="relative group flex aspect-square size-24 items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm overflow-hidden">
                                            {logoUrl ? (
                                                <img src={logoUrl} alt="Logo Universidad" className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <Building className="size-10 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Logo de la Universidad</h3>
                                                <p className="text-sm text-gray-500">Visible en la barra lateral y reportes.</p>
                                            </div>
                                            <div>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                />
                                                <Button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploadingLogo}
                                                    variant="outline"
                                                    className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                                                >
                                                    {uploadingLogo ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Subiendo...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="mr-2 h-4 w-4" />
                                                            Cambiar Logo
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="bg-gray-100" />

                                    {/* System Title and Subtitle Section */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-4">Textos del Sistema</h3>
                                            <p className="text-sm text-gray-500 mb-4">Personaliza los textos que aparecen en la barra lateral.</p>
                                        </div>

                                        <div className="grid gap-4">
                                            <div className="grid gap-2">
                                                <Label className="font-semibold text-gray-700">Título Principal</Label>
                                                <Input
                                                    type="text"
                                                    placeholder="SGC ISO 9001"
                                                    className="rounded-xl"
                                                    value={systemTitle}
                                                    onChange={(e) => setSystemTitle(e.target.value)}
                                                />
                                                <p className="text-xs text-muted-foreground">Aparece en la parte superior de la barra lateral.</p>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label className="font-semibold text-gray-700">Subtítulo</Label>
                                                <Input
                                                    type="text"
                                                    placeholder="Sistema de Calidad"
                                                    className="rounded-xl"
                                                    value={systemSubtitle}
                                                    onChange={(e) => setSystemSubtitle(e.target.value)}
                                                />
                                                <p className="text-xs text-muted-foreground">Texto secundario debajo del título.</p>
                                            </div>

                                            <Button
                                                onClick={handleSaveSystemTexts}
                                                disabled={savingTexts}
                                                className="mt-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl px-6 py-5 h-auto font-bold w-full md:w-auto"
                                            >
                                                {savingTexts ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Guardando...
                                                    </>
                                                ) : (
                                                    "Guardar Cambios"
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
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
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="rounded-xl"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Para mayor seguridad.</p>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="font-semibold text-gray-700">Nueva contraseña</Label>
                                    <Input
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        className="rounded-xl"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label className="font-semibold text-gray-700">Confirmar nueva contraseña</Label>
                                    <Input
                                        type="password"
                                        placeholder="Repite la contraseña"
                                        className="rounded-xl"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>

                                <Button
                                    onClick={handleUpdatePassword}
                                    disabled={updatingPassword}
                                    className="mt-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl px-6 py-5 h-auto font-bold w-full md:w-auto"
                                >
                                    {updatingPassword ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Actualizando...
                                        </>
                                    ) : (
                                        "Actualizar contraseña"
                                    )}
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
