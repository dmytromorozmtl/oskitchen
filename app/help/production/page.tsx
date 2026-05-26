export default function HelpProductionPage() {
  return (
    <article className="space-y-6 text-sm leading-relaxed text-muted-foreground">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Production</h1>
      <p>
        Production tracks cook / pack / label progress per SKU. Pair it with the Kitchen Screen for
        line-of-sight in the kitchen.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Keep prepared dates accurate — they drive packing and routes.</li>
        <li>Use Staff Tasks for prep checklists alongside production states.</li>
        <li>Forecast and ingredient demand inform purchasing — they are estimates, not guarantees.</li>
      </ul>
    </article>
  );
}
