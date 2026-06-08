export const USERS = [
  { email: 'cylla@store', password: 'cylla123', name: 'Cylla Admin', role: 'admin' },
  { email: 'agung@panca', password: 'pancagung', name: 'Agung / Atasan', role: 'viewer' },
];

export const SEED_SALES = [
  { id: 1, date: '2026-06-08', marketplace: 'Shopee', product: 'Canva Pro', qty: 10, price: 9000, status: 'Selesai' },
  { id: 2, date: '2026-06-08', marketplace: 'TikTok Shop', product: 'CapCut Pro', qty: 5, price: 5500, status: 'Selesai' },
  { id: 3, date: '2026-06-07', marketplace: 'Tokopedia', product: 'Netflix 1P1U', qty: 2, price: 30000, status: 'Selesai' },
];

export const SEED_STOCKS = [
  { id: 1, product: 'Canva Pro', initial: 50, incoming: 20, sold: 10 },
  { id: 2, product: 'CapCut Pro', initial: 30, incoming: 10, sold: 5 },
  { id: 3, product: 'Netflix 1P1U', initial: 5, incoming: 0, sold: 2 },
  { id: 4, product: 'YouTube Premium', initial: 8, incoming: 0, sold: 3 },
];