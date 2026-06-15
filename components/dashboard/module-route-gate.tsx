"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@prisma/client";

import { pathAllowedByModuleGate } from "@/lib/module-visibility";
import { isDashboardPathAllowedForRole } from "@/lib/nav-role-filter";
import {
  getModuleReadinessForPath,
  moduleReadinessBadgeLabel,
} from "@/lib/product/module-readiness";
import { showInternalOpsDashboardUi } from "@/lib/ui/customer-facing-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ModuleRouteGate({
  blockedPathPrefixes,
  userRole = "OWNER",
  isPlatformSuper = false,
  gtmSurfaceAccess = false,
  children,
}: {
  blockedPathPrefixes: readonly string[];
  userRole?: UserRole;
  isPlatformSuper?: boolean;
  gtmSurfaceAccess?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const moduleAllowed = pathAllowedByModuleGate(pathname, blockedPathPrefixes);
  const roleAllowed = isDashboardPathAllowedForRole(
    pathname,
    userRole,
    isPlatformSuper,
    Boolean(gtmSurfaceAccess),
  );
  const readiness = getModuleReadinessForPath(pathname);
  const readinessLabel = readiness
    ? moduleReadinessBadgeLabel(readiness.status)
    : null;

  if (!moduleAllowed) {
    return (
      <Card className="mx-auto max-w-lg border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Module not enabled</CardTitle>
          <CardDescription>
            This area is turned off for your workspace. Turn it back on from module settings if you
            need it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="premium" className="rounded-full">
            <Link href="/dashboard/settings/modules">Open module settings</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/today">Go to Today</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!roleAllowed) {
    return (
      <Card className="mx-auto max-w-lg border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">You do not have access</CardTitle>
          <CardDescription>
            Your workspace role cannot open this page. Ask an owner or manager if you need access,
            or use the shortcuts you have been assigned.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="premium" className="rounded-full">
            <Link href="/dashboard/today">Go to Today</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/support">Contact support</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (readiness && readinessLabel && showInternalOpsDashboardUi()) {
    return (
      <div className="space-y-4">
        <Card className="border-amber-500/40 bg-amber-500/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {readiness.label} is currently {readinessLabel.toLowerCase()}
            </CardTitle>
            <CardDescription>
              {readiness.notes}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            {readiness.status === "PILOT_ONLY"
              ? "This module is visible for controlled rollout and should not be treated as broad GA functionality."
              : "Use this module with rollout caution and keep operators aware that behavior and polish may still change."}
          </CardContent>
        </Card>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
