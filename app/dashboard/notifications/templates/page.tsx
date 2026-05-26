import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TestEmailForm } from "@/components/dashboard/notifications/test-email-form";
import { NOTIFICATION_CATEGORY_LABEL } from "@/lib/notifications/notification-types";
import { listSystemTemplates } from "@/lib/notifications/template-registry";
import { previewTemplate } from "@/lib/notifications/template-renderer";
import { canSendEmails } from "@/lib/notifications/provider-resend";
import { canUseNotifications } from "@/lib/notifications/notification-permissions";
import { requireUserProfile } from "@/lib/auth";
import { getTenantActor } from "@/lib/scope/cached-tenant";


export default async function TemplatesPage() {
  const { userId } = await getTenantActor();
  const profile = await requireUserProfile();
  const sendingEnabled = canSendEmails();
  const canTest = canUseNotifications(
    { userId, email: profile.email ?? null, role: profile.role ?? null },
    "send_test_email",
  );

  const templates = listSystemTemplates();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {templates.length} system templates. Each template ships with a safe variable list. Test
        sends use example values from the registry. The body uses HTML escaping for variables — no
        scripts can be injected via variables.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        {templates.map((t) => {
          const preview = previewTemplate(t.key);
          return (
            <Card key={t.key} id={t.key}>
              <CardHeader className="space-y-1">
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  {t.name}
                  <Badge variant="outline" className="text-[10px]">{NOTIFICATION_CATEGORY_LABEL[t.category]}</Badge>
                  {t.marketing ? <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-900 dark:text-amber-200">marketing</Badge> : null}
                </CardTitle>
                <CardDescription className="text-xs">{t.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Subject</p>
                  <p className="text-sm">{preview?.subject ?? t.subject}</p>
                </div>
                <details className="rounded-lg border bg-muted/20 p-3 text-xs">
                  <summary className="cursor-pointer font-medium">Preview HTML</summary>
                  <div className="mt-2 max-h-64 overflow-auto rounded bg-card p-2" dangerouslySetInnerHTML={{ __html: preview?.html ?? "" }} />
                </details>
                <details className="rounded-lg border bg-muted/20 p-3 text-xs">
                  <summary className="cursor-pointer font-medium">Variables ({t.variables.length})</summary>
                  <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                    {t.variables.map((v) => (
                      <li key={v.key} className="rounded border bg-card px-2 py-1">
                        <code className="text-xs">{`{{${v.key}}}`}</code>
                        <span className="ml-2 text-muted-foreground">{v.label}{v.required ? " · required" : ""}</span>
                      </li>
                    ))}
                  </ul>
                </details>

                <TestEmailForm
                  templateKey={t.key}
                  disabled={!sendingEnabled || !canTest}
                  disabledReason={!sendingEnabled ? "Provider not configured" : "You don't have permission"}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
