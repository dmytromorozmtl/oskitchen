import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addPlatformSupportCustomerReplyAction,
  addPlatformSupportInternalCommentAction,
  platformAssignSupportTicketAction,
  platformUpdateSupportTicketStatusAction,
} from "@/actions/platform-support";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { Button } from "@/components/ui/button";
import { getPlatformTicketForAdmin } from "@/services/platform/platform-support-service";
import { SupportTicketStatus } from "@prisma/client";

const STATUS_OPTIONS = Object.values(SupportTicketStatus);

export default async function PlatformSupportTicketPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:support:read");
  const ticket = await getPlatformTicketForAdmin(ticketId);
  if (!ticket) notFound();

  const canReply = ctx.permissions.has("platform:support:reply");
  const canAssign = ctx.permissions.has("platform:support:assign");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/platform/support" className="text-xs text-amber-200/90 hover:underline">
            ← Support inbox
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-white">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {ticket.status} · {ticket.priority} · {ticket.category}
          </p>
        </div>
        {ticket.workspace ? (
          <Link
            href={`/platform/workspaces/${ticket.workspace.id}`}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Workspace: {ticket.workspace.name}
          </Link>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="text-sm font-semibold text-zinc-200">Original message</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-400">{ticket.message}</p>
            <p className="mt-3 text-xs text-zinc-600">
              Requester: {ticket.email}
              {ticket.userProfile ? ` · account ${ticket.userProfile.email}` : ""}
            </p>
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="text-sm font-semibold text-zinc-200">Thread</h2>
            <div className="mt-3 space-y-3">
              {ticket.comments.map((c) => (
                <div
                  key={c.id}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    c.visibility === "INTERNAL"
                      ? "border-amber-900/50 bg-amber-950/20 text-amber-100/90"
                      : "border-zinc-700 bg-zinc-950 text-zinc-200"
                  }`}
                >
                  <p className="text-[10px] uppercase text-zinc-500">
                    {c.visibility === "INTERNAL" ? "Internal" : "Customer-visible"} ·{" "}
                    {c.authorUser?.email ?? "system"} · {c.createdAt.toISOString().slice(0, 16)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{c.message}</p>
                </div>
              ))}
            </div>
          </section>

          {canReply ? (
            <div className="grid gap-4 md:grid-cols-2">
              <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <h2 className="text-sm font-semibold text-zinc-200">Customer reply</h2>
                <p className="mt-1 text-xs text-zinc-500">Visible to the requester in their workspace.</p>
                <form action={addPlatformSupportCustomerReplyAction} className="mt-3 space-y-2">
                  <input type="hidden" name="ticketId" value={ticket.id} />
                  <textarea
                    name="message"
                    required
                    rows={4}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                    placeholder="Reply to customer…"
                  />
                  <Button type="submit" size="sm">
                    Send customer reply
                  </Button>
                </form>
              </section>
              <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <h2 className="text-sm font-semibold text-zinc-200">Internal note</h2>
                <p className="mt-1 text-xs text-zinc-500">Never shown to customers.</p>
                <form action={addPlatformSupportInternalCommentAction} className="mt-3 space-y-2">
                  <input type="hidden" name="ticketId" value={ticket.id} />
                  <textarea
                    name="message"
                    required
                    rows={4}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                    placeholder="Internal context for operators…"
                  />
                  <Button type="submit" size="sm" variant="secondary">
                    Save internal note
                  </Button>
                </form>
              </section>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">You do not have permission to reply to tickets.</p>
          )}
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="text-sm font-semibold text-zinc-200">Status</h2>
            {canReply ? (
              <form action={platformUpdateSupportTicketStatusAction} className="mt-3 space-y-2">
                <input type="hidden" name="ticketId" value={ticket.id} />
                <select
                  name="status"
                  defaultValue={ticket.status}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm" variant="outline">
                  Update status
                </Button>
              </form>
            ) : (
              <p className="mt-2 text-sm text-zinc-500">{ticket.status}</p>
            )}
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="text-sm font-semibold text-zinc-200">Assignment</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Current: {ticket.assignedTo?.email ?? "Unassigned"}
            </p>
            {canAssign ? (
              <form action={platformAssignSupportTicketAction} className="mt-3 space-y-2">
                <input type="hidden" name="ticketId" value={ticket.id} />
                <input
                  name="assigneeId"
                  placeholder="User profile UUID (empty to unassign)"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs text-white"
                />
                <Button type="submit" size="sm" variant="outline">
                  Save assignment
                </Button>
              </form>
            ) : (
              <p className="mt-2 text-xs text-zinc-600">Requires platform:support:assign.</p>
            )}
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="text-sm font-semibold text-zinc-200">Events</h2>
            <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto text-xs text-zinc-400">
              {ticket.events.map((e) => (
                <li key={e.id} className="border-b border-zinc-800/80 pb-2">
                  <span className="font-mono text-zinc-500">{e.createdAt.toISOString().slice(0, 16)}</span>{" "}
                  {e.eventType}
                  {e.performedBy?.email ? ` · ${e.performedBy.email}` : ""}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
