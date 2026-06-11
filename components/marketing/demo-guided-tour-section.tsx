"use client";

import Link from "next/link";
import { MonitorPlay, PlayCircle } from "lucide-react";

import { DemoLaunchButton } from "@/components/demo/demo-launch-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DEMO_PAGE_IMPROVEMENT_EYEBROW,
  DEMO_PAGE_IMPROVEMENT_HEADLINE,
  DEMO_PAGE_IMPROVEMENT_PRIMARY_CTA,
  DEMO_PAGE_IMPROVEMENT_SANDBOX_STOPS,
  DEMO_PAGE_IMPROVEMENT_SECONDARY_CTA,
  DEMO_PAGE_IMPROVEMENT_SUBLINE,
  DEMO_PAGE_IMPROVEMENT_VIDEO_SCRIPT_DOC,
  DEMO_PAGE_IMPROVEMENT_VIDEO_TOUR_SEGMENTS,
} from "@/lib/marketing/demo-page-improvement-content";
import {
  DEMO_PAGE_IMPROVEMENT_SANDBOX_STOP_COUNT,
  DEMO_PAGE_IMPROVEMENT_SANDBOX_TEST_ID,
  DEMO_PAGE_IMPROVEMENT_VIDEO_SEGMENT_COUNT,
  DEMO_PAGE_IMPROVEMENT_VIDEO_TOUR_TEST_ID,
} from "@/lib/marketing/demo-page-improvement-policy";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/** Blueprint P1-83 — interactive sandbox tabs + guided video tour on /demo. */
export function DemoGuidedTourSection({ className }: Props) {
  const defaultStop = DEMO_PAGE_IMPROVEMENT_SANDBOX_STOPS[0]?.id ?? "today";

  return (
    <section
      className={cn("space-y-10", className)}
      aria-labelledby="demo-guided-tour-heading"
    >
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <Badge variant="secondary" className="rounded-full">
          {DEMO_PAGE_IMPROVEMENT_EYEBROW}
        </Badge>
        <h2
          id="demo-guided-tour-heading"
          className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          {DEMO_PAGE_IMPROVEMENT_HEADLINE}
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          {DEMO_PAGE_IMPROVEMENT_SUBLINE}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card
          className="border-border/80 bg-card/90 shadow-sm"
          data-testid={DEMO_PAGE_IMPROVEMENT_SANDBOX_TEST_ID}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <MonitorPlay className="h-5 w-5 text-primary" aria-hidden />
              <CardTitle className="text-lg">Interactive sandbox</CardTitle>
            </div>
            <CardDescription>
              {DEMO_PAGE_IMPROVEMENT_SANDBOX_STOP_COUNT} operator stops — launch the workspace,
              then follow this path. Channels stay simulated until you verify credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultStop} className="w-full">
              <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/80 p-1">
                {DEMO_PAGE_IMPROVEMENT_SANDBOX_STOPS.map((stop) => (
                  <TabsTrigger
                    key={stop.id}
                    value={stop.id}
                    className="rounded-md px-3 py-1.5 text-xs sm:text-sm"
                    data-testid={`demo-sandbox-stop-${stop.id}`}
                  >
                    {stop.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {DEMO_PAGE_IMPROVEMENT_SANDBOX_STOPS.map((stop) => (
                <TabsContent key={stop.id} value={stop.id} className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">
                      {stop.highlight}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">{stop.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {stop.description}
                    </p>
                  </div>
                  <p className="rounded-lg border border-dashed border-border/80 bg-muted/30 px-3 py-2 font-mono text-xs text-muted-foreground">
                    {stop.route}
                  </p>
                </TabsContent>
              ))}
            </Tabs>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <DemoLaunchButton className="h-11 rounded-full px-6 text-sm font-semibold" />
              <span className="text-xs text-muted-foreground">
                {DEMO_PAGE_IMPROVEMENT_PRIMARY_CTA.label} — honest BETA labels in workspace
              </span>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border/80 bg-card/90 shadow-sm"
          data-testid={DEMO_PAGE_IMPROVEMENT_VIDEO_TOUR_TEST_ID}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-primary" aria-hidden />
              <CardTitle className="text-lg">Guided video tour</CardTitle>
            </div>
            <CardDescription>
              {DEMO_PAGE_IMPROVEMENT_VIDEO_SEGMENT_COUNT}-segment script for sales calls and
              Loom recordings — typical 5-minute walkthrough.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-3">
              {DEMO_PAGE_IMPROVEMENT_VIDEO_TOUR_SEGMENTS.map((segment, index) => (
                <li
                  key={segment.id}
                  className="flex gap-3 rounded-xl border border-border/70 bg-background/60 p-3"
                  data-testid={`demo-video-tour-segment-${segment.id}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{segment.time}</span>
                      <span className="text-sm font-medium">{segment.title}</span>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">{segment.route}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Full script:{" "}
                <code className="rounded bg-muted px-1.5 py-0.5">{DEMO_PAGE_IMPROVEMENT_VIDEO_SCRIPT_DOC}</code>
              </p>
              <Link
                href={DEMO_PAGE_IMPROVEMENT_SECONDARY_CTA.href}
                className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-medium shadow-sm transition hover:bg-muted"
              >
                {DEMO_PAGE_IMPROVEMENT_SECONDARY_CTA.label}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
