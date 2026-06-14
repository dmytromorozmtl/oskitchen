/** Deployment hints from runtime environment (never exposes secret values). */
export function getDeploymentHints(): {
  vercelEnv: string | null;
  nodeEnv: string;
  gitSha: string | null;
  deploymentId: string | null;
  regionReady: boolean;
} {
  return {
    vercelEnv: process.env.VERCEL_ENV?.trim() || null,
    nodeEnv: process.env.NODE_ENV ?? "development",
    gitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID?.trim() || null,
    regionReady: true,
  };
}
