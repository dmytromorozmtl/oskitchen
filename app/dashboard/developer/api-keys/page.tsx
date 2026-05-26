import { ApiKeysPanel } from "@/components/developer/api-keys-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEVELOPER_API_SCOPE_LABEL, DEVELOPER_API_SCOPES } from "@/lib/developer/api-scopes";
import { requireDeveloperCenterAccess } from "@/lib/developer/developer-permissions";
import { listApiKeysForDeveloper } from "@/services/developer/api-key-service";

export default async function DeveloperApiKeysPage() {
  const ctx = await requireDeveloperCenterAccess();
  const keys = await listApiKeysForDeveloper(ctx.userId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">API management</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Enterprise workspace keys for <code className="rounded bg-muted px-1 text-xs">/api/public/v1/*</code>. Keys
          are stored hashed — only the prefix remains visible. Raw secrets are shown once at creation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Governance scopes</CardTitle>
          <CardDescription>
            Recommended scope identifiers — enforce at the API edge as routing matures. Keys created today inherit
            full workspace access until per-key scopes ship.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
          {DEVELOPER_API_SCOPES.map((s) => (
            <div key={s} className="rounded-lg border border-border/60 px-2 py-1 font-mono text-xs">
              {s}
              <span className="ml-2 font-sans text-[11px]">— {DEVELOPER_API_SCOPE_LABEL[s]}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <ApiKeysPanel keys={keys} />
    </div>
  );
}
