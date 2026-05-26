import type { GiftCardStatus } from "@prisma/client";

export type GiftCardRow = {
  id: string;
  code: string;
  balance: number;
  initialBalance: number;
  status: GiftCardStatus;
  updatedAt: Date;
};

export function GiftCardList({ cards }: { cards: GiftCardRow[] }) {
  if (cards.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No gift cards yet — issue a card above or sell via storefront.
      </p>
    );
  }

  return (
    <ul className="text-sm space-y-2">
      {cards.map((c) => (
        <li key={c.id} className="flex flex-wrap justify-between gap-2 border-b py-2 font-mono">
          <span>{c.code}</span>
          <span className="text-right">
            ${c.balance.toFixed(2)} / ${c.initialBalance.toFixed(2)} · {c.status}
            {c.status !== "ACTIVE" ? (
              <span className="block text-xs text-muted-foreground font-sans">
                Last activity {new Date(c.updatedAt).toLocaleString()}
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
