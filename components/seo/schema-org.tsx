import { PRODUCTION_APP_URL } from "@/lib/auth/public-site-url";
import { APP_NAME, STRIPE_PLANS } from "@/lib/constants";

import { JsonLd } from "./json-ld";

const SITE = PRODUCTION_APP_URL;

export function OrganizationSchema() {
  return (
    <JsonLd
      id="schema-organization"
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: APP_NAME,
        url: SITE,
        logo: `${SITE}/favicon.svg`,
        description:
          "Cloud POS and kitchen operations platform for restaurants, meal prep, catering, bakeries, bars, and ghost kitchens in the United States and Canada.",
        areaServed: [
          { "@type": "Country", name: "United States" },
          { "@type": "Country", name: "Canada" },
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "hello@kitchenos.app",
          availableLanguage: ["English"],
          areaServed: ["US", "CA"],
        },
      }}
    />
  );
}

export function SoftwareApplicationSchema() {
  return (
    <JsonLd
      id="schema-software-application"
      data={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: APP_NAME,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE,
        description:
          "Restaurant POS, kitchen display, table management, and production planning for food operators — web-based, no proprietary hardware required.",
        applicationSubCategory: "Point of Sale Software",
        areaServed: [
          { "@type": "Country", name: "United States" },
          { "@type": "Country", name: "Canada" },
        ],
        offers: {
          "@type": "Offer",
          price: String(STRIPE_PLANS.STARTER.priceMonthly),
          priceCurrency: "USD",
          description: "Starter plan from $49/month with 14-day trial",
        },
      }}
    />
  );
}

/** WebSite without SearchAction — site search is not implemented. */
export function WebSiteSchema() {
  return (
    <JsonLd
      id="schema-website"
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: APP_NAME,
        url: SITE,
        inLanguage: "en-US",
      }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  return (
    <JsonLd
      id="schema-breadcrumb"
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

export function ArticleSchema(opts: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  authorName?: string;
}) {
  return (
    <JsonLd
      id="schema-article"
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: opts.title,
        description: opts.description,
        url: opts.url,
        datePublished: opts.datePublished,
        author: {
          "@type": "Organization",
          name: opts.authorName ?? APP_NAME,
        },
        publisher: {
          "@type": "Organization",
          name: APP_NAME,
          logo: {
            "@type": "ImageObject",
            url: `${SITE}/favicon.svg`,
          },
        },
      }}
    />
  );
}

export function FAQSchema({ questions }: { questions: { question: string; answer: string }[] }) {
  return (
    <JsonLd
      id="schema-faq"
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: q.answer,
          },
        })),
      }}
    />
  );
}
