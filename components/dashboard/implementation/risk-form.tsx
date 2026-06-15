"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  addImplementationRiskAction,
  resolveImplementationRiskAction,
} from "@/actions/implementation-center";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AddRiskForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [mitigation, setMitigation] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (title.trim().length === 0) {
      setError("Title is required");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await addImplementationRiskAction({ projectId, title, mitigation, severity });
      if ("error" in res) setError(res.error ?? "Failed");
      else {
        setTitle("");
        setMitigation("");
        setSeverity("medium");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2 rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold">Add risk</h3>
      <Input placeholder="Risk title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea
        placeholder="Mitigation plan"
        value={mitigation}
        onChange={(e) => setMitigation(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as typeof severity)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <Button type="button" size="sm" disabled={pending} onClick={submit}>
          {pending ? "Adding…" : "Add risk"}
        </Button>
        {error ? <span className="text-xs text-rose-600">{error}</span> : null}
      </div>
    </div>
  );
}

export function ResolveRiskButton({ projectId, riskId }: { projectId: string; riskId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const res = await resolveImplementationRiskAction({ projectId, riskId });
          if ("ok" in res && res.ok) router.refresh();
        });
      }}
    >
      {pending ? "Resolving…" : "Resolve"}
    </Button>
  );
}
