import React from "react";
import Link from "next/link";
import { ShieldOff, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PERMISSION_DENIED_UX_ERA17_TEST_ID } from "@/lib/ux/permission-denied-era17-policy";
import {
  PERMISSION_DENIED_CARD_CLASS,
  PERMISSION_DENIED_CARD_TEST_ID,
} from "@/lib/design/permission-denied-patterns";
import {
  PERMISSION_DENIED_STATE_ICON_CONTAINER_CLASS,
  PERMISSION_DENIED_STATE_REQUEST_ACCESS_HREF,
  PERMISSION_DENIED_STATE_REQUEST_ACCESS_LABEL,
  PERMISSION_DENIED_STATE_REQUEST_ACCESS_TEST_ID,
} from "@/lib/design/permission-denied-state-policy";
import {
  resolvePermissionDeniedSurface,
  type PermissionDeniedSurfaceId,
} from "@/lib/ux/permission-denied-copy";
import { cn } from "@/lib/utils";

export type PermissionDeniedCardProps = {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  helpLabel?: string;
  helpHref?: string;
  icon?: LucideIcon;
  /** Surfaces required permission in data attribute for UX audits. */
  permissionKey?: string;
  testId?: string;
  className?: string;
};

function PermissionDeniedActions({
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  helpHref,
  helpLabel,
}: Pick<
  PermissionDeniedCardProps,
  | "primaryHref"
  | "primaryLabel"
  | "secondaryHref"
  | "secondaryLabel"
  | "helpHref"
  | "helpLabel"
>) {
  const hasPrimary = primaryHref && primaryLabel;
  const hasSecondary = secondaryHref && secondaryLabel;
  const hasHelp = helpHref && helpLabel;

  if (!hasPrimary && !hasSecondary && !hasHelp) {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap">
      {hasPrimary ? (
        <Button asChild className="rounded-full">
          <Link href={primaryHref!}>{primaryLabel}</Link>
        </Button>
      ) : null}
      {hasSecondary ? (
        <Button asChild variant="outline" className="rounded-full">
          <Link href={secondaryHref!}>{secondaryLabel}</Link>
        </Button>
      ) : null}
      {hasHelp ? (
        <Button
          asChild
          variant="link"
          className="rounded-full text-xs text-muted-foreground"
          data-testid={PERMISSION_DENIED_STATE_REQUEST_ACCESS_TEST_ID}
        >
          <Link href={helpHref!}>{helpLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}

/** Unified RBAC denial card — illustration, message, and recovery CTAs. */
export function PermissionDeniedCard({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  helpHref = PERMISSION_DENIED_STATE_REQUEST_ACCESS_HREF,
  helpLabel = PERMISSION_DENIED_STATE_REQUEST_ACCESS_LABEL,
  icon: Icon = ShieldOff,
  permissionKey,
  testId = PERMISSION_DENIED_UX_ERA17_TEST_ID,
  className,
}: PermissionDeniedCardProps) {
  return (
    <Card
      className={cn(PERMISSION_DENIED_CARD_CLASS, className)}
      data-testid={testId}
      data-permission-key={permissionKey ?? undefined}
      role="status"
    >
      <CardHeader className="text-center sm:text-left">
        <div className={PERMISSION_DENIED_STATE_ICON_CONTAINER_CLASS} aria-hidden>
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <PermissionDeniedActions
          primaryHref={primaryHref}
          primaryLabel={primaryLabel}
          secondaryHref={secondaryHref}
          secondaryLabel={secondaryLabel}
          helpHref={helpHref}
          helpLabel={helpLabel}
        />
      </CardContent>
    </Card>
  );
}

export type PermissionDeniedSurfaceCardProps = {
  surfaceId: PermissionDeniedSurfaceId;
  className?: string;
};

/** Standard RBAC denial card with surface copy and layout shell. */
export function PermissionDeniedSurfaceCard({
  surfaceId,
  className,
}: PermissionDeniedSurfaceCardProps) {
  const surface = resolvePermissionDeniedSurface(surfaceId);

  return (
    <div
      className="mx-auto max-w-xl space-y-4 py-10"
      data-permission-denied-surface={surfaceId}
    >
      <PermissionDeniedCard
        title={surface.title}
        description={surface.description}
        primaryHref={surface.primaryHref}
        primaryLabel={surface.primaryLabel}
        secondaryHref={surface.secondaryHref}
        secondaryLabel={surface.secondaryLabel}
        helpHref={PERMISSION_DENIED_STATE_REQUEST_ACCESS_HREF}
        helpLabel={PERMISSION_DENIED_STATE_REQUEST_ACCESS_LABEL}
        permissionKey={surface.permissionKey}
        className={className}
      />
    </div>
  );
}
