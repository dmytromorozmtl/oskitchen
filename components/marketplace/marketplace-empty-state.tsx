import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarketplaceEmptyStateIllustration } from "@/components/marketplace/marketplace-empty-state-illustration";
import {
  getMarketplaceEmptyStateDefinition,
  type MarketplaceEmptyStateScenario,
} from "@/lib/marketplace/marketplace-empty-states-policy";
import {
  MARKETPLACE_EMPTY_STATE_ILLUSTRATION_FRAME_CLASS,
  MARKETPLACE_EMPTY_STATE_ILLUSTRATION_INLINE_FRAME_CLASS,
  MARKETPLACE_EMPTY_STATE_CTA_ROW_CLASS,
  MARKETPLACE_EMPTY_STATE_VALUE_PROP_BULLET_CLASS,
  MARKETPLACE_EMPTY_STATE_VALUE_PROP_LIST_CLASS,
  MARKETPLACE_EMPTY_STATES_DESIGN_CTA_TEST_ID,
  MARKETPLACE_EMPTY_STATES_DESIGN_ILLUSTRATION_TEST_ID,
  MARKETPLACE_EMPTY_STATES_DESIGN_VALUE_PROP_TEST_ID,
  resolveMarketplaceEmptyStateIllustrationKind,
} from "@/lib/design/marketplace-empty-states-design-policy";
import {
  EMPTY_STATE_CARD_CLASS,
  EMPTY_STATE_INLINE_CLASS,
  EMPTY_STATE_TEST_ID,
} from "@/lib/design/empty-state-patterns";
import { cn } from "@/lib/utils";

export type MarketplaceEmptyStateProps = {
  scenario: MarketplaceEmptyStateScenario;
  variant?: "card" | "inline";
  className?: string;
  primaryHref?: string;
  primaryLabel?: string;
};

function MarketplaceEmptyIllustrationBlock({
  scenario,
  compact = false,
}: {
  scenario: MarketplaceEmptyStateScenario;
  compact?: boolean;
}) {
  const kind = resolveMarketplaceEmptyStateIllustrationKind(scenario);

  return (
    <div
      className={cn(
        compact
          ? MARKETPLACE_EMPTY_STATE_ILLUSTRATION_INLINE_FRAME_CLASS
          : MARKETPLACE_EMPTY_STATE_ILLUSTRATION_FRAME_CLASS,
      )}
      data-testid={MARKETPLACE_EMPTY_STATES_DESIGN_ILLUSTRATION_TEST_ID}
    >
      <MarketplaceEmptyStateIllustration kind={kind} />
    </div>
  );
}

function MarketplaceEmptyValueProps({
  items,
  compact = false,
}: {
  items: readonly string[];
  compact?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <ul
      className={cn(
        MARKETPLACE_EMPTY_STATE_VALUE_PROP_LIST_CLASS,
        compact ? "text-xs" : "text-sm",
      )}
      data-testid={MARKETPLACE_EMPTY_STATES_DESIGN_VALUE_PROP_TEST_ID}
    >
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className={MARKETPLACE_EMPTY_STATE_VALUE_PROP_BULLET_CLASS} aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function MarketplaceEmptyActions({
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  centered = false,
}: {
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  centered?: boolean;
}) {
  return (
    <div
      className={cn(
        MARKETPLACE_EMPTY_STATE_CTA_ROW_CLASS,
        centered ? "sm:justify-center" : "sm:justify-start",
      )}
      data-testid={MARKETPLACE_EMPTY_STATES_DESIGN_CTA_TEST_ID}
    >
      <Button asChild className="rounded-full" variant="premium">
        <Link href={primaryHref}>{primaryLabel}</Link>
      </Button>
      {secondaryLabel && secondaryHref ? (
        <Button asChild variant="outline" className="rounded-full">
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}

/** Engaging marketplace empty state — illustration, value props, CTAs (P1-25, P1-67). */
export function MarketplaceEmptyState({
  scenario,
  variant = "card",
  className,
  primaryHref,
  primaryLabel,
}: MarketplaceEmptyStateProps) {
  const def = getMarketplaceEmptyStateDefinition(scenario, {
    primaryHref,
    primaryLabel,
  });

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center",
          EMPTY_STATE_INLINE_CLASS,
          className,
        )}
        data-testid={EMPTY_STATE_TEST_ID}
        data-marketplace-empty-scenario={scenario}
      >
        <MarketplaceEmptyIllustrationBlock scenario={scenario} compact />
        <p className="mt-4 text-base font-medium">{def.title}</p>
        {def.description ? (
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {def.description}
          </p>
        ) : null}
        <div className="mt-4 w-full max-w-md">
          <MarketplaceEmptyValueProps items={def.valueProps.slice(0, 2)} compact />
        </div>
        <div className="mt-4 w-full max-w-md">
          <MarketplaceEmptyActions
            primaryLabel={def.primaryLabel}
            primaryHref={def.primaryHref}
            secondaryLabel={def.secondaryLabel}
            secondaryHref={def.secondaryHref}
            centered
          />
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(EMPTY_STATE_CARD_CLASS, className)}
      data-testid={EMPTY_STATE_TEST_ID}
      data-marketplace-empty-scenario={scenario}
    >
      <CardHeader className="text-center sm:text-left">
        <MarketplaceEmptyIllustrationBlock scenario={scenario} />
        <CardTitle className="mt-4 text-xl">{def.title}</CardTitle>
        {def.description ? (
          <CardDescription className="text-base leading-relaxed">{def.description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <MarketplaceEmptyValueProps items={def.valueProps} />
        <MarketplaceEmptyActions
          primaryLabel={def.primaryLabel}
          primaryHref={def.primaryHref}
          secondaryLabel={def.secondaryLabel}
          secondaryHref={def.secondaryHref}
        />
      </CardContent>
    </Card>
  );
}

/** Compact inline empty for supplier lanes. */
export function MarketplaceLaneEmptyState({
  catalogHref,
}: {
  catalogHref: string;
}) {
  return (
    <MarketplaceEmptyState
      scenario="lane_products"
      variant="inline"
      primaryHref={catalogHref}
      primaryLabel="Browse lane"
      className="px-4 py-5"
    />
  );
}

export { resolveMarketplaceEmptyStateIllustrationKind } from "@/lib/design/marketplace-empty-states-design-policy";
