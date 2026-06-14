import type { IntegrationConnection } from "@prisma/client";

import { decryptOptional } from "@/lib/crypto";
import type { MailchimpLiveConnectionSettings } from "@/lib/integrations/mailchimp-live-types";

export function parseMailchimpSettings(
  settingsJson: unknown,
): MailchimpLiveConnectionSettings {
  if (!settingsJson || typeof settingsJson !== "object") return {};
  return settingsJson as MailchimpLiveConnectionSettings;
}

export function getMailchimpCredentials(conn: IntegrationConnection | null) {
  const accessToken = decryptOptional(conn?.accessTokenEncrypted);
  if (!accessToken) return null;

  const settings = parseMailchimpSettings(conn?.settingsJson);
  const apiEndpoint =
    settings.apiEndpoint?.trim() ??
    (settings.datacenter ? `https://${settings.datacenter}.api.mailchimp.com` : null);

  if (!apiEndpoint) return null;

  return {
    accessToken,
    apiEndpoint,
    datacenter: settings.datacenter ?? null,
    listId: settings.selectedListId ?? conn?.externalStoreId ?? process.env.MAILCHIMP_LIST_ID?.trim() ?? null,
    settings,
  };
}
