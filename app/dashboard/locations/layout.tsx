import { LocationSwitcher } from "@/components/dashboard/location-switcher";
import { LocationsSubnav } from "@/components/dashboard/locations-subnav";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { LOCATION_ALL, readLocationContext } from "@/lib/locations/location-context";
import { prisma } from "@/lib/prisma";

export default async function LocationsLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await getTenantActor();
  const [ctx, locations] = await Promise.all([
    readLocationContext(),
    prisma.location.findMany({
      where: { userId, status: { not: "ARCHIVED" } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
  const current = ctx.mode === "all" ? LOCATION_ALL : ctx.locationId;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <LocationsSubnav />
        <LocationSwitcher options={locations} current={current} className="w-full lg:w-64" />
      </div>
      {children}
    </div>
  );
}
