"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Cake, Heart, RefreshCw, UserMinus } from "lucide-react";

import {
  runCrmAutomationScanAction,
  saveCrmAutomationConfigAction,
} from "@/actions/crm/automation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { CrmAutomationSnapshot } from "@/lib/crm/automation-types";

type Props = {
  snapshot: CrmAutomationSnapshot;
  canManage: boolean;
};

const LANE_ICONS = {
  win_back: UserMinus,
  birthday: Cake,
  favorites: Heart,
} as const;

export function CrmAutomationPanel({ snapshot, canManage }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [config, setConfig] = useState(snapshot.config);

  function handleSave() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await saveCrmAutomationConfigAction(config);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  function handleRunScan() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await runCrmAutomationScanAction();
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(
        `Created ${res.data.followUpsCreated} follow-ups · ${res.data.birthdayRewardsAwarded} birthday rewards`,
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-6" data-testid="crm-automation-panel">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.totalPending}</p>
            <p className="text-xs text-muted-foreground">Automation opportunities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win-back</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.winBackCount}</p>
            <p className="text-xs text-muted-foreground">Inactive customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Birthdays</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.birthdayCount}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Favorites</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.favoritesCount}</p>
            <p className="text-xs text-muted-foreground">Reorder nudges</p>
          </CardContent>
        </Card>
      </div>

      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Automation settings</CardTitle>
            <CardDescription>
              Win-back, birthday rewards, and favorites reorder triggers — consent-gated outreach
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="winBack">Win-back</Label>
                <Switch
                  id="winBack"
                  checked={config.winBackEnabled}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({ ...prev, winBackEnabled: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="birthday">Birthday</Label>
                <Switch
                  id="birthday"
                  checked={config.birthdayEnabled}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({ ...prev, birthdayEnabled: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="favorites">Favorites</Label>
                <Switch
                  id="favorites"
                  checked={config.favoritesEnabled}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({ ...prev, favoritesEnabled: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="consent">Require consent</Label>
                <Switch
                  id="consent"
                  checked={config.requireMarketingConsent}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({ ...prev, requireMarketingConsent: checked }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="winBackDays">Win-back after (days)</Label>
                <Input
                  id="winBackDays"
                  type="number"
                  min="7"
                  value={config.winBackInactiveDays}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      winBackInactiveDays: Math.max(7, Number(e.target.value) || 45),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="favoritesDays">Favorites inactive (days)</Label>
                <Input
                  id="favoritesDays"
                  type="number"
                  min="7"
                  value={config.favoritesInactiveDays}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      favoritesInactiveDays: Math.max(7, Number(e.target.value) || 21),
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSave} disabled={pending} className="rounded-full">
                Save settings
              </Button>
              <Button
                onClick={handleRunScan}
                disabled={pending}
                variant="outline"
                className="rounded-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Run scan now
              </Button>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
            <p className="text-xs text-muted-foreground">
              {snapshot.summary.followUpsCreatedToday} follow-ups created today by automation
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {snapshot.lanes.map((lane) => {
          const Icon = LANE_ICONS[lane.kind];
          return (
            <Card key={lane.kind}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-4 w-4" />
                  {lane.label}
                </CardTitle>
                <CardDescription>
                  {lane.enabled ? `${lane.pendingCount} pending` : "Disabled"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lane.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No candidates right now.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {lane.items.map((item) => (
                      <li
                        key={item.id}
                        className="border-b border-border/40 py-2 last:border-0"
                      >
                        <Link href={item.href} className="font-medium hover:underline">
                          {item.customerName}
                        </Link>
                        <p className="text-xs text-muted-foreground">{item.message}</p>
                        {item.requiresConsent && !item.hasConsent ? (
                          <Badge variant="outline" className="mt-1 rounded-full text-xs">
                            No consent
                          </Badge>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/customers/follow-ups">Follow-ups queue</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/settings/crm">CRM settings</Link>
        </Button>
      </div>
    </div>
  );
}
