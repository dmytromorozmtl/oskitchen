import { Shield } from 'lucide-react';

type Props = {
  badges: readonly string[];
};

export function ConversionTrustBadges({ badges }: Props) {
  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {badges.map((badge) => (
        <li
          key={badge}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          <Shield className="h-3 w-3 text-primary" aria-hidden />
          {badge}
        </li>
      ))}
    </ul>
  );
}
