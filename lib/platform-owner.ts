/**
 * Bootstrap-only platform root identity.
 * Used to seed `SUPER_ADMIN` on first platform login — not for runtime mutation authorization.
 */
export const PLATFORM_ROOT_EMAIL = "workspace.moroz@gmail.com";

/** True when email matches the bootstrap founder identity (seed / first-login only). */
export function isBootstrapPlatformRootEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === PLATFORM_ROOT_EMAIL.toLowerCase();
}

/**
 * @deprecated Runtime authorization must use `hasSuperAdminRoleRow` / `isSuperAdminUser`.
 * Kept for bootstrap scripts and gradual migration of sync UI helpers.
 */
export function isSuperAdminEmail(email: string | null | undefined): boolean {
  return isBootstrapPlatformRootEmail(email);
}
