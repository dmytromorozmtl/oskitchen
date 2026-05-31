import { redirect } from "next/navigation";

import { saveBrandingSettingsFormAction } from "@/actions/monetization";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { PlanGate } from "@/components/plans/plan-gate";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export default async function BrandingSettingsPage() {
  const actor = await requireWorkspacePermissionActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: actor.sessionUserId },
    select: { role: true, email: true },
  });
  if (!actor.platformBypass && profile?.role !== UserRole.OWNER) {
    redirect("/dashboard/settings");
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: actor.userId },
    select: { plan: true },
  });
  const allowHide = sub?.plan === "ENTERPRISE" || actor.platformBypass;

  const ks = await prisma.kitchenSettings.findUnique({
    where: { userId: actor.userId },
  });

  return (
    <PlanGate userId={actor.userId} feature="white_label" title="Branding">
      <div className="space-y-6">
        <SectionHeader sectionKey="branding" />
        <Card>
          <CardHeader>
            <CardTitle>Workspace appearance</CardTitle>
            <CardDescription>
              Logo still uses the main business settings image URL when you upload assets later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveBrandingSettingsFormAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brandColorHex">Brand color (hex)</Label>
                <Input
                  id="brandColorHex"
                  name="brandColorHex"
                  placeholder="#FF5F1F"
                  defaultValue={ks?.brandColorHex ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storefrontThemeKey">Storefront theme key</Label>
                <Input
                  id="storefrontThemeKey"
                  name="storefrontThemeKey"
                  placeholder="default / dark / …"
                  defaultValue={ks?.storefrontThemeKey ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customDomainHint">Custom domain (planned)</Label>
                <Input
                  id="customDomainHint"
                  name="customDomainHint"
                  placeholder="orders.yourbrand.com"
                  defaultValue={ks?.customDomainHint ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailFooterBranding">Email footer line</Label>
                <Input
                  id="emailFooterBranding"
                  name="emailFooterBranding"
                  defaultValue={ks?.emailFooterBranding ?? ""}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hideKitchenOsBranding"
                  name="hideKitchenOsBranding"
                  defaultChecked={ks?.hideKitchenOsBranding}
                  disabled={!allowHide}
                />
                <Label htmlFor="hideKitchenOsBranding" className="font-normal">
                  Hide OS Kitchen branding (Enterprise only)
                </Label>
              </div>
              <Button type="submit" className="rounded-full">
                Save
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PlanGate>
  );
}
