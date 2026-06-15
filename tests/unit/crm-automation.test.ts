import { describe, expect, it } from "vitest";

import {
  buildCrmAutomationLane,
  buildCrmAutomationQueueItem,
  buildCrmAutomationSnapshot,
} from "@/lib/crm/automation-builders";
import {
  CRM_AUTOMATION_PATH,
  CRM_AUTOMATION_POLICY_ID,
  CRM_AUTOMATION_SERVICE,
  CRM_AUTOMATION_WIN_BACK_DEFAULT_DAYS,
} from "@/lib/crm/automation-policy";
import {
  DEFAULT_CRM_AUTOMATION_CONFIG,
  parseCrmAutomationConfig,
} from "@/lib/crm/automation-settings";

describe("CRM Automation", () => {
  it("locks policy constants", () => {
    expect(CRM_AUTOMATION_POLICY_ID).toBe("crm-automation-v1");
    expect(CRM_AUTOMATION_SERVICE).toBe("services/crm/automation-service.ts");
    expect(CRM_AUTOMATION_PATH).toBe("/dashboard/crm/automation");
    expect(CRM_AUTOMATION_WIN_BACK_DEFAULT_DAYS).toBe(45);
  });

  it("parses automation config with defaults", () => {
    expect(parseCrmAutomationConfig(null)).toEqual(DEFAULT_CRM_AUTOMATION_CONFIG);
    expect(
      parseCrmAutomationConfig({ winBackEnabled: false, favoritesInactiveDays: 14 }),
    ).toMatchObject({ winBackEnabled: false, favoritesInactiveDays: 14 });
  });

  it("builds queue item with customer href", () => {
    const item = buildCrmAutomationQueueItem({
      kind: "win_back",
      customerId: "cust-1",
      customerName: "Jane Doe",
      message: "Inactive 60 days",
      requiresConsent: true,
      hasConsent: true,
    });

    expect(item.id).toBe("win_back-cust-1");
    expect(item.href).toBe("/dashboard/customers/cust-1");
  });

  it("assembles automation snapshot summary", () => {
    const winBackItem = buildCrmAutomationQueueItem({
      kind: "win_back",
      customerId: "c1",
      customerName: "A",
      message: "Win back",
      requiresConsent: true,
      hasConsent: true,
    });
    const birthdayItem = buildCrmAutomationQueueItem({
      kind: "birthday",
      customerId: "c2",
      customerName: "B",
      message: "Birthday",
      requiresConsent: false,
      hasConsent: true,
    });

    const snapshot = buildCrmAutomationSnapshot({
      config: DEFAULT_CRM_AUTOMATION_CONFIG,
      lanes: [
        buildCrmAutomationLane({
          kind: "win_back",
          enabled: true,
          items: [winBackItem],
        }),
        buildCrmAutomationLane({
          kind: "birthday",
          enabled: true,
          items: [birthdayItem],
        }),
        buildCrmAutomationLane({ kind: "favorites", enabled: true, items: [] }),
      ],
      followUpsCreatedToday: 3,
    });

    expect(snapshot.policyId).toBe(CRM_AUTOMATION_POLICY_ID);
    expect(snapshot.basePath).toBe(CRM_AUTOMATION_PATH);
    expect(snapshot.summary.totalPending).toBe(2);
    expect(snapshot.summary.winBackCount).toBe(1);
    expect(snapshot.summary.birthdayCount).toBe(1);
    expect(snapshot.summary.followUpsCreatedToday).toBe(3);
  });
});
