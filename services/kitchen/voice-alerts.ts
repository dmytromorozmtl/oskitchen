import { formatKdsTicketNumber } from "@/lib/kitchen/kds-queue-clarity-era18";
import {
  KDS_VOICE_ALERT_DEFAULT_PITCH,
  KDS_VOICE_ALERT_DEFAULT_RATE,
  KDS_VOICE_ALERT_DEFAULT_VOLUME,
  KDS_VOICE_ALERTS_POLICY_ID,
} from "@/lib/kitchen/kds-voice-alerts-policy";

export type KdsVoiceAlertKind =
  | "new_order"
  | "overdue"
  | "rush_peak"
  | "rush_building"
  | "allergen";

export type KdsVoiceAlertContext = {
  orderId?: string;
  customerName?: string;
  tableName?: string | null;
  elapsedMinutes?: number;
  queueTotal?: number;
};

export type KdsVoiceAlertOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
};

export type KdsVoiceAlertMessage = {
  kind: KdsVoiceAlertKind;
  text: string;
  policyId: typeof KDS_VOICE_ALERTS_POLICY_ID;
};

const speechQueue: string[] = [];
let speaking = false;

function ticketLabel(orderId: string | undefined): string {
  if (!orderId) return "";
  return formatKdsTicketNumber(orderId);
}

export function buildKdsVoiceAlertMessage(
  kind: KdsVoiceAlertKind,
  context: KdsVoiceAlertContext = {},
): KdsVoiceAlertMessage {
  const ticket = ticketLabel(context.orderId);
  let text: string;

  switch (kind) {
    case "new_order":
      text = [
        "New order",
        context.tableName ? `table ${context.tableName}` : null,
        context.customerName ? context.customerName : null,
      ]
        .filter(Boolean)
        .join(", ")
        .concat(".");
      break;
    case "overdue":
      text = `Overdue ticket${ticket ? ` ${ticket}` : ""}. ${
        context.elapsedMinutes ?? 15
      } minutes on the line. Bump or expedite.`;
      break;
    case "rush_peak":
      text = `Peak rush. ${context.queueTotal ?? 0} active tickets. Route priority tickets first.`;
      break;
    case "rush_building":
      text = `Rush building. ${context.queueTotal ?? 0} tickets in queue.`;
      break;
    case "allergen":
      text = `Allergy alert${ticket ? `, ticket ${ticket}` : ""}. Check allergen flags before prep.`;
      break;
  }

  return {
    kind,
    text,
    policyId: KDS_VOICE_ALERTS_POLICY_ID,
  };
}

export function isKdsVoiceAlertsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function drainSpeechQueue(options?: KdsVoiceAlertOptions): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (speaking || speechQueue.length === 0) return;

  speaking = true;
  const message = speechQueue.shift()!;
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = options?.rate ?? KDS_VOICE_ALERT_DEFAULT_RATE;
  utterance.pitch = options?.pitch ?? KDS_VOICE_ALERT_DEFAULT_PITCH;
  utterance.volume = options?.volume ?? KDS_VOICE_ALERT_DEFAULT_VOLUME;

  const advance = () => {
    speaking = false;
    drainSpeechQueue(options);
  };

  utterance.onend = advance;
  utterance.onerror = advance;
  window.speechSynthesis.speak(utterance);
}

export function speakKdsVoiceAlert(message: string, options?: KdsVoiceAlertOptions): void {
  if (!isKdsVoiceAlertsSupported()) return;
  speechQueue.push(message);
  drainSpeechQueue(options);
}

export function announceKdsVoiceAlert(
  kind: KdsVoiceAlertKind,
  context: KdsVoiceAlertContext = {},
  options?: KdsVoiceAlertOptions,
): KdsVoiceAlertMessage {
  const alert = buildKdsVoiceAlertMessage(kind, context);
  speakKdsVoiceAlert(alert.text, options);
  return alert;
}

export function cancelKdsVoiceAlerts(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  speechQueue.length = 0;
  speaking = false;
}

export function kdsVoiceAlertsPolicySnapshot(): {
  policyId: typeof KDS_VOICE_ALERTS_POLICY_ID;
  supported: boolean;
} {
  return {
    policyId: KDS_VOICE_ALERTS_POLICY_ID,
    supported: isKdsVoiceAlertsSupported(),
  };
}
