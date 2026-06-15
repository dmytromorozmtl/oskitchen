import Link from "next/link";

import { EmptyState } from "@/components/dashboard/empty-state";
import { VendorRegistrationForm } from "@/components/marketplace/vendor-registration-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadWorkspaceVendorRegistration } from "@/services/marketplace/vendor-registration-service";

export const metadata = { title: "Register as marketplace vendor" };

export default async function VendorRegisterPage() {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.vendor.register",
    route: "/vendor/register",
  });
  if (!access.ok) {
    return access.deny;
  }

  const { workspaceId } = await getTenantActor();
  if (!workspaceId) {
    return (
      <EmptyState
        title="Workspace required"
        description="Open or create a workspace before registering as a HoReCa marketplace vendor."
        primaryLabel="Today"
        primaryHref="/dashboard/today"
      />
    );
  }

  const existing = await loadWorkspaceVendorRegistration(workspaceId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Become a marketplace vendor"
        description="Submit your company profile, compliance documents, and contact details for platform verification."
        actions={
          existing ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/vendor/register/status">View status</Link>
            </Button>
          ) : null
        }
      />

      {existing && ["PENDING", "UNDER_REVIEW", "APPROVED"].includes(existing.status) ? (
        <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 text-sm">
          <p className="font-medium">Application already on file</p>
          <p className="mt-1 text-muted-foreground">
            Status: {existing.status.replace(/_/g, " ").toLowerCase()}.{" "}
            <Link href="/vendor/register/status" className="text-primary underline">
              View verification timeline
            </Link>
          </p>
        </div>
      ) : (
        <VendorRegistrationForm />
      )}
    </div>
  );
}
