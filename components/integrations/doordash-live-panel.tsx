"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import {
  importDoorDashLiveOrdersAction,
  saveDoorDashLiveCredentialsAction,
  syncDoorDashLiveMenuAction,
  testDoorDashLiveConnectionAction,
} from "@/actions/doordash-live";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DoorDashLiveDashboard } from "@/lib/integrations/doordash-live-types";

export function DoorDashLivePanel({ dashboard }: { dashboard: DoorDashLiveDashboard }) {
  const searchParams = useSearchParams();
  const oauthNotice =
    searchParams.get("oauth") === "connected"
      ? "DoorDash OAuth connected — webhooks and menu sync are ready to test."
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
    <div className="space-y-6" data-testid="doordash-live-panel">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={dashboard.mode === "live" ? "default" : "outline"}>
          {dashboard.mode === "live" ? "LIVE pipeline" : "Placeholder — add credentials"}
        </Badge>
        {dashboard.oauthConnected ? <Badge variant="secondary">OAuth connected</Badge> : null}
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
          <CardTitle className="text-lg">Credentials</CardTitle>
          <CardDescription>API key + merchant ID, or OAuth below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            action={(fd) => {
              startTransition(async () => {
                const res = await saveDoorDashLiveCredentialsAction(fd);
                setMessage(res.ok ? "Credentials saved." : res.error);
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="dd-name">Label</Label>
              <Input id="dd-name" name="name" defaultValue="DoorDash" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dd-merchant">Merchant ID</Label>
              <Input
                id="dd-merchant"
                name="merchantId"
                defaultValue={dashboard.merchantId ?? ""}
                data-testid="doordash-merchant-id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dd-api-key">API key (Bearer)</Label>
              <Input id="dd-api-key" name="apiKey" type="password" autoComplete="off" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dd-webhook">Webhook signing secret</Label>
              <Input id="dd-webhook" name="webhookSecret" type="password" autoComplete="off" />
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="menuSyncEnabled" defaultChecked={dashboard.menuSyncEnabled} />
                Menu sync
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="orderIngestionEnabled"
                  defaultChecked={dashboard.orderIngestionEnabled}
                />
                Order webhooks
              </label>
            </div>
            <Button type="submit" disabled={pending}>
              Save credentials
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">OAuth & webhooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {dashboard.authorizeUrl ? (
            <Button asChild className="rounded-full">
              <a href={dashboard.authorizeUrl} data-testid="doordash-oauth-connect">
                Connect with DoorDash
              </a>
            </Button>
          ) : dashboard.oauthConnected ? (
            <p className="text-muted-foreground">OAuth token active.</p>
          ) : (
            <p className="text-muted-foreground">
              Set <code className="rounded bg-muted px-1">DOORDASH_OAUTH_CLIENT_SECRET</code> for OAuth,
              or save an API key above.
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
          <p>
            <Link className="text-primary underline" href="/dashboard/integration-health">
              Integration health
            </Link>
          </p>
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
            onClick={() => run(() => syncDoorDashLiveMenuAction())}
            data-testid="doordash-sync-menu"
          >
            Sync menu to DoorDash
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => importDoorDashLiveOrdersAction())}
            data-testid="doordash-import-orders"
          >
            Import orders now
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => run(() => testDoorDashLiveConnectionAction())}
          >
            Test API
          </Button>
        </CardContent>
      </Card>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent marketplace orders</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {dashboard.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No DoorDash orders ingested yet.</p>
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
