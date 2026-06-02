export const DEMO_SESSION_HOURS = 2;

export function demoSessionExpiresAt(from: Date = new Date()): Date {
  return new Date(from.getTime() + DEMO_SESSION_HOURS * 60 * 60 * 1000);
}

export function isDemoSessionExpired(expiresAt: Date | null | undefined, now = new Date()): boolean {
  if (!expiresAt) return false;
  return expiresAt.getTime() <= now.getTime();
}

export function formatDemoTimeRemaining(
  expiresAt: Date | null | undefined,
  now = new Date(),
): string | null {
  if (!expiresAt) return null;
  const ms = expiresAt.getTime() - now.getTime();
  if (ms <= 0) return "expired";
  const totalMinutes = Math.ceil(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function isGuestDemoEmail(email: string | null | undefined): boolean {
  return Boolean(email?.toLowerCase().endsWith("@demo.os-kitchen.app"));
}
