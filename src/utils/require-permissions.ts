import { redirect } from "next/navigation";
import { hasPermissions } from "./has-permissions";

export function requirePermissions(
  user:
    | { role?: string | null; permissions?: string[] | null }
    | null
    | undefined,
  requiredPermissions: string[] = [],
  moduleName = "",
) {
  if (hasPermissions(user, requiredPermissions)) return;

  return redirect(
    `/nao-autorizado?moduleName=${encodeURIComponent(moduleName)}`,
  );
}

export default requirePermissions;
