"use client";

import * as React from "react";

import {
  forceUberEatsMenuSyncAction,
  testDoorDashConnectionAction,
} from "@/actions/integration-menu-sync";
import { getActionError, isActionSuccess } from "@/lib/action-result";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function IntegrationForceSyncPanel() {
  const [uberMsg, setUberMsg] = React.useState<string | null>(null);
  const [ddMsg, setDdMsg] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Force sync & connectivity</CardTitle>
        <CardDescription>
          Push menus to Uber Eats or verify DoorDash Drive credentials. Requires env keys on the server.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={loading === "uber"}
          onClick={async () => {
            setLoading("uber");
            setUberMsg(null);
            const res = await forceUberEatsMenuSyncAction();
            setUberMsg(
              isActionSuccess<{ categoriesCount?: number; itemsCount?: number; message?: string }>(res)
                ? `Uber: ${res.data?.message ?? "done"} (${res.data?.itemsCount ?? 0} items)`
                : (getActionError(res) ?? "Sync failed"),
            );
            setLoading(null);
          }}
        >
          Force sync Uber Eats menu
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={loading === "dd"}
          onClick={async () => {
            setLoading("dd");
            setDdMsg(null);
            const res = await testDoorDashConnectionAction();
            setDdMsg(
              isActionSuccess<{ message: string }>(res)
                ? res.data?.message ?? "Connected"
                : (getActionError(res) ?? "Connection failed"),
            );
            setLoading(null);
          }}
        >
          Test DoorDash API
        </Button>
        {uberMsg ? (
          <p className="w-full text-sm text-muted-foreground" role="status">
            {uberMsg}
          </p>
        ) : null}
        {ddMsg ? (
          <p className="w-full text-sm text-muted-foreground" role="status">
            {ddMsg}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
