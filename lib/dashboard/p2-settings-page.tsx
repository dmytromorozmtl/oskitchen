import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";

type Props = {
  title: string;
  description: string;
  configured: boolean;
  envKeys: string[];
  backHref?: string;
};

export function P2SettingsPage({
  title,
  description,
  configured,
  envKeys,
  backHref = "/dashboard/settings",
}: Props) {
  return (
    <PageShell narrow>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="max-w-xl space-y-4 rounded-2xl border border-border/80 bg-card p-6 text-sm">
        <p>
          Status:{" "}
          <span className={configured ? "font-medium text-green-600" : "font-medium text-amber-600"}>
            {configured ? "Configured" : "Not configured"}
          </span>
        </p>
        {!configured ? (
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            {envKeys.map((k) => (
              <li key={k}>
                <code className="text-xs">{k}</code>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Integration is wired; use dashboard workflows to send or sync.</p>
        )}
        <Link href={backHref} className="text-primary underline-offset-4 hover:underline">
          ← Back to settings
        </Link>
      </div>
    </PageShell>
  );
}
