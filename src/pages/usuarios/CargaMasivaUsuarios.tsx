import { useState } from "react";
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
import { apiClient } from "@/lib/api";

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
    const [resultado, setResultado] = useState<ResultadoCarga | null>(null);

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

            const response = await apiClient.post("/usuarios/carga-masiva", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const data: ResultadoCarga = response.data;
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
            toast.error(error.response?.data?.detail || "Error al procesar el archivo");
        } finally {
            setCargando(false);
        }
    };

    const descargarPlantilla = () => {
        // Crear CSV de plantilla
        const headers = [
            'documento',
            'nombre',
            'segundo_nombre',
            'primer_apellido',
            'segundo_apellido',
            'correo_electronico',
            'nombre_usuario',
            'contrasena',
            'area_codigo',
            'roles',
            'activo'
        ];

        const ejemplos = [
            '12345678,Juan,Carlos,Pérez,García,juan.perez@empresa.com,jperez,password123,SIS,ADMIN,true',
            '87654321,María,Elena,López,Martínez,maria.lopez@empresa.com,mlopez,password456,CAL,USER,true',
        ];

        const csv = [headers.join(','), ...ejemplos].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla_usuarios.csv';
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success("Plantilla descargada");
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
                            <span>• Documento</span>
                            <span>• Nombre</span>
                            <span>• Primer Apellido</span>
                            <span>• Correo Electronico</span>
                            <span>• Nombre Usuario</span>
                            <span>• Contraseña</span>
                            <span>• Codigo de Area</span>
                            <span>• Roles (separados por coma)</span>
                        </div>
                    </div>

                    <Button onClick={descargarPlantilla} variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar Plantilla de Ejemplo
                    </Button>
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
