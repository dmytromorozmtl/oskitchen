import Link from "next/link";
import { Lock } from "lucide-react";
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

export type FeaturePreviewOverlayProps = {
  /** Feature name shown on the overlay card. */
  title: string;
  description?: string;
  /** Primary CTA label (default: Launching soon). */
  ctaLabel?: string;
  /** Optional href — when set, CTA becomes a link instead of disabled. */
  ctaHref?: string;
  /** Blurred preview content rendered behind the overlay. */
  children?: React.ReactNode;
  className?: string;
  /** Minimum height for standalone gates without children. */
  minHeight?: string;
  testId?: string;
};

function FeaturePreviewOverlayCard({
  title,
  description,
  ctaLabel,
  ctaHref,
  className,
}: Pick<
  FeaturePreviewOverlayProps,
  "title" | "description" | "ctaLabel" | "ctaHref" | "className"
>) {
  const resolvedDescription =
    description ??
    "This module is in preview. Capabilities may change before general availability.";

  return (
    <Card
      className={cn(
        "max-w-md border-border/80 bg-card/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/90",
        className,
      )}
    >
      <CardHeader className="items-center text-center">
        <div
          className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
          aria-hidden
        >
          <Lock className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base leading-relaxed">
          {resolvedDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-6">
        {ctaHref ? (
          <Button asChild className="rounded-full" variant="outline">
            <Link href={ctaHref}>{ctaLabel ?? "Launching soon"}</Link>
          </Button>
        ) : (
          <Button
            type="button"
            className="rounded-full"
            variant="outline"
            disabled
            aria-disabled
          >
            {ctaLabel ?? "Launching soon"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Blurred preview gate for PREVIEW / not-yet-GA dashboard modules.
 * Wraps skeleton or mock UI; blocks interaction until the feature ships.
 */
export function FeaturePreviewOverlay({
  title,
  description,
  ctaLabel = "Launching soon",
  ctaHref,
  children,
  className,
  minHeight = "min-h-[280px]",
  testId = "feature-preview-overlay",
}: FeaturePreviewOverlayProps) {
  if (!children) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 p-6",
          minHeight,
          className,
        )}
        data-testid={testId}
        role="status"
        aria-label={`${title} — preview`}
      >
        <FeaturePreviewOverlayCard
          title={title}
          description={description}
          ctaLabel={ctaLabel}
          ctaHref={ctaHref}
        />
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl", minHeight, className)}
      data-testid={testId}
      role="status"
      aria-label={`${title} — preview`}
    >
      <div
        className="pointer-events-none select-none blur-[6px] opacity-50 saturate-50"
        aria-hidden
      >
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/40 p-4 backdrop-blur-[2px]">
        <FeaturePreviewOverlayCard
          title={title}
          description={description}
          ctaLabel={ctaLabel}
          ctaHref={ctaHref}
        />
      </div>
    </div>
  );
}
