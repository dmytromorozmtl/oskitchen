import Link from "next/link";
import { Bell, Megaphone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeamCommunicationFeed } from "@/services/team/team-communication-service";

export function TeamCommunicationWidget({ feed }: { feed: TeamCommunicationFeed }) {
  const latest = feed.items.slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Team comms</CardTitle>
        <Link href="/dashboard/staff/team" className="text-xs text-primary hover:underline">
          Open feed →
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-4 text-sm">
          <span className="text-muted-foreground">
            Unread: <strong className="text-foreground">{feed.unreadCount}</strong>
          </span>
          <span className="text-muted-foreground">
            Overdue: <strong className="text-foreground">{feed.overdueReminders}</strong>
          </span>
        </div>
        {latest.length === 0 ? (
          <p className="text-sm text-muted-foreground">No team messages yet.</p>
        ) : (
          <ul className="space-y-2">
            {latest.map((item) => (
              <li key={item.id} className="flex gap-2 text-sm">
                {item.kind === "reminder" ? (
                  <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                ) : (
                  <Megaphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
                <span className="line-clamp-2">{item.metadata.body}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
