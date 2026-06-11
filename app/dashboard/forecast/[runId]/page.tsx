import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addForecastAdjustmentFormAction,
  archiveForecastRunFormAction,
  restoreForecastRunFormAction,
  sendForecastToIngredientDemandFormAction,
  sendForecastToProductionFormAction,
} from "@/actions/forecast";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FORECAST_SOURCE_LABEL,
  FORECAST_TYPE_LABEL,
} from "@/lib/forecast/forecast-types";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getForecastRunDetail } from "@/services/forecast/forecast-service";

function isoIn(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default async function ForecastRunDetailPage({ params }: { params: Promise<{ runId: string }> }) {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const { runId } = await params;
  const run = await getForecastRunDetail(dataUserId, runId);
  if (!run) notFound();

  const sources = Array.isArray(run.sourceTypesJson)
    ? (run.sourceTypesJson as string[])
    : [];

  const productLines = run.lines.filter((l) => l.productId);
  const cateringLines = run.lines.filter((l) => !l.productId && !l.ingredientId);
  const ingredientLines = run.lines.filter((l) => l.ingredientId);

  const totalForecast = productLines.reduce((acc, l) => acc + Number(l.forecastQuantity), 0);
  const totalBuffer = productLines.reduce((acc, l) => acc + Number(l.bufferQuantity), 0);
  const totalRecommended = productLines.reduce((acc, l) => acc + Number(l.recommendedQuantity), 0);

  const isArchived = run.status === "ARCHIVED";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            <Link href="/dashboard/forecast" className="underline">Forecast</Link> · Run detail
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{run.title}</h1>
          <p className="text-muted-foreground">
            {FORECAST_TYPE_LABEL[run.forecastType]} · {run.dateFrom.toISOString().slice(0, 10)} → {run.dateTo.toISOString().slice(0, 10)}
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Estimate only.</span> Confidence: {run.confidence.toLowerCase()}. Buffer {Number(run.bufferPercent)}%.
            {run.brand ? ` · Brand: ${run.brand.name}` : ""}
            {run.location ? ` · Location: ${run.location.name}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isArchived ? (
            <form action={restoreForecastRunFormAction}>
              <input type="hidden" name="forecastRunId" value={run.id} />
              <Button type="submit" size="sm" variant="outline">Restore</Button>
            </form>
          ) : (
            <form action={archiveForecastRunFormAction}>
              <input type="hidden" name="forecastRunId" value={run.id} />
              <Button type="submit" size="sm" variant="ghost">Archive</Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Product lines" value={productLines.length} />
        <Kpi label="Forecast units" value={Math.round(totalForecast)} />
        <Kpi label="Buffer units" value={Math.round(totalBuffer)} />
        <Kpi label="Recommended" value={Math.round(totalRecommended)} />
      </div>

      <div className="flex flex-wrap gap-1">
        {sources.map((s) => (
          <Badge key={s} variant="secondary" className="rounded-full text-[10px]">
            {FORECAST_SOURCE_LABEL[s as keyof typeof FORECAST_SOURCE_LABEL] ?? s}
          </Badge>
        ))}
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Product demand</CardTitle>
          <CardDescription>Sorted by recommended quantity (forecast + buffer).</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {productLines.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No product lines were produced. Try adding more sources (historical orders, meal plans, catering events) and re-run.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Forecast</TableHead>
                  <TableHead className="text-right">Buffer</TableHead>
                  <TableHead className="text-right">Recommend</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Sources</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productLines.map((l) => {
                  const contributions = Array.isArray(l.sourceSummaryJson)
                    ? (l.sourceSummaryJson as { source: string; quantity: number; note?: string }[])
                    : [];
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.label}</TableCell>
                      <TableCell className="text-right tabular-nums">{Number(l.forecastQuantity).toFixed(0)}</TableCell>
                      <TableCell className="text-right tabular-nums">{Number(l.bufferQuantity).toFixed(0)}</TableCell>
                      <TableCell className="text-right tabular-nums">{Number(l.recommendedQuantity).toFixed(0)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full capitalize">
                          {l.confidence.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {contributions.length === 0
                          ? "—"
                          : contributions
                              .map((c) => `${FORECAST_SOURCE_LABEL[c.source as keyof typeof FORECAST_SOURCE_LABEL] ?? c.source}: ${Math.round(c.quantity)}`)
                              .join(" · ")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {cateringLines.length > 0 ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Catering / event lines</CardTitle>
            <CardDescription>Free-text catering items without a linked product.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {cateringLines.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2 text-sm">
                <span>{l.label}</span>
                <span className="tabular-nums text-muted-foreground">{Number(l.recommendedQuantity).toFixed(0)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {ingredientLines.length > 0 ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Ingredient impact</CardTitle>
            <CardDescription>Quantities expanded from recipes attached to forecasted products.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Forecast</TableHead>
                  <TableHead className="text-right">Buffer</TableHead>
                  <TableHead className="text-right">Recommend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredientLines.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.label}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{l.unit}</TableCell>
                    <TableCell className="text-right tabular-nums">{Number(l.forecastQuantity).toFixed(2)}</TableCell>
                    <TableCell className="text-right tabular-nums">{Number(l.bufferQuantity).toFixed(2)}</TableCell>
                    <TableCell className="text-right tabular-nums">{Number(l.recommendedQuantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Send to production</CardTitle>
            <CardDescription>Creates a draft production batch with the recommended units.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={sendForecastToProductionFormAction} className="space-y-2">
              <input type="hidden" name="forecastRunId" value={run.id} />
              <div>
                <Label htmlFor="prodTitle">Batch title</Label>
                <Input id="prodTitle" name="title" defaultValue={`${run.title} — prep`} required />
              </div>
              <div>
                <Label htmlFor="productionDate">Date</Label>
                <Input id="productionDate" name="productionDate" type="date" defaultValue={isoIn(1)} required />
              </div>
              <Button type="submit" size="sm">Create draft batch</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Send to ingredient demand</CardTitle>
            <CardDescription>Expands forecasted products into a draft demand run.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={sendForecastToIngredientDemandFormAction} className="space-y-2">
              <input type="hidden" name="forecastRunId" value={run.id} />
              <div>
                <Label htmlFor="demandTitle">Demand run title</Label>
                <Input id="demandTitle" name="title" defaultValue={`${run.title} — ingredients`} required />
              </div>
              <Button type="submit" size="sm">Create demand run</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Add manual adjustment</CardTitle>
            <CardDescription>Audited — applied to matching lines.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addForecastAdjustmentFormAction} className="space-y-2">
              <input type="hidden" name="forecastRunId" value={run.id} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="targetType">Target</Label>
                  <select id="targetType" name="targetType" defaultValue="global" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="global">Global</option>
                    <option value="product">Product</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="adjustmentType">Type</Label>
                  <select id="adjustmentType" name="adjustmentType" defaultValue="PERCENT" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="PERCENT">% change</option>
                    <option value="FIXED_QUANTITY">+/- units</option>
                    <option value="OVERRIDE">Override</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="targetId">Product ID (for product target)</Label>
                <Input id="targetId" name="targetId" placeholder="uuid (optional)" />
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Input id="value" name="value" type="number" step="0.5" defaultValue={10} required />
              </div>
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea id="reason" name="reason" rows={2} placeholder="Holiday week, rain day, …" />
              </div>
              <Button type="submit" size="sm" variant="secondary">Apply adjustment</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Adjustments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {run.adjustments.length === 0 ? (
              <p className="text-muted-foreground">No adjustments yet.</p>
            ) : null}
            {run.adjustments.map((a) => (
              <div key={a.id} className="rounded-xl border border-border/70 p-2">
                <p className="font-medium">
                  {a.targetType}{a.targetId ? `:${a.targetId}` : ""} · {a.adjustmentType} {Number(a.value)}
                </p>
                {a.reason ? <p className="text-xs text-muted-foreground">{a.reason}</p> : null}
                <p className="text-[10px] text-muted-foreground">
                  {a.createdAt.toISOString()} by {a.createdBy ?? "owner"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {run.events.length === 0 ? (
              <p className="text-muted-foreground">No activity yet.</p>
            ) : null}
            {run.events.map((e) => (
              <div key={e.id} className="rounded-xl border border-border/70 p-2 text-xs">
                <p className="font-medium">{e.eventType}</p>
                <p className="text-[10px] text-muted-foreground">
                  {e.createdAt.toISOString()} {e.performedBy ? `· ${e.performedBy}` : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
