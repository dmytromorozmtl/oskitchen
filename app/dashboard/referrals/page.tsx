import { PageShell } from "@/components/layout/page-shell";
import { ReferralProgramPanel } from "@/components/dashboard/referral-program-panel";
import { readReferralProgramGtmSnapshot } from "@/lib/marketing/referral-program-absolute-final-policy";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { getReferralDashboard } from "@/services/referral/referral-service";

export const metadata = {
  title: "Refer a restaurateur — OS Kitchen",
  description: "Owner-to-owner referral program for restaurant operators.",
};

export default async function ReferralsPage() {
  const { sessionUser } = await requireTenantActor();
  const [dashboard, gtm] = await Promise.all([
    getReferralDashboard(sessionUser.id),
    Promise.resolve(readReferralProgramGtmSnapshot()),
  ]);

  return (
    <PageShell>
      <ReferralProgramPanel dashboard={dashboard} gtm={gtm} variant="full" />
    </PageShell>
  );
}
