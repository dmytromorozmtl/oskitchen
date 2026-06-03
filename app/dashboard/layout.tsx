import { DashboardLayoutFallback } from "@/components/dashboard/dashboard-layout-fallback";
import {
  DashboardLayoutContent,
  dashboardLayoutErrorDetail,
} from "@/app/dashboard/dashboard-layout-content";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    return await DashboardLayoutContent({ children });
  } catch (error) {
    console.error("[dashboard-layout] fatal", error);
    return <DashboardLayoutFallback detail={dashboardLayoutErrorDetail(error)} />;
  }
}
