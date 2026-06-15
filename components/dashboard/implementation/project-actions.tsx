"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  generateImplementationTasksAction,
  markGoLiveAction,
  previewImplementationTasksAction,
  runReadinessAction,
} from "@/actions/implementation-center";
import { Button } from "@/components/ui/button";

type PreviewTask = {
  itemId: string;
  title: string;
  description: string | null;
  alreadyExists: boolean;
};

export function RunReadinessButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await runReadinessAction({ projectId });
            if ("error" in res) setError(res.error ?? "Failed");
            else router.refresh();
          });
        }}
      >
        {pending ? "Running…" : "Run readiness check"}
      </Button>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </div>
  );
}

export function MarkGoLiveButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() => {
          setError(null);
          if (!window.confirm("Mark this project LIVE? This only changes status; no live data is created.")) return;
          startTransition(async () => {
            const res = await markGoLiveAction({ projectId });
            if ("error" in res) setError(res.error ?? "Failed");
            else router.refresh();
          });
        }}
      >
        {pending ? "Marking…" : "Mark live"}
      </Button>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </div>
  );
}

export function GenerateTasksPanel({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<PreviewTask[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [summary, setSummary] = useState<string | null>(null);

  async function runPreview() {
    setError(null);
    setSummary(null);
    startTransition(async () => {
      const res = await previewImplementationTasksAction({ projectId });
      if ("error" in res) setError(res.error ?? "Failed");
      else {
        setPreview(res.preview);
        const next: Record<string, boolean> = {};
        for (const t of res.preview) next[t.itemId] = !t.alreadyExists;
        setSelected(next);
      }
    });
  }

  async function generate() {
    if (!preview) return;
    const itemIds = preview.filter((p) => selected[p.itemId] && !p.alreadyExists).map((p) => p.itemId);
    if (itemIds.length === 0) {
      setError("Pick at least one new item.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await generateImplementationTasksAction({ projectId, itemIds });
      if ("error" in res) setError(res.error ?? "Failed");
      else {
        setSummary(`Created ${res.created} tasks (${res.skipped} skipped).`);
        setPreview(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={runPreview}>
          {pending && !preview ? "Loading…" : "Preview tasks"}
        </Button>
        {preview ? (
          <Button type="button" size="sm" disabled={pending} onClick={generate}>
            {pending ? "Generating…" : "Generate selected"}
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      {summary ? <p className="text-xs text-emerald-700">{summary}</p> : null}

      {preview ? (
        <div className="space-y-1.5 rounded-md border bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            Review the tasks that will be created. Items already linked to a task are skipped.
          </p>
          <ul className="space-y-1.5">
            {preview.map((t) => (
              <li key={t.itemId} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected[t.itemId] ?? false}
                  disabled={t.alreadyExists}
                  onChange={(e) =>
                    setSelected((prev) => ({ ...prev, [t.itemId]: e.target.checked }))
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium">
                    {t.title}{" "}
                    {t.alreadyExists ? (
                      <span className="ml-1 text-xs text-amber-600">already linked</span>
                    ) : null}
                  </div>
                  {t.description ? (
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
