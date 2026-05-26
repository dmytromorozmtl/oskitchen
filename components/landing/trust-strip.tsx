const PILLARS = [
  {
    title: 'No hardware lock-in',
    description: 'Run POS and kitchen tools on tablets and browsers you already own.',
  },
  {
    title: 'Honest integrations',
    description: 'Channels labeled live, setup-ready, or partner-required — never fake badges.',
  },
  {
    title: '14-day free trial',
    description: 'Evaluate on your menu and workflow. No credit card required to start.',
  },
] as const;

export function TrustStrip() {
  return (
    <section className="border-y border-border/60 bg-muted/30 px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
        {PILLARS.map((pillar) => (
          <div key={pillar.title} className="text-center sm:text-left">
            <p className="text-sm font-semibold tracking-tight text-foreground">{pillar.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
