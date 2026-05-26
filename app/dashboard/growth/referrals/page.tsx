import { ensureReferralCode } from "@/actions/growth";
import { CopyReferralButton } from "@/components/growth/copy-referral-button";
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
import { SITE_URL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getTenantActor } from "@/lib/scope/cached-tenant";

export default async function GrowthReferralsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  let codeRow = await prisma.referralCode.findFirst({
    where: { userId: dataUserId, active: true },
  });
  if (!codeRow) {
    await ensureReferralCode();
    codeRow = await prisma.referralCode.findFirst({
      where: { userId: dataUserId, active: true },
    });
  }

  const events = codeRow
    ? await prisma.referralEvent.findMany({
        where: { referralCodeId: codeRow.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  const base = SITE_URL.replace(/\/$/, "");
  const link = codeRow ? `${base}/signup?ref=${encodeURIComponent(codeRow.code)}` : "";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your referral link</CardTitle>
          <CardDescription>
            Append <code className="rounded bg-muted px-1">?ref=CODE</code> on marketing pages —
            cookie persists through signup attribution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {codeRow ? (
            <>
              <p className="font-mono text-sm">{link}</p>
              <CopyReferralButton text={link} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Generating code… refresh.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent referral events</CardTitle>
          <CardDescription>Emails touching your code (privacy-minimal).</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Converted user</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {e.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </TableCell>
                  <TableCell className="text-sm">{e.email}</TableCell>
                  <TableCell className="text-xs">{e.source ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {e.convertedUserId ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {events.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No events yet — share your link on beta landing pages or invoices.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
