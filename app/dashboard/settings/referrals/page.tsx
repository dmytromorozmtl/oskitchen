import { CopyReferralButton } from "@/components/growth/copy-referral-button";
import { Badge } from "@/components/ui/badge";
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
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  getReferralDashboard,
  REFERRAL_FREE_MONTH_DAYS,
} from "@/services/referral/referral-service";

export const metadata = {
  title: "Referrals — Settings",
  description: "Refer restaurants and earn free subscription months.",
};

export default async function SettingsReferralsPage() {
  const { sessionUser } = await getTenantActor();
  const dashboard = await getReferralDashboard(sessionUser.id);

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Referral program</h1>
        <p className="text-sm text-muted-foreground">
          Share your link. When a restaurant signs up, you both get{" "}
          <strong>{REFERRAL_FREE_MONTH_DAYS} days</strong> free on your OS Kitchen plan.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your referral link</CardTitle>
          <CardDescription>
            Short link for texts and social — <code className="rounded bg-muted px-1">/r/CODE</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="break-all font-mono text-sm leading-relaxed">{dashboard.link}</p>
          <CopyReferralButton text={dashboard.link} />
          <p className="text-xs text-muted-foreground">
            Code: <span className="font-mono">{dashboard.code}</span>
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Restaurants referred</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{dashboard.referredRestaurants}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Free months earned</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{dashboard.earnedFreeMonths}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent signups</CardTitle>
          <CardDescription>Attributed via your link (email only — no full profiles).</CardDescription>
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
                <TableRow key={e.id}>
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
              No referrals yet — share your link with another restaurant owner.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
