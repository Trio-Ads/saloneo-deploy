import api from '../../services/api';

/** Supplier marketplace (see beauty-flow-backend/src/services/marketplace.ts). Amounts in DA TTC. */

export const CATEGORIES = [
  'coloration', 'hair_care', 'styling', 'nails', 'lashes_brows', 'face_care', 'body_care', 'waxing', 'hygiene', 'equipment', 'spa',
] as const;
export type Category = typeof CATEGORIES[number];
export const ALL_ZONES = 'ALL';

export type OrderStatus =
  | 'pending_payment' | 'paid' | 'accepted' | 'shipped' | 'delivered' | 'disputed' | 'released'
  | 'refund_pending' | 'refunded' | 'partially_refunded' | 'cancelled' | 'expired';

export interface Shipping { zones: string[]; fee: number; freeAbove: number; leadTimeDays: number }
export interface PayoutInfo { legalName: string; method: 'ccp' | 'bank'; rib: string; updatedAt?: string }
export interface Ledger { pending: number; earned: number; commission: number; paidOut: number; available: number }

export interface SupplierCard {
  id: string; slug: string; companyName: string; wilaya?: string; description?: string; categories: Category[];
  shipping: Shipping; phone?: string; productCount?: number; productCategories?: Category[]; deliverable?: boolean;
}

export interface MarketProduct {
  id: string; supplierId: string; name: string; brand?: string; category: Category; description?: string; photos: string[];
  unit: string; sku?: string; price: number; minOrderQty: number; stock: number; leadTimeDays: number; deliverable?: boolean;
  supplier?: { id: string; slug: string; companyName: string; wilaya?: string };
}

/** Supplier's own catalogue row. */
export interface SupplierProduct {
  id: string; name: string; brand?: string; category: Category; description?: string; photos: string[]; unit: string; sku?: string;
  price: number; minOrderQty: number; stock: number; leadTimeDays?: number; zones: string[]; isActive: boolean; updatedAt?: string;
}

export interface OrderItem { productId: string; name: string; brand?: string; unit: string; sku?: string; price: number; qty: number; total: number; stockProductId?: string; stockQty?: number }
export interface OrderEvent { from: string | null; to: OrderStatus; actor: 'salon' | 'supplier' | 'admin' | 'system'; note?: string; at: string }
export interface OrderMessage { from: 'salon' | 'supplier' | 'admin'; body: string; at: string }
export interface ShipTo { name: string; contact?: string; phone: string; address: string; wilaya: string }

export interface Order {
  id: string; number: string; status: OrderStatus; createdAt: string; paidAt?: string; acceptedAt?: string; deliveredAt?: string;
  releasedAt?: string; refundedAt?: string; salonName: string; supplierName: string; supplierId: string; shipTo: ShipTo;
  items: OrderItem[]; subtotal: number; deliveryFee: number; total: number; refundAmount: number; refundTarget?: 'refunded' | 'partially_refunded';
  shipment?: { carrier?: string; tracking?: string; shippedAt?: string };
  dispute?: { reason: string; openedAt: string; resolution?: string; resolvedAt?: string };
  messages: OrderMessage[]; stockAddedAt?: string; events?: OrderEvent[];
  deadlines: { ship?: string; autoRelease?: string; payment?: string };
  // salon
  orderNumber?: string; cardLast4?: string; approvalCode?: string; message?: string; canRetry?: boolean;
  // supplier / admin
  commissionPercent?: number; commission?: number; net?: number; paidOut?: boolean;
  // admin
  salonId?: string; refundError?: string; attempts?: number; satim?: { orderId?: string; orderNumber?: string };
}

export interface OrderRow {
  id: string; number: string; status: OrderStatus; createdAt: string; paidAt?: string; salonName: string; supplierName: string;
  supplierId: string; wilaya?: string; total: number; refundAmount: number; itemCount: number; firstItems: string[]; lines: number;
  commission?: number; commissionPercent?: number; paidOut?: boolean; disputeReason?: string; refundError?: string;
}
export interface OrderPage { total: number; page: number; pageSize: number; orders: OrderRow[] }

