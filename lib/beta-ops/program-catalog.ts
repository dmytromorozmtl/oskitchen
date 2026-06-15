import type { ProgramStepId } from "@/lib/beta-ops/program-state";

export type ProgramStepMeta = {
  id: ProgramStepId;
  title: string;
  when: string;
  owner: string;
  commands: string[];
  gate: string;
  artifacts: string[];
};

export const PROGRAM_STEPS: ProgramStepMeta[] = [
  {
    id: 0,
    title: "Day 1 complete",
    when: "Сейчас",
    owner: "Engineering / QA",
    commands: [
      "npm run beta:setup -- --init",
      "npm run beta:staging-prep",
      "npm run beta:day1-complete",
    ],
    gate: "BETA_LAUNCH_REPORT.json → readyForBeta: true",
    artifacts: ["BETA_LAUNCH_REPORT.json", "BETA_LAUNCH_REPORT.html", "BETA_PROGRAM_STATE.json"],
  },
  {
    id: 1,
    title: "Go live (1–3 kitchens)",
    when: "Сразу после green Day 1",
    owner: "Founder / CS",
    commands: ["npm run beta:go-live -- --emails=chef1@,chef2@,chef3@"],
    gate: "BETA_COHORT_REGISTRY.json → status: live",
    artifacts: ["BETA_COHORT_REGISTRY.json", "BETA_GO_LIVE_PACK.json"],
  },
  {
    id: 2,
    title: "Week 1 daily ops",
    when: "Ежедневно",
    owner: "Ops / Founder",
    commands: ["npm run beta:support-setup", "npm run beta:daily-ops"],
    gate: "BETA_DAILY_OPS_YYYY-MM-DD.json → unhealthy: 0",
    artifacts: ["BETA_DAILY_OPS_*.json", "Slack #beta-pilot"],
  },
  {
    id: 3,
    title: "Week 2 review",
    when: "Конец недели 2",
    owner: "Product",
    commands: ["npm run beta:week2-review"],
    gate: "BETA_WEEK2_REVIEW.md + staff feedback summary",
    artifacts: ["BETA_WEEK2_REVIEW.md", "BETA_STAFF_FEEDBACK.json"],
  },
  {
    id: 4,
    title: "Go/no-go post-beta epic",
    when: "Week 3–4",
    owner: "Leadership",
    commands: ["npm run beta:go-no-go", "npm run beta:go-no-go -- --record-decision=go"],
    gate: "BETA_GO_NO_GO.json → decision: go",
    artifacts: ["BETA_GO_NO_GO.json"],
  },
  {
    id: 5,
    title: "Tune staff templates",
    when: "По feedback",
    owner: "Engineering",
    commands: [
      "npm run beta:tune-templates",
      "npm run beta:tune-templates -- --diff",
      "# edit lib/permissions/permission-matrix.ts",
    ],
    gate: "tests pass + verify:staff-parity",
    artifacts: ["BETA_TEMPLATE_TUNING.md"],
  },
];
