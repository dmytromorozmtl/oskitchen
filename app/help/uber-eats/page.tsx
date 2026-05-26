export default function HelpUberEatsPage() {
  return (
    <article className="space-y-4 text-sm leading-relaxed text-muted-foreground">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Understanding Uber Eats access
      </h1>
      <p>
        Production Uber Eats workflows require marketplace partner credentials issued by Uber — do
        not promise customers live ingestion until keys validate in staging.
      </p>
      <p>
        KitchenOS ships adapter scaffolding plus simulated demo rows for UX rehearsal only.
        Label pilots honestly and keep demo data marked synthetic.
      </p>
    </article>
  );
}
