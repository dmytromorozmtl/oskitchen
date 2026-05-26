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
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
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
}) {
  return (
    <Card
      className={cn(
        "border-dashed border-border/80 bg-muted/10 shadow-none",
        className,
      )}
    >
      <CardHeader className="text-center sm:text-left">
        {Icon ? (
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:mx-0">
            <Icon className="h-6 w-6" />
          </div>
        ) : null}
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
        {primarySlot ? (
          primarySlot
        ) : primaryLabel && primaryHref ? (
          <Button asChild className="rounded-full" variant="premium">
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
        ) : null}
        {secondaryLabel && secondaryHref ? (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        ) : null}
        <Button asChild variant="ghost" className="rounded-full text-muted-foreground">
          <Link href={demoHref}>{demoLabel}</Link>
        </Button>
        {helpLabel && helpHref ? (
          <Button asChild variant="link" className="rounded-full text-xs text-muted-foreground">
            <Link href={helpHref}>{helpLabel}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
