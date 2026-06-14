import type { IntegrationConnection } from "@prisma/client";

import { decryptOptional } from "@/lib/crypto";
import type { SquarePaymentsLiveConnectionSettings } from "@/lib/integrations/square-payments-live-types";

const API_BASE = process.env.SQUARE_PAYMENTS_API_BASE ?? "https://connect.squareup.com";
const API_VERSION = process.env.SQUARE_PAYMENTS_API_VERSION ?? "2024-01-18";

export function getSquarePaymentsApiBase(): string {
  return API_BASE.replace(/\/$/, "");
}

export function getSquarePaymentsApiVersion(): string {
  return API_VERSION;
}

export function parseSquarePaymentsSettings(
  settingsJson: unknown,
): SquarePaymentsLiveConnectionSettings {
  if (!settingsJson || typeof settingsJson !== "object") return {};
  return settingsJson as SquarePaymentsLiveConnectionSettings;
}

export function getSquarePaymentsCredentials(conn: IntegrationConnection | null) {
  const accessToken = decryptOptional(conn?.accessTokenEncrypted);
  if (!accessToken) return null;

  const settings = parseSquarePaymentsSettings(conn?.settingsJson);
  const locationId =
    settings.merchantId ??
    conn?.externalStoreId ??
    process.env.SQUARE_PAYMENTS_LOCATION_ID?.trim() ??
    null;

  return {
    accessToken,
    locationId,
    settings,
    apiBase: getSquarePaymentsApiBase(),
    apiVersion: getSquarePaymentsApiVersion(),
  };
}

export function squarePaymentsHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "Square-Version": getSquarePaymentsApiVersion(),
  };
}
