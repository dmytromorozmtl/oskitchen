import { PublicShell } from "@/components/marketing/public-page";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Partner revenue" };

export default function PartnerRevenuePage() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Partner revenue</h1>
        <Card>
          <CardHeader>
            <CardTitle>Commission placeholder</CardTitle>
            <CardDescription>Referral attribution is planned. Real payout automation is not implemented and should not be promised.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    </PublicShell>
  );
}
