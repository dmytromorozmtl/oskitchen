import type { UserRole } from "@prisma/client";

export function canSupervisorOverride(input: {
  role: UserRole;
  platformBypass?: boolean;
}): boolean {
  if (input.platformBypass) return true;
  return input.role === "OWNER";
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
