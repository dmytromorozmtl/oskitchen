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
    const detail = dashboardLayoutErrorDetail(error);
    console.error("[dashboard-layout] fatal", {
      detail,
      name: error instanceof Error ? error.name : undefined,
      message: error instanceof Error ? error.message : String(error),
    });
    return <DashboardLayoutFallback detail={detail} />;
  }
}
