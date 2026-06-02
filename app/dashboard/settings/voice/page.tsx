import { VoiceSettingsPanel } from "@/components/voice/voice-settings-panel";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { loadVoiceSettingsForDashboard } from "@/actions/voice-ordering";
import { readVoiceTableLabel } from "@/lib/voice/voice-order-meta";
import { listRecentVoiceOrders } from "@/services/voice/voice-ordering-service";
import { getTenantActor } from "@/lib/scope/cached-tenant";

export const metadata = {
  title: "Voice ordering — Settings",
  description: "Connect Alexa and Google Home to send orders to the kitchen.",
};

function appOrigin(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  return "https://os-kitchen.com";
}

export default async function SettingsVoicePage() {
  const { sessionUser } = await getTenantActor();
  const settings = await loadVoiceSettingsForDashboard();
  const recent = await listRecentVoiceOrders(sessionUser.id, 15);
  const origin = appOrigin();

  const alexaWebhookUrl = `${origin}/api/voice/alexa`;
  const googleWebhookUrl = `${origin}/api/voice/google`;

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Voice ordering</h1>
        <p className="text-sm text-muted-foreground">
          Guests say &ldquo;{settings.wakePhrase}, add two lattes to table five&rdquo; — orders
          land on KDS with a purple <strong>Voice</strong> badge. Parsing is{" "}
          <Badge variant="secondary">AI-assisted</Badge> (deterministic menu match).
        </p>
      </div>

      <VoiceSettingsPanel
        initial={settings}
        alexaWebhookUrl={alexaWebhookUrl}
        googleWebhookUrl={googleWebhookUrl}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent voice orders</CardTitle>
          <CardDescription>Last 15 orders from Alexa, Google Home, or dashboard tests.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No voice orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((o) => {
                  let meta: unknown;
                  try {
                    meta =
                      typeof o.sourceMetadataJson === "string"
                        ? JSON.parse(o.sourceMetadataJson)
                        : o.sourceMetadataJson;
                  } catch {
                    meta = o.sourceMetadataJson;
                  }
                  return (
                    <TableRow key={o.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {o.createdAt.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {o.tableName ?? readVoiceTableLabel(meta) ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{o.status}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
