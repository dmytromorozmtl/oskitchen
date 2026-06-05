"use client";

import Link from "next/link";
import { Database, Download, FileJson } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DataPortabilitySnapshot } from "@/lib/data/export-types";

type Props = {
  snapshot: DataPortabilitySnapshot;
};

export function DataExportPanel({ snapshot }: Props) {
  return (
    <div className="space-y-6" data-testid="data-export-panel">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Export lanes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.laneCount}</p>
            <p className="text-xs text-muted-foreground">{snapshot.workspaceLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.accessibleDomainCount}</p>
            <p className="text-xs text-muted-foreground">
              of {snapshot.summary.domainCount} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portable rows</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.totalRows}</p>
            <p className="text-xs text-muted-foreground">Across accessible domains</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Manifest</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <a href={snapshot.summary.manifestHref}>
                <FileJson className="mr-2 h-4 w-4" />
                Download JSON
              </a>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">Full portability index</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {snapshot.lanes.map((lane) => (
          <Card key={lane.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4" />
                {lane.label}
              </CardTitle>
              <CardDescription>
                {lane.domains.length} domains · {lane.rowCount} rows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lane.domains.map((domain) => (
                <div
                  key={domain.type}
                  className="flex flex-col gap-2 rounded-lg border border-border/80 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{domain.label}</p>
                      <Badge variant="outline" className="rounded-full text-[10px] uppercase">
                        {domain.format}
                      </Badge>
                      {!domain.accessible ? (
                        <Badge variant="secondary" className="rounded-full text-[10px]">
                          restricted
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{domain.description}</p>
                    <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                      {domain.rowCount} rows
                    </p>
                  </div>
                  {domain.accessible ? (
                    <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
                      <a href={domain.downloadHref}>
                        <Download className="mr-2 h-4 w-4" />
                        CSV
                      </a>
                    </Button>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Per-domain CSV exports use the existing export center pipeline.{" "}
        <Link href="/dashboard/import-export/export" className="underline underline-offset-4">
          Legacy export grid
        </Link>
      </p>
    </div>
  );
}
