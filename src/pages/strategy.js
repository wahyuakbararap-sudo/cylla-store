import { getSales, getStocks } from '../data/storage.js';
import { showToast } from '../components/toast.js';

function rupiah(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function StrategyPage() {
  const sales = getSales().filter((item) => item.status === 'Selesai');
  const stocks = getStocks();

  const productMap = {};
  const marketMap = {};

  sales.forEach((item) => {
    if (!productMap[item.product]) {
      productMap[item.product] = { qty: 0, revenue: 0 };
    }

    productMap[item.product].qty += Number(item.qty);
    productMap[item.product].revenue += Number(item.qty) * Number(item.price);

    marketMap[item.marketplace] =
      (marketMap[item.marketplace] || 0) + Number(item.qty) * Number(item.price);
  });

  const products = Object.entries(productMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  const markets = Object.entries(marketMap)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = products.reduce((sum, item) => sum + item.revenue, 0);
  const best = products[0];
  const worst = products[products.length - 1];
  const bestMarket = markets[0];

  const lowStocks = stocks.filter((item) => {
    const left = Number(item.initial) + Number(item.incoming) - Number(item.sold);
    return left < 10;
  });

  const score = Math.min(
    100,
    Math.round(
      (sales.length * 4) +
      (products.length * 6) +
      (markets.length * 8) -
      (lowStocks.length * 8)
    )
  );

  return `
    <div class="strategy-hero">
      <div>
        <p class="muted">Business health score</p>
        <h1>${score}/100</h1>
        <span class="hero-badge">${score >= 70 ? 'Sehat' : score >= 40 ? 'Perlu Ditingkatkan' : 'Kritis'}</span>
      </div>

      <div class="strategy-hero-info">
        <strong>${best?.name || 'Belum ada produk unggulan'}</strong>
        <p>Produk dengan kontribusi omzet terbesar saat ini.</p>
      </div>
    </div>

    <div class="grid kpi">
      <div class="card">
        <p>Produk Terbaik</p>
        <h1>${best?.name || '-'}</h1>
      </div>

      <div class="card">
        <p>Produk Lemah</p>
        <h1>${worst?.name || '-'}</h1>
      </div>

      <div class="card">
        <p>Marketplace Terbaik</p>
        <h1>${bestMarket?.name || '-'}</h1>
      </div>

      <div class="card">
        <p>Stok Perhatian</p>
        <h1>${lowStocks.length}</h1>
      </div>
    </div>

    <div class="grid two">
      <div class="card">
        <h2>Rekomendasi Cepat</h2>
        ${renderRecommendations(best, worst, bestMarket, lowStocks, totalRevenue)}
      </div>

      <div class="card">
        <h2>Insight Marketplace</h2>
        ${renderMarkets(markets, totalRevenue)}
      </div>
    </div>

    <div class="grid two">
      <div class="card">
        <h2>Produk Terlaris</h2>
        ${renderProducts(products, totalRevenue)}
      </div>

      <div class="card">
        <h2>Produk Perlu Perhatian</h2>
        ${renderWeakProducts(products)}
      </div>
    </div>

    <div class="card">
      <h2>Catatan Strategi</h2>

      <textarea
        id="actionPlan"
        rows="7"
        placeholder="Contoh: Fokus push Canva Pro, restock Netflix, bikin promo bundling..."
      >${localStorage.getItem('cylla_plan') || ''}</textarea>

      <button id="savePlanBtn">Simpan Catatan</button>
    </div>
  `;
}

function renderRecommendations(best, worst, bestMarket, lowStocks, totalRevenue) {
  const list = [];

  if (best) {
    const percent = totalRevenue ? Math.round((best.revenue / totalRevenue) * 100) : 0;
    list.push(`Fokus push <strong>${best.name}</strong>, karena menyumbang sekitar <strong>${percent}%</strong> omzet.`);
  }

  if (worst && worst.name !== best?.name) {
    list.push(`Evaluasi <strong>${worst.name}</strong>. Bisa dicoba bundling, diskon kecil, atau stop restock dulu.`);
  }

  if (bestMarket) {
    list.push(`Marketplace terbaik sekarang <strong>${bestMarket.name}</strong>. Prioritaskan promo dan stok di sana.`);
  }

  if (lowStocks.length) {
    list.push(`Ada <strong>${lowStocks.length}</strong> produk stok menipis/habis. Restock dulu sebelum push promo.`);
  }

  if (!list.length) {
    return `<div class="empty-state">Belum ada data untuk rekomendasi.</div>`;
  }

  return `
    <div class="strategy-list">
      ${list.map((text, index) => `
        <div class="strategy-item">
          <span class="strategy-number">${index + 1}</span>
          <p>${text}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function renderMarkets(markets, totalRevenue) {
  if (!markets.length) {
    return `<div class="empty-state">Belum ada marketplace aktif.</div>`;
  }

  return `
    <div class="market-list">
      ${markets.map((market) => {
        const percent = totalRevenue ? Math.round((market.revenue / totalRevenue) * 100) : 0;

        return `
          <div class="market-item">
            <div>
              <strong>${market.name}</strong>
              <p class="muted">${rupiah(market.revenue)}</p>
            </div>

            <span class="badge yellow">${percent}%</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderProducts(products, totalRevenue) {
  if (!products.length) {
    return `<div class="empty-state">Belum ada data produk.</div>`;
  }

  return `
    <table>
      <thead>
        <tr>
          <th>Produk</th>
          <th>Terjual</th>
          <th>Omzet</th>
          <th>Kontribusi</th>
        </tr>
      </thead>

      <tbody>
        ${products.slice(0, 5).map((item) => {
          const percent = totalRevenue ? Math.round((item.revenue / totalRevenue) * 100) : 0;

          return `
            <tr>
              <td>${item.name}</td>
              <td>${item.qty}</td>
              <td>${rupiah(item.revenue)}</td>
              <td><span class="badge green">${percent}%</span></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function renderWeakProducts(products) {
  const weak = [...products].sort((a, b) => a.revenue - b.revenue).slice(0, 5);

  if (!weak.length) {
    return `<div class="empty-state">Belum ada produk lemah.</div>`;
  }

  return `
    <div class="weak-list">
      ${weak.map((item) => `
        <div class="weak-item">
          <div>
            <strong>${item.name}</strong>
            <p class="muted">Terjual ${item.qty} • ${rupiah(item.revenue)}</p>
          </div>

          <span class="badge red">Review</span>
        </div>
      `).join('')}
    </div>
  `;
}

export function setupStrategyEvents() {
  document.getElementById('savePlanBtn')?.addEventListener('click', () => {
    const value = document.getElementById('actionPlan').value;

    localStorage.setItem('cylla_plan', value);
    showToast('Catatan strategi berhasil disimpan');
  });
}