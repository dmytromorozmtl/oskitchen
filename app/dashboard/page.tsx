import { HomeOverview } from "@/components/dashboard/home-overview";
import { getTenantActor } from "@/lib/scope/cached-tenant";

export default async function DashboardHomePage() {
  const { dataUserId } = await getTenantActor();
  return <HomeOverview userId={dataUserId} />;
}
