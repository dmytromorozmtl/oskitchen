import { GrowthSubnav } from "@/components/growth/growth-subnav";
import { requireOwnerForGrowth } from "@/lib/growth/require-owner-growth";

export default async function GrowthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOwnerForGrowth();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Growth</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Founder-only CRM, funnel analytics, and outbound helpers — data stays in your database.
        </p>
      </div>
      <GrowthSubnav />
      {children}
    </div>
  );
}
