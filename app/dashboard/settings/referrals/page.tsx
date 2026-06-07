import { ReferralProgramPanel } from "@/components/dashboard/referral-program-panel";
import { readReferralProgramGtmSnapshot } from "@/lib/marketing/referral-program-absolute-final-policy";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getReferralDashboard } from "@/services/referral/referral-service";

export const metadata = {
  title: "Referrals — Settings",
  description: "Refer restaurants and earn free subscription months.",
};

export default async function SettingsReferralsPage() {
  const { sessionUser } = await getTenantActor();
  const [dashboard, gtm] = await Promise.all([
    getReferralDashboard(sessionUser.id),
    Promise.resolve(readReferralProgramGtmSnapshot()),
  ]);

  return (
    <div className="mx-auto max-w-2xl pb-8">
      <ReferralProgramPanel dashboard={dashboard} gtm={gtm} variant="settings" />
    </div>
  );
}
