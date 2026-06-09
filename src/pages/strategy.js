import { getSales } from '../data/storage.js';
import { showToast } from '../components/toast.js';

function rupiah(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function StrategyPage() {
  const sales = getSales();

  const map = {};
  sales.forEach((item) => {
    if (!map[item.product]) {
      map[item.product] = { qty: 0, revenue: 0 };
    }

    map[item.product].qty += Number(item.qty);
    map[item.product].revenue += Number(item.qty) * Number(item.price);
  });

  const products = Object.entries(map)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  const best = products[0];
  const worst = products[products.length - 1];

  return `
    <div class="grid kpi">
      <div class="card">
        <p>Produk Terbaik</p>
        <h1>${best?.name || '-'}</h1>
      </div>

      <div class="card">
        <p>Produk Terlemah</p>
        <h1>${worst?.name || '-'}</h1>
      </div>

      <div class="card">
        <p>Total Produk</p>
        <h1>${products.length}</h1>
      </div>

      <div class="card">
        <p>Total Omzet</p>
        <h1>${rupiah(products.reduce((a, b) => a + b.revenue, 0))}</h1>
      </div>
    </div>

    <div class="card">
      <h2>Produk Terlaris</h2>

      ${
        products.length
          ? `
            <table>
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Terjual</th>
                  <th>Omzet</th>
                </tr>
              </thead>

              <tbody>
                ${products.slice(0, 5).map((item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>${rupiah(item.revenue)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `
          : `<div class="empty-state">Belum ada data produk.</div>`
      }
    </div>

    <div class="card">
      <h2>Catatan Strategi</h2>

      <textarea
        id="actionPlan"
        rows="8"
        placeholder="Contoh: Fokus push Canva Pro, restock Netflix, bikin promo bundling..."
      >${localStorage.getItem('cylla_plan') || ''}</textarea>

      <button id="savePlanBtn">
        Simpan Catatan
      </button>
    </div>
  `;
}

export function setupStrategyEvents() {
  const btn = document.getElementById('savePlanBtn');

  if (!btn) return;

  btn.onclick = () => {
    const value = document.getElementById('actionPlan').value;

    localStorage.setItem('cylla_plan', value);

    showToast('Catatan strategi berhasil disimpan');
  };
}