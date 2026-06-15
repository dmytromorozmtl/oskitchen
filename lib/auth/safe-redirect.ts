/**
 * Validates post-auth redirect targets — blocks open redirects.
 */
export function safeInternalNextPath(
  raw: string | null | undefined,
  fallback = "/dashboard/today",
): string {
  if (!raw) return fallback;

  const trimmed = raw.trim();
  if (!trimmed) return fallback;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    if (trimmed.includes("\\") || trimmed.includes("@")) return fallback;
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const allowedHosts = [
      "os-kitchen.com",
      "www.os-kitchen.com",
      "kitchen-os-aervio.vercel.app",
      "localhost",
    ];
    const host = url.hostname.toLowerCase();
    const allowed = allowedHosts.some(
      (h) => host === h || host.endsWith(`.${h}`) || host === `localhost`,
    );
    if (allowed) {
      return url.pathname + url.search + url.hash;
    }
  } catch {
    // invalid URL
  }

  return fallback;
}
