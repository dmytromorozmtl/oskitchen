"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createApiKeyForm, revokeApiKeyById } from "@/actions/monetization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Row = {
  id: string;
  name: string;
  prefix: string;
  active: boolean;
  createdAt: Date;
  lastUsedAt: Date | null;
};

export function ApiKeysPanel({ keys }: { keys: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [recentSecret, setRecentSecret] = React.useState<string | null>(null);

  return (
    <div className="space-y-8">
      <CardLike title="Create key">
        <form
          className="flex flex-wrap items-end gap-3"
          action={(fd) =>
            startTransition(async () => {
              const res = await createApiKeyForm(fd);
              if ("error" in res) {
                toast.error(getActionError(res) ?? "Something went wrong");
                return;
              }
              setRecentSecret(res.secret);
              toast.success("API key created — copy it now.");
              router.refresh();
            })
          }
        >
          <div className="space-y-2">
            <Label htmlFor="apiKeyName">Label</Label>
            <Input
              id="apiKeyName"
              name="name"
              placeholder="Production BI"
              required
              className="min-w-[220px]"
            />
          </div>
          <Button type="submit" disabled={pending} className="rounded-full">
            Generate
          </Button>
        </form>
        {recentSecret ? (
          <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
            <p className="font-medium text-foreground">Copy once — not shown again</p>
            <code className="mt-2 block break-all font-mono text-xs">{recentSecret}</code>
          </div>
        ) : null}
      </CardLike>

      <CardLike title="Active keys">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Prefix</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((k) => (
              <TableRow key={k.id}>
                <TableCell>{k.name}</TableCell>
                <TableCell className="font-mono text-xs">{k.prefix}…</TableCell>
                <TableCell>{k.active ? "Active" : "Revoked"}</TableCell>
                <TableCell className="text-right">
                  {k.active ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await revokeApiKeyById(k.id);
                          toast.success("Key revoked");
                          router.refresh();
                        })
                      }
                    >
                      Revoke
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
            {!keys.length ? (
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-muted-foreground">
                  No keys yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardLike>
    </div>
  );
}

function CardLike({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
