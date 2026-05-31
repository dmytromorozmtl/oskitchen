type Props = {
  hostname: string;
  txtName: string;
  tokenPreview: string;
};

export function DomainDnsInstructions({ hostname, txtName, tokenPreview }: Props) {
  return (
    <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-sm">
      <p className="font-medium">Required DNS records</p>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
        <li>
          <span className="text-foreground">TXT (verification)</span> — name: <code className="rounded bg-muted px-1 font-mono text-xs">{txtName || `(_kos-verify.${hostname})`}</code>
          , value must contain your verification token (first characters:{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">{tokenPreview || "—"}</code>).
        </li>
        <li>
          <span className="text-foreground">CNAME or A</span> — point <code className="font-mono text-xs">{hostname}</code> to your hosting target per your provider (OS Kitchen cannot guess the
          correct target).
        </li>
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Internal routing uses <span className="font-mono">/api/storefront/resolve-host</span> with a server secret — that secret is never shown in the browser.
      </p>
    </div>
  );
}
