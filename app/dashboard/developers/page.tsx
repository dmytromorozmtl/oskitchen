import { AppMarketplacePanel } from "@/components/platform/app-marketplace-panel";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { loadAppMarketplaceDashboard } from "@/services/platform/app-marketplace-service";

export const metadata = {
  title: "API Marketplace — Developers",
  description: "Submit, review, and publish OAuth apps with 70/30 revenue share.",
};

export const dynamic = "force-dynamic";

/** PERMISSION_DENIED_EXCEPTION — platform OAuth marketplace; workspace RBAC not surface-gated (DES-37). */

export default async function DashboardDevelopersPage() {
  const { sessionUser } = await getTenantActor();
  const canReview = await isPlatformAdmin(sessionUser.id, sessionUser.email);

  const dashboard = await loadAppMarketplaceDashboard({
    userEmail: sessionUser.email ?? null,
    canReview,
  });

  return (
    <div className="mx-auto max-w-5xl pb-10">
      <AppMarketplacePanel dashboard={dashboard} defaultEmail={sessionUser.email ?? ""} />
    </div>
  );
}
