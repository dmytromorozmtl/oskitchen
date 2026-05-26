"use client";

import { getActionError } from "@/lib/action-result";

import { useState, useTransition } from "react";

import { saveReportFormAction } from "@/actions/reports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SaveReportForm({
  reportKey,
  filtersQuery,
  defaultName,
}: {
  reportKey: string;
  filtersQuery: string;
  defaultName: string;
}) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Card className="border-border/80 shadow-sm print:hidden">
      <CardHeader>
        <CardTitle className="text-base">Save this view</CardTitle>
        <CardDescription>
          Save the current filters as a named report so you can reopen it next week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            setSuccess(false);
            const fd = new FormData();
            fd.set("reportKey", reportKey);
            fd.set("name", name);
            fd.set("description", description);
            fd.set("filtersQuery", filtersQuery);
            startTransition(async () => {
              const res = await saveReportFormAction(fd);
              if (!res.ok) setError(getActionError(res) ?? "Something went wrong");
              else setSuccess(true);
            });
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm sm:w-72"
            placeholder="Report name"
            required
            maxLength={255}
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm sm:w-72"
            placeholder="Optional description"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save report"}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        {success && <p className="mt-2 text-sm text-emerald-600">Saved.</p>}
      </CardContent>
    </Card>
  );
}
