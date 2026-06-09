import {
  getSales,
  getStocks,
  getFinance,
  getTarget,
} from '../data/storage.js';

function rupiah(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function AIPage() {
  const sales = getSales().filter((x) => x.status === 'Selesai');
  const stocks = getStocks();
  const finance = getFinance();
  const target = getTarget();

  const omzet = sales.reduce((a, b) => a + b.qty * b.price, 0);
  const biaya =
    Number(finance.ads || 0) +
    Number(finance.fee || 0) +
    Number(finance.shipping || 0) +
    Number(finance.other || 0);

  const profit = omzet - biaya;
  const targetPercent = target ? Math.round((omzet / target) * 100) : 0;

  const productMap = {};
  sales.forEach((item) => {
    if (!productMap[item.product]) {
      productMap[item.product] = { qty: 0, revenue: 0 };
    }

    productMap[item.product].qty += Number(item.qty);
    productMap[item.product].revenue += Number(item.qty) * Number(item.price);
  });

  const products = Object.entries(productMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  const best = products[0];
  const weak = products[products.length - 1];

  const lowStocks = stocks.filter((item) => {
    const left = Number(item.initial) + Number(item.incoming) - Number(item.sold);
    return left < 10;
  });

  const score = Math.max(
    0,
    Math.min(
      100,
      60 +
        (targetPercent >= 50 ? 15 : -10) +
        (profit > 0 ? 15 : -15) -
        lowStocks.length * 5
    )
  );

  return `
    <div class="dashboard-hero">
      <div>
        <p class="muted">AI Analyst Rule-Based</p>
        <h1>${score}/100</h1>
        <span class="hero-badge">
          ${score >= 75 ? 'Bisnis Sehat' : score >= 50 ? 'Perlu Ditingkatkan' : 'Perlu Perhatian Serius'}
        </span>
      </div>

      <div class="target-box">
        <strong>Kesimpulan Cepat</strong>
        <p style="margin-top:8px">
          Omzet ${rupiah(omzet)}, profit ${rupiah(profit)}, target tercapai ${targetPercent}%.
        </p>
      </div>
    </div>

    <div class="grid kpi">
      <div class="card">
        <p>Omzet</p>
        <h1>${rupiah(omzet)}</h1>
      </div>

      <div class="card">
        <p>Profit</p>
        <h1>${rupiah(profit)}</h1>
      </div>

      <div class="card">
        <p>Target</p>
        <h1>${targetPercent}%</h1>
      </div>

      <div class="card">
        <p>Stok Risiko</p>
        <h1>${lowStocks.length}</h1>
      </div>
    </div>

    <div class="grid two">
      <div class="card">
        <h2>Insight Utama</h2>
        <div class="strategy-list">
          ${best ? `
            <div class="strategy-item">
              <span class="strategy-number">1</span>
              <p>Produk paling kuat saat ini adalah <strong>${best.name}</strong> dengan omzet ${rupiah(best.revenue)}.</p>
            </div>
          ` : ''}

          ${weak && weak.name !== best?.name ? `
            <div class="strategy-item">
              <span class="strategy-number">2</span>
              <p><strong>${weak.name}</strong> performanya paling rendah. Coba bundling, diskon kecil, atau stop push dulu.</p>
            </div>
          ` : ''}

          <div class="strategy-item">
            <span class="strategy-number">3</span>
            <p>Target bulanan baru tercapai <strong>${targetPercent}%</strong>. ${
              targetPercent < 50
                ? 'Perlu dorong promo dan produk high demand.'
                : 'Progress target masih cukup aman.'
            }</p>
          </div>

          <div class="strategy-item">
            <span class="strategy-number">4</span>
            <p>Profit saat ini <strong>${rupiah(profit)}</strong>. ${
              profit < 0
                ? 'Biaya lebih besar dari omzet, cek biaya iklan/fee.'
                : 'Profit masih positif, tinggal optimasi margin.'
            }</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Risiko Stok</h2>
        ${
          lowStocks.length
            ? `
              <div class="alert-list">
                ${lowStocks.map((item) => {
                  const left = Number(item.initial) + Number(item.incoming) - Number(item.sold);

                  return `
                    <div class="alert-item">
                      <div>
                        <strong>${item.product}</strong>
                        <p class="muted">Sisa stok ${left}</p>
                      </div>
                      <span class="badge ${left <= 0 ? 'red' : 'yellow'}">
                        ${left <= 0 ? 'Habis' : 'Menipis'}
                      </span>
                    </div>
                  `;
                }).join('')}
              </div>
            `
            : `<div class="empty-state">Tidak ada risiko stok.</div>`
        }
      </div>
    </div>

    <div class="card">
      <h2>Action Plan Minggu Ini</h2>

      <div class="strategy-list">
        <div class="strategy-item">
          <span class="strategy-number">1</span>
          <p>Restock produk yang stoknya menipis/habis sebelum push promo.</p>
        </div>

        <div class="strategy-item">
          <span class="strategy-number">2</span>
          <p>Fokuskan promosi ke produk terlaris: <strong>${best?.name || '-'}</strong>.</p>
        </div>

        <div class="strategy-item">
          <span class="strategy-number">3</span>
          <p>Evaluasi biaya operasional supaya margin tidak bocor.</p>
        </div>
      </div>
    </div>
  `;
}

export function setupAIEvents() {}