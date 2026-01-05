import type { GetBytokenResponse } from "@/lib/modules/sessions/sessions-service";

type User = GetBytokenResponse["user"] | null | undefined;

export function validateBranchAccess(
  user: User,
  currentBranch: string,
): boolean {
  if (!user) {
    return false;
  }

  if (user.role === "ADMIN") {
    return true;
  }

  return user.branchs?.includes(currentBranch) ?? false;
}
