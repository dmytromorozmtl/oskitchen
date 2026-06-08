import { decryptOptional } from "@/lib/crypto";
import type { IntegrationConnection } from "@prisma/client";

export function getMonerisApiBase(): string {
  return process.env.MONERIS_API_BASE?.trim() ?? "https://gateway.moneris.com";
}

export function monerisGatewayHeaders(accessToken: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (accessToken?.trim()) {
    headers.Authorization = `Bearer ${accessToken.trim()}`;
  }
  return headers;
}

export type MonerisCredentials = {
  accessToken: string | null;
  apiToken: string | null;
  storeId: string | null;
};

export function parseMonerisSettings(json: unknown): Record<string, unknown> {
  if (json && typeof json === "object" && !Array.isArray(json)) {
    return json as Record<string, unknown>;
  }
  return {};
}

export function getMonerisCredentials(
  conn: Pick<IntegrationConnection, "accessTokenEncrypted" | "externalStoreId" | "settingsJson">,
): MonerisCredentials | null {
  const accessToken = decryptOptional(conn.accessTokenEncrypted);
  const settings = parseMonerisSettings(conn.settingsJson);
  const apiToken =
    (typeof settings.apiToken === "string" ? settings.apiToken : null) ??
    process.env.MONERIS_API_TOKEN?.trim() ??
    null;
  const storeId =
    (typeof settings.storeId === "string" ? settings.storeId : null) ??
    conn.externalStoreId?.trim() ??
    process.env.MONERIS_STORE_ID?.trim() ??
    null;

  if (!accessToken && !apiToken) return null;
  return { accessToken, apiToken, storeId };
}
