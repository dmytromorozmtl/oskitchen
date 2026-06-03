import type {
  BenchmarkReportSection,
  GenerateIndustryReportInput,
  IndustryBenchmarkReport,
} from "@/lib/ai/benchmark-2.0-types";
import type { BenchmarkMetric } from "@/lib/ai/benchmark-network-types";
import { formatBenchmarkValue } from "@/lib/ai/benchmark-dashboard-builders";

export const BENCHMARK_PREMIUM_PRICE_USD = 49;

export type BenchmarkReportCatalogEntry = {
  id: string;
  title: string;
  cadence: IndustryBenchmarkReport["cadence"];
  periodLabel: string;
};

export const BENCHMARK_REPORT_CATALOG: BenchmarkReportCatalogEntry[] = [
  {
    id: "monthly-industry-pulse",
    title: "Monthly Industry Pulse",
    cadence: "monthly",
    periodLabel: "Last 30 days",
  },
  {
    id: "quarterly-deep-dive",
    title: "Quarterly Deep Dive",
    cadence: "quarterly",
    periodLabel: "Last 90 days",
  },
  {
    id: "food-cost-special",
    title: "Food Cost Benchmark Special",
    cadence: "special",
    periodLabel: "Cost focus",
  },
  {
    id: "labor-throughput",
    title: "Labor & Throughput Report",
    cadence: "special",
    periodLabel: "Operations focus",
  },
];

function findMetric(metrics: BenchmarkMetric[], key: string): BenchmarkMetric | undefined {
  return metrics.find((m) => m.key === key);
}

function metricSentence(metric: BenchmarkMetric): string {
  const value = formatBenchmarkValue(metric);
  const vs =
    metric.percentileRank >= 75
      ? "above top-quartile peers"
      : metric.percentileRank >= 50
        ? "near industry median"
        : "below peer median";
  return `${metric.label}: ${value} (${metric.percentileRank.toFixed(0)}th percentile, ${vs}).`;
}

function buildExecutiveSummary(data: GenerateIndustryReportInput["data"]): string {
  const { summary, cohort } = data;
  const strong = summary.strongMetrics.slice(0, 2).join(", ") || "core KPIs";
  const weak = summary.weakMetrics.slice(0, 2).join(", ") || "cost drivers";
  return (
    `Your ${cohort.label.toLowerCase()} location ranks at the ${summary.averagePercentile.toFixed(0)}th percentile ` +
    `across ${summary.metricCount} tracked metrics (n≈${cohort.sampleSize.toLocaleString()}). ` +
    `Strengths: ${strong}. Focus areas: ${weak}.`
  );
}

function sectionFromMetrics(
  id: string,
  title: string,
  metrics: BenchmarkMetric[],
  keys: string[],
  highlight: BenchmarkReportSection["highlight"] = "neutral",
): BenchmarkReportSection | null {
  const picked = keys
    .map((k) => findMetric(metrics, k))
    .filter((m): m is BenchmarkMetric => Boolean(m));
  if (picked.length === 0) return null;
  return {
    id,
    title,
    body: picked.map(metricSentence).join(" "),
    metricKeys: keys,
    highlight,
  };
}

export function generateIndustryReport(input: GenerateIndustryReportInput): IndustryBenchmarkReport {
  const catalog = BENCHMARK_REPORT_CATALOG.find((r) => r.id === input.reportId);
  if (!catalog) {
    throw new Error(`Unknown benchmark report: ${input.reportId}`);
  }

  const { data } = input;
  const locked = input.locked ?? false;
  const generatedAt = new Date().toISOString();

  const sections: BenchmarkReportSection[] = [];

  if (catalog.id === "monthly-industry-pulse") {
    const pulse = sectionFromMetrics(
      "pulse-revenue",
      "Revenue & traffic",
      data.metrics,
      ["revenue_per_day", "orders_per_day", "avg_ticket"],
      "neutral",
    );
    const customers = sectionFromMetrics(
      "pulse-customers",
      "Guest loyalty",
      data.metrics,
      ["repeat_customer_rate", "meal_plan_subscribers"],
      "positive",
    );
    if (pulse) sections.push(pulse);
    if (customers) sections.push(customers);
  } else if (catalog.id === "quarterly-deep-dive") {
    const cost = sectionFromMetrics(
      "qd-cost",
      "Unit economics",
      data.metrics,
      ["food_cost_percent", "gross_margin_percent", "labor_cost_percent"],
      "negative",
    );
    const ops = sectionFromMetrics(
      "qd-ops",
      "Operational excellence",
      data.metrics,
      ["health_score", "production_completion", "kds_wait_minutes"],
      "neutral",
    );
    if (cost) sections.push(cost);
    if (ops) sections.push(ops);
  } else if (catalog.id === "food-cost-special") {
    const food = sectionFromMetrics(
      "fc-food",
      "Food cost & waste",
      data.metrics,
      ["food_cost_percent", "waste_percent", "cost_variance_alerts"],
      "negative",
    );
    const inv = sectionFromMetrics(
      "fc-inv",
      "Purchasing & inventory",
      data.metrics,
      ["inventory_shortage_rate", "po_overdue_rate", "demand_shortage_lines"],
      "neutral",
    );
    if (food) sections.push(food);
    if (inv) sections.push(inv);
  } else {
    const labor = sectionFromMetrics(
      "lt-labor",
      "Labor efficiency",
      data.metrics,
      ["labor_cost_percent", "open_task_rate"],
      "negative",
    );
    const throughput = sectionFromMetrics(
      "lt-throughput",
      "Kitchen throughput",
      data.metrics,
      ["kds_wait_minutes", "production_completion", "packing_accuracy"],
      "neutral",
    );
    if (labor) sections.push(labor);
    if (throughput) sections.push(throughput);
  }

  const topOpportunity = data.summary.weakMetrics[0];
  if (topOpportunity) {
    sections.push({
      id: `${catalog.id}-action`,
      title: "Priority action",
      body: `Peers improving fastest on ${topOpportunity.replace(/_/g, " ")} this period — align playbook with your weakest percentile metrics.`,
      highlight: "negative",
    });
  }

  return {
    id: catalog.id,
    title: catalog.title,
    cadence: catalog.cadence,
    cohortLabel: data.cohort.label,
    generatedAt,
    periodLabel: catalog.periodLabel,
    executiveSummary: buildExecutiveSummary(data),
    sections,
    premiumOnly: true,
    locked,
  };
}

export function buildIndustryReportCatalog(
  data: GenerateIndustryReportInput["data"],
  isPremium: boolean,
): IndustryBenchmarkReport[] {
  return BENCHMARK_REPORT_CATALOG.map((entry) =>
    generateIndustryReport({
      reportId: entry.id,
      data,
      locked: !isPremium,
    }),
  );
}
