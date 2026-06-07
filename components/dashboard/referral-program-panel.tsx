import Link from "next/link";

import { CopyReferralButton } from "@/components/growth/copy-referral-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatReferralGtmGateSummary,
  REFERRAL_PROGRAM_REWARD_DAYS,
  type ReferralProgramGtmSnapshot,
} from "@/lib/marketing/referral-program-absolute-final-policy";
import {
  getReferralGtmTierByRefereeCount,
  REFERRAL_PROGRAM_GTM_TIERS,
  REFERRAL_PROGRAM_PRODUCT_STATUS,
} from "@/lib/marketing/referral-program-policy";
import type { ReferralDashboard } from "@/services/referral/referral-service";

type Props = {
  dashboard: ReferralDashboard;
  gtm: ReferralProgramGtmSnapshot;
  variant?: "full" | "settings";
};

export function ReferralProgramPanel({ dashboard, gtm, variant = "full" }: Props) {
  const tier = getReferralGtmTierByRefereeCount(dashboard.referredRestaurants);

  return (
    <div className="space-y-6" data-referral-program-panel>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {variant === "settings" ? "Referral program" : "Refer a restaurateur"}
          </h1>
          <Badge variant="secondary" className="rounded-full text-[10px]">
            {REFERRAL_PROGRAM_PRODUCT_STATUS}
          </Badge>
          <Badge
            variant={gtm.gtmEnabled ? "default" : "outline"}
            className="rounded-full text-[10px]"
          >
            GTM {gtm.gtmStatusLabel}
          </Badge>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Owner-to-owner growth for <strong>kitchen operators only</strong> — ghost kitchens, meal
          prep, commissaries, and multi-concept groups. Share your link; when another restaurant
          completes signup, you both receive{" "}
          <strong>{REFERRAL_PROGRAM_REWARD_DAYS} days</strong> free on your OS Kitchen subscription.
          Rewards are tracked in billing — <strong>not unlimited</strong> stacked credits beyond
          policy.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your referral link</CardTitle>
          <CardDescription>
            Short link for texts and Slack — <code className="rounded bg-muted px-1">/r/CODE</code>{" "}
            sets a 90-day attribution cookie through signup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="break-all font-mono text-sm leading-relaxed">{dashboard.link}</p>
          <div data-referral-program-copy-link>
            <CopyReferralButton text={dashboard.link} />
          </div>
          <p className="text-xs text-muted-foreground">
            Code: <span className="font-mono">{dashboard.code}</span>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Restaurants referred" value={dashboard.referredRestaurants} />
        <Kpi label="Free months earned" value={dashboard.earnedFreeMonths} />
        <Kpi label="Referrer tier" value={tier} hint={REFERRAL_PROGRAM_GTM_TIERS.join(" → ")} />
        <Kpi
          label="Portfolio NPS gate"
          value={gtm.npsScore == null ? "—" : gtm.npsScore}
          hint={formatReferralGtmGateSummary(gtm)}
        />
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
          <CardDescription>Product flow — live in engineering (BETA label in-app).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">1. Share</strong> — Send your{" "}
            <code className="rounded bg-muted px-1">/r/CODE</code> link to another operator.
          </p>
          <p>
            <strong className="text-foreground">2. Signup</strong> — They create an OS Kitchen
            account with your code (cookie or query param).
          </p>
          <p>
            <strong className="text-foreground">3. Reward</strong> — Both accounts receive{" "}
            {REFERRAL_PROGRAM_REWARD_DAYS} days free; audit trail in billing events.
          </p>
          <p className="text-xs">
            Public marketing amplification stays <strong>PRE-LAUNCH</strong> until{" "}
            <strong>portfolio NPS</strong> ≥40 from ≥3 pilot surveys — in-app referrals remain
            available for early design partners.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent signups</CardTitle>
          <CardDescription>
            Attributed via your link (email only — no full operator profiles).
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.recentEvents.map((e) => (
                <TableRow key={e.id} data-referral-program-event-row={e.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {e.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate text-sm sm:max-w-none">
                    {e.email}
                  </TableCell>
                  <TableCell>
                    {e.convertedUserId ? (
                      <Badge variant={e.rewardsGranted ? "default" : "secondary"}>
                        {e.rewardsGranted ? "Free month applied" : "Signed up"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Clicked link</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {dashboard.recentEvents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No referrals yet — share your link with another restaurant owner in your network.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {variant === "full" ? (
        <div className="flex flex-wrap gap-3 text-sm">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/settings/referrals">Settings view</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/growth/referrals">Growth analytics</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}
