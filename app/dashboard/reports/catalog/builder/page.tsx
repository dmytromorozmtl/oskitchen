"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buildCustomReportPreview,
  type CustomReportBuilderSpec,
  type ReportCatalogExportFormat,
} from "@/services/analytics/report-catalog-service";

const METRIC_OPTIONS = ["revenue", "orders", "aov", "labor_pct", "food_cost_pct", "margin", "covers"];
const GROUP_OPTIONS = ["day", "week", "location", "category", "channel", "server", "item"];
const EXPORT_OPTIONS: ReportCatalogExportFormat[] = ["csv", "pdf", "xlsx", "google_sheets"];
const SCHEDULE_OPTIONS = ["none", "daily", "weekly", "monthly"] as const;

export default function CustomReportBuilderPage() {
  const [title, setTitle] = useState("My custom report");
  const [metrics, setMetrics] = useState<string[]>(["revenue", "orders"]);
  const [groupBy, setGroupBy] = useState<string[]>(["day", "location"]);
  const [dateRange, setDateRange] = useState<CustomReportBuilderSpec["dateRange"]>("30d");
  const [exportFormat, setExportFormat] = useState<ReportCatalogExportFormat>("csv");
  const [schedule, setSchedule] = useState<CustomReportBuilderSpec["schedule"]>("none");

  const preview = useMemo(
    () =>
      buildCustomReportPreview({
        title,
        metrics,
        groupBy,
        dateRange,
        locationIds: [],
        exportFormat,
        schedule,
      }),
    [title, metrics, groupBy, dateRange, exportFormat, schedule],
  );

  function toggle(list: string[], value: string, setter: (next: string[]) => void) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Custom report builder</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose metrics, date range, locations, and grouping. Scheduled email delivery saves to your report settings.
        </p>
      </div>

      <Card data-testid="custom-report-builder">
        <CardHeader>
          <CardTitle className="text-base">Report definition</CardTitle>
          <CardDescription>Preview updates as you configure dimensions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-title">Report name</Label>
            <Input id="report-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Metrics</legend>
            <div className="flex flex-wrap gap-2">
              {METRIC_OPTIONS.map((metric) => (
                <ToggleChip
                  key={metric}
                  active={metrics.includes(metric)}
                  onClick={() => toggle(metrics, metric, setMetrics)}
                >
                  {metric}
                </ToggleChip>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Group by</legend>
            <div className="flex flex-wrap gap-2">
              {GROUP_OPTIONS.map((group) => (
                <ToggleChip
                  key={group}
                  active={groupBy.includes(group)}
                  onClick={() => toggle(groupBy, group, setGroupBy)}
                >
                  {group}
                </ToggleChip>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date-range">Date range</Label>
              <select
                id="date-range"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as CustomReportBuilderSpec["dateRange"])}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="custom">Custom range (on report page)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-format">Export format</Label>
              <select
                id="export-format"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ReportCatalogExportFormat)}
              >
                {EXPORT_OPTIONS.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule email</Label>
            <select
              id="schedule"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value as CustomReportBuilderSpec["schedule"])}
            >
              {SCHEDULE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "none" ? "No schedule" : option}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-sm">
            <p className="font-medium">{preview.title}</p>
            <p className="mt-1 text-muted-foreground">{preview.summary}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={preview.suggestedRoute}>Run closest wired report</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/reports/catalog">Back to catalog</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}
