import { PRODUCTION_APP_URL } from "@/lib/auth/public-site-url";
import { getKbFaqForLocale, KB_FAQ_ENTRIES } from "@/lib/kb/kb-faq-content";
import type { KbLocale } from "@/lib/kb/knowledge-base-content";

export const KB_FAQ_SCHEMA_POLICY_ID = "kb-faq-schema-v1" as const;

export type KbFaqPageJsonLd = {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
};

export function buildKbFaqPageJsonLd(locale: KbLocale = "en"): KbFaqPageJsonLd {
  const faqs = getKbFaqForLocale(locale);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function kbFaqPageUrl(locale: KbLocale = "en"): string {
  const base = `${PRODUCTION_APP_URL.replace(/\/$/, "")}/kb`;
  return locale === "en" ? base : `${base}?lang=${locale}`;
}

export function auditKbFaqSchemaContent(): {
  passed: boolean;
  entryCount: number;
  failures: string[];
} {
  const failures: string[] = [];

  if (KB_FAQ_ENTRIES.length < 8) {
    failures.push(`KB_FAQ_ENTRIES must have at least 8 entries — found ${KB_FAQ_ENTRIES.length}`);
  }

  for (const entry of KB_FAQ_ENTRIES) {
    if (!entry.question.en?.trim()) {
      failures.push(`missing en question for ${entry.id}`);
    }
    if (!entry.answer.en?.trim()) {
      failures.push(`missing en answer for ${entry.id}`);
    }
    if (entry.answer.en.length > 600) {
      failures.push(`answer too long for Featured Snippets target: ${entry.id}`);
    }
  }

  const jsonLd = buildKbFaqPageJsonLd("en");
  if (jsonLd["@type"] !== "FAQPage") {
    failures.push("JSON-LD @type must be FAQPage");
  }
  if (jsonLd.mainEntity.length !== KB_FAQ_ENTRIES.length) {
    failures.push("JSON-LD mainEntity count mismatch");
  }

  return {
    passed: failures.length === 0,
    entryCount: KB_FAQ_ENTRIES.length,
    failures,
  };
}
