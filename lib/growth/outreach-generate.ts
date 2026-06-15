import type { BetaLead } from "@prisma/client";

import { APP_NAME } from "@/lib/constants";
import { logger } from "@/lib/logger";

export type OutreachTemplate =
  | "cold_email"
  | "linkedin_dm"
  | "follow_up_1"
  | "follow_up_2"
  | "demo_recap"
  | "beta_invite"
  | "integration_soon";

function baseCtx(lead: BetaLead) {
  return {
    name: lead.fullName.split(" ")[0] ?? lead.fullName,
    fullName: lead.fullName,
    business: lead.businessName,
    email: lead.email,
    pain: lead.biggestPain ?? "your ops workflow",
    volume: lead.weeklyOrderVolume ?? "your current volume",
  };
}

export function templateOutreach(
  lead: BetaLead,
  template: OutreachTemplate,
): string {
  const c = baseCtx(lead);
  switch (template) {
    case "linkedin_dm":
      return `Hi ${c.name} — noticed ${c.business} is scaling weekly fulfillment. We built ${APP_NAME} to unify preorder menus, production, and packing. Worth a 12-min look?`;
    case "follow_up_1":
      return `Hi ${c.name}, quick follow-up on ${APP_NAME} for ${c.business}. Happy to share how teams like yours cut manual order handling — reply with a good time this week?`;
    case "follow_up_2":
      return `${c.name}, last ping — if ${c.pain} is still slowing the team, I can walk through a focused demo on channels + production board. No pressure if timing’s off.`;
    case "demo_recap":
      return `Hi ${c.name}, thanks for exploring ${APP_NAME} with us today. Next steps we discussed: (1) connect your storefront channel, (2) load next week’s menu, (3) trial packing labels. I'm here for setup questions.`;
    case "beta_invite":
      return `${c.name}, we'd love ${c.business} in the OS Kitchen beta — priority onboarding, direct Slack with founders, and influence on the roadmap. Reply “beta” and we’ll send calendar options.`;
    case "integration_soon":
      return `Thanks for the integration ask — it’s on our near-term list. For now we can route ${c.business} through manual upload / CSV and prioritize your connector in the next sprint.`;
    case "cold_email":
    default:
      return `Hi ${c.name},

I'm reaching out because ${c.business} looks like a strong fit for ${APP_NAME} — we help meal prep, catering, and multi-channel kitchens run weekly menus, production, and packing in one queue.

You mentioned ~${c.volume} and pain around ${c.pain}. If that’s still top of mind, I can show a short walkthrough tailored to your stack.

Best`;
  }
}

export async function generateOutreachDraft(params: {
  lead: BetaLead;
  template: OutreachTemplate;
}): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return templateOutreach(params.lead, params.template);
  }
  try {
    const system =
      "You write concise, practical B2B SaaS outreach for food operations software. No hype, no fake metrics. Plain paragraphs.";
    const userPrompt = `Lead: ${params.lead.fullName}, ${params.lead.businessName}, ${params.lead.email}. Pain: ${params.lead.biggestPain ?? "unknown"}. Volume: ${params.lead.weeklyOrderVolume ?? "unknown"}. Template intent: ${params.template}. Product: ${APP_NAME}. Output email body only, under 180 words.`;
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_OUTREACH_MODEL ?? "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 400,
      }),
    });
    if (!res.ok) {
      logger.warn("OpenAI outreach failed", await res.text());
      return templateOutreach(params.lead, params.template);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text && text.length > 20
      ? text
      : templateOutreach(params.lead, params.template);
  } catch (e) {
    logger.warn("OpenAI outreach error", e);
    return templateOutreach(params.lead, params.template);
  }
}
