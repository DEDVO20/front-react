import { getCurrentUser } from "@/services/auth";

const PERMISSION_ALIASES: Record<string, string[]> = {
  "sistema.config": ["sistema.config", "sistema.configurar"],
  "usuarios.gestion": ["usuarios.gestion", "usuarios.crear", "usuarios.editar", "usuarios.eliminar"],
  "areas.gestionar": ["areas.gestionar", "procesos.admin"],
  "noconformidades.gestion": ["noconformidades.gestion", "no_conformidades.gestionar", "acciones_correctivas.gestionar"],
  "noconformidades.reportar": ["noconformidades.reportar"],
  "noconformidades.cerrar": ["noconformidades.cerrar"],
  "riesgos.gestion": ["riesgos.gestion", "riesgos.administrar"],
  "capacitaciones.gestion": ["capacitaciones.gestion", "capacitaciones.gestionar"],
};

export function getUserPermissions(): string[] {
  const user = getCurrentUser();
  return Array.isArray(user?.permisos) ? user.permisos : [];
}

function expandPermissions(required: string[]): string[] {
  const expanded = new Set<string>();
  required.forEach((code) => {
    (PERMISSION_ALIASES[code] || [code]).forEach((c) => expanded.add(c));
  });
  return Array.from(expanded);
}

export function hasAnyPermission(required: string[]): boolean {
  const userPerms = getUserPermissions();
  if (userPerms.includes("sistema.admin")) return true;
  const expanded = expandPermissions(required);
  return expanded.some((perm) => userPerms.includes(perm));
}
