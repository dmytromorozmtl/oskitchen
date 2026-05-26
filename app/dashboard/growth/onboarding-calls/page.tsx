import { format } from "date-fns";

import { submitOnboardingCallForm } from "@/actions/growth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";

export default async function OnboardingCallsPage() {
  const rows = await prisma.onboardingCall.findMany({
    orderBy: { callDate: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Log onboarding / sales call</CardTitle>
          <CardDescription>
            Structured discovery notes — link optional UUIDs for workspace, beta lead, or demo
            request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submitOnboardingCallForm} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input id="businessName" name="businessName" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="contactName">Contact name</Label>
              <Input id="contactName" name="contactName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="callDate">Call date</Label>
              <Input id="callDate" name="callDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Input id="stage" name="stage" placeholder="Discovery, pilot…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">Workspace user id (optional)</Label>
              <Input id="userId" name="userId" placeholder="uuid" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="betaLeadId">Beta lead id (optional)</Label>
              <Input id="betaLeadId" name="betaLeadId" placeholder="uuid" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="demoRequestId">Demo request id (optional)</Label>
              <Input id="demoRequestId" name="demoRequestId" placeholder="uuid" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="goals">Goals</Label>
              <Textarea id="goals" name="goals" rows={2} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="currentWorkflow">Current workflow</Label>
              <Textarea id="currentWorkflow" name="currentWorkflow" rows={2} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="painPoints">Pain points</Label>
              <Textarea id="painPoints" name="painPoints" rows={2} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="integrationsNeeded">Integrations needed</Label>
              <Textarea id="integrationsNeeded" name="integrationsNeeded" rows={2} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="objections">Objections</Label>
              <Textarea id="objections" name="objections" rows={2} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nextSteps">Next steps</Label>
              <Textarea id="nextSteps" name="nextSteps" rows={2} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="successCriteria">Success criteria</Label>
              <Textarea id="successCriteria" name="successCriteria" rows={2} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="outcome">Outcome</Label>
              <Textarea id="outcome" name="outcome" rows={2} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="rounded-full">
                Save call
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent calls</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-xs">
                    {format(r.callDate, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{r.businessName}</TableCell>
                  <TableCell>{r.contactName}</TableCell>
                  <TableCell className="text-xs">{r.stage ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
