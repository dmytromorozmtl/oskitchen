"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { applyTemplateAction } from "@/actions/templates";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ALL_TEMPLATE_SECTIONS,
  TEMPLATE_SECTION_LABEL,
} from "@/lib/templates/template-types";
import type {
  TemplatePreview,
  TemplateSectionKey,
  WorkspaceTemplateSeed,
} from "@/lib/templates/template-types";

type Props = {
  template: WorkspaceTemplateSeed;
  preview: TemplatePreview;
};

const ACTION_TONE: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-900",
  update: "bg-amber-100 text-amber-900",
  skip: "bg-slate-100 text-slate-900",
  noop: "bg-muted text-muted-foreground",
};

export function ApplyWizard({ template, preview }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState<TemplateSectionKey[]>(ALL_TEMPLATE_SECTIONS);
  const [acknowledgeConflicts, setAck] = useState(false);
  const [overwriteBusinessMode, setOverwrite] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    status: string;
    applicationId?: string;
    errors?: string[];
  } | null>(null);

  const conflictCount = preview.counts.conflicts;
  const hasBusinessModeChange = preview.changes.some(
    (c) => c.section === "business_mode" && c.action === "update",
  );
  const hasBusinessModeConflict = preview.changes.some(
    (c) => c.section === "business_mode" && c.conflict,
  );

  function toggleSection(s: TemplateSectionKey) {
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  function onApply() {
    setError(null);
    setResult(null);
    start(async () => {
      const res = await applyTemplateAction({
        templateKey: template.key,
        applyMode: "APPLY_CONFIGURATION_ONLY",
        selectedSections: selected,
        acknowledgeConflicts,
        overwriteBusinessMode,
      });
      if (res.ok) {
        setResult({
          status: res.status ?? "APPLIED",
          applicationId: res.applicationId,
          errors: res.errors,
        });
        router.refresh();
      } else {
        setError(res.error ?? "Unable to apply");
      }
    });
  }

  if (result) {
    return (
      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">
            {result.status === "APPLIED" ? "Template applied" : "Partial apply"}
          </CardTitle>
          <CardDescription>
            Application id: <span className="font-mono text-xs">{result.applicationId}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.errors && result.errors.length > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
              <p className="font-medium">Some sections did not apply cleanly:</p>
              <ul className="mt-1 list-disc pl-5">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard/today">Open Today</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/playbooks">Open Playbooks</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/tasks">Setup tasks</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/templates/history">Applied history</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">1. Choose sections</CardTitle>
          <CardDescription>
            Untick any section you don&apos;t want this apply to touch. Selections are scoped to this run.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {ALL_TEMPLATE_SECTIONS.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(s)}
                  onChange={() => toggleSection(s)}
                />
                {TEMPLATE_SECTION_LABEL[s]}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">2. Preview impact</CardTitle>
          <CardDescription>
            create={preview.counts.create} · update={preview.counts.update} · skip=
            {preview.counts.skip} · conflicts={conflictCount}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {preview.changes.map((c, i) => (
              <li
                key={i}
                className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 p-2"
              >
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    ACTION_TONE[c.action] ?? ""
                  }`}
                >
                  {c.action}
                </span>
                <span className="text-xs text-muted-foreground">{c.section}</span>
                <span className="flex-1">{c.summary}</span>
                {c.conflict ? (
                  <span className="text-xs text-amber-700">{c.conflict}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {conflictCount > 0 ? (
        <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">3. Resolve conflicts</CardTitle>
            <CardDescription>
              {conflictCount} potential conflict{conflictCount === 1 ? "" : "s"} detected.
              Acknowledge to proceed or unselect the affected section.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={acknowledgeConflicts}
                onChange={(e) => setAck(e.target.checked)}
              />
              I understand and want to proceed.
            </label>
            {hasBusinessModeConflict ? (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={overwriteBusinessMode}
                  onChange={(e) => setOverwrite(e.target.checked)}
                />
                Allow overwriting the existing business mode.
              </label>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">
            {conflictCount > 0 ? "4." : "3."} Confirm
          </CardTitle>
          <CardDescription>
            Applying creates a record under{" "}
            <Link className="underline" href="/dashboard/templates/history">
              Applied history
            </Link>
            . You can roll back later from there.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I want to apply this template to my workspace.
          </label>
          {hasBusinessModeChange && !overwriteBusinessMode && hasBusinessModeConflict ? (
            <p className="text-xs text-amber-700">
              Business mode change is queued but will be skipped unless you allow overwrite above.
            </p>
          ) : null}
          {error ? <p className="text-xs text-rose-600">{error}</p> : null}
          <Button
            type="button"
            onClick={onApply}
            disabled={
              pending ||
              !confirmed ||
              selected.length === 0 ||
              (conflictCount > 0 && !acknowledgeConflicts)
            }
          >
            {pending ? "Applying…" : "Apply template"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
