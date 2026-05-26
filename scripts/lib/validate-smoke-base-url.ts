/**
 * Validate STOREFRONT_SMOKE_BASE_URL before HTTP smoke (no secrets logged).
 */
import { isPlaceholderAppUrl } from "@/lib/storefront/storefront-release-env";

export type SmokeUrlValidation =
  | { ok: true; origin: string }
  | { ok: false; message: string; hint?: string };

export function validateSmokeBaseUrl(raw: string | undefined): SmokeUrlValidation {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) {
    return {
      ok: false,
      message: "STOREFRONT_SMOKE_BASE_URL is not set",
      hint: 'export STOREFRONT_SMOKE_BASE_URL="https://your-app.vercel.app"',
    };
  }
  if (trimmed.includes("<") || trimmed.includes(">")) {
    return {
      ok: false,
      message: `Invalid URL contains angle brackets: ${trimmed}`,
      hint:
        'Do not copy literally from docs. Use your real URL in quotes, e.g. export STOREFRONT_SMOKE_BASE_URL="https://kitchenos.vercel.app"',
    };
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return {
      ok: false,
      message: `Invalid URL: ${trimmed}`,
      hint: 'Must include scheme: export STOREFRONT_SMOKE_BASE_URL="https://host"',
    };
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    return { ok: false, message: `Unsupported protocol: ${url.protocol}` };
  }
  if (isPlaceholderAppUrl(url.href)) {
    return {
      ok: false,
      message: `Placeholder host "${url.hostname}"`,
      hint: "Set NEXT_PUBLIC_APP_URL and STOREFRONT_SMOKE_BASE_URL to your Vercel Production or Preview URL",
    };
  }
  const origin = url.origin.replace(/\/$/, "");
  return { ok: true, origin };
}

export function formatSmokeUrlError(v: Extract<SmokeUrlValidation, { ok: false }>): string {
  const lines = [`✗ ${v.message}`];
  if (v.hint) lines.push(`  → ${v.hint}`);
  lines.push("");
  lines.push("Find URL: Vercel → Project → Deployments → open deployment → copy domain (no trailing /)");
  return lines.join("\n");
}
