import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { getKbArticle, type KbArticle } from "@/lib/knowledge-base/catalog";

const KB_ROOT = join(process.cwd(), "docs/knowledge-base");

export async function loadKbArticleMarkdown(slug: string): Promise<{
  article: KbArticle;
  markdown: string;
} | null> {
  const article = getKbArticle(slug);
  if (!article) return null;

  const markdown = await readFile(join(KB_ROOT, article.fileName), "utf8");
  return { article, markdown };
}
