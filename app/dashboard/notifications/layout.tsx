import { NotificationsSubnav } from "@/components/dashboard/notifications/subnav";

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Manage transactional emails, reminders, internal alerts, templates, logs, retries, and
            delivery provider health.
          </p>
        </div>
        <NotificationsSubnav />
      </div>
      {children}
    </div>
  );
}
