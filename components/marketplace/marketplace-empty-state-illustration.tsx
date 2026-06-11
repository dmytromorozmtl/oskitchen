import type { MarketplaceEmptyStateIllustrationKind } from "@/lib/design/marketplace-empty-states-design-policy";
import { cn } from "@/lib/utils";

type Props = {
  kind: MarketplaceEmptyStateIllustrationKind;
  className?: string;
};

function IllustrationSvg({ kind }: { kind: MarketplaceEmptyStateIllustrationKind }) {
  const stroke = "currentColor";
  const fillSoft = "fill-primary/15";
  const fillMid = "fill-primary/25";

  switch (kind) {
    case "vendors":
      return (
        <svg viewBox="0 0 96 96" className="h-16 w-16 text-primary" aria-hidden>
          <rect x="18" y="34" width="60" height="42" rx="6" className={fillSoft} />
          <path
            d="M18 44 L48 28 L78 44"
            fill="none"
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="38" y="52" width="20" height="24" rx="2" className={fillMid} />
          <circle cx="30" cy="72" r="3" className={fillMid} />
          <circle cx="66" cy="72" r="3" className={fillMid} />
        </svg>
      );
    case "orders":
      return (
        <svg viewBox="0 0 96 96" className="h-16 w-16 text-primary" aria-hidden>
          <rect x="24" y="20" width="48" height="60" rx="6" className={fillSoft} />
          <path
            d="M34 36 H62 M34 48 H58 M34 60 H52"
            fill="none"
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="62" cy="60" r="10" className={fillMid} />
          <path
            d="M58 60 L61 63 L67 57"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "catalog":
      return (
        <svg viewBox="0 0 96 96" className="h-16 w-16 text-primary" aria-hidden>
          <rect x="22" y="28" width="28" height="28" rx="4" className={fillMid} />
          <rect x="46" y="28" width="28" height="28" rx="4" className={fillSoft} />
          <rect x="22" y="56" width="28" height="28" rx="4" className={fillSoft} />
          <rect x="46" y="56" width="28" height="28" rx="4" className={fillMid} />
          <circle cx="72" cy="24" r="8" className="fill-primary/30" />
          <path
            d="M69 24 L71.5 26.5 L76 22"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "cart":
      return (
        <svg viewBox="0 0 96 96" className="h-16 w-16 text-primary" aria-hidden>
          <path
            d="M24 30 H32 L38 62 H68 L74 38 H34"
            fill="none"
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="42" cy="72" r="4" className={fillMid} />
          <circle cx="64" cy="72" r="4" className={fillMid} />
          <rect x="40" y="18" width="24" height="12" rx="3" className={fillSoft} />
        </svg>
      );
    case "discovery":
    default:
      return (
        <svg viewBox="0 0 96 96" className="h-16 w-16 text-primary" aria-hidden>
          <path
            d="M48 18 L54 36 L72 38 L58 50 L62 68 L48 58 L34 68 L38 50 L24 38 L42 36 Z"
            className={fillSoft}
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="48" cy="44" r="6" className={fillMid} />
        </svg>
      );
  }
}

/** Decorative marketplace empty-state illustration (P1-67). */
export function MarketplaceEmptyStateIllustration({ kind, className }: Props) {
  return (
    <div className={cn("text-primary", className)} role="img" aria-hidden>
      <IllustrationSvg kind={kind} />
    </div>
  );
}
