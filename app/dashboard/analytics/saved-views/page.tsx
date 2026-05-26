import Link from "next/link";

import {
  createAnalyticsSavedViewFormAction,
  deleteAnalyticsSavedViewFormAction,
} from "@/actions/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

const PRESETS = [
  { name: "Catering ops", description: "Catering-only filter, last 30d.", query: "cateringOnly=1" },
  { name: "Production only", description: "Production tab default range.", query: "" },
  { name: "Delivery focus", description: "Delivery fulfillment, last 30d.", query: "fulfillment=DELIVERY" },
  { name: "Executive weekly", description: "All channels, last 7d.", query: "" },
  { name: "Multi-location overview", description: "All locations, last 30d.", query: "" },
];

export default async function SavedViewsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const views = await prisma.analyticsSavedView.findMany({
    where: { userId: dataUserId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Saved views</h1>
        <p className="text-muted-foreground">Save filter + tab combinations for quick recall.</p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Create saved view</CardTitle>
          <CardDescription>Captures the current default filters into a named view.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createAnalyticsSavedViewFormAction} className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Catering weekly review" />
            </div>
            <div>
              <Label htmlFor="tab">Tab</Label>
              <Input id="tab" name="tab" placeholder="overview / revenue / catering …" />
            </div>
            <div>
              <Label htmlFor="filtersQuery">Filters (query string)</Label>
              <Input id="filtersQuery" name="filtersQuery" placeholder="cateringOnly=1&fulfillment=DELIVERY" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} placeholder="Optional notes." />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Save view</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Presets</CardTitle>
          <CardDescription>Common analytics setups. Click to open.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PRESETS.map((p) => (
            <Link
              key={p.name}
              href={`/dashboard/analytics?${p.query}`}
              className="rounded-xl border border-border/70 p-3 text-sm hover:bg-muted/40"
            >
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.description}</p>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Your views</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {views.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved views yet.</p>
          ) : null}
          {views.map((v) => {
            const filters = (v.filtersJson ?? {}) as Record<string, unknown>;
            const queryParts: string[] = [];
            for (const [k, val] of Object.entries(filters)) {
              if (val == null || val === false || val === "") continue;
              queryParts.push(`${k}=${encodeURIComponent(String(val))}`);
            }
            const target = `/dashboard/analytics${v.tab ? `/${v.tab}` : ""}?${queryParts.join("&")}`;
            return (
              <div key={v.id} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2">
                <div>
                  <p className="font-medium text-sm">{v.name}</p>
                  {v.description ? <p className="text-xs text-muted-foreground">{v.description}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={target} className="text-xs underline">Open</Link>
                  <form action={deleteAnalyticsSavedViewFormAction}>
                    <input type="hidden" name="viewId" value={v.id} />
                    <Button type="submit" size="sm" variant="ghost">Delete</Button>
                  </form>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
