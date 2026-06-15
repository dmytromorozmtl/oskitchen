/**
 * Pure helpers for AI briefing narrative (Blueprint P2-111).
 */

import { AI_BRIEFING_NARRATIVE_P2_111_POLICY_ID } from "@/lib/ai/ai-briefing-narrative-p2-111-policy";

export type AiBriefingNarrativeSectionId = "yesterday" | "channel-mix" | "next-step";

export type AiBriefingNarrativeSection = {
  id: AiBriefingNarrativeSectionId;
  label: string;
  text: string;
  sourceReference: string;
};

export type AiBriefingNarrativeReport = {
  policyId: typeof AI_BRIEFING_NARRATIVE_P2_111_POLICY_ID;
  sectionCount: number;
  narrative: string;
  sections: AiBriefingNarrativeSection[];
  generatedAt: string;
};

function formatDeltaPct(deltaPct: number): string {
  const sign = deltaPct >= 0 ? "+" : "";
  return `${sign}${Math.round(deltaPct)}%`;
}

export function buildYesterdaySection(input: {
  orderDeltaPct: number;
  periodLabel?: string;
  sourceId?: string;
}): AiBriefingNarrativeSection {
  const period = input.periodLabel ?? "Yesterday";
  const delta = formatDeltaPct(input.orderDeltaPct);
  return {
    id: "yesterday",
    label: "Yesterday",
    text: `${period} ${delta} order volume vs prior week.`,
    sourceReference: `orders:${input.sourceId ?? "week-comparison"}`,
  };
}

export function buildChannelMixSection(input: {
  channel: string;
  channelDeltaPct: number;
  metricLabel?: string;
  sourceId?: string;
}): AiBriefingNarrativeSection {
  const metric = input.metricLabel ?? "orders";
  const delta = formatDeltaPct(input.channelDeltaPct);
  return {
    id: "channel-mix",
    label: "Channel mix",
    text: `${input.channel} ${metric} ${delta} vs prior period.`,
    sourceReference: `channel:${input.sourceId ?? input.channel.toLowerCase().replace(/\s+/g, "-")}`,
  };
}

export function buildNextStepSection(input: {
  action: string;
  reason?: string;
  sourceId?: string;
}): AiBriefingNarrativeSection {
  const reason = input.reason ? ` — ${input.reason}` : "";
  return {
    id: "next-step",
    label: "Next step",
    text: `Next: ${input.action}${reason}.`,
    sourceReference: `action:${input.sourceId ?? "briefing-next"}`,
  };
}

export function composeBriefingNarrative(sections: AiBriefingNarrativeSection[]): string {
  const yesterday = sections.find((s) => s.id === "yesterday");
  const channel = sections.find((s) => s.id === "channel-mix");
  const next = sections.find((s) => s.id === "next-step");

  const parts: string[] = [];
  if (yesterday) {
    const short = yesterday.text.replace(/ order volume vs prior week\./, "");
    parts.push(short.endsWith(".") ? short.slice(0, -1) : short);
  }
  if (channel) {
    const short = channel.text.replace(/ vs prior period\./, "");
    parts.push(short);
  }
  if (next) {
    parts.push(next.text.replace(/\.$/, ""));
  }

  return parts.join(". ") + (parts.length > 0 ? "." : "");
}

export function buildAiBriefingNarrativeReport(input: {
  sections: AiBriefingNarrativeSection[];
  generatedAt?: string;
}): AiBriefingNarrativeReport {
  return {
    policyId: AI_BRIEFING_NARRATIVE_P2_111_POLICY_ID,
    sectionCount: input.sections.length,
    narrative: composeBriefingNarrative(input.sections),
    sections: input.sections,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}

export const AI_BRIEFING_NARRATIVE_DEMO_INPUT = {
  orderDeltaPct: 12,
  channel: "DoorDash",
  channelDeltaPct: 18,
  nextAction: "review menu mix",
  nextReason: "fries margin flagged",
} as const;

export function buildAiBriefingNarrativeDemoReport(): AiBriefingNarrativeReport {
  const sections = [
    buildYesterdaySection({ orderDeltaPct: AI_BRIEFING_NARRATIVE_DEMO_INPUT.orderDeltaPct }),
    buildChannelMixSection({
      channel: AI_BRIEFING_NARRATIVE_DEMO_INPUT.channel,
      channelDeltaPct: AI_BRIEFING_NARRATIVE_DEMO_INPUT.channelDeltaPct,
    }),
    buildNextStepSection({
      action: AI_BRIEFING_NARRATIVE_DEMO_INPUT.nextAction,
      reason: AI_BRIEFING_NARRATIVE_DEMO_INPUT.nextReason,
    }),
  ];

  return buildAiBriefingNarrativeReport({
    sections,
    generatedAt: "2026-06-09T08:00:00.000Z",
  });
}

export function matchesCanonicalBriefingPattern(narrative: string): boolean {
  return (
    /yesterday/i.test(narrative) &&
    /doordash|channel|orders/i.test(narrative) &&
    /next:/i.test(narrative)
  );
}
