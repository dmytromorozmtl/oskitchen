import { formatDistanceToNow } from "date-fns";

import { getActiveSupportSessionsVisibleToUser } from "@/services/platform/platform-support-session-service";

export async function SupportSessionCustomerNotice({ userId }: { userId: string }) {
  const rows = await getActiveSupportSessionsVisibleToUser(userId);
  if (!rows.length) return null;
  const first = rows[0];
  return (
    <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-950 dark:text-sky-50">
      <p className="font-medium">OS Kitchen platform support is reviewing this workspace</p>
      <p className="mt-1 text-xs text-sky-900/90 dark:text-sky-100/90">
        Mode: {first.mode.replace(/_/g, " ").toLowerCase()} · Active {formatDistanceToNow(first.startedAt, { addSuffix: true })} ·
        Ends {formatDistanceToNow(first.expiresAt, { addSuffix: true })}
      </p>
      {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ? (
        <p className="mt-2 text-xs text-sky-900/80 dark:text-sky-200/90">
          Questions about this session? Contact {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}.
        </p>
      ) : null}
    </div>
  );
}
