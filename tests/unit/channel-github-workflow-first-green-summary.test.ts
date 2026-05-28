import { describe, expect, it } from "vitest";

import {
  buildChannelGitHubWorkflowFirstGreenSummary,
  evaluateChannelGitHubWorkflowSecretPrerequisites,
  resolveChannelGitHubWorkflowFirstGreenProofStatus,
} from "@/lib/integrations/channel-github-workflow-first-green-summary";

describe("channel github workflow first green summary", () => {
  it("evaluates channel secret prerequisites", () => {
    expect(evaluateChannelGitHubWorkflowSecretPrerequisites({})).toEqual({
      ok: false,
      reason: expect.stringContaining("DATABASE_URL"),
    });
  });

  it("resolves proof_passed with github PASSED and run url", () => {
    expect(
      resolveChannelGitHubWorkflowFirstGreenProofStatus({
        channelSecretsConfigured: true,
        githubOutcome: "PASSED",
        githubRunUrl: "https://github.com/org/repo/actions/runs/1",
      }),
    ).toBe("proof_passed");
  });

  it("builds summary with missing github run when secrets configured", () => {
    const summary = buildChannelGitHubWorkflowFirstGreenSummary(
      [
        { id: "wiring_cert", label: "Wiring", status: "PASSED" },
        { id: "channel_secrets", label: "Secrets", status: "PASSED" },
        {
          id: "github_run_evidence",
          label: "GitHub",
          status: "SKIPPED",
          reason: "no url",
        },
      ],
      {
        missingEnvVars: [],
        channelSecretsConfigured: true,
        githubRun: {
          workflowPath: ".github/workflows/woo-shopify-staging-smoke.yml",
          runUrl: null,
          outcome: null,
        },
      },
    );
    expect(summary.githubWorkflowProofStatus).toBe("proof_skipped_missing_github_run");
  });
});
