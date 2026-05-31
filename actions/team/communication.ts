"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  createTeamCommunicationItem,
  markTeamCommunicationRead,
} from "@/services/team/team-communication-load";

const TEAM_PATHS = [
  "/dashboard/staff/team",
  "/dashboard/staff",
];

function revalidateTeamCommunication() {
  for (const path of TEAM_PATHS) revalidatePath(path);
}

async function requireTeamManageAccess(operation: string) {
  const access = await requireMutationPermission("staff.manage");
  if (!access.ok) throw new Error(`${operation}: ${access.error}`);
  return access.actor;
}

const composeSchema = z.object({
  kind: z.enum(["announcement", "reminder", "message"]),
  body: z.string().min(1).max(4000),
  priority: z.enum(["normal", "high"]).optional(),
  audience: z.enum(["all", "role", "individual"]).optional(),
  audienceRoleTypes: z.string().optional(),
  targetStaffMemberId: z.string().uuid().optional().or(z.literal("")),
  dueAt: z.string().optional(),
});

export async function postTeamCommunicationAction(formData: FormData): Promise<void> {
  const actor = await requireTeamManageAccess("team.post");
  const { dataUserId } = await requireTenantActor();

  const parsed = composeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid team communication payload");

  const roleTypes =
    parsed.data.audienceRoleTypes?.split(",").map((s) => s.trim()).filter(Boolean) ?? undefined;

  const result = await createTeamCommunicationItem({
    userId: dataUserId,
    performedById: actor.sessionUserId,
    authorName: actor.workspaceRole,
    kind: parsed.data.kind,
    body: parsed.data.body,
    priority: parsed.data.priority,
    audience: parsed.data.audience,
    audienceRoleTypes: roleTypes,
    targetStaffMemberId: parsed.data.targetStaffMemberId || undefined,
    dueAt: parsed.data.dueAt,
    summary:
      parsed.data.kind === "announcement"
        ? "Team announcement"
        : parsed.data.kind === "reminder"
          ? "Team reminder"
          : "Team message",
  });

  if (!result.ok) throw new Error(result.error);
  revalidateTeamCommunication();
}

export async function markTeamCommunicationReadAction(formData: FormData): Promise<void> {
  const { dataUserId } = await requireTenantActor();
  const eventId = z.string().uuid().parse(formData.get("eventId"));
  const staffMemberId = z.string().uuid().parse(formData.get("staffMemberId"));

  await markTeamCommunicationRead({
    userId: dataUserId,
    eventId,
    staffMemberId,
  });
  revalidateTeamCommunication();
}
