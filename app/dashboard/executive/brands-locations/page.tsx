import { ExecutiveFilterBar } from "@/components/dashboard/executive/executive-filter-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { canViewExecutive } from "@/lib/executive/executive-permissions";
import { prisma } from "@/lib/prisma";
import { loadExecutiveOverview } from "@/services/executive/executive-dashboard-service";

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default async function ExecutiveBrandsLocationsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const scope = { isOwner: true, email: user.email ?? null, role: null };
  if (!canViewExecutive(scope, "executive.read.brand_location")) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          You do not have permission to view brand / location comparisons.
        </CardContent>
      </Card>
    );
  }
  const filters = parseAnalyticsFilters(sp);
  const [overview, brands, locations] = await Promise.all([
    loadExecutiveOverview({ userId: dataUserId }, filters),
    prisma.brand.findMany({
      where: { workspace: { ownerUserId: user.id } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.location.findMany({
      where: { userId: dataUserId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const oneBrand = overview.brandCount <= 1;
  const oneLocation = overview.locationCount <= 1;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Brands &amp; locations</h1>
        <p className="text-sm text-muted-foreground">{overview.rangeLabel}</p>
      </header>
      <ExecutiveFilterBar
        filters={filters}
        basePath="/dashboard/executive/brands-locations"
        brands={brands}
        locations={locations}
      />

      <section className="grid gap-3 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Revenue by brand</CardTitle>
            <CardDescription>
              {oneBrand
                ? `${overview.brandCount} brand configured.`
                : `${overview.brandCount} brands · top brand ${overview.topBrand?.name ?? "—"}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overview.brandsRanked.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No brand-attributed revenue in the window.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/80 text-left text-muted-foreground">
                    <th className="px-2 py-1 font-medium">Brand</th>
                    <th className="px-2 py-1 text-right font-medium">Orders</th>
                    <th className="px-2 py-1 text-right font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.brandsRanked.map((b) => (
                    <tr key={b.id} className="border-b border-border/40">
                      <td className="px-2 py-1">{b.name}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{b.orders}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{money(b.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Revenue by location</CardTitle>
            <CardDescription>
              {oneLocation
                ? `${overview.locationCount} location configured.`
                : `${overview.locationCount} locations · top location ${overview.topLocation?.name ?? "—"}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overview.locationsRanked.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No location-attributed revenue in the window.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/80 text-left text-muted-foreground">
                    <th className="px-2 py-1 font-medium">Location</th>
                    <th className="px-2 py-1 text-right font-medium">Orders</th>
                    <th className="px-2 py-1 text-right font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.locationsRanked.map((l) => (
                    <tr key={l.id} className="border-b border-border/40">
                      <td className="px-2 py-1">{l.name}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{l.orders}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{money(l.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
