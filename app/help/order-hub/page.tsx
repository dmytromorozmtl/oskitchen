export default function HelpOrderHubPage() {
  return (
    <article className="space-y-6 text-sm leading-relaxed text-muted-foreground">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Order Hub</h1>
      <p>
        Order Hub is your unified queue for incoming orders across channels. Connect integrations so
        marketplace and POS orders land alongside manual orders.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong className="text-foreground">Filters:</strong> scope by status, channel, or prep
          date when volume spikes.
        </li>
        <li>
          <strong className="text-foreground">Production handoff:</strong> push confirmed orders into
          production batches without duplicating data entry.
        </li>
        <li>
          <strong className="text-foreground">Exceptions:</strong> flag substitutions or holds before
          packing labels print.
        </li>
      </ul>
      <p>
        Next: see <span className="font-medium text-foreground">Production</span> and{" "}
        <span className="font-medium text-foreground">Packing</span> articles for downstream steps.
      </p>
    </article>
  );
}
