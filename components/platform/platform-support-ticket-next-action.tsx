import Link from "next/link";

import {
  resolvePlatformSupportTicketRowNextAction,
  type PlatformSupportInboxTicketFocus,
} from "@/lib/support/platform-support-inbox-focus-era18";

export function PlatformSupportTicketNextAction(props: {
  ticket: PlatformSupportInboxTicketFocus;
}) {
  const action = resolvePlatformSupportTicketRowNextAction(props.ticket);

  if (!action) {
    return <span className="text-zinc-500">—</span>;
  }

  return (
    <Link
      href={action.href}
      data-testid={`platform-support-ticket-next-action-${props.ticket.id}`}
      className={
        action.tone === "urgent"
          ? "font-medium text-amber-300 hover:underline"
          : "text-amber-200/90 hover:underline"
      }
    >
      {action.label}
    </Link>
  );
}
