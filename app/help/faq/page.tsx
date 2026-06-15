export default function HelpFaqPage() {
  const faqs = [
    {
      q: "Is demo data real?",
      a: "No — demo workspaces use synthetic orders labeled as demo. Never treat demo exports as customer PII.",
    },
    {
      q: "Can I connect Shopify or WooCommerce?",
      a: "Use Integrations from the dashboard. Start with a sandbox store or staging credentials until flows are validated.",
    },
    {
      q: "Where do weekly menus live?",
      a: "Menus define prep windows and deadlines. Create a menu, attach items, then open Order Hub to see live demand.",
    },
    {
      q: "How do I escalate a bug?",
      a: "Use the in-app Feedback button — it captures your route and routes to the founder inbox when configured.",
    },
    {
      q: "Who can access Growth analytics?",
      a: "Only workspace Owners see /dashboard/growth — it contains beta leads and operational telemetry.",
    },
  ];

  return (
    <article className="space-y-8 text-sm leading-relaxed">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">FAQ</h1>
        <p className="mt-2 text-muted-foreground">
          Quick answers — for deep dives open the topic guides from Help home.
        </p>
      </div>
      <dl className="space-y-6">
        {faqs.map((item) => (
          <div key={item.q} className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <dt className="font-medium text-foreground">{item.q}</dt>
            <dd className="mt-2 text-muted-foreground">{item.a}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
