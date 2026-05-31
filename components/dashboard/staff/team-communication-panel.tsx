"use client";

import { useState } from "react";
import { Bell, Megaphone, MessageSquare } from "lucide-react";

import { markTeamCommunicationReadAction, postTeamCommunicationAction } from "@/actions/team/communication";
import type { TeamCommunicationItem } from "@/lib/team/team-communication-types";
import type { TeamCommunicationFeed } from "@/services/team/team-communication-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StaffOption = { id: string; name: string };

type Props = {
  feed: TeamCommunicationFeed;
  canManage: boolean;
  staff: StaffOption[];
  viewerStaffMemberId?: string;
};

const KIND_ICON = {
  announcement: Megaphone,
  reminder: Bell,
  message: MessageSquare,
} as const;

function FeedItem({
  item,
  viewerStaffMemberId,
}: {
  item: TeamCommunicationItem;
  viewerStaffMemberId?: string;
}) {
  const Icon = KIND_ICON[item.kind];
  const isUnread =
    viewerStaffMemberId != null &&
    !(item.metadata.readByStaffIds ?? []).includes(viewerStaffMemberId);

  return (
    <li
      className={`rounded-lg border p-3 ${isUnread ? "border-primary/40 bg-primary/5" : "bg-background"}`}
    >
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {item.kind}
            </span>
            {item.metadata.priority === "high" && (
              <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:text-rose-300">
                High
              </span>
            )}
            {item.isOverdue && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-200">
                Overdue
              </span>
            )}
            {item.isDueSoon && !item.isOverdue && (
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-800 dark:text-blue-200">
                Due soon
              </span>
            )}
          </div>
          <p className="mt-1 text-sm">{item.metadata.body}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {new Date(item.createdAtIso).toLocaleString()}
            {item.metadata.dueAt ? ` · Due ${new Date(item.metadata.dueAt).toLocaleString()}` : ""}
            {item.metadata.authorName ? ` · ${item.metadata.authorName}` : ""}
          </p>
          {viewerStaffMemberId && isUnread && (
            <form action={markTeamCommunicationReadAction} className="mt-2">
              <input type="hidden" name="eventId" value={item.id} />
              <input type="hidden" name="staffMemberId" value={viewerStaffMemberId} />
              <button type="submit" className="text-xs text-primary hover:underline">
                Mark read
              </button>
            </form>
          )}
        </div>
      </div>
    </li>
  );
}

export function TeamCommunicationPanel({ feed, canManage, staff, viewerStaffMemberId }: Props) {
  const [kind, setKind] = useState<"announcement" | "reminder" | "message">("announcement");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Unread</CardTitle>
            <p className="text-2xl font-semibold">{feed.unreadCount}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Overdue reminders</CardTitle>
            <p className="text-2xl font-semibold">{feed.overdueReminders}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Feed items</CardTitle>
            <p className="text-2xl font-semibold">{feed.items.length}</p>
          </CardHeader>
        </Card>
      </div>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compose</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={postTeamCommunicationAction} className="grid gap-3">
              <input type="hidden" name="kind" value={kind} />
              <div className="flex flex-wrap gap-2">
                {(["announcement", "reminder", "message"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={`rounded-full px-3 py-1 text-xs capitalize ${
                      kind === k ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <textarea
                name="body"
                required
                rows={3}
                placeholder="Write announcement, reminder, or message…"
                className="rounded-md border px-3 py-2 text-sm"
              />
              <div className="grid gap-2 sm:grid-cols-3">
                <select name="priority" defaultValue="normal" className="rounded-md border px-2 py-1.5 text-sm">
                  <option value="normal">Normal priority</option>
                  <option value="high">High priority</option>
                </select>
                <select name="audience" defaultValue="all" className="rounded-md border px-2 py-1.5 text-sm">
                  <option value="all">All staff</option>
                  <option value="role">By role</option>
                  <option value="individual">Individual</option>
                </select>
                {kind === "reminder" && (
                  <input
                    type="datetime-local"
                    name="dueAt"
                    className="rounded-md border px-2 py-1.5 text-sm"
                  />
                )}
              </div>
              <input
                name="audienceRoleTypes"
                placeholder="Role types if audience=role (LINE_COOK, PACKER…)"
                className="rounded-md border px-2 py-1.5 text-sm font-mono text-xs"
              />
              <select name="targetStaffMemberId" className="rounded-md border px-2 py-1.5 text-sm">
                <option value="">Individual target (optional)</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-fit rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
              >
                Post to team feed
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team feed</CardTitle>
        </CardHeader>
        <CardContent>
          {feed.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No announcements, reminders, or messages yet.</p>
          ) : (
            <ul className="space-y-3">
              {feed.items.map((item) => (
                <FeedItem key={item.id} item={item} viewerStaffMemberId={viewerStaffMemberId} />
              ))}
            </ul>
          )}
          <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
            {feed.notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
