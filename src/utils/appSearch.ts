export interface AppSearchItem {
  label: string;
  path: string;
  keywords: string[];
  group: string;
}

export const APP_SEARCH_ITEMS: AppSearchItem[] = [
  { label: "Panel de Control", path: "/dashboard", keywords: ["inicio", "home", "dashboard", "panel"], group: "General" },
  { label: "Mi Perfil", path: "/perfil", keywords: ["perfil", "foto", "cuenta"], group: "General" },
  { label: "Configuración", path: "/configuracion", keywords: ["ajustes", "configuracion", "preferencias"], group: "General" },
  { label: "Seguridad", path: "/seguridad", keywords: ["seguridad", "contraseña", "sesion", "2fa"], group: "General" },
  { label: "Reportes", path: "/reportes", keywords: ["reportes", "pdf", "analisis"], group: "General" },
  { label: "Mesa de Ayuda", path: "/mesa-ayuda", keywords: ["soporte", "ticket", "ayuda"], group: "General" },
  { label: "Manual de Usuario", path: "/manual-usuario", keywords: ["manual", "guia", "ayuda", "documentacion"], group: "General" },

  { label: "Gestionar Áreas", path: "/gestionar_areas", keywords: ["areas", "departamentos"], group: "Gestión" },
  { label: "Asignar Responsables", path: "/Asignar_Responsables", keywords: ["responsables", "areas"], group: "Gestión" },
  { label: "Lista de Usuarios", path: "/ListaDeUsuarios", keywords: ["usuarios", "personas"], group: "Gestión" },
  { label: "Nuevo Usuario", path: "/NuevoUsuario", keywords: ["crear usuario"], group: "Gestión" },
  { label: "Roles y Permisos", path: "/Roles_y_Permisos", keywords: ["roles", "permisos"], group: "Gestión" },

  { label: "Gestionar Documentos", path: "/documentos", keywords: ["documentos", "sgc"], group: "Documentos" },
  { label: "Documentos Públicos", path: "/Documentos_Publicos", keywords: ["publicos", "formatos"], group: "Documentos" },
  { label: "Control de Versiones", path: "/control-versiones", keywords: ["versiones"], group: "Documentos" },
  { label: "Aprobaciones Pendientes", path: "/Aprobaciones_Pendientes", keywords: ["aprobaciones"], group: "Documentos" },
  { label: "Revisiones Pendientes", path: "/Revisiones_Pendientes", keywords: ["revisiones"], group: "Documentos" },
  { label: "Documentos Obsoletos", path: "/Documentos_Obsoletos", keywords: ["obsoletos"], group: "Documentos" },

  { label: "Mapa de Procesos", path: "/procesos", keywords: ["mapa", "procesos"], group: "Procesos" },
  { label: "Listado de Procesos", path: "/procesos/listado", keywords: ["listado procesos"], group: "Procesos" },
  { label: "Nuevo Proceso", path: "/procesos/nuevo", keywords: ["crear proceso"], group: "Procesos" },

  { label: "Tablero Acciones Correctivas", path: "/acciones-correctivas/dashboard", keywords: ["acciones", "tablero"], group: "Calidad" },
  { label: "Nuevas Acciones Correctivas", path: "/Acciones_correctivas_Nuevas", keywords: ["nueva accion"], group: "Calidad" },
  { label: "Acciones En Proceso", path: "/Acciones_correctivas_EnProceso", keywords: ["acciones proceso"], group: "Calidad" },
  { label: "Acciones Cerradas", path: "/Acciones_correctivas_Cerradas", keywords: ["acciones cerradas"], group: "Calidad" },
  { label: "Acciones Verificadas", path: "/Acciones_correctivas_Verificadas", keywords: ["acciones verificadas"], group: "Calidad" },
  { label: "No Conformidades Abiertas", path: "/No_conformidades_Abiertas", keywords: ["nc", "no conformidad"], group: "Calidad" },
  { label: "NC En Tratamiento", path: "/No_conformidades_EnTratamiento", keywords: ["tratamiento nc"], group: "Calidad" },
  { label: "NC Cerradas", path: "/No_conformidades_Cerradas", keywords: ["nc cerradas"], group: "Calidad" },

  { label: "Planificación de Auditorías", path: "/AuditoriasPlanificacion", keywords: ["auditorias", "planificar"], group: "Auditorías" },
  { label: "Programa Anual", path: "/auditorias/programa-anual", keywords: ["programa anual"], group: "Auditorías" },
  { label: "Formularios de Auditoría", path: "/auditorias/formularios", keywords: ["formularios auditoria"], group: "Auditorías" },
  { label: "Auditorías En Curso", path: "/AuditoriasEnCurso", keywords: ["en curso"], group: "Auditorías" },
  { label: "Auditorías Completadas", path: "/AuditoriasCompletas", keywords: ["completadas"], group: "Auditorías" },
  { label: "Hallazgos", path: "/AuditoriasHallazgosView", keywords: ["hallazgos"], group: "Auditorías" },

  { label: "Matriz de Riesgos", path: "/riesgos/matriz", keywords: ["riesgos", "matriz"], group: "Riesgos" },
  { label: "Controles de Riesgo", path: "/riesgos/controles", keywords: ["controles"], group: "Riesgos" },
  { label: "Tratamiento de Riesgos", path: "/riesgos/tratamiento", keywords: ["tratamiento riesgo"], group: "Riesgos" },

  { label: "Objetivos Activos", path: "/Activos", keywords: ["objetivos"], group: "Calidad" },
  { label: "Seguimiento de Objetivos", path: "/Seguimiento", keywords: ["seguimiento"], group: "Calidad" },
  { label: "Historial de Objetivos", path: "/Historial", keywords: ["historial objetivos"], group: "Calidad" },

  { label: "Tablero de Indicadores", path: "/indicadores/tablero", keywords: ["indicadores", "tablero"], group: "Indicadores" },
  { label: "Eficacia", path: "/indicadores/eficacia", keywords: ["eficacia"], group: "Indicadores" },
  { label: "Eficiencia", path: "/indicadores/eficiencia", keywords: ["eficiencia"], group: "Indicadores" },
  { label: "Cumplimiento", path: "/indicadores/cumplimiento", keywords: ["cumplimiento"], group: "Indicadores" },

  { label: "Capacitaciones Programadas", path: "/capacitaciones/programadas", keywords: ["capacitaciones"], group: "Capacitaciones" },
  { label: "Historial de Capacitaciones", path: "/capacitaciones/historial", keywords: ["historial capacitaciones"], group: "Capacitaciones" },
  { label: "Asistencias", path: "/capacitaciones/asistencias", keywords: ["asistencias"], group: "Capacitaciones" },
  { label: "Competencias", path: "/capacitaciones/competencias", keywords: ["competencias"], group: "Capacitaciones" },
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export function searchAppRoutes(query: string, limit = 8): AppSearchItem[] {
  const q = normalize(query);
  if (!q) return [];

  return APP_SEARCH_ITEMS.filter((item) => {
    const haystack = normalize([item.label, item.group, ...item.keywords].join(" "));
    return haystack.includes(q);
  }).slice(0, limit);
}
