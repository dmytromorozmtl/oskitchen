/** Detect doc/example placeholders in staging env values (incl. localized copy-paste). */

export function isPlaceholderEnvValue(val: string | undefined): boolean {
  if (!val?.trim()) return true;
  const v = val.trim();
  const patterns = [
    "yourdomain.com",
    "your-project.vercel.app",
    "your-app.vercel.app",
    "example.com",
    "YOUR-ENDPOINT",
    "YOUR-REGION",
    "YOUR-DB",
    "YOUR-ID",
    "example-12345",
    "us1-example",
    "ВАШ-ID",
    "ВАШ",
    "PROJECT",
    "PASSWORD@",
    "aws-REGION",
    "AX…",
    "AX...",
    "…",
    "https://….upstash",
    "https://…",
    "<",
    ">",
  ];
  return patterns.some((p) => v.includes(p));
}

export function isValidUpstashUrl(url: string): boolean {
  if (isPlaceholderEnvValue(url)) return false;
  try {
    const u = new URL(url);
    return u.hostname.endsWith(".upstash.io") && u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidUpstashToken(token: string): boolean {
  if (isPlaceholderEnvValue(token)) return false;
  return token.length >= 16;
}
