export const CASE_STUDIES_DISCLAIMER =
  "Metrics marked as targets reflect pilot goals, not audited financial results. Stories update as operators grant permission.";

export type CaseStudy = {
  id: string;
  slug: string;
  title: string;
  segment: string;
  operatorType: string;
  location: string;
  summary: string;
  monogram: string;
  readTime: string;
  heroMetric: string;
  heroLabel: string;
  status: "pilot" | "published";
  challenge: string;
  approach: string;
  solution: string;
  quote: string;
  attribution: string;
  quoteAuthor: string;
  outcomes: Array<{ label: string; value: string }>;
  results: Array<{ label: string; value: string }>;
  href: string;
  ctaLabel: string;
};

const RAW_CASE_STUDIES = [
  {
    slug: "pilot-meal-prep-q3",
    title: "Regional meal prep — order volume pilot",
    segment: "Meal prep",
    operatorType: "Meal prep",
    location: "US Midwest",
    summary:
      "Production planning lived in spreadsheets; packing errors spiked every Sunday cutoff. OS Kitchen weekly menus, batches, and KDS packing brought Sundays back under control.",
    monogram: "MP",
    readTime: "5 min read",
    heroMetric: "3×",
    heroLabel: "weekly orders (target)",
    challenge:
      "Production planning lived in spreadsheets; packing errors spiked every Sunday cutoff.",
    approach:
      "OS Kitchen weekly menus, production batches, and KDS packing queue with barcode verification.",
    solution:
      "OS Kitchen weekly menus, production batches, and KDS packing queue with barcode verification.",
    results: [
      { label: "Hours saved / week", value: "12+ (target)" },
      { label: "Packing errors", value: "-40% (target)" },
      { label: "Orders / week", value: "40 → 120 (target)" },
    ],
    quote: "We stopped firefighting Sundays. Production finally matches what we sold.",
    attribution: "Pilot operator (permission pending)",
    quoteAuthor: "Pilot operator (permission pending)",
    status: "pilot" as const,
    href: "/solutions/meal-prep",
    ctaLabel: "See meal prep solution",
  },
] as const;

export const CASE_STUDIES: CaseStudy[] = RAW_CASE_STUDIES.map((raw) => ({
  id: raw.slug,
  slug: raw.slug,
  title: raw.title,
  segment: raw.segment,
  operatorType: raw.operatorType,
  location: raw.location,
  summary: raw.summary,
  monogram: raw.monogram,
  readTime: raw.readTime,
  heroMetric: raw.heroMetric,
  heroLabel: raw.heroLabel,
  status: raw.status,
  challenge: raw.challenge,
  approach: raw.approach,
  solution: raw.solution,
  quote: raw.quote,
  attribution: raw.attribution,
  quoteAuthor: raw.quoteAuthor,
  outcomes: [...raw.results],
  results: [...raw.results],
  href: raw.href,
  ctaLabel: raw.ctaLabel,
}));

export const CASE_STUDY_IDS = CASE_STUDIES.map((study) => study.id);

export function caseStudyById(id: string): CaseStudy | undefined {
  return CASE_STUDIES.find((study) => study.id === id);
}

export function caseStudyBySlug(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((study) => study.slug === slug);
}
