export default function HelpGettingStartedPage() {
  return (
    <article className="space-y-6 text-sm leading-relaxed text-muted-foreground">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Getting started</h1>
      <p className="rounded-lg border border-border/70 bg-muted/30 p-4 text-muted-foreground">
        Guided tours can be replayed from Help soon — use the activation checklist on your home
        dashboard and ⌘K to jump modules.
      </p>
      <ol className="list-decimal space-y-2 pl-5">
        <li>Finish onboarding — timezone, pickup address, and notifications.</li>
        <li>Create a weekly menu with preorder deadlines.</li>
        <li>Add menu items with prepared dates and pricing.</li>
        <li>Place a test order or connect a sales channel.</li>
        <li>Open Production and Packing to complete your first cycle.</li>
      </ol>
      <p className="text-muted-foreground">
        Demo workspaces show synthetic data — enable demo mode only for supervised pilots and label
        flows clearly for trainees.
      </p>
    </article>
  );
}
