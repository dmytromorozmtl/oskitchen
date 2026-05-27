import { describe, expect, it } from "vitest";

import {
  canDoCateringQuote,
  isSuperAdminCatering,
} from "@/lib/catering/quote-permissions";
import { resolveCateringQuoteActorScope } from "@/lib/catering/resolve-catering-quote-actor-scope";

describe("catering quote platform bypass", () => {
  it("denies catering superadmin bridge when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: false,
    };

    expect(isSuperAdminCatering(scope)).toBe(false);
    expect(canDoCateringQuote(scope, "catering_quote.convert")).toBe(false);
    expect(canDoCateringQuote(scope, "catering_quote.archive")).toBe(false);
  });

  it("allows catering superadmin bridge when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: true,
    };

    expect(isSuperAdminCatering(scope)).toBe(true);
    expect(canDoCateringQuote(scope, "catering_quote.convert")).toBe(true);
    expect(canDoCateringQuote(scope, "catering_quote.read.cost_margin")).toBe(true);
  });

  it("passes platformBypass from workspace actor into catering quote scope", () => {
    const scope = resolveCateringQuoteActorScope({
      workspaceRole: "STAFF",
      email: "workspace.moroz@gmail.com",
      profileRole: "staff",
      profileEmail: "workspace.moroz@gmail.com",
      platformBypass: true,
    });

    expect(scope.platformBypass).toBe(true);
    expect(canDoCateringQuote(scope, "catering_quote.template.manage")).toBe(true);
  });

  it("preserves owner catering quote access without platformBypass", () => {
    const scope = resolveCateringQuoteActorScope({
      workspaceRole: "OWNER",
      email: "owner@example.com",
      profileRole: "OWNER",
      profileEmail: "owner@example.com",
    });

    expect(canDoCateringQuote(scope, "catering_quote.archive")).toBe(true);
    expect(canDoCateringQuote(scope, "catering_quote.share.public_link")).toBe(true);
  });

  it("preserves role-scoped catering quote access without platformBypass", () => {
    const scope = resolveCateringQuoteActorScope({
      workspaceRole: "STAFF",
      email: "sales@example.com",
      profileRole: "sales",
      profileEmail: "sales@example.com",
    });

    expect(canDoCateringQuote(scope, "catering_quote.create")).toBe(true);
    expect(canDoCateringQuote(scope, "catering_quote.production.read")).toBe(false);
  });
});
