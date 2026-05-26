import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkspaceTemplateSeed } from "@/lib/templates/template-types";

type Props = {
  template: WorkspaceTemplateSeed;
  applied?: boolean;
  recommended?: boolean;
};

export function TemplateCard({ template, applied, recommended }: Props) {
  const modules = template.sections.modulePins.map((p) => p.moduleKey);
  const sampleData = (template.sections.sampleMenuCategories ?? []).length > 0;
  return (
    <Card
      className={
        recommended
          ? "border-primary/30 bg-primary/[0.04] shadow-sm"
          : "border-border/80 bg-card/90 shadow-sm"
      }
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{template.title}</CardTitle>
          <div className="flex flex-wrap gap-1">
            {applied ? (
              <Badge variant="secondary" className="rounded-full text-xs">
                Applied
              </Badge>
            ) : null}
            {recommended ? (
              <Badge className="rounded-full text-xs">Recommended</Badge>
            ) : null}
            <Badge variant="outline" className="rounded-full text-xs">
              Safe preview
            </Badge>
          </div>
        </div>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>~{template.setupTimeMinutes} min setup</span>
          <span>·</span>
          <span>{modules.length} modules</span>
          <span>·</span>
          <span>{template.sections.setupTasks.length} setup tasks</span>
          {sampleData ? (
            <>
              <span>·</span>
              <span>sample data ready</span>
            </>
          ) : null}
        </div>
        <div className="text-xs text-muted-foreground">
          For:{" "}
          {template.businessModes.map((m) => (
            <span key={m} className="mr-1 inline-block rounded-full bg-muted px-2 py-0.5">
              {m}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={`/dashboard/templates/${template.key}`}>Preview</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/templates/${template.key}/apply`}>Apply…</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