export interface SupplierProfile {
  id: string; companyName: string; slug: string; email: string; contactName?: string; phone?: string; wilaya?: string; address?: string;
  nif?: string; rc?: string; description?: string; categories: Category[]; status: 'pending' | 'approved' | 'rejected' | 'suspended';
  statusReason?: string; shipping: Shipping; payoutInfo: PayoutInfo | null; commissionPercent: number;
  settings: { autoReleaseDays: number; shipDeadlineDays: number }; paymentsEnabled: boolean;
}

export type LineProblem = 'UNAVAILABLE' | 'MIN_QTY' | 'OUT_OF_STOCK' | 'NOT_DELIVERED' | 'BAD_QTY';
export interface Quote {
  supplier: SupplierCard;
  lines: { productId: string; qty: number; product: MarketProduct | null; problem: LineProblem | null }[];
  totals: { subtotal: number; deliveryFee: number; total: number };
  valid: boolean;
}

export const supplierAPI = {
  apply: (data: unknown) => api.post('/supplier/apply', data),
  me: () => api.get<SupplierProfile>('/supplier/me'),
  updateMe: (data: Partial<SupplierProfile>) => api.put<SupplierProfile>('/supplier/me', data),
  savePayout: (data: PayoutInfo) => api.put('/supplier/payout-info', data),
  dashboard: () => api.get('/supplier/dashboard'),
  upload: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post<{ url: string }>('/supplier/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  products: () => api.get<{ products: SupplierProduct[] }>('/supplier/products'),
  createProduct: (p: Partial<SupplierProduct>) => api.post('/supplier/products', p),
  updateProduct: (id: string, p: Partial<SupplierProduct>) => api.put(`/supplier/products/${id}`, p),
  deleteProduct: (id: string) => api.delete(`/supplier/products/${id}`),
  importCsv: (csv: string, dryRun = false) => api.post<{ created: number; updated: number; valid: number; errors: { line: number; field: string }[] }>('/supplier/products/import', { csv, dryRun }),
  orders: (params: Record<string, unknown>) => api.get<OrderPage>('/supplier/orders', { params }),
  order: (id: string) => api.get<{ order: Order; supplier: Record<string, string> }>(`/supplier/orders/${id}`),
  accept: (id: string) => api.post<{ order: Order }>(`/supplier/orders/${id}/accept`),
  refuse: (id: string, reason: string) => api.post<{ order: Order }>(`/supplier/orders/${id}/refuse`, { reason }),
  ship: (id: string, carrier: string, tracking: string) => api.post<{ order: Order }>(`/supplier/orders/${id}/ship`, { carrier, tracking }),
  message: (id: string, body: string) => api.post<{ message: OrderMessage }>(`/supplier/orders/${id}/messages`, { body }),
  payments: () => api.get<{ balance: Ledger; payouts: { id: string; amount: number; paidAt: string; reference?: string; method?: string }[]; settled: OrderRow[]; payoutInfo: PayoutInfo | null }>('/supplier/payments'),
};

export interface MarketContext { paymentsEnabled: boolean; wilaya: string; suppliers: number; hasOpenOrders: boolean; shipTo: ShipTo; wilayas: string[] }
type SalonOrder = { order: Order; stockSuggestions: Record<string, { productId: string; perUnit: number }> };

export const marketAPI = {
  context: () => api.get<MarketContext>('/market/context'),
  suppliers: (params: { wilaya?: string; category?: string }) => api.get<{ suppliers: SupplierCard[] }>('/market/suppliers', { params }),
  supplier: (slug: string, wilaya?: string) => api.get<{ supplier: SupplierCard; products: MarketProduct[] }>(`/market/suppliers/${slug}`, { params: { wilaya } }),
  products: (params: { q?: string; category?: string; wilaya?: string; supplier?: string; page?: number; deliverable?: string }) =>
    api.get<{ total: number; page: number; pageSize: number; items: MarketProduct[] }>('/market/products', { params }),
  quote: (supplierId: string, items: { productId: string; qty: number }[], wilaya: string) => api.post<Quote>('/market/quote', { supplierId, items, wilaya }),
  checkout: (data: { supplierId: string; items: { productId: string; qty: number }[]; shipTo: ShipTo; lang: string }) =>
    api.post<{ orderId: string; formUrl: string }>('/market/orders', data),
  orders: (params: Record<string, unknown>) => api.get<OrderPage>('/market/orders', { params }),
  order: (id: string) => api.get<SalonOrder>(`/market/orders/${id}`),
  confirmPayment: (id: string) => api.post<SalonOrder>(`/market/orders/${id}/confirm-payment`),
  retry: (id: string, lang: string) => api.post<{ formUrl: string }>(`/market/orders/${id}/retry`, { lang }),
  cancel: (id: string) => api.post<SalonOrder>(`/market/orders/${id}/cancel`),
  received: (id: string) => api.post<SalonOrder>(`/market/orders/${id}/received`),
  dispute: (id: string, reason: string) => api.post<SalonOrder>(`/market/orders/${id}/dispute`, { reason }),
  addToStock: (id: string, lines: { index: number; productId?: string; create?: { name: string; unit: string }; qty: number }[]) =>
    api.post<SalonOrder>(`/market/orders/${id}/stock`, { lines }),
  message: (id: string, body: string) => api.post<{ message: OrderMessage }>(`/market/orders/${id}/messages`, { body }),
};

export interface AdminSupplier {
  id: string; companyName: string; slug: string; email: string; phone?: string; contactName?: string; wilaya?: string; address?: string;
  nif?: string; rc?: string; categories: Category[]; description?: string; status: SupplierProfile['status']; statusReason?: string;
  invited: boolean; createdAt: string; approvedAt?: string; commissionPercent: number | null; effectiveCommission: number;
  payout: PayoutInfo | null; shipping: Shipping; products: number; orders: number; gmv: number;
}
export interface MarketSettings { commissionPercent: number; autoReleaseDays: number; shipDeadlineDays: number }
export interface AdminStats {
  gmv: number; paidOrders: number; commission: number; gmvMonth: number; ordersMonth: number; commissionMonth: number;
  escrow: number; disputes: number; refundsPending: number; byStatus: Record<string, number>; suppliers: Record<string, number>;
}
export interface SupplierBalance extends Ledger { supplierId: string; companyName: string; email: string; payout: PayoutInfo | null; lastPayoutAt: string | null }

export const adminMarketAPI = {
  overview: () => api.get<{ paymentsEnabled: boolean; stats: AdminStats; settings: MarketSettings }>('/admin/marketplace/overview'),
  saveSettings: (s: MarketSettings) => api.put<{ settings: MarketSettings }>('/admin/marketplace/settings', s),
  suppliers: () => api.get<{ suppliers: AdminSupplier[] }>('/admin/marketplace/suppliers'),
  invite: (data: { email: string; companyName: string; contactName?: string; phone?: string; wilaya?: string }) => api.post('/admin/marketplace/suppliers/invite', data),
  updateSupplier: (id: string, data: { status?: string; reason?: string; commissionPercent?: number | null }) => api.patch(`/admin/marketplace/suppliers/${id}`, data),
  orders: (params: Record<string, unknown>) => api.get<OrderPage>('/admin/marketplace/orders', { params }),
  order: (id: string) => api.get<{ order: Order }>(`/admin/marketplace/orders/${id}`),
  resolve: (id: string, decision: 'release' | 'refund' | 'partial', amount: number, note: string) => api.post<{ order: Order }>(`/admin/marketplace/orders/${id}/resolve`, { decision, amount, note }),
  retryRefund: (id: string) => api.post<{ order: Order }>(`/admin/marketplace/orders/${id}/refund`),
  markRefunded: (id: string, note: string) => api.post<{ order: Order }>(`/admin/marketplace/orders/${id}/mark-refunded`, { note }),
  message: (id: string, body: string) => api.post<{ message: OrderMessage }>(`/admin/marketplace/orders/${id}/messages`, { body }),
  balances: () => api.get<{ balances: SupplierBalance[] }>('/admin/marketplace/balances'),
  csv: () => api.get('/admin/marketplace/balances.csv', { responseType: 'blob' }),
  payout: (data: { supplierId: string; amount: number; paidAt: string; reference: string }) => api.post('/admin/marketplace/payouts', data),
};

/** Error code from an API error (MarketError → { code }). */
export const errorCode = (e: any): string | undefined => e?.response?.data?.code;
