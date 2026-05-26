"use client";

import { useEffect, useState } from "react";

type PreflightResponse = {
  ok: boolean;
  blocked: boolean;
  failures: { code: string; headline: string; detail: string }[];
};

export function ExperimentPublishPreflightBanner() {
  const [data, setData] = useState<PreflightResponse | null>(null);

  useEffect(() => {
    void fetch("/api/dashboard/experiment-publish-preflight")
      .then((r) => r.json())
      .then((j) => setData(j as PreflightResponse))
      .catch(() => setData(null));
  }, []);

  if (!data?.blocked || data.failures.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/40"
      role="alert"
    >
      <p className="font-medium text-amber-900 dark:text-amber-100">Publish blocked by experiment gates</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-amber-800 dark:text-amber-200">
        {data.failures.slice(0, 5).map((f) => (
          <li key={f.code}>
            {f.headline}
            {f.detail ? ` — ${f.detail}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
