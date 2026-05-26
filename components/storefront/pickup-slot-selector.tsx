'use client';

import { useState } from 'react';
import { Check, Clock } from 'lucide-react';

export interface PickupWindowOption {
  id: string;
  startTime: string;
  endTime: string;
  maxOrders: number;
  currentOrders: number;
  available: boolean;
}

export function PickupSlotSelector({
  windows,
  name = 'pickupWindowId',
}: {
  windows: PickupWindowOption[];
  name?: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  if (windows.length === 0) return null;

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={selected ?? ''} />
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Pickup Time
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {windows.map((window) => (
          <button
            key={window.id}
            type="button"
            disabled={!window.available}
            onClick={() => setSelected(window.id)}
            className={`rounded-xl border p-3 text-center transition-all ${
              selected === window.id
                ? 'border-primary bg-primary/10 ring-2 ring-primary'
                : window.available
                  ? 'hover:bg-muted cursor-pointer'
                  : 'opacity-40 cursor-not-allowed bg-muted'
            }`}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              {selected === window.id && <Check className="h-3.5 w-3.5 text-primary" />}
              <span className="font-medium text-sm">
                {window.startTime} — {window.endTime}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {window.available
                ? `${window.maxOrders - window.currentOrders} slots left`
                : 'Full'}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
