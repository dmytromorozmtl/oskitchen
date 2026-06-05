import type { IntegrationConnection } from "@prisma/client";

import { decryptOptional } from "@/lib/crypto";
import type { MonerisLiveConnectionSettings } from "@/lib/integrations/moneris-live-types";

export function getMonerisApiBase(): string {
  return (process.env.MONERIS_API_BASE ?? "https://gateway.moneris.com").replace(/\/$/, "");
}

export function parseMonerisSettings(settingsJson: unknown): MonerisLiveConnectionSettings {
  if (!settingsJson || typeof settingsJson !== "object") return {};
  return settingsJson as MonerisLiveConnectionSettings;
}

export function getMonerisCredentials(conn: IntegrationConnection | null) {
  const accessToken = decryptOptional(conn?.accessTokenEncrypted);
  const apiToken =
    decryptOptional(conn?.refreshTokenEncrypted) ??
    process.env.MONERIS_API_TOKEN?.trim() ??
    null;

  if (!accessToken && !apiToken) return null;

  const settings = parseMonerisSettings(conn?.settingsJson);
  const storeId =
    settings.storeId ??
    conn?.externalStoreId ??
    process.env.MONERIS_STORE_ID?.trim() ??
    null;

  return {
    accessToken,
    apiToken,
    storeId,
    settings,
    apiBase: getMonerisApiBase(),
  };
}

export function monerisGatewayHeaders(accessToken: string | null): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}
