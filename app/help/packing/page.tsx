export default function HelpPackingPage() {
  return (
    <article className="space-y-6 text-sm leading-relaxed text-muted-foreground">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Packing & fulfillment</h1>
      <p>
        Packing groups orders by guest and fulfillment lane. Verification lets you log audit events
        against lookup tokens — align printed QR codes with internal orders before handoff.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Delivery routes group by pickup date — ensure addresses live on the order notes.</li>
        <li>Allergen text on labels must be verified by your team — OS Kitchen stores operational hints only.</li>
      </ul>
    </article>
  );
}
