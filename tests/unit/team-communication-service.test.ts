import { describe, expect, it } from "vitest";

import {
  buildCreateMetadata,
  buildTeamCommunicationFeed,
  buildTeamCommunicationSummary,
} from "@/services/team/team-communication-service";

describe("team communication service", () => {
  const now = new Date("2026-05-07T12:00:00.000Z");

  it("builds feed from team staff events", () => {
    const feed = buildTeamCommunicationFeed({
      now,
      events: [
        {
          id: "e1",
          eventType: "team.announcement",
          summary: "Team announcement",
          metadataJson: {
            body: "Pre-shift huddle at 4pm",
            priority: "high",
            audience: "all",
            readByStaffIds: [],
          },
          staffMemberId: null,
          staffName: null,
          createdAt: new Date("2026-05-07T10:00:00.000Z"),
        },
        {
          id: "e2",
          eventType: "team.reminder",
          summary: "Team reminder",
          metadataJson: {
            body: "Restock line coolers",
            priority: "normal",
            audience: "all",
            dueAt: "2026-05-07T08:00:00.000Z",
            readByStaffIds: [],
          },
          staffMemberId: null,
          staffName: null,
          createdAt: new Date("2026-05-06T10:00:00.000Z"),
        },
      ],
    });

    expect(feed.items).toHaveLength(2);
    expect(feed.overdueReminders).toBe(1);
    expect(buildTeamCommunicationSummary(feed).announcements).toBe(1);
  });

  it("filters individual audience to target staff", () => {
    const feed = buildTeamCommunicationFeed({
      events: [
        {
          id: "e3",
          eventType: "team.message",
          summary: "Team message",
          metadataJson: {
            body: "Private note",
            priority: "normal",
            audience: "individual",
            targetStaffMemberId: "s1",
            readByStaffIds: [],
          },
          staffMemberId: "s1",
          staffName: "Alex",
          createdAt: new Date("2026-05-07T10:00:00.000Z"),
        },
      ],
      viewerStaffMemberId: "s2",
    });

    expect(feed.items).toHaveLength(0);
  });

  it("tracks unread count for viewer", () => {
    const feed = buildTeamCommunicationFeed({
      events: [
        {
          id: "e4",
          eventType: "team.message",
          summary: "Hi",
          metadataJson: buildCreateMetadata({ body: "Check the walk-in" }),
          staffMemberId: null,
          staffName: null,
          createdAt: new Date("2026-05-07T10:00:00.000Z"),
        },
      ],
      viewerStaffMemberId: "s1",
    });

    expect(feed.unreadCount).toBe(1);
  });
});
