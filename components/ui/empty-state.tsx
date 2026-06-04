import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { appIconHeaderClass, appIconHeroClass } from "@/lib/design/icon-system";
import {
  EMPTY_STATE_CARD_CLASS,
  EMPTY_STATE_INLINE_CLASS,
  EMPTY_STATE_TEST_ID,
} from "@/lib/design/empty-state-patterns";

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  primarySlot?: React.ReactNode;
  secondaryLabel?: string;
  secondaryHref?: string;
  demoHref?: string;
  /** CTA label for demo entry (default avoids vague “placeholder” language). */
  demoLabel?: string;
  helpLabel?: string;
  helpHref?: string;
  className?: string;
  /** Card layout for page-level empties; inline for tables and filter results. */
  variant?: "card" | "inline";
  /** Hide the default demo exploration link (common on marketplace surfaces). */
  showDemoLink?: boolean;
};

function EmptyStateActions({
  primarySlot,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  demoHref = "/demo",
  demoLabel = "Explore product demo",
  helpLabel,
  helpHref,
  showDemoLink = true,
  centered = false,
}: Pick<
  EmptyStateProps,
  | "primarySlot"
  | "primaryLabel"
  | "primaryHref"
  | "secondaryLabel"
  | "secondaryHref"
  | "demoHref"
  | "demoLabel"
  | "helpLabel"
  | "helpHref"
  | "showDemoLink"
> & { centered?: boolean }) {
  const hasPrimary = primarySlot || (primaryLabel && primaryHref);
  const hasSecondary = secondaryLabel && secondaryHref;
  const hasHelp = helpLabel && helpHref;
  const hasDemo = showDemoLink;

  if (!hasPrimary && !hasSecondary && !hasHelp && !hasDemo) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap",
        centered ? "sm:justify-center" : "sm:justify-start",
      )}
    >
      {primarySlot ? (
        primarySlot
      ) : primaryLabel && primaryHref ? (
        <Button asChild className="rounded-full" variant="premium">
          <Link href={primaryHref}>{primaryLabel}</Link>
        </Button>
      ) : null}
      {hasSecondary ? (
        <Button asChild variant="outline" className="rounded-full">
          <Link href={secondaryHref!}>{secondaryLabel}</Link>
        </Button>
      ) : null}
      {hasDemo ? (
        <Button asChild variant="ghost" className="rounded-full text-muted-foreground">
          <Link href={demoHref}>{demoLabel}</Link>
        </Button>
      ) : null}
      {hasHelp ? (
        <Button asChild variant="link" className="rounded-full text-xs text-muted-foreground">
          <Link href={helpHref!}>{helpLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryLabel,
  primaryHref,
  primarySlot,
  secondaryLabel,
  secondaryHref,
  demoHref = "/demo",
  demoLabel = "Explore product demo",
  helpLabel,
  helpHref,
  className,
  variant = "card",
  showDemoLink = true,
}: EmptyStateProps) {
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center",
          EMPTY_STATE_INLINE_CLASS,
          className,
        )}
        data-testid={EMPTY_STATE_TEST_ID}
      >
        {Icon ? (
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className={appIconHeaderClass} aria-hidden />
          </div>
        ) : null}
        <p className="text-base font-medium">{title}</p>
        {description ? (
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
        <div className="mt-4 w-full max-w-md">
          <EmptyStateActions
            primarySlot={primarySlot}
            primaryLabel={primaryLabel}
            primaryHref={primaryHref}
            secondaryLabel={secondaryLabel}
            secondaryHref={secondaryHref}
            demoHref={demoHref}
            demoLabel={demoLabel}
            helpLabel={helpLabel}
            helpHref={helpHref}
            showDemoLink={showDemoLink}
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
    >
      <CardHeader className="text-center sm:text-left">
        {Icon ? (
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:mx-0">
            <Icon className={appIconHeroClass} aria-hidden />
          </div>
        ) : null}
        <CardTitle className="text-xl">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <EmptyStateActions
          primarySlot={primarySlot}
          primaryLabel={primaryLabel}
          primaryHref={primaryHref}
          secondaryLabel={secondaryLabel}
          secondaryHref={secondaryHref}
          demoHref={demoHref}
          demoLabel={demoLabel}
          helpLabel={helpLabel}
          helpHref={helpHref}
          showDemoLink={showDemoLink}
        />
      </CardContent>
    </Card>
  );
}
