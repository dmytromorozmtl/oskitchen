import { assertPartnerAccess } from "@/lib/partner/partner-permissions";

export default async function PartnerDashboardLayout({ children }: { children: React.ReactNode }) {
  await assertPartnerAccess();
  return (
    <div className="mx-auto max-w-[min(1600px,calc(100vw-2rem))] space-y-6 px-2 pb-10 sm:px-4 lg:px-0">
      {children}
    </div>
  );
}
