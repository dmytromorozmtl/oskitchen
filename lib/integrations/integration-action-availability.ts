export type IntegrationSurfaceAction = "webhook_replay" | "integration_retry" | "credential_edit";

export type IntegrationActionAvailability = {
  available: boolean;
  reason: string;
  requiredPermission?: string;
  label: string;
  disabledTooltip: string;
};

/**
 * Central guard for integration/webhook UI — prevents fake replay/retry until server mutations exist.
 */
export function getIntegrationActionAvailability(
  _provider: string | undefined,
  action: IntegrationSurfaceAction,
  context: { hasReplayServerAction?: boolean; hasRetryServerAction?: boolean; isPlatform?: boolean },
): IntegrationActionAvailability {
  const hasReplay = Boolean(context.hasReplayServerAction);
  const hasRetry = Boolean(context.hasRetryServerAction);

  switch (action) {
    case "webhook_replay":
      return {
        available: hasReplay,
        reason: hasReplay ? "Replay server action is registered." : "No audited webhook replay mutation is wired yet.",
        requiredPermission: context.isPlatform ? "platform:integrations:repair" : undefined,
        label: "Replay",
        disabledTooltip:
          "Replay runs from the Webhook activity table (workspace) or Platform → Webhooks row actions — requires audited reason and permission.",
      };
    case "integration_retry":
      return {
        available: hasRetry,
        reason: hasRetry ? "Retry/sync server action is registered." : "No audited integration retry mutation is wired yet.",
        requiredPermission: context.isPlatform ? "platform:integrations:repair" : undefined,
        label: "Retry sync",
        disabledTooltip: "Retry not available yet — fix forward in workspace settings or error recovery when actions exist.",
      };
    case "credential_edit":
      return {
        available: true,
        reason: "Workspace owner flows handle credentials in the dashboard.",
        label: "Credentials",
        disabledTooltip: "",
      };
    default: {
      const _exhaustive: never = action;
      return {
        available: false,
        reason: `Unknown action ${_exhaustive}`,
        label: "—",
        disabledTooltip: "Unsupported action.",
      };
    }
  }
}
