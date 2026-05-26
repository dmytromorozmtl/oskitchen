import type { UserRole } from "@prisma/client";

import { isSuperAdminEmail } from "@/lib/platform-owner";

export function canSupervisorOverride(role: UserRole, email: string | null | undefined): boolean {
  if (isSuperAdminEmail(email)) return true;
  return role === "OWNER";
}

export function parseEmbeddedTokenFromQr(text: string): string {
  const t = text.trim();
  try {
    const u = new URL(t);
    const q = u.searchParams.get("t");
    if (q?.trim()) return q.trim();
  } catch {
    /* not a URL */
  }
  return t;
}
