import { runForecastFormAction } from "@/actions/forecast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bufferDefaultForMode } from "@/lib/forecast/forecast-buffers";
import {
  FORECAST_SOURCE_LABEL,
  FORECAST_SOURCE_VALUES,
  FORECAST_TYPE_LABEL,
  FORECAST_TYPE_VALUES,
  forecastTerminologyForMode,
} from "@/lib/forecast/forecast-types";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { menuListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

function isoDateNDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default async function NewForecastPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: dataUserId },
    include: { kitchenSettings: { select: { businessType: true } } },
  });
  const businessMode = profile?.kitchenSettings?.businessType ?? null;
  const terminology = forecastTerminologyForMode(businessMode);
  const defaultBuffer = bufferDefaultForMode(businessMode);

  const plannerMenuWhere = await menuListWhereForOwnerAnd(dataUserId, { catalogOnly: false });
  const [brands, locations, menus] = await Promise.all([
    prisma.brand.findMany({ where: { workspaceId: dataUserId }, select: { id: true, name: true }, orderBy: { name: "asc" }, take: 50 }),
    prisma.location.findMany({ where: { userId: dataUserId }, select: { id: true, name: true }, orderBy: { name: "asc" }, take: 50 }),
    prisma.menu.findMany({
      where: plannerMenuWhere,
      select: { id: true, title: true, active: true },
      orderBy: { active: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Run a new forecast</h1>
        <p className="text-muted-foreground">
          Pick the forecast type, date range, and the sources to blend. KitchenOS will produce a
          deterministic estimate — never an ML/AI prediction.
        </p>
      </div>

      <form action={runForecastFormAction} className="space-y-6">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">1. Basics</CardTitle>
            <CardDescription>Name the run and choose the forecast type.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder={`${terminology.pageTitle} — ${new Date().toISOString().slice(0, 10)}`} required />
            </div>
            <div>
              <Label htmlFor="forecastType">Forecast type</Label>
              <select
                id="forecastType"
                name="forecastType"
                defaultValue="PRODUCT_DEMAND"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {FORECAST_TYPE_VALUES.map((t) => (
                  <option key={t} value={t}>{FORECAST_TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="bufferPercent">Buffer %</Label>
              <Input
                id="bufferPercent"
                name="bufferPercent"
                type="number"
                min={0}
                max={100}
                step="0.5"
                defaultValue={defaultBuffer}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">2. Date range</CardTitle>
            <CardDescription>Period the forecast should cover.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="dateFrom">From</Label>
              <Input id="dateFrom" name="dateFrom" type="date" defaultValue={isoDateNDaysFromNow(1)} required />
            </div>
            <div>
              <Label htmlFor="dateTo">To</Label>
              <Input id="dateTo" name="dateTo" type="date" defaultValue={isoDateNDaysFromNow(7)} required />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">3. Sources</CardTitle>
            <CardDescription>
              Defaults follow your business mode — check what you want to include.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {FORECAST_SOURCE_VALUES.map((s) => (
              <label key={s} className="flex items-start gap-2 rounded-xl border border-border/70 p-3 text-sm">
                <input
                  type="checkbox"
                  name="sources"
                  value={s}
                  defaultChecked={terminology.defaultSources.includes(s)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">{FORECAST_SOURCE_LABEL[s]}</p>
                  <p className="text-xs text-muted-foreground">
                    {sourceHint(s)}
                  </p>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">4. Filters</CardTitle>
            <CardDescription>Narrow to a brand, location, menu, or fulfillment.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="brandId">Brand</Label>
              <select id="brandId" name="brandId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">All brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="locationId">Location</Label>
              <select id="locationId" name="locationId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">All locations</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="menuId">Menu</Label>
              <select id="menuId" name="menuId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">No menu filter</option>
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}{m.active ? " (active)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="fulfillmentType">Fulfillment</Label>
              <select id="fulfillmentType" name="fulfillmentType" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Any</option>
                <option value="PICKUP">Pickup</option>
                <option value="DELIVERY">Delivery</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="submit">Run forecast</Button>
        </div>
      </form>

      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-sm">Estimates only</CardTitle>
          <CardDescription className="text-xs">
            Forecasts are deterministic projections derived from your own data. They are not ML
            predictions and should not be treated as guarantees.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function sourceHint(source: string): string {
  switch (source) {
    case "HISTORICAL_ORDERS":
      return "Same-weekday averages from the trailing 90 days.";
    case "ACTIVE_MENU":
      return "Include products from the currently active menu(s).";
    case "UPCOMING_MENU":
      return "Include products from menus starting in the future.";
    case "MENU_PLANNER":
      return "Treat planned menu items as a demand signal.";
    case "MEAL_PLANS":
      return "Committed recurring demand from upcoming meal plan cycles.";
    case "ACCEPTED_CATERING_EVENTS":
      return "Accepted catering quotes whose event date falls in the window.";
    case "PRODUCTION_PLAN":
      return "Existing production batches scheduled in the window.";
    case "SALES_CHANNELS":
      return "Per-channel filters via attribution (Storefront, WooCommerce, etc.).";
    case "MANUAL_ADJUSTMENT":
      return "Operator-supplied add-ons / overrides applied after the calculation.";
    case "SEASONAL_FACTOR":
      return "Reserved for future seasonal multipliers.";
    default:
      return "";
  }
}
