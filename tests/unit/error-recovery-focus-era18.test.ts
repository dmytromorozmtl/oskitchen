import { describe, expect, it } from "vitest";

import {
  ERROR_RECOVERY_FOCUS_ERA18_BACKLOG_ID,
  ERROR_RECOVERY_FOCUS_ERA18_POLICY_ID,
  ERROR_RECOVERY_FOCUS_ERA18_PROOF_STATUS,
  PLATFORM_ERROR_RECOVERY_FOCUS_ERA18_BACKLOG_ID,
  PLATFORM_ERROR_RECOVERY_FOCUS_ERA18_POLICY_ID,
  PLATFORM_ERROR_RECOVERY_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/error-recovery/error-recovery-focus-era18-policy";
import {
  pickErrorRecoveryAttentionItems,
  pickErrorRecoveryEventNextActions,
  pickPlatformErrorRecoveryAttentionItems,
  pickPlatformErrorRecoveryEventNextActions,
  summarizeErrorRecoverySnapshot,
  summarizePlatformErrorRecoverySnapshot,
  type ErrorRecoverySnapshot,
  type PlatformErrorRecoverySnapshot,
} from "@/lib/error-recovery/error-recovery-focus-era18";
import type { ObservabilityErrorEvent } from "@/services/observability/error-event-service";

function emptyPlatformSnapshot(
  over: Partial<PlatformErrorRecoverySnapshot> = {},
): PlatformErrorRecoverySnapshot {
  return {
    webhookPending: 0,
    integrationErrors: 0,
    automationFailures: 0,
    openTickets: 0,
    criticalTickets: 0,
    activeIncidents: 0,
    criticalProductionIncidents: 0,
    ...over,
  };
}

function emptySnapshot(over: Partial<ErrorRecoverySnapshot> = {}): ErrorRecoverySnapshot {
  return {
    failedWebhooks: 0,
    errorIntegrations: 0,
    failedExternalOrders: 0,
    failedImports: 0,
    unmappedProducts: 0,
    cronOpenIncidents: 0,
    cronStalledEscalations: 0,
    productionIncidentsOpen: 0,
    productionIncidentsCritical: 0,
    ...over,
  };
}

function sampleEvent(over: Partial<ObservabilityErrorEvent> = {}): ObservabilityErrorEvent {
  return {
    id: "webhook:abc",
    severity: "medium",
    workspaceId: "ws-1",
    workspaceLabel: "Demo",
    module: "WEBHOOKS",
    provider: "SHOPIFY",
    affectedEntityType: "WebhookEvent",
    affectedEntityId: "abc",
    summary: "orders/create: signature mismatch",
    firstSeen: new Date("2026-05-28T10:00:00Z"),
    lastSeen: new Date("2026-05-28T10:00:00Z"),
    retryCount: 1,
    nextRecommendedAction: "Verify signing secret and replay safely.",
    safeRetryHref: "/dashboard/sales-channels/webhooks",
    supportTicketHref: "/dashboard/support/inbox",
    auditHref: "/dashboard/audit-logs",
    ...over,
  };
}

describe("error-recovery-focus-era18 policy", () => {
  it("registers era18 error recovery focus proof", () => {
    expect(ERROR_RECOVERY_FOCUS_ERA18_POLICY_ID).toBe("era18-error-recovery-focus-v1");
    expect(ERROR_RECOVERY_FOCUS_ERA18_PROOF_STATUS).toBe("error_recovery_focus_attention_wired");
    expect(ERROR_RECOVERY_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-019");
  });

  it("registers era18 platform error recovery focus proof", () => {
    expect(PLATFORM_ERROR_RECOVERY_FOCUS_ERA18_POLICY_ID).toBe(
      "era18-platform-error-recovery-focus-v1",
    );
    expect(PLATFORM_ERROR_RECOVERY_FOCUS_ERA18_PROOF_STATUS).toBe(
      "platform_error_recovery_focus_attention_wired",
    );
    expect(PLATFORM_ERROR_RECOVERY_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-020");
  });
});

describe("pickErrorRecoveryAttentionItems", () => {
  it("prioritizes critical production incidents first", () => {
    const items = pickErrorRecoveryAttentionItems(
      emptySnapshot({
        productionIncidentsCritical: 2,
        errorIntegrations: 5,
        failedExternalOrders: 3,
      }),
    );

    expect(items[0]?.id).toBe("production-critical");
    expect(items[0]?.tone).toBe("urgent");
    expect(items.some((item) => item.id === "integration-errors")).toBe(true);
  });

  it("escalates cron stalled escalations to urgent tone", () => {
    const items = pickErrorRecoveryAttentionItems(
      emptySnapshot({
        cronOpenIncidents: 1,
        cronStalledEscalations: 2,
      }),
    );

    expect(items[0]?.id).toBe("cron-attention");
    expect(items[0]?.tone).toBe("urgent");
    expect(items[0]?.detail).toContain("stalled escalation");
  });

  it("returns empty when all signals are clear", () => {
    expect(pickErrorRecoveryAttentionItems(emptySnapshot())).toEqual([]);
  });

  it("caps category attention at four items", () => {
    const items = pickErrorRecoveryAttentionItems(
      emptySnapshot({
        productionIncidentsOpen: 1,
        cronOpenIncidents: 2,
        errorIntegrations: 1,
        failedExternalOrders: 4,
        failedImports: 2,
        unmappedProducts: 10,
        failedWebhooks: 50,
      }),
    );

    expect(items).toHaveLength(4);
    expect(items.map((item) => item.id)).toEqual([
      "production-open",
      "cron-attention",
      "integration-errors",
      "failed-channel-orders",
    ]);
  });
});

describe("pickErrorRecoveryEventNextActions", () => {
  it("sorts high severity before medium regardless of time", () => {
    const actions = pickErrorRecoveryEventNextActions([
      sampleEvent({
        id: "import:1",
        severity: "low",
        summary: "Import failed",
        lastSeen: new Date("2026-05-28T12:00:00Z"),
        safeRetryHref: "/dashboard/import-center/history",
      }),
      sampleEvent({
        id: "webhook:2",
        severity: "high",
        summary: "Async job exhausted retries",
        lastSeen: new Date("2026-05-27T08:00:00Z"),
      }),
    ]);

    expect(actions[0]?.id).toBe("webhook:2");
    expect(actions[0]?.tone).toBe("urgent");
  });

  it("returns empty for no recent events", () => {
    expect(pickErrorRecoveryEventNextActions([])).toEqual([]);
  });
});

describe("summarizeErrorRecoverySnapshot", () => {
  it("flags urgent when integration or channel orders fail", () => {
    const summary = summarizeErrorRecoverySnapshot(
      emptySnapshot({ errorIntegrations: 1, failedExternalOrders: 0 }),
    );
    expect(summary.hasUrgent).toBe(true);
    expect(summary.totalSignals).toBe(1);
  });
});

describe("pickPlatformErrorRecoveryAttentionItems", () => {
  it("prioritizes critical production incidents and critical tickets", () => {
    const items = pickPlatformErrorRecoveryAttentionItems(
      emptyPlatformSnapshot({
        criticalProductionIncidents: 1,
        criticalTickets: 3,
        integrationErrors: 5,
      }),
    );

    expect(items[0]?.id).toBe("production-critical");
    expect(items.some((item) => item.id === "critical-tickets")).toBe(true);
    expect(items[0]?.href).toBe("/platform/incidents");
  });

  it("returns empty when platform signals are clear", () => {
    expect(pickPlatformErrorRecoveryAttentionItems(emptyPlatformSnapshot())).toEqual([]);
  });
});

describe("pickPlatformErrorRecoveryEventNextActions", () => {
  it("prefixes workspace label for cross-tenant triage", () => {
    const actions = pickPlatformErrorRecoveryEventNextActions([
      sampleEvent({
        workspaceLabel: "Pilot Cafe",
        safeRetryHref: "/platform/webhooks",
      }),
    ]);

    expect(actions[0]?.title).toContain("[Pilot Cafe]");
    expect(actions[0]?.href).toBe("/platform/webhooks");
  });
});

describe("summarizePlatformErrorRecoverySnapshot", () => {
  it("flags urgent when critical tickets or integrations fail", () => {
    const summary = summarizePlatformErrorRecoverySnapshot(
      emptyPlatformSnapshot({ criticalTickets: 2 }),
    );
    expect(summary.hasUrgent).toBe(true);
  });
});
