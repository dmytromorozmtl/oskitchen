'use client';

import { getActionError, isActionSuccess } from "@/lib/action-result";
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Beer, Coffee, Pizza, Plus, Utensils, Wine } from 'lucide-react';
import { toast } from 'sonner';

import { addItemToTabAction, closeTabAction, createTabAction } from '@/actions/pos/tabs';
import { useSyncedServerState } from '@/hooks/use-synced-server-state';
import { posTouchButtonClass } from '@/lib/pos/touch-targets';

export interface TabRow {
  id: string;
  name: string;
  status: string;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  tableId?: string | null;
}

const QUICK_ITEMS = [
  { name: 'Beer', price: 6, icon: Beer },
  { name: 'Wine', price: 9, icon: Wine },
  { name: 'Cocktail', price: 12, icon: Coffee },
  { name: 'Pizza', price: 14, icon: Pizza },
  { name: 'Burger', price: 12, icon: Utensils },
  { name: 'Fries', price: 5, icon: Utensils },
];

function actionErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  return 'Something went wrong';
}

function tabSubtotal(tab: TabRow): number {
  return tab.items.reduce((sum, item) => sum + item.totalPrice, 0) || tab.subtotal;
}

export function TabPanel({ tabs: initialTabs }: { tabs: TabRow[] }) {
  const [tabs, setTabs] = useSyncedServerState(initialTabs);
  const [selectedTab, setSelectedTab] = useState<string | null>(initialTabs[0]?.id ?? null);
  const [showNewTab, setShowNewTab] = useState(false);
  const [tipAmount, setTipAmount] = useState<Record<string, number>>({});
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const currentTab = tabs.find((t) => t.id === selectedTab);
  const liveSubtotal = currentTab ? tabSubtotal(currentTab) : 0;
  const liveTax = liveSubtotal * 0.08;
  const liveTip = selectedTab ? (tipAmount[selectedTab] ?? 0) : 0;

  async function handleCreateTab(formData: FormData) {
    startTransition(async () => {
      const result = await createTabAction(formData);
      const _err = getActionError(result);
      if (_err) {
        toast.error(_err);
        return;
      }
      if (isActionSuccess<{ tab: TabRow }>(result) && result.data?.tab) {
        const newTab = result.data.tab;
        setTabs((prev) => [newTab, ...prev]);
        setSelectedTab(newTab.id);
      }
      toast.success('Tab opened');
      setShowNewTab(false);
      router.refresh();
    });
  }

  function handleAddItem(productName: string, price: number) {
    if (!selectedTab) return;

    const optimisticItem = {
      id: `temp-${Date.now()}`,
      productName,
      quantity: 1,
      unitPrice: price,
      totalPrice: price,
    };

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === selectedTab
          ? {
              ...tab,
              items: [...tab.items, optimisticItem],
              subtotal: tabSubtotal(tab) + price,
            }
          : tab,
      ),
    );

    startTransition(async () => {
      const fd = new FormData();
      fd.append('tabId', selectedTab);
      fd.append('productName', productName);
      fd.append('quantity', '1');
      fd.append('unitPrice', String(price));
      const result = await addItemToTabAction(fd);
      const _err = getActionError(result);
      if (_err) {
        toast.error(_err);
        router.refresh();
        return;
      }
      toast.success(`Added ${productName}`);
      router.refresh();
    });
  }

  function handleCloseTab() {
    if (!selectedTab) return;
    const closingId = selectedTab;
    const snapshot = tabs;
    setTabs((prev) => prev.filter((t) => t.id !== closingId));
    setSelectedTab((id) => {
      if (id !== closingId) return id;
      const remaining = snapshot.filter((t) => t.id !== closingId);
      return remaining[0]?.id ?? null;
    });

    startTransition(async () => {
      const fd = new FormData();
      fd.append('tabId', closingId);
      fd.append('tip', String(tipAmount[closingId] || 0));
      const result = await closeTabAction(fd);
      const _err = getActionError(result);
      if (_err) {
        setTabs(snapshot);
        setSelectedTab(closingId);
        toast.error(_err);
        router.refresh();
        return;
      }
      toast.success('Tab closed');
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Open Tabs</h2>
          <button
            type="button"
            disabled={pending}
            onClick={() => setShowNewTab(!showNewTab)}
            className="inline-flex items-center gap-1 rounded-xl bg-primary text-primary-foreground px-3 py-1.5 text-sm disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" />
            New Tab
          </button>
        </div>

        {showNewTab && (
          <form action={handleCreateTab} className="rounded-xl border bg-card p-3 space-y-2">
            <input
              name="name"
              placeholder="Customer name or table"
              required
              disabled={pending}
              className="w-full h-9 rounded-lg border px-3 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-primary text-primary-foreground px-3 py-1 text-xs disabled:opacity-60"
              >
                {pending ? 'Creating…' : 'Create'}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setShowNewTab(false)}
                className="rounded-lg border px-3 py-1 text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              disabled={pending}
              onClick={() => setSelectedTab(tab.id)}
              className={`w-full text-left rounded-xl border p-3 transition-all ${
                selectedTab === tab.id
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{tab.name}</span>
                <span className="text-sm font-mono">${tabSubtotal(tab).toFixed(2)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {tab.items.length} item{tab.items.length !== 1 ? 's' : ''}
              </div>
            </button>
          ))}
          {tabs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No open tabs</p>
          )}
        </div>
      </div>

      {currentTab && (
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{currentTab.name}</h2>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Tip $</span>
                <input
                  type="number"
                  min={0}
                  disabled={pending}
                  value={tipAmount[currentTab.id] || 0}
                  onChange={(e) =>
                    setTipAmount({ ...tipAmount, [currentTab.id]: Number(e.target.value) })
                  }
                  className="w-16 h-8 rounded-lg border px-2 text-sm"
                />
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={handleCloseTab}
                className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
              >
                {pending ? 'Closing…' : `Close Tab — $${(liveSubtotal + liveTax + liveTip).toFixed(2)}`}
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Quick Add</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {QUICK_ITEMS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  disabled={pending}
                  onClick={() => handleAddItem(item.name, item.price)}
                  className={`flex ${posTouchButtonClass} flex-col items-center justify-center rounded-xl border p-2 text-center hover:bg-muted active:scale-95 transition-all disabled:opacity-60`}
                >
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="text-[11px] font-medium">{item.name}</span>
                  <span className="text-[10px] text-muted-foreground">${item.price}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {currentTab.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <span className="font-medium">{item.productName}</span>
                  <span className="text-sm text-muted-foreground ml-2">x{item.quantity}</span>
                </div>
                <span className="font-mono">${item.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
