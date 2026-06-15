import type { ReactNode } from "react";

/** Minimal markdown rendering for operator KB (headings, lists, paragraphs). */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function KbMarkdown({ source }: { source: string }) {
  const lines = source.split("\n");
  const nodes: ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="list-disc space-y-1 pl-5 my-3">
        {listItems.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed">
            {item}
          </li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listItems.push(trimmed.slice(2));
      continue;
    }
    flushList();

    if (trimmed.startsWith("### ")) {
      nodes.push(
        <h3 key={i} className="mt-6 mb-2 text-base font-semibold">
          {trimmed.slice(4)}
        </h3>,
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      nodes.push(
        <h2 key={i} className="mt-8 mb-3 text-lg font-semibold">
          {trimmed.slice(3)}
        </h2>,
      );
      continue;
    }
    if (trimmed.startsWith("# ")) {
      nodes.push(
        <h1 key={i} className="text-2xl font-bold tracking-tight mb-4">
          {trimmed.slice(2)}
        </h1>,
      );
      continue;
    }
    if (!trimmed) {
      nodes.push(<div key={`sp-${i}`} className="h-2" />);
      continue;
    }

    const withCode = escapeHtml(trimmed).replace(
      /`([^`]+)`/g,
      '<code class="rounded bg-muted px-1 py-0.5 text-xs font-mono">$1</code>',
    );
    nodes.push(
      <p
        key={i}
        className="text-sm leading-relaxed text-foreground/90"
        dangerouslySetInnerHTML={{ __html: withCode }}
      />,
    );
  }
  flushList();

  return <article className="max-w-3xl">{nodes}</article>;
}
