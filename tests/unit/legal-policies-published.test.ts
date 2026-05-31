import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("areLegalPoliciesPublished", () => {
  const key = "LEGAL_POLICIES_PUBLISHED";
  let previous: string | undefined;

  beforeEach(() => {
    previous = process.env[key];
    vi.resetModules();
  });

  afterEach(() => {
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  });

  it("is false when unset", async () => {
    delete process.env[key];
    const { areLegalPoliciesPublished } = await import("@/lib/legal/legal-policies-published");
    expect(areLegalPoliciesPublished()).toBe(false);
  });

  it("is true for true / 1 / yes (case-insensitive)", async () => {
    for (const v of ["true", "TRUE", "1", "yes", " Yes "]) {
      vi.resetModules();
      process.env[key] = v;
      const { areLegalPoliciesPublished } = await import("@/lib/legal/legal-policies-published");
      expect(areLegalPoliciesPublished()).toBe(true);
    }
  });

  it("is false for arbitrary strings", async () => {
    process.env[key] = "maybe";
    const { areLegalPoliciesPublished } = await import("@/lib/legal/legal-policies-published");
    expect(areLegalPoliciesPublished()).toBe(false);
  });
});

describe("legalPolicyPageMetadata", () => {
  const key = "LEGAL_POLICIES_PUBLISHED";
  let previous: string | undefined;

  beforeEach(() => {
    previous = process.env[key];
    vi.resetModules();
  });

  afterEach(() => {
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  });

  it("sets noindex when draft", async () => {
    delete process.env[key];
    const { legalPolicyPageMetadata } = await import("@/lib/legal/legal-policies-published");
    const m = legalPolicyPageMetadata({ slug: "privacy", appName: "OS Kitchen" });
    expect(m.robots).toEqual({ index: false, follow: false });
    expect(String(m.title)).toMatch(/draft/i);
  });

  it("allows indexing when published", async () => {
    process.env[key] = "true";
    vi.resetModules();
    const { legalPolicyPageMetadata } = await import("@/lib/legal/legal-policies-published");
    const m = legalPolicyPageMetadata({ slug: "terms", appName: "OS Kitchen" });
    expect(m.robots).toEqual({ index: true, follow: true });
    expect(String(m.title)).not.toMatch(/\(draft\)/i);
  });
});
