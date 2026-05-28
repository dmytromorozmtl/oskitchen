import React from "react";
import Link from "next/link";

import { PERMISSION_DENIED_UX_ERA17_TEST_ID } from "@/lib/ux/permission-denied-era17-policy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PosAccessCardProps = {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  /** When set, surfaces required permission in data attribute for UX audits. */
  permissionKey?: string;
};

export function PosAccessCard({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  permissionKey,
}: PosAccessCardProps) {
  return (
    <Card
      className="max-w-lg border-border/80 shadow-sm"
      data-testid={PERMISSION_DENIED_UX_ERA17_TEST_ID}
      data-permission-key={permissionKey ?? undefined}
      role="status"
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {(primaryHref || secondaryHref) ? (
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

/** Prefer PermissionDeniedSurfaceCard for POS/KDS pilot surfaces; alias for legacy imports. */
export const PermissionDeniedCard = PosAccessCard;
