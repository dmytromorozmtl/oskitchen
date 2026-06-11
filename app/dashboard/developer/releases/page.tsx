import Link from "next/link";
import { format } from "date-fns";

import {
  publishReleaseNoteFromForm,
  submitDraftReleaseNoteForm,
} from "@/actions/growth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireDeveloperCenterAccess } from "@/lib/developer/developer-permissions";
import { prisma } from "@/lib/prisma";
import { APP_VERSION } from "@/lib/version";
import { getReleaseNoteStats } from "@/services/developer/release-service";

export default async function DeveloperReleasesPage() {
  await requireDeveloperCenterAccess();
  const [notes, stats] = await Promise.all([
    prisma.releaseNote.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    getReleaseNoteStats(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Release notes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Draft here, publish to the public <Link href="/changelog">/changelog</Link>. Runtime label{" "}
          <span className="font-mono text-xs">{APP_VERSION}</span> from <span className="font-mono">lib/version.ts</span>
          .
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary">Total {stats.total}</Badge>
          <Badge variant="outline">Published {stats.published}</Badge>
          <Badge variant="outline">Drafts {stats.drafts}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New draft</CardTitle>
          <CardDescription>Slug must be unique (URL fragment).</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submitDraftReleaseNoteForm} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" required placeholder="may-2026-onboarding" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version label</Label>
                <Input id="version" name="version" required placeholder="0.3.0-beta" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" name="summary" required rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" required rows={8} />
            </div>
            <Button type="submit" className="w-fit rounded-full">
              Save draft
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notes.map((n) => (
            <div
              key={n.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 p-4"
            >
              <div>
                <p className="font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">
                  {n.version} · {n.slug}{" "}
                  {n.published ? (
                    <span className="text-emerald-600">· published</span>
                  ) : (
                    <span>· draft</span>
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Updated {format(n.updatedAt, "MMM d, yyyy HH:mm")}
                </p>
              </div>
              {!n.published ? (
                <form action={publishReleaseNoteFromForm}>
                  <input type="hidden" name="id" value={n.id} />
                  <Button type="submit" size="sm" className="rounded-full">
                    Publish
                  </Button>
                </form>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
