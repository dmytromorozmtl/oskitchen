/** Canonical platform root identity — must match bootstrap + billing bypass. */
export const PLATFORM_ROOT_EMAIL = "workspace.moroz@gmail.com";

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === PLATFORM_ROOT_EMAIL.toLowerCase();
}
