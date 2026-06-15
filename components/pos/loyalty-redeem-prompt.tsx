type Props = {
  pointsBalance: number;
  redeemThreshold: number;
  onRedeem?: (points: number) => void;
};

export function LoyaltyRedeemPrompt({ pointsBalance, redeemThreshold, onRedeem }: Props) {
  if (pointsBalance < redeemThreshold) return null;
  const blocks = Math.floor(pointsBalance / redeemThreshold);
  return (
    <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-sm dark:border-amber-900/50 dark:bg-amber-950/30">
      <p className="font-medium">
        You have {pointsBalance} points — redeem {redeemThreshold} pts per discount block ({blocks} available)?
      </p>
      {onRedeem ? (
        <button
          type="button"
          className="mt-2 text-primary underline-offset-4 hover:underline"
          onClick={() => onRedeem(redeemThreshold)}
        >
          Redeem {redeemThreshold} points
        </button>
      ) : null}
    </div>
  );
}
