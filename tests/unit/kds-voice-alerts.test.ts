import { describe, expect, it } from "vitest";

import {
  KDS_VOICE_ALERTS_POLICY_ID,
  KDS_VOICE_ALERTS_SERVICE,
} from "@/lib/kitchen/kds-voice-alerts-policy";
import {
  announceKdsVoiceAlert,
  buildKdsVoiceAlertMessage,
  cancelKdsVoiceAlerts,
  isKdsVoiceAlertsSupported,
  kdsVoiceAlertsPolicySnapshot,
} from "@/services/kitchen/voice-alerts";

describe("KDS voice alerts", () => {
  it("locks policy constants", () => {
    expect(KDS_VOICE_ALERTS_POLICY_ID).toBe("kds-voice-alerts-v1");
    expect(KDS_VOICE_ALERTS_SERVICE).toBe("services/kitchen/voice-alerts.ts");
  });

  it("builds new order voice message", () => {
    const alert = buildKdsVoiceAlertMessage("new_order", {
      customerName: "Alex",
      tableName: "4",
    });
    expect(alert.text).toBe("New order, table 4, Alex.");
    expect(alert.policyId).toBe(KDS_VOICE_ALERTS_POLICY_ID);
  });

  it("builds overdue and allergen messages with ticket numbers", () => {
    const overdue = buildKdsVoiceAlertMessage("overdue", {
      orderId: "abc-123",
      elapsedMinutes: 18,
    });
    expect(overdue.text).toContain("Overdue ticket");
    expect(overdue.text).toContain("18 minutes");

    const allergen = buildKdsVoiceAlertMessage("allergen", { orderId: "abc-123" });
    expect(allergen.text).toContain("Allergy alert");
    expect(allergen.text).toContain("Check allergen flags");
  });

  it("builds rush peak and building messages", () => {
    expect(buildKdsVoiceAlertMessage("rush_peak", { queueTotal: 9 }).text).toContain(
      "Peak rush. 9 active tickets",
    );
    expect(buildKdsVoiceAlertMessage("rush_building", { queueTotal: 6 }).text).toContain(
      "Rush building. 6 tickets",
    );
  });

  it("reports unsupported speech synthesis in node", () => {
    expect(isKdsVoiceAlertsSupported()).toBe(false);
    expect(kdsVoiceAlertsPolicySnapshot().supported).toBe(false);
    expect(() => cancelKdsVoiceAlerts()).not.toThrow();
    expect(() => announceKdsVoiceAlert("new_order", { customerName: "Sam" })).not.toThrow();
  });
});
