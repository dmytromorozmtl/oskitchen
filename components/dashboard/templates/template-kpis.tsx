import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type KpiTile = { label: string; value: string | number; hint?: string };

export function TemplateKpis({ tiles }: { tiles: KpiTile[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((t) => (
        <Card key={t.label} className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {t.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{t.value}</p>
            {t.hint ? <p className="mt-1 text-xs text-muted-foreground">{t.hint}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
