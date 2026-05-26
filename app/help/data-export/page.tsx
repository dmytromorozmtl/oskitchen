export default function HelpDataExportPage() {
  return (
    <article className="space-y-4 text-sm leading-relaxed text-muted-foreground">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Exporting workspace data</h1>
      <p>
        Owners can download CSV snapshots from Settings → Data export cards (orders, customers,
        products, production, ingredients, integration metadata).
      </p>
      <p>
        These exports are convenience copies — maintain database backups separately. Governance copy
        lives in <span className="font-mono text-xs">docs/DATA_RETENTION_POLICY.md</span> in the
        repository.
      </p>
    </article>
  );
}
