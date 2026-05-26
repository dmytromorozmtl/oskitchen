import Link from "next/link";
import { notFound } from "next/navigation";

import { KbMarkdown } from "@/components/knowledge-base/kb-markdown";
import { Button } from "@/components/ui/button";
import { loadKbArticleMarkdown } from "@/lib/knowledge-base/load-article";

type PageProps = { params: Promise<{ slug: string }> };

export default async function KbArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const loaded = await loadKbArticleMarkdown(slug);
  if (!loaded) notFound();

  const { article, markdown } = loaded;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/dashboard/support/kb" className="hover:underline">
              Knowledge base
            </Link>
            {" / "}
            {article.title}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{article.title}</h1>
        </div>
        {article.moduleHref ? (
          <Button asChild variant="secondary" size="sm">
            <Link href={article.moduleHref}>Open in app</Link>
          </Button>
        ) : null}
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <KbMarkdown source={markdown} />
      </div>
    </div>
  );
}
