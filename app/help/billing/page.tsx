export default function HelpBillingPage() {
  return (
    <article className="space-y-6 text-sm leading-relaxed text-muted-foreground">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Billing</h1>
      <p>
        Subscription plans gate certain channels and automation surfaces — limits still enforce on
        the server even if the UI shows a soft prompt.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Use the billing portal link from Dashboard → Billing for card updates.</li>
        <li>Stripe webhooks must be configured for production environments.</li>
      </ul>
    </article>
  );
}
