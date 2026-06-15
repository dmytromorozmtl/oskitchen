import { Lock } from "lucide-react";

import { CROSS_CHANNEL_REWARDS_GTM_LOCK_ID } from "@/lib/rewards/cross-channel-rewards-policy";
import {
  INVENTORY_DEPLETION_GTM_LOCK_ID,
  INVENTORY_DEPLETION_POLICY_SUMMARY,
} from "@/lib/inventory/inventory-depletion-policy";

export type PolicyLockedBannerVariant = "inventory_pos_only" | "rewards_dual_ledger";

const COPY: Record<
  PolicyLockedBannerVariant,
  { title: string; body: string; policyId: string; testId: string }
> = {
  inventory_pos_only: {
    title: "Inventory depletion — POS checkout only (locked policy)",
    body: INVENTORY_DEPLETION_POLICY_SUMMARY,
    policyId: INVENTORY_DEPLETION_GTM_LOCK_ID,
    testId: "policy-locked-inventory-pos-only",
  },
  rewards_dual_ledger: {
    title: "Loyalty & gift cards — separate POS and storefront ledgers (locked policy)",
    body:
      "Kitchen-ledger rewards apply at POS checkout. Storefront uses a separate ledger. Codes and balances are not interchangeable across channels until a future era ships unified schema, migration, and cert gates.",
    policyId: CROSS_CHANNEL_REWARDS_GTM_LOCK_ID,
    testId: "policy-locked-rewards-dual-ledger",
  },
};

export function PolicyLockedHonestyBanner(props: { variant: PolicyLockedBannerVariant }) {
  const copy = COPY[props.variant];

  return (
    <div
      className="rounded-lg border border-border/80 bg-muted/40 px-4 py-3 text-sm"
      data-testid={copy.testId}
      data-policy-id={copy.policyId}
    >
      <p className="flex items-center gap-2 font-medium text-foreground">
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        {copy.title}
      </p>
      <p className="mt-1.5 text-muted-foreground">{copy.body}</p>
    </div>
  );
}
