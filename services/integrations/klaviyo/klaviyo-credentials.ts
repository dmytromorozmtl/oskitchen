import type { IntegrationConnection } from "@prisma/client";

import type { KlaviyoLiveConnectionSettings } from "@/lib/integrations/klaviyo-live-types";

export function getKlaviyoApiKey(): string | null {
  return process.env.KLAVIYO_API_KEY?.trim() ?? null;
}

export function isKlaviyoApiKeyConfigured(): boolean {
  return Boolean(getKlaviyoApiKey());
}

export function parseKlaviyoSettings(
  settingsJson: unknown,
): KlaviyoLiveConnectionSettings {
  if (!settingsJson || typeof settingsJson !== "object") return {};
  return settingsJson as KlaviyoLiveConnectionSettings;
}

export function getKlaviyoCredentials(conn: IntegrationConnection | null) {
  const apiKey = getKlaviyoApiKey();
  if (!apiKey) return null;
  return {
    apiKey,
    settings: parseKlaviyoSettings(conn?.settingsJson),
  };
}
