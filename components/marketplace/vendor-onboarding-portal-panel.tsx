import Link from "next/link";
import { Clock, MapPin, Package, Percent, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  VENDOR_ONBOARDING_PORTAL_P2_116_CAPABILITIES,
  VENDOR_ONBOARDING_PORTAL_P2_116_EYEBROW,
  VENDOR_ONBOARDING_PORTAL_P2_116_HEADLINE,
  VENDOR_ONBOARDING_PORTAL_P2_116_OPERATOR_LINKS,
  VENDOR_ONBOARDING_PORTAL_P2_116_SUBLINE,
} from "@/lib/marketplace/vendor-onboarding-portal-p2-116-content";
import { VENDOR_ONBOARDING_PORTAL_P2_116_TEST_IDS } from "@/lib/marketplace/vendor-onboarding-portal-p2-116-policy";
import type { VendorOnboardingPortalSnapshot } from "@/services/marketplace/vendor-onboarding-portal-p2-116-service";

const CAPABILITY_ICONS = [Upload, Percent, MapPin, Clock, Package] as const;

function statusVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case "ready":
      return "default";
    case "partial":
      return "secondary";
    default:
      return "outline";
  }
}

/** Blueprint P2-116 — vendor onboarding portal panel. */
export function VendorOnboardingPortalPanel({
  snapshot,
}: {
  snapshot: VendorOnboardingPortalSnapshot;
}) {
  return (
    <div className="space-y-8" data-testid={VENDOR_ONBOARDING_PORTAL_P2_116_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {VENDOR_ONBOARDING_PORTAL_P2_116_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {VENDOR_ONBOARDING_PORTAL_P2_116_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {VENDOR_ONBOARDING_PORTAL_P2_116_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live vendor data"} · {snapshot.companyName} ·{" "}
          readiness {snapshot.readinessScore}% · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Readiness</CardDescription>
            <CardTitle className="text-2xl">{snapshot.readinessScore}%</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Live SKUs</CardDescription>
            <CardTitle className="text-2xl">{snapshot.activeSkuCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Delivery zones</CardDescription>
            <CardTitle className="text-2xl">{snapshot.deliveryZoneCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Min MOQ</CardDescription>
            <CardTitle className="text-2xl">{snapshot.minimumMoq}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {VENDOR_ONBOARDING_PORTAL_P2_116_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? Package;
          const block = snapshot.blocks[index];
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={VENDOR_ONBOARDING_PORTAL_P2_116_TEST_IDS[index + 1]}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                    <CardTitle className="text-base">{capability.label}</CardTitle>
                  </div>
                  {block ? (
                    <Badge variant={statusVariant(block.status)} className="rounded-full capitalize">
                      {block.status}
                    </Badge>
                  ) : null}
                </div>
                <CardDescription>{capability.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {block ? <p className="text-muted-foreground">{block.summary}</p> : null}
                <Button asChild variant="link" size="sm" className="h-auto p-0">
                  <Link href={capability.route}>Open {capability.label.toLowerCase()}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {VENDOR_ONBOARDING_PORTAL_P2_116_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
