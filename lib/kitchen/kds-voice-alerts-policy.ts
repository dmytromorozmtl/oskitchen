import { KDS_RUSH_MODE_POLICY_ID } from "@/lib/kitchen/kds-rush-mode-policy";

export const KDS_VOICE_ALERTS_POLICY_ID = "kds-voice-alerts-v1" as const;

export const KDS_VOICE_ALERTS_SERVICE = "services/kitchen/voice-alerts.ts" as const;

export const KDS_VOICE_ALERTS_EXTENDS_POLICIES = [KDS_RUSH_MODE_POLICY_ID] as const;

export const KDS_VOICE_ALERT_DEFAULT_RATE = 1.05 as const;

export const KDS_VOICE_ALERT_DEFAULT_PITCH = 1 as const;

export const KDS_VOICE_ALERT_DEFAULT_VOLUME = 0.9 as const;
