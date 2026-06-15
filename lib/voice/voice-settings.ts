import { randomBytes } from "node:crypto";

export type VoiceIntegrationSettings = {
  enabled: boolean;
  alexaEnabled: boolean;
  googleEnabled: boolean;
  wakePhrase: string;
  webhookSecret: string;
};

export const DEFAULT_VOICE_SETTINGS: VoiceIntegrationSettings = {
  enabled: false,
  alexaEnabled: true,
  googleEnabled: true,
  wakePhrase: "OS Kitchen",
  webhookSecret: "",
};

export function generateVoiceWebhookSecret(): string {
  return `vos_${randomBytes(18).toString("hex")}`;
}

export function voiceSettingsFromSettingsCenter(settingsCenterJson: unknown): VoiceIntegrationSettings {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object") {
    return { ...DEFAULT_VOICE_SETTINGS, webhookSecret: generateVoiceWebhookSecret() };
  }
  const voice = (settingsCenterJson as Record<string, unknown>).voice;
  if (!voice || typeof voice !== "object") {
    return { ...DEFAULT_VOICE_SETTINGS, webhookSecret: generateVoiceWebhookSecret() };
  }
  const o = voice as Record<string, unknown>;
  const secret =
    typeof o.webhookSecret === "string" && o.webhookSecret.length >= 16
      ? o.webhookSecret
      : generateVoiceWebhookSecret();
  return {
    enabled: o.enabled === true,
    alexaEnabled: o.alexaEnabled !== false,
    googleEnabled: o.googleEnabled !== false,
    wakePhrase:
      typeof o.wakePhrase === "string" && o.wakePhrase.trim()
        ? o.wakePhrase.trim().slice(0, 80)
        : DEFAULT_VOICE_SETTINGS.wakePhrase,
    webhookSecret: secret,
  };
}

export function mergeVoiceIntoSettingsCenter(
  settingsCenterJson: unknown,
  voice: VoiceIntegrationSettings,
): Record<string, unknown> {
  const base =
    settingsCenterJson && typeof settingsCenterJson === "object"
      ? { ...(settingsCenterJson as Record<string, unknown>) }
      : {};
  base.voice = voice;
  return base;
}
