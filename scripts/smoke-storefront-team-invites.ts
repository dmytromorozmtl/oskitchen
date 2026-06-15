/**
 * Staging smoke: storefront team invites (create → list → cancel → optional accept).
 *
 * Examples (replace placeholders with real values — do NOT paste angle brackets):
 *
 *   npm run smoke:team-invites -- --list
 *   npm run smoke:team-invites -- --owner-email=you@company.com
 *   npm run smoke:team-invites -- --owner-user-id=550e8400-e29b-41d4-a716-446655440000
 *
 * Accept path:
 *   npm run smoke:team-invites -- --owner-email=owner@co.com --email=staff@co.com --accept-user-id=...
 */
import { prisma } from "@/lib/prisma";
import {
  acceptStorefrontTeamInvite,
  cancelStorefrontTeamInvite,
  createStorefrontTeamInvite,
  listPendingStorefrontInvites,
} from "@/services/storefront/storefront-team-invite-service";

const PLACEHOLDER_RE = /^<[^>]+>$/;

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  if (!hit) return undefined;
  const value = hit.slice(prefix.length).trim();
  if (!value || PLACEHOLDER_RE.test(value)) {
    console.error(
      `Invalid value for --${name}: "${value}". Use a real UUID/email, not a doc placeholder like <OWNER_UUID>.`,
    );
    process.exit(1);
  }
  return value;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function printHelp(): void {
  console.log(`
Storefront team invite smoke test

Options:
  --list                     List workspace owners eligible for smoke
  --owner-user-id=UUID       Workspace owner (UserProfile id)
  --owner-email=email        Resolve owner by email (alternative to UUID)
  --email=invitee@test       Invite target email (default: smoke-invite-<ts>@kitchenos.test)
  --accept-user-id=UUID      Run accept flow instead of cancel (invitee must exist)
  --help                     This message

Environment:
  DATABASE_URL               Required (loaded from .env)
  SMOKE_OWNER_USER_ID        Default owner if --owner-* omitted
  SMOKE_OWNER_EMAIL          Default owner email

Examples:
  npm run smoke:team-invites -- --list
  npm run smoke:team-invites -- --owner-email=owner@example.com
`);
}

async function listEligibleOwners(): Promise<void> {
  const rows = await prisma.storefrontSettings.findMany({
    where: { workspaceId: { not: null }, isPrimary: true },
    select: {
      userId: true,
      workspaceId: true,
      storeSlug: true,
      userProfile: { select: { email: true, fullName: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 25,
  });
  if (rows.length === 0) {
    console.log("No primary storefronts with workspaceId found.");
    return;
  }
  console.log("Eligible owners (primary storefront + workspace):\n");
  for (const r of rows) {
    console.log(
      `  ${r.userProfile?.email ?? "(no email)"}  userId=${r.userId}  slug=${r.storeSlug}  workspace=${r.workspaceId}`,
    );
  }
  console.log("\nRun smoke with: npm run smoke:team-invites -- --owner-email=YOUR_EMAIL");
}

async function resolveOwnerUserId(): Promise<string> {
  const fromArg = arg("owner-user-id");
  if (fromArg) return fromArg;

  const email = arg("owner-email") ?? process.env.SMOKE_OWNER_EMAIL?.trim();
  if (email) {
    const profile = await prisma.userProfile.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true, email: true },
    });
    if (!profile) {
      console.error(`No UserProfile for owner-email=${email}. Run with --list to see candidates.`);
      process.exit(1);
    }
    return profile.id;
  }

  const fromEnv = process.env.SMOKE_OWNER_USER_ID?.trim();
  if (fromEnv && !PLACEHOLDER_RE.test(fromEnv)) return fromEnv;

  console.error(
    "Missing owner. Use one of:\n" +
      "  npm run smoke:team-invites -- --list\n" +
      "  npm run smoke:team-invites -- --owner-email=you@company.com\n" +
      "  npm run smoke:team-invites -- --owner-user-id=550e8400-e29b-41d4-a716-446655440000\n" +
      "  export SMOKE_OWNER_EMAIL=you@company.com && npm run smoke:team-invites",
  );
  process.exit(1);
}

async function main() {
  if (hasFlag("help") || process.argv.includes("-h")) {
    printHelp();
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL required (.env or export)");
    process.exit(1);
  }

  if (hasFlag("list")) {
    await listEligibleOwners();
    return;
  }

  const ownerUserId = await resolveOwnerUserId();
  const acceptUserId = arg("accept-user-id");
  const email = arg("email") ?? `smoke-invite-${Date.now()}@kitchenos.test`;

  const sf = await prisma.storefrontSettings.findFirst({
    where: { userId: ownerUserId, workspaceId: { not: null } },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    select: { id: true, workspaceId: true, storeSlug: true },
  });
  if (!sf?.workspaceId) {
    console.error(
      `No storefront with workspace for owner ${ownerUserId}. Run --list or pick another owner.`,
    );
    process.exit(1);
  }

  console.log("using", { ownerUserId, storefrontId: sf.id, workspaceId: sf.workspaceId, slug: sf.storeSlug });

  const created = await createStorefrontTeamInvite({
    storefrontId: sf.id,
    workspaceId: sf.workspaceId,
    email,
    role: "STAFF",
    invitedByUserId: ownerUserId,
  });
  console.log("created", { id: created.id, email: created.email, token: created.token });

  const pending = await listPendingStorefrontInvites(sf.id);
  if (!pending.some((p) => p.id === created.id)) {
    console.error("Invite not listed after create");
    process.exit(1);
  }

  if (acceptUserId) {
    const profile = await prisma.userProfile.findUnique({
      where: { id: acceptUserId },
      select: { email: true },
    });
    if (!profile?.email) {
      console.error("accept-user-id must have UserProfile.email");
      process.exit(1);
    }
    if (profile.email.toLowerCase() !== email.toLowerCase()) {
      console.warn(
        `Warning: invite email (${email}) differs from profile (${profile.email}). Accept may fail.`,
      );
    }
    const accepted = await acceptStorefrontTeamInvite({
      token: created.token,
      userId: acceptUserId,
      email: profile.email,
    });
    if (!accepted.ok) {
      console.error("accept failed", accepted);
      process.exit(1);
    }
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId: sf.workspaceId, userId: acceptUserId },
      },
    });
    if (!member) {
      console.error("workspace member missing after accept");
      process.exit(1);
    }
    console.log("smoke OK: create / list / accept", { workspaceId: accepted.workspaceId });
    return;
  }

  await cancelStorefrontTeamInvite(created.id, sf.id);
  const after = await listPendingStorefrontInvites(sf.id);
  if (after.some((p) => p.id === created.id)) {
    console.error("Invite still pending after cancel");
    process.exit(1);
  }

  console.log("smoke OK: create / list / cancel");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
