import { DashboardLayoutFallback } from "@/components/dashboard/dashboard-layout-fallback";
import {
  DashboardLayoutContent,
  dashboardLayoutErrorDetail,
} from "@/app/dashboard/dashboard-layout-content";
import { isNextNavigationError } from "@/lib/next/is-navigation-error";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    return await DashboardLayoutContent({ children });
  } catch (error) {
    if (isNextNavigationError(error)) throw error;
    console.error("[dashboard-layout] fatal", error);
    return <DashboardLayoutFallback detail={dashboardLayoutErrorDetail(error)} />;
  }
}
