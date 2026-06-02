"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import {
  importUberEatsLiveOrdersAction,
  syncUberEatsLiveMenuAction,
  testUberEatsLiveConnectionAction,
} from "@/actions/uber-eats-live";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UberEatsLiveDashboard } from "@/lib/integrations/uber-eats-live-types";

export function UberEatsLivePanel({ dashboard }: { dashboard: UberEatsLiveDashboard }) {
  const searchParams = useSearchParams();
  const oauthNotice =
    searchParams.get("oauth") === "connected"
      ? "Uber OAuth connected — webhooks and menu sync are ready to test."
      : searchParams.get("oauth_error")
        ? `OAuth error: ${searchParams.get("oauth_error")}`
        : null;

  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string; data?: { message?: string } }>) {
    startTransition(async () => {
      const res = await action();
      if (!res.ok) {
        setMessage(res.error ?? "Action failed.");
        return;
      }
      setMessage(res.data?.message ?? "Done.");
    });
  }

  return (
    <div className="space-y-6" data-testid="uber-eats-live-panel">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={dashboard.mode === "live" ? "default" : "outline"}>
          {dashboard.mode === "live" ? "LIVE pipeline" : "Placeholder — add credentials"}
        </Badge>
        {dashboard.oauthConnected ? <Badge variant="secondary">OAuth connected</Badge> : null}
        {dashboard.connectionStatus ? (
          <Badge variant="outline">{dashboard.connectionStatus}</Badge>
        ) : null}
      </div>

      {oauthNotice ? (
        <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">{oauthNotice}</p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Go-live checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {dashboard.checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span aria-hidden>{item.done ? "✓" : "○"}</span>
              <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                {item.label}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">OAuth & webhooks</CardTitle>
          <CardDescription>
            Connect your Uber Eats store, then register the webhook for real-time orders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {dashboard.authorizeUrl ? (
            <Button asChild className="rounded-full">
              <a href={dashboard.authorizeUrl} data-testid="uber-eats-oauth-connect">
                Connect with Uber
              </a>
            </Button>
          ) : dashboard.oauthConnected ? (
            <p className="text-muted-foreground">OAuth token active.</p>
          ) : (
            <p className="text-muted-foreground">
              Save client credentials on the{" "}
              <Link href="/dashboard/integrations/uber-eats" className="text-primary underline">
                settings page
              </Link>{" "}
              before connecting OAuth.
            </p>
          )}
          {dashboard.webhookUrl ? (
            <div>
              <p className="mb-1 font-medium">Webhook URL</p>
              <code className="block break-all rounded-md bg-muted px-2 py-2 text-xs">
                {dashboard.webhookUrl}
              </code>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sync controls</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={pending}
            onClick={() => run(() => syncUberEatsLiveMenuAction())}
            data-testid="uber-eats-sync-menu"
          >
            Sync menu to Uber
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => importUberEatsLiveOrdersAction())}
            data-testid="uber-eats-import-orders"
          >
            Import orders now
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => run(() => testUberEatsLiveConnectionAction())}
          >
            Test OAuth
          </Button>
        </CardContent>
      </Card>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent marketplace orders</CardTitle>
          <CardDescription>
            Mapped via `normalizeUberEatsMarketplaceOrder` — webhook + poll import.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {dashboard.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No Uber Eats orders ingested yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Kitchen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.recentOrders.map((row) => (
                  <TableRow key={row.externalOrderId}>
                    <TableCell className="font-mono text-xs">
                      {row.displayId ?? row.externalOrderId.slice(0, 8)}
                    </TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>
                      {row.total != null ? `$${row.total.toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell>{row.imported ? "Imported" : "External only"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
