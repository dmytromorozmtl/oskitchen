import Link from "next/link";

export default function SupportDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[min(1400px,calc(100vw-2rem))] space-y-6 px-2 pb-12 sm:px-4 lg:px-0">
      <div className="flex flex-wrap gap-2 border-b border-border/80 pb-3 text-sm">
        <Link href="/dashboard/support" className="text-muted-foreground hover:text-foreground">
          Center
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/dashboard/support/inbox" className="text-muted-foreground hover:text-foreground">
          Inbox
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/dashboard/support/kb" className="text-muted-foreground hover:text-foreground">
          Knowledge base
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/dashboard/support/reports" className="text-muted-foreground hover:text-foreground">
          Reports
        </Link>
      </div>
      {children}
    </div>
  );
}
