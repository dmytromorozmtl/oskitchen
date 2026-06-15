import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  vendorStatusBadgeVariant,
  vendorStatusLabel,
} from "@/lib/marketplace/vendor-registration-types";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadWorkspaceVendorRegistration } from "@/services/marketplace/vendor-registration-service";

export const metadata = { title: "Vendor verification status" };

export default async function VendorRegisterStatusPage() {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.vendor.register.status",
    route: "/vendor/register/status",
  });
  if (!access.ok) {
    return access.deny;
  }

  const { workspaceId } = await getTenantActor();
  if (!workspaceId) {
    return (
      <EmptyState
        title="Workspace required"
        description="Open a workspace to view vendor verification status."
        primaryLabel="Today"
        primaryHref="/dashboard/today"
      />
    );
  }

  const registration = await loadWorkspaceVendorRegistration(workspaceId);

  if (!registration) {
    return (
      <EmptyState
        title="No vendor application"
        description="Register your company to sell on the OS Kitchen B2B HoReCa marketplace."
        primaryLabel="Start registration"
        primaryHref="/vendor/register"
      />
    );
  }

  const StatusIcon =
    registration.status === "APPROVED"
      ? CheckCircle2
      : registration.status === "REJECTED"
        ? XCircle
        : Clock;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification status"
        description={`${registration.companyName} · submitted ${new Date(registration.createdAt).toLocaleDateString()}`}
        actions={
          registration.status === "APPROVED" ? (
            <Button asChild className="rounded-full">
              <Link href="/vendor/dashboard">Open vendor cabinet</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/vendor/register">Update application</Link>
            </Button>
          )
        }
      />

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <StatusIcon className="mt-1 h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">{registration.companyName}</CardTitle>
              <p className="text-sm text-muted-foreground">{registration.legalName}</p>
            </div>
          </div>
          <Badge variant={vendorStatusBadgeVariant(registration.status)} className="rounded-full">
            {vendorStatusLabel(registration.status)}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <span className="text-muted-foreground">Country:</span> {registration.country ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Contact:</span> {registration.contactEmail ?? "—"}
          </p>
          {registration.status === "APPROVED" && registration.verifiedAt ? (
            <p className="text-emerald-700 dark:text-emerald-300">
              Verified {new Date(registration.verifiedAt).toLocaleString()}
            </p>
          ) : null}
          {registration.status === "REJECTED" ? (
            <p className="text-destructive">
              Application was not approved. Update documents and contact platform support to reapply.
            </p>
          ) : null}
          {registration.status === "PENDING" || registration.status === "UNDER_REVIEW" ? (
            <p className="text-muted-foreground">
              Platform ops is reviewing your documents. You will receive email at {registration.contactEmail}.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
