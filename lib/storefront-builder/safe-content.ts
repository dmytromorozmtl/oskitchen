const UNSAFE_PROTOCOL = /^\s*(javascript|data|vbscript):/i;

export function assertSafeHttpsUrl(url: string, opts?: { allowHttpLocal?: boolean }): { ok: true; url: string } | { ok: false; reason: string } {
  const u = url.trim();
  if (!u) return { ok: false, reason: "URL is empty." };
  if (UNSAFE_PROTOCOL.test(u)) return { ok: false, reason: "URL uses an unsafe protocol." };
  try {
    const parsed = new URL(u);
    if (parsed.protocol === "https:") return { ok: true, url: u };
    if (opts?.allowHttpLocal && parsed.protocol === "http:" && (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")) {
      return { ok: true, url: u };
    }
    if (parsed.protocol === "http:") return { ok: false, reason: "HTTP is only allowed for localhost in development." };
    return { ok: false, reason: "URL must be HTTPS." };
  } catch {
    return { ok: false, reason: "URL is not valid." };
  }
}

/** Strip script-like patterns from plain text blocks (not a full HTML sanitizer). */
export function sanitizeRichTextLite(input: string): string {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}
