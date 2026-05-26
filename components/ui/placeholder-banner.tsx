import { AlertTriangle } from "lucide-react";

type PlaceholderBannerProps = {
  feature: string;
  eta?: string;
  detail?: string;
};

export function PlaceholderBanner({ feature, eta, detail }: PlaceholderBannerProps) {
  return (
    <div
      className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30"
      role="status"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
        <div>
          <p className="font-medium text-amber-900 dark:text-amber-100">{feature} — coming soon</p>
          {eta ? <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">Expected: {eta}</p> : null}
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
            {detail ??
              "This capability is on the roadmap and is not production-ready. Do not promise it to customers until the capability matrix shows BETA or READY."}
          </p>
        </div>
      </div>
    </div>
  );
}
