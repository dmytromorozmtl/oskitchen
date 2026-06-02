export default function HelpIntegrationsPage() {
  return (
    <article className="space-y-6 text-sm leading-relaxed text-muted-foreground">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Integrations</h1>
      <p>
        WooCommerce, Shopify, and Uber Eats use encrypted credentials on the server. Uber Direct
        courier dispatch is on the roadmap — not a live integration. Use{" "}
        <strong>Test connection</strong> actions before relying on automation.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Webhooks must reach your deployed URL — check <code>/dashboard/integrations/webhooks</code>{" "}
          for pending rows.
        </li>
        <li>Unmatched catalog lines appear in Order Hub — map before orders stall.</li>
        <li>Never paste API secrets into chat or tickets.</li>
      </ul>
    </article>
  );
}
