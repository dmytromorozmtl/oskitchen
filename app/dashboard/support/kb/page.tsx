import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KB_ARTICLES } from "@/lib/knowledge-base/catalog";

export default function SupportKbPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Knowledge base</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Step-by-step guides for operators. Each article links to the live module in your workspace.
          Need hands-on help? Open a ticket from the Support center.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {KB_ARTICLES.map((article) => (
          <Card key={article.slug} className="flex flex-col border-border/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{article.title}</CardTitle>
              <CardDescription>Operator guide</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto flex flex-wrap gap-2 pt-0">
              <Button asChild variant="default" size="sm">
                <Link href={`/dashboard/support/kb/${article.slug}`}>Read article</Link>
              </Button>
              {article.moduleHref ? (
                <Button asChild variant="secondary" size="sm">
                  <Link href={article.moduleHref}>Open module</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-dashed bg-muted/20">
        <CardHeader>
          <CardTitle className="text-base">Pilot onboarding</CardTitle>
          <CardDescription>
            Internal runbook for white-glove setup — share day-0 checklist with your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/support" className="text-sm font-medium text-primary hover:underline">
            Back to Support center
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
