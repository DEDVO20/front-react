import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Upload,
    ArrowLeft,
    Download,
    FileSpreadsheet,
    CheckCircle,
    XCircle,
    AlertCircle,
    Users,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { apiClient, API_BASE_URL } from "@/lib/api";
import { usuarioService } from "@/services/usuario.service";

const COLUMNAS_USUARIO = [
    "documento",
    "nombre",
    "segundo_nombre",
    "primer_apellido",
    "segundo_apellido",
    "correo_electronico",
    "nombre_usuario",
    "contrasena",
    "area_codigo",
    "roles",
    "activo",
] as const;

const descargarLibroExcel = (libro: XLSX.WorkBook, nombreArchivo: string) => {
    XLSX.writeFile(libro, nombreArchivo);
};

interface ErrorDetalle {
    fila: number;
    campo: string;
    valor?: string;
    error: string;
}

interface UsuarioExitoso {
    fila: number;
    nombre_usuario: string;
    nombre_completo: string;
    correo_electronico: string;
}

interface ResultadoCarga {
    total_procesados: number;
    exitosos: number;
    errores: number;
    detalles_exitosos: UsuarioExitoso[];
    detalles_errores: ErrorDetalle[];
}

export default function CargaMasivaUsuarios() {
    const navigate = useNavigate();
    const [archivo, setArchivo] = useState<File | null>(null);
    const [cargando, setCargando] = useState(false);
    const [descargando, setDescargando] = useState<"plantilla" | "usuarios" | null>(null);
    const [resultado, setResultado] = useState<ResultadoCarga | null>(null);
    const [areas, setAreas] = useState<{ codigo: string; nombre: string }[]>([]);
    const [roles, setRoles] = useState<{ id?: string; clave: string; nombre: string }[]>([]);

    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const [areasRes, rolesRes] = await Promise.all([
                    apiClient.get("/areas?limit=200"),
                    apiClient.get("/roles?limit=200"),
                ]);
                setAreas(Array.isArray(areasRes.data) ? areasRes.data : []);
                setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
            } catch (error) {
                console.error("No se pudieron cargar áreas o roles:", error);
            }
        };
        cargarCatalogos();
    }, []);

    const extraerMensajeError = async (error: any) => {
        const data = error?.response?.data;
        if (data instanceof Blob) {
            try {
                const parsed = JSON.parse(await data.text());
                if (typeof parsed?.detail === "string") return parsed.detail;
            } catch {
                /* ignore */
            }
        }
        const detail = data?.detail ?? error?.detail;
        if (typeof detail === "string") return detail;
        if (Array.isArray(detail)) {
            return detail.map((item) => item?.msg || item?.detail || JSON.stringify(item)).join(". ");
        }
        return error?.message || "Error al procesar el archivo";
    };

    const generarPlantillaLocal = () => {
        const areaEjemplo = areas[0]?.codigo || "CAL";
        const rolEjemplo = roles.find((r) => r.clave !== "admin")?.clave || roles[0]?.clave || "auxiliar";

        const ejemplos = [
            {
                documento: "10000001",
                nombre: "Juan",
                segundo_nombre: "Carlos",
                primer_apellido: "Perez",
                segundo_apellido: "Garcia",
                correo_electronico: "juan.perez@empresa.com",
                nombre_usuario: "jperez",
                contrasena: "Password123",
                area_codigo: areaEjemplo,
                roles: rolEjemplo,
                activo: "true",
            },
            {
                documento: "10000002",
                nombre: "Maria",
                segundo_nombre: "Elena",
                primer_apellido: "Lopez",
                segundo_apellido: "Martinez",
                correo_electronico: "maria.lopez@empresa.com",
                nombre_usuario: "mlopez",
                contrasena: "Password123",
                area_codigo: areaEjemplo,
                roles: rolEjemplo,
                activo: "true",
            },
        ];

        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(ejemplos, { header: [...COLUMNAS_USUARIO] }), "Usuarios");
        XLSX.utils.book_append_sheet(
            libro,
            XLSX.utils.json_to_sheet(
                areas.length ? areas.map((a) => ({ codigo: a.codigo, nombre: a.nombre })) : [{ codigo: "", nombre: "No hay áreas" }]
            ),
            "Areas"
        );
        XLSX.utils.book_append_sheet(
            libro,
            XLSX.utils.json_to_sheet(
                roles.length ? roles.map((r) => ({ clave: r.clave, nombre: r.nombre })) : [{ clave: "", nombre: "No hay roles" }]
            ),
            "Roles"
        );
        descargarLibroExcel(libro, "plantilla_usuarios.xlsx");
    };

    const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const extension = file.name.split('.').pop()?.toLowerCase();
            if (!['xlsx', 'xls', 'csv'].includes(extension || '')) {
                toast.error("Tipo de archivo no válido. Use .xlsx, .xls o .csv");
                return;
            }

            // Validar tamaño (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("El archivo no puede superar los 5MB");
                return;
            }

            setArchivo(file);
            setResultado(null);
        }
    };

    const handleProcesar = async () => {
        if (!archivo) {
            toast.error("Seleccione un archivo primero");
            return;
        }

        setCargando(true);

        try {
            const formData = new FormData();
            formData.append("file", archivo);

            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/usuarios/carga-masiva`, {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                body: formData,
            });

            const payload = await response.json().catch(() => ({}));

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
                return;
            }

            if (!response.ok) {
                throw new Error(
                    typeof payload?.detail === "string"
                        ? payload.detail
                        : Array.isArray(payload?.detail)
                            ? payload.detail.map((item: any) => item?.msg || item?.detail || JSON.stringify(item)).join(". ")
                            : "Error al procesar el archivo"
                );
            }

            const data: ResultadoCarga = payload;
            setResultado(data);

            if (data.errores === 0) {
                toast.success(`¡${data.exitosos} usuarios creados exitosamente!`);
            } else if (data.exitosos === 0) {
                toast.error(`No se pudo crear ningún usuario. ${data.errores} errores encontrados.`);
            } else {
                toast.warning(`${data.exitosos} usuarios creados, ${data.errores} con errores.`);
            }
        } catch (error: any) {
            console.error("Error:", error);
            toast.error(await extraerMensajeError(error));
        } finally {
            setCargando(false);
        }
    };

    const descargarPlantilla = async () => {
        setDescargando("plantilla");
        try {
            generarPlantillaLocal();
            toast.success("Plantilla descargada");
        } catch (error: any) {
            console.error(error);
            toast.error((await extraerMensajeError(error)) || "No se pudo descargar la plantilla");
        } finally {
            setDescargando(null);
        }
    };

    const exportarUsuarios = async () => {
        setDescargando("usuarios");
        try {
            const [usuarios, rolesRes] = await Promise.all([
                usuarioService.getAll({ limit: 5000 }),
                roles.length ? Promise.resolve({ data: roles }) : apiClient.get("/roles"),
            ]);

            const catalogoRoles = Array.isArray(rolesRes.data) ? rolesRes.data : roles;
            const rolesPorId = new Map<string, string>(
                catalogoRoles
                    .filter((rol: { id?: string; clave: string }) => rol.id && rol.clave)
                    .map((rol: { id?: string; clave: string }) => [String(rol.id), rol.clave])
            );

            const filas = (Array.isArray(usuarios) ? usuarios : []).map((usuario: any) => {
                const clavesRol = Array.isArray(usuario.roles)
                    ? usuario.roles
                          .map((asignacion: any) => rolesPorId.get(String(asignacion.rol_id)) || asignacion.rol?.clave || "")
                          .filter(Boolean)
                    : [];
                return {
                    documento: usuario.documento ?? "",
                    nombre: usuario.nombre || "",
                    segundo_nombre: usuario.segundo_nombre || "",
                    primer_apellido: usuario.primer_apellido || "",
                    segundo_apellido: usuario.segundo_apellido || "",
                    correo_electronico: usuario.correo_electronico || "",
                    nombre_usuario: usuario.nombre_usuario || "",
                    contrasena: "",
                    area_codigo: usuario.area?.codigo || "",
                    roles: clavesRol.join(","),
                    activo: usuario.activo ? "true" : "false",
                };
            });

            const libro = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
                libro,
                XLSX.utils.json_to_sheet(filas, { header: [...COLUMNAS_USUARIO] }),
                "Usuarios"
            );
            XLSX.utils.book_append_sheet(
                libro,
                XLSX.utils.json_to_sheet([
                    {
                        nota: "Las contraseñas no se exportan porque están cifradas. Este archivo es de consulta; para crear usuarios use la plantilla e incluya una contraseña de al menos 8 caracteres.",
                    },
                ]),
                "Nota"
            );
            descargarLibroExcel(libro, "usuarios_plataforma.xlsx");
            toast.success(`${filas.length} usuarios descargados`);
        } catch (error: any) {
            console.error(error);
            toast.error((await extraerMensajeError(error)) || "No se pudieron exportar los usuarios");
        } finally {
            setDescargando(null);
        }
    };

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6 pt-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Upload className="h-7 w-7 text-blue-600" />
                        </div>
                        Carga Masiva de Usuarios
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Cargue múltiples usuarios desde un archivo Excel o CSV
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/ListaDeUsuarios")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>
            </div>

            {/* Instrucciones y Plantilla */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                        Instrucciones
                    </CardTitle>
                    <CardDescription>
                        Siga estos pasos para cargar usuarios masivamente
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Formato del archivo:</h3>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>Tipos soportados: Excel (.xlsx, .xls) o CSV</li>
                            <li>Tamaño máximo: 5MB</li>
                            <li>Máximo 1000 usuarios por archivo</li>
                            <li>Primera fila debe contener los encabezados</li>
                        </ul>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h3 className="font-semibold text-amber-900 mb-2">Columnas requeridas:</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-amber-800">
                            <span>• documento</span>
                            <span>• nombre</span>
                            <span>• primer_apellido</span>
                            <span>• correo_electronico</span>
                            <span>• nombre_usuario</span>
                            <span>• contrasena (mín. 8 caracteres)</span>
                            <span>• area_codigo</span>
                            <span>• roles (separados por coma)</span>
                        </div>
                    </div>

                    {(areas.length > 0 || roles.length > 0) && (
                        <div className="grid gap-4 md:grid-cols-2">
                            {areas.length > 0 && (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-slate-900 mb-2">Códigos de área válidos</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {areas.map((area) => (
                                            <Badge key={area.codigo} variant="outline">
                                                {area.codigo} — {area.nombre}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {roles.length > 0 && (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-slate-900 mb-2">Claves de rol válidas</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {roles.map((rol) => (
                                            <Badge key={rol.clave} variant="outline">
                                                {rol.clave} — {rol.nombre}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid gap-3 md:grid-cols-2">
                        <Button onClick={descargarPlantilla} variant="outline" disabled={!!descargando}>
                            {descargando === "plantilla" ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-4 w-4" />
                            )}
                            Descargar Plantilla de Ejemplo
                        </Button>
                        <Button onClick={exportarUsuarios} variant="outline" disabled={!!descargando}>
                            {descargando === "usuarios" ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Users className="mr-2 h-4 w-4" />
                            )}
                            Descargar Usuarios de la Plataforma
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        La plantilla incluye ejemplos y las hojas Areas/Roles con valores válidos.
                        La exportación trae los usuarios actuales (sin contraseñas, porque están cifradas).
                    </p>
                </CardContent>
            </Card>

            {/* Carga de Archivo */}
            <Card>
                <CardHeader>
                    <CardTitle>Seleccionar Archivo</CardTitle>
                    <CardDescription>
                        Seleccione el archivo Excel o CSV con los datos de los usuarios
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleArchivoChange}
                            className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {archivo && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {archivo.name}
                            </Badge>
                        )}
                    </div>

                    <Button
                        onClick={handleProcesar}
                        disabled={!archivo || cargando}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {cargando ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Procesar Archivo
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Resultados */}
            {resultado && (
                <>
                    {/* Resumen */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Total Procesados
                                </CardDescription>
                                <CardTitle className="text-4xl font-bold">
                                    {resultado.total_procesados}
                                </CardTitle>
                            </CardHeader>
                        </Card>

                        <Card className="border-green-100">
                            <CardHeader className="pb-3">
                                <CardDescription className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    Exitosos
                                </CardDescription>
                                <CardTitle className="text-4xl font-bold text-green-600">
                                    {resultado.exitosos}
                                </CardTitle>
                            </CardHeader>
                        </Card>

                        <Card className="border-red-100">
                            <CardHeader className="pb-3">
                                <CardDescription className="flex items-center gap-2 text-red-600">
                                    <XCircle className="w-4 h-4" />
                                    Errores
                                </CardDescription>
                                <CardTitle className="text-4xl font-bold text-red-600">
                                    {resultado.errores}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Usuarios Creados */}
                    {resultado.detalles_exitosos.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="w-5 h-5" />
                                    Usuarios Creados Exitosamente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fila</TableHead>
                                            <TableHead>Usuario</TableHead>
                                            <TableHead>Nombre Completo</TableHead>
                                            <TableHead>Correo</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {resultado.detalles_exitosos.map((usuario, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{usuario.fila}</TableCell>
                                                <TableCell className="font-mono">{usuario.nombre_usuario}</TableCell>
                                                <TableCell>{usuario.nombre_completo}</TableCell>
                                                <TableCell>{usuario.correo_electronico}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    {/* Errores */}
                    {resultado.detalles_errores.length > 0 && (
                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-700">
                                    <AlertCircle className="w-5 h-5" />
                                    Errores Encontrados
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fila</TableHead>
                                            <TableHead>Campo</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead>Error</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {resultado.detalles_errores.map((error, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{error.fila}</TableCell>
                                                <TableCell className="font-mono text-sm">{error.campo}</TableCell>
                                                <TableCell className="text-sm">{error.valor || '-'}</TableCell>
                                                <TableCell className="text-red-600 text-sm">{error.error}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
