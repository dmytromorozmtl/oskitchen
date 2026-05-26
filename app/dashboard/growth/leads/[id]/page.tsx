import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

import {
  appendBetaLeadNote,
  convertBetaLeadToDemoRequest,
  updateBetaLeadPriority,
  updateBetaLeadStatus,
} from "@/actions/growth";
import { Badge } from "@/components/ui/badge";
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
import { scoreBetaLead } from "@/lib/growth/lead-scoring";
import { prisma } from "@/lib/prisma";
import { BetaLeadStatus } from "@prisma/client";

const LEAD_STATUSES: BetaLeadStatus[] = [
  "NEW",
  "QUALIFIED",
  "CONTACTED",
  "DEMO_BOOKED",
  "ONBOARDED",
  "REJECTED",
  "CUSTOMER",
];

export default async function GrowthLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await prisma.betaLead.findUnique({
    where: { id },
    include: { timelineNotes: { orderBy: { createdAt: "desc" } } },
  });
  if (!lead) notFound();

  const { label } = scoreBetaLead({
    weeklyOrderVolume: lead.weeklyOrderVolume,
    businessType: lead.businessType,
    currentChannels: lead.currentChannels,
    biggestPain: lead.biggestPain,
    interestedFeatures: lead.interestedFeatures,
    country: lead.country,
    businessWebsite: lead.businessWebsite,
  });

  const channels = Array.isArray(lead.currentChannels)
    ? (lead.currentChannels as string[]).join(", ")
    : JSON.stringify(lead.currentChannels);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" className="rounded-full" asChild>
          <Link href="/dashboard/growth/leads">← Leads</Link>
        </Button>
        <Badge variant="secondary">{lead.status}</Badge>
        <span className="text-sm text-muted-foreground">
          Score {lead.score} · {label}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{lead.businessName}</CardTitle>
            <CardDescription>
              {lead.fullName} · {lead.email}
              {lead.phone ? ` · ${lead.phone}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Website: </span>
              {lead.businessWebsite ?? "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Channels: </span>
              {channels}
            </div>
            <div>
              <span className="text-muted-foreground">Weekly volume: </span>
              {lead.weeklyOrderVolume ?? "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Pain: </span>
              {lead.biggestPain ?? "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Features: </span>
              {JSON.stringify(lead.interestedFeatures)}
            </div>
            <div>
              <span className="text-muted-foreground">Country / TZ: </span>
              {lead.country ?? "—"} / {lead.timezone ?? "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              action={async (fd) => {
                "use server";
                await updateBetaLeadStatus({
                  leadId: id,
                  status: fd.get("status") as BetaLeadStatus,
                });
              }}
              className="space-y-2"
            >
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={lead.status}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm" className="rounded-full">
                Update status
              </Button>
            </form>

            <form
              action={async (fd) => {
                "use server";
                await updateBetaLeadPriority({
                  leadId: id,
                  priority: Number(fd.get("priority") ?? 0),
                });
              }}
              className="space-y-2"
            >
              <Label>Priority (0–9)</Label>
              <Input
                name="priority"
                type="number"
                min={0}
                max={9}
                defaultValue={lead.priority}
              />
              <Button type="submit" size="sm" variant="outline" className="rounded-full">
                Save priority
              </Button>
            </form>

            <form
              action={async () => {
                "use server";
                await convertBetaLeadToDemoRequest(id);
              }}
            >
              <Button type="submit" variant="secondary" className="w-full rounded-full">
                Convert to demo request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notes timeline</CardTitle>
          <CardDescription>Internal-only founder notes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {lead.timelineNotes.map((n) => (
              <li key={n.id} className="rounded-lg border border-border/70 p-3 text-sm">
                <p className="text-xs text-muted-foreground">
                  {format(n.createdAt, "MMM d, yyyy HH:mm")}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{n.body}</p>
              </li>
            ))}
          </ul>
          <form
            action={async (fd) => {
              "use server";
              await appendBetaLeadNote({
                leadId: id,
                body: String(fd.get("body") ?? ""),
              });
            }}
            className="space-y-2"
          >
            <Label htmlFor="body">Add note</Label>
            <Textarea id="body" name="body" rows={3} placeholder="Call recap, objection, next step…" />
            <Button type="submit" size="sm" className="rounded-full">
              Save note
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Suggested outreach</CardTitle>
          <CardDescription>
            Hi {lead.fullName.split(" ")[0]} — tailored angle based on pain ({label} fit).
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Mention their stated channels ({channels}) and offer a focused demo on order hub +
          production if score ≥ warm. Full drafts live under Outreach assistant.
        </CardContent>
      </Card>
    </div>
  );
}
