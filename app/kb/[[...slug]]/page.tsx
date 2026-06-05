import type { Metadata } from "next";

import { KbArticleView, KbHomeView, kbArticleMetadata } from "@/components/kb/kb-pages";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";
import { getAllKbSlugs, slugPathToString } from "@/services/kb/knowledge-base-service";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ lang?: string; q?: string; category?: string }>;
};

export async function generateStaticParams() {
  return getAllKbSlugs().map((slug) => ({
    slug: slug.split("/"),
  }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const slugStr = slugPathToString(slug);
  if (!slugStr) {
    return marketingPageMetadata({
      title: "OS Kitchen Knowledge Base",
      description:
        "Self-serve guides for POS, kitchen display, integrations, invoice scanning, bank import, and billing.",
      path: "/kb",
      keywords: ["restaurant pos help", "kitchen software docs", "os kitchen kb"],
    });
  }
  return kbArticleMetadata(slugStr, lang);
}

export default async function KnowledgeBasePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { lang, q, category } = await searchParams;
  const slugStr = slugPathToString(slug);

  if (!slugStr) {
    return <KbHomeView locale={lang} query={q} categoryId={category} />;
  }

  return <KbArticleView slug={slugStr} locale={lang} />;
}
