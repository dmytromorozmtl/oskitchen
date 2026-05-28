import { describe, expect, it } from "vitest";

import {
  buildPackingQcChecklist,
  buildPackingQcHero,
  buildPackingQcClarityHref,
  packingQcPolicySnapshot,
  resolvePackingBriefingQcHref,
  summarizePackingQcChecklist,
} from "@/lib/packing/packing-qc-clarity-era19";
import {
  PACKING_QC_CLARITY_ANCHOR,
  PACKING_QC_CLARITY_ERA19_BACKLOG_ID,
  PACKING_QC_CLARITY_ERA19_POLICY_ID,
  PACKING_QC_CLARITY_ERA19_PROOF_STATUS,
} from "@/lib/packing/packing-qc-clarity-era19-policy";

const emptyFocus = {
  allergenOpenCount: 0,
  labelsMissingCount: 0,
  queuedCount: 0,
  packedUnverifiedCount: 0,
};

describe("packing-qc-clarity-era19 policy", () => {
  it("locks era19 packing QC clarity policy", () => {
    expect(PACKING_QC_CLARITY_ERA19_POLICY_ID).toBe("era19-packing-qc-clarity-v1");
    expect(PACKING_QC_CLARITY_ERA19_BACKLOG_ID).toBe("KOS-E19-032");
    expect(PACKING_QC_CLARITY_ERA19_PROOF_STATUS).toBe("packing_qc_clarity_wired");
    expect(PACKING_QC_CLARITY_ANCHOR).toBe("packing-qc-clarity");
    expect(buildPackingQcClarityHref()).toContain("#packing-qc-clarity");
  });
});

describe("buildPackingQcChecklist", () => {
  it("blocks QC when no pack tasks exist", () => {
    const steps = buildPackingQcChecklist({ focus: emptyFocus, hasTasks: false });
    expect(steps[0]?.status).toBe("blocked");
    expect(steps.every((step) => step.status === "blocked" || step.id === "review_pack_focus")).toBe(
      true,
    );
  });

  it("activates allergen step when checks are open", () => {
    const steps = buildPackingQcChecklist({
      hasTasks: true,
      focus: { ...emptyFocus, allergenOpenCount: 2, queuedCount: 3 },
    });

    expect(steps.find((step) => step.id === "clear_allergen_gaps")?.status).toBe("active");
    expect(steps.find((step) => step.id === "log_labels_and_pack")?.status).toBe("blocked");
  });

  it("activates verify step when packed lines await sign-off", () => {
    const steps = buildPackingQcChecklist({
      hasTasks: true,
      focus: { ...emptyFocus, packedUnverifiedCount: 2 },
    });

    expect(steps.find((step) => step.id === "verify_before_handoff")?.status).toBe("active");
  });

  it("marks QC clear when all gaps are resolved", () => {
    const steps = buildPackingQcChecklist({ focus: emptyFocus, hasTasks: true });
    const summary = summarizePackingQcChecklist(steps);
    expect(summary.qcClear).toBe(true);
  });
});

describe("buildPackingQcHero", () => {
  it("shows urgent hero for open allergen checks", () => {
    const hero = buildPackingQcHero({
      hasTasks: true,
      focus: { ...emptyFocus, allergenOpenCount: 1 },
    });

    expect(hero.tone).toBe("urgent");
    expect(hero.headline).toContain("allergen");
  });

  it("shows success hero when QC is clear", () => {
    const hero = buildPackingQcHero({ hasTasks: true, focus: emptyFocus });
    expect(hero.tone).toBe("success");
    expect(hero.headline).toContain("clear");
  });
});

describe("resolvePackingBriefingQcHref", () => {
  it("routes open queue briefing links to QC anchor", () => {
    expect(
      resolvePackingBriefingQcHref({
        packingQueueOpen: 3,
      }),
    ).toContain("#packing-qc-clarity");
  });

  it("preserves fallback when queue is clear", () => {
    expect(
      resolvePackingBriefingQcHref({
        packingQueueOpen: 0,
        fallbackHref: "/dashboard/packing",
      }),
    ).toBe("/dashboard/packing");
  });

  it("exports policy snapshot with QC href", () => {
    const snapshot = packingQcPolicySnapshot();
    expect(snapshot.policyId).toBe(PACKING_QC_CLARITY_ERA19_POLICY_ID);
    expect(snapshot.qcHref).toContain("#packing-qc-clarity");
  });
});
