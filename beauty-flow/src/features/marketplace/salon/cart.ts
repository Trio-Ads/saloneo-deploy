import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MarketProduct } from '../api';

/** One cart per supplier (→ one order per supplier). Prices shown here are a snapshot; the server re-prices at checkout. */
export interface CartLine { productId: string; qty: number; product: MarketProduct }
export interface SupplierCart { supplier: { id: string; slug: string; companyName: string }; lines: CartLine[] }

interface CartState {
  owner: string | null;
  carts: Record<string, SupplierCart>;
  bindTo: (userId: string) => void;
  add: (p: MarketProduct, qty: number) => void;
  setQty: (supplierId: string, productId: string, qty: number) => void;
  remove: (supplierId: string, productId: string) => void;
  clear: (supplierId: string) => void;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      owner: null,
      carts: {},
      // A cart belongs to one salon account: another login on the same browser starts empty
      bindTo: (userId) => { if (get().owner !== userId) set({ owner: userId, carts: {} }); },
      add: (p, qty) => set((s) => {
        const sup = p.supplier!;
        const cart = s.carts[sup.id] || { supplier: { id: sup.id, slug: sup.slug, companyName: sup.companyName }, lines: [] };
        const existing = cart.lines.find((l) => l.productId === p.id);
        const lines = existing
          ? cart.lines.map((l) => (l.productId === p.id ? { ...l, qty: l.qty + qty, product: p } : l))
          : [...cart.lines, { productId: p.id, qty, product: p }];
        return { carts: { ...s.carts, [sup.id]: { ...cart, lines } } };
      }),
      setQty: (supplierId, productId, qty) => set((s) => {
        const cart = s.carts[supplierId];
        if (!cart) return s;
        return { carts: { ...s.carts, [supplierId]: { ...cart, lines: cart.lines.map((l) => (l.productId === productId ? { ...l, qty: Math.max(1, Math.floor(qty) || 1) } : l)) } } };
      }),
      remove: (supplierId, productId) => set((s) => {
        const cart = s.carts[supplierId];
        if (!cart) return s;
        const lines = cart.lines.filter((l) => l.productId !== productId);
        const carts = { ...s.carts };
        if (lines.length) carts[supplierId] = { ...cart, lines }; else delete carts[supplierId];
        return { carts };
      }),
      clear: (supplierId) => set((s) => {
        const carts = { ...s.carts };
        delete carts[supplierId];
        return { carts };
      }),
      count: () => Object.values(get().carts).reduce((n, c) => n + c.lines.length, 0),
    }),
    { name: 'saloneo-market-cart' }
  )
);
