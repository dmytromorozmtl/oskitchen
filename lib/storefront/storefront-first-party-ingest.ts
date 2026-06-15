import { toJsonValue } from "@/lib/prisma/json";
import {
  parseFirstPartyAnalyticsMode,
  STOREFRONT_ANALYTICS_CONSENT_COOKIE,
  type FirstPartyAnalyticsMode,
} from "@/lib/storefront/consent";

type IngestBody = {
  storeSlug: string;
  eventName: string;
  path?: string;
  metadata?: Record<string, unknown>;
  referrer?: string;
};

type FpScriptPayload = {
  mode?: string;
  fpToken?: string | null;
  strictIngest?: boolean;
  ingestDisabled?: boolean;
};

function readFpScriptPayload(): FpScriptPayload {
  if (typeof document === "undefined") return {};
  const el = document.getElementById("kos-storefront-fp-analytics");
  if (!el?.textContent?.trim()) return {};
  try {
    return JSON.parse(el.textContent) as FpScriptPayload;
  } catch {
    return {};
  }
}

function readFirstPartyModeFromPage(): FirstPartyAnalyticsMode {
  const j = readFpScriptPayload();
  return parseFirstPartyAnalyticsMode(j.mode);
}

/**
 * Posts to `/api/storefront/analytics` with first-party consent headers and optional signed token.
 * Call only from client components / effects.
 */
export async function ingestStorefrontFirstPartyEvent(
  body: IngestBody,
  opts?: { firstPartyMode?: FirstPartyAnalyticsMode },
): Promise<void> {
  const script = readFpScriptPayload();
  const mode = opts?.firstPartyMode ?? readFirstPartyModeFromPage();
  if (mode === "DISABLED") return;
  if (script.ingestDisabled) return;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (mode === "CONSENT_REQUIRED") {
    const m = document.cookie.match(new RegExp(`(?:^|; )${STOREFRONT_ANALYTICS_CONSENT_COOKIE}=([^;]*)`));
    const v = m?.[1] ? decodeURIComponent(m[1]) : "";
    if (v !== "granted") return;
    headers["x-kos-fp-consent"] = "granted";
  } else {
    headers["x-kos-fp-consent"] = "always";
  }

  const fpToken = typeof script.fpToken === "string" && script.fpToken.trim() ? script.fpToken.trim() : "";
  if (script.strictIngest && !fpToken) return;
  if (fpToken) {
    headers["x-kos-fp-analytics-token"] = fpToken;
  }

  await fetch("/api/storefront/analytics", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  }).catch(() => {});
}
