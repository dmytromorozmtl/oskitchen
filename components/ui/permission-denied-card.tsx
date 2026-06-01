import React from "react";
import Link from "next/link";
import { ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PERMISSION_DENIED_UX_ERA17_TEST_ID } from "@/lib/ux/permission-denied-era17-policy";
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
  /** Surfaces required permission in data attribute for UX audits. */
  permissionKey?: string;
  testId?: string;
  className?: string;
};

/** Unified RBAC denial card for dashboard and workspace surfaces. */
export function PermissionDeniedCard({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  permissionKey,
  testId = PERMISSION_DENIED_UX_ERA17_TEST_ID,
  className,
}: PermissionDeniedCardProps) {
  return (
    <Card
      className={cn("max-w-lg border-border/80 shadow-sm", className)}
      data-testid={testId}
      data-permission-key={permissionKey ?? undefined}
      role="status"
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <ShieldOff
            className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <div className="space-y-1.5">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      {primaryHref || secondaryHref ? (
        <CardContent className="flex flex-wrap gap-2">
          {primaryHref && primaryLabel ? (
            <Button asChild className="rounded-full">
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
          ) : null}
          {secondaryHref && secondaryLabel ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          ) : null}
        </CardContent>
      ) : null}
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
        permissionKey={surface.permissionKey}
        className={className}
      />
    </div>
  );
}
