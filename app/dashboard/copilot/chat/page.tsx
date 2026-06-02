import Link from "next/link";

import { AiFeatureApiError } from "@/components/dashboard/ai-feature-api-error";
import { ChatThread } from "@/components/dashboard/copilot/chat-thread";
import { AiStatusBadges } from "@/components/dashboard/copilot/ai-status-badges";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  hasCopilotChatPageAccess,
  loadCopilotPageActor,
} from "@/lib/ux/copilot-page-access-era20";
import { loadAiFeaturePage } from "@/lib/ai/load-ai-feature-page";
import {
  getCopilotSettings,
  listConversations,
  listMessages,
} from "@/services/ai/copilot-service";

export default async function CopilotChatPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const { scope } = await loadCopilotPageActor();
  if (!hasCopilotChatPageAccess(scope)) {
    return <PermissionDeniedSurfaceCard surfaceId="copilot_chat" />;
  }
  const conversationId = typeof sp.c === "string" ? sp.c : null;
  const pageData = await loadAiFeaturePage(async () => {
    const [settings, conversations, messages] = await Promise.all([
      getCopilotSettings(scope),
      listConversations(scope),
      conversationId ? listMessages(scope, conversationId) : Promise.resolve([]),
    ]);
    return { settings, conversations, messages };
  });

  if (!pageData.ok) {
    return <AiFeatureApiError featureName="Copilot Chat" error={pageData.error} />;
  }

  const { settings, conversations, messages } = pageData.data;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Ask copilot</h1>
          <p className="text-sm text-muted-foreground">
            Server-side AI calls only. Drafted actions land in the Action Drafts tab for approval.
          </p>
          <AiStatusBadges
            hasApiKey={settings.hasApiKey}
            aiNarrativeEnabled={settings.aiNarrativeEnabled}
            deterministicOnly={settings.deterministicOnly}
            redactionLevel={settings.redactionLevel}
            requireApprovalAll={settings.requireApprovalAll}
          />
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Conversations</CardTitle>
            <CardDescription>Recent threads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 pt-0 text-sm">
            <Link
              href="/dashboard/copilot/chat"
              className="block rounded-md px-2 py-1 hover:bg-muted"
            >
              + New conversation
            </Link>
            {conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground">No previous conversations.</p>
            ) : (
              conversations.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/copilot/chat?c=${c.id}`}
                  className={`block truncate rounded-md px-2 py-1 ${
                    c.id === conversationId ? "bg-muted font-medium" : "hover:bg-muted"
                  }`}
                >
                  {c.title}
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardContent className="pt-4">
            <ChatThread
              initialConversationId={conversationId}
              initialMessages={messages.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
