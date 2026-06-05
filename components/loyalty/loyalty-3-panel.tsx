"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Crown, Gift, Layers, PartyPopper, Users } from "lucide-react";

import { saveLoyalty3ConfigAction } from "@/actions/loyalty-3";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Loyalty3DashboardSnapshot } from "@/lib/loyalty/loyalty-3-types";

type Props = {
  snapshot: Loyalty3DashboardSnapshot;
  canManage: boolean;
};

export function Loyalty3Panel({ snapshot, canManage }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState(snapshot.program.v3);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await saveLoyalty3ConfigAction(config);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6" data-testid="loyalty-3-panel">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.totalMembers}</p>
            <p className="text-xs text-muted-foreground">Loyalty accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cross-brand points</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.crossBrandPoints}</p>
            <p className="text-xs text-muted-foreground">Earned across brands</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">VIP members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.vipCount}</p>
            <p className="text-xs text-muted-foreground">×{config.vipMultiplier} earn multiplier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Referral bonuses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {snapshot.referralStats.bonusPointsAwarded}
            </p>
            <p className="text-xs text-muted-foreground">
              {snapshot.referralStats.completedReferrals} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Loyalty 3.0 settings</CardTitle>
            <CardDescription>Cross-brand pool, VIP multiplier, event bonuses, referral leaderboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="crossBrand">Cross-brand pool</Label>
                <Switch
                  id="crossBrand"
                  checked={config.crossBrandEnabled}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({ ...prev, crossBrandEnabled: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="eventBonus">Event bonuses</Label>
                <Switch
                  id="eventBonus"
                  checked={config.eventBonusEnabled}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({ ...prev, eventBonusEnabled: checked }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vipMultiplier">VIP earn multiplier</Label>
                <Input
                  id="vipMultiplier"
                  type="number"
                  step="0.05"
                  min="1"
                  max="3"
                  value={config.vipMultiplier}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      vipMultiplier: Number(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vipMinLtv">VIP min LTV ($)</Label>
                <Input
                  id="vipMinLtv"
                  type="number"
                  min="0"
                  value={Math.round(config.vipMinLifetimeValueCents / 100)}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      vipMinLifetimeValueCents: Math.max(0, Number(e.target.value) || 0) * 100,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventBonusPoints">Event bonus points</Label>
                <Input
                  id="eventBonusPoints"
                  type="number"
                  min="0"
                  value={config.eventBonusPoints}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      eventBonusPoints: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                />
              </div>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button onClick={handleSave} disabled={pending} className="rounded-full">
              Save Loyalty 3.0
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4" />
              Cross-brand lanes
            </CardTitle>
            <CardDescription>Points earned per brand in the workspace pool</CardDescription>
          </CardHeader>
          <CardContent>
            {snapshot.crossBrandLanes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cross-brand earn data yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {snapshot.crossBrandLanes.map((lane) => (
                  <li
                    key={lane.brandId ?? "unbranded"}
                    className="flex items-center justify-between border-b border-border/40 py-2 last:border-0"
                  >
                    <span>{lane.brandName}</span>
                    <span className="text-muted-foreground">
                      {lane.pointsEarned} pts · {lane.memberCount} members
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Crown className="h-4 w-4" />
              VIP members
            </CardTitle>
            <CardDescription>High-value customers with boosted earn rate</CardDescription>
          </CardHeader>
          <CardContent>
            {snapshot.vipMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No VIP members yet.{" "}
                <Link href="/dashboard/customers/vip" className="underline">
                  Promote VIPs
                </Link>
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {snapshot.vipMembers.map((member) => (
                  <li
                    key={member.customerId}
                    className="flex items-center justify-between border-b border-border/40 py-2 last:border-0"
                  >
                    <Link href={member.href} className="font-medium hover:underline">
                      {member.displayName}
                    </Link>
                    <span className="text-muted-foreground">
                      {member.pointsBalance} pts · {member.tier}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PartyPopper className="h-4 w-4" />
              Event opportunities
            </CardTitle>
            <CardDescription>Catering events eligible for loyalty bonuses</CardDescription>
          </CardHeader>
          <CardContent>
            {snapshot.eventOpportunities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming catering events.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {snapshot.eventOpportunities.map((event) => (
                  <li
                    key={event.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 py-2 last:border-0"
                  >
                    <div>
                      <Link href={event.href} className="font-medium hover:underline">
                        {event.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {event.customerName ?? "—"}
                        {event.guestCount ? ` · ${event.guestCount} guests` : ""}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {event.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Referrals
            </CardTitle>
            <CardDescription>
              {snapshot.referralStats.pendingReferrals} pending ·{" "}
              {snapshot.program.referralBonusPoints} pts per referral
            </CardDescription>
          </CardHeader>
          <CardContent>
            {snapshot.referralStats.recentReferrals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No referral bonuses awarded yet. Enable referrals in Loyalty 2.0 builder.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {snapshot.referralStats.recentReferrals.map((ref) => (
                  <li
                    key={ref.id}
                    className="flex items-center justify-between border-b border-border/40 py-2 last:border-0"
                  >
                    <span>{ref.referrerLabel}</span>
                    <span className="text-muted-foreground">+{ref.points} pts</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/loyalty/program-builder">
            <Gift className="mr-2 h-4 w-4" />
            Loyalty 2.0 builder
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/customers/loyalty">Classic loyalty</Link>
        </Button>
      </div>
    </div>
  );
}
