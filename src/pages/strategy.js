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

  const productMap = {};

  sales.forEach((item) => {
    if (!productMap[item.product]) {
      productMap[item.product] = {
        qty: 0,
        revenue: 0,
      };
    }

    productMap[item.product].qty += item.qty;
    productMap[item.product].revenue += item.qty * item.price;
  });

  const products = Object.entries(productMap)
    .map(([name, data]) => ({
      name,
      ...data,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const bestProduct = products[0];
  const worstProduct = products[products.length - 1];

  const totalRevenue = products.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  const score = Math.min(
    100,
    Math.round(
      (totalRevenue / 1000000) * 50 +
      sales.length * 3
    )
  );

  return `
    <div class="grid kpi">

      <div class="card">
        <p>Skor Kesehatan</p>
        <h1>${score}/100</h1>
      </div>

      <div class="card">
        <p>Produk Terbaik</p>
        <h1>${bestProduct?.name || '-'}</h1>
      </div>

      <div class="card">
        <p>Perlu Perhatian</p>
        <h1>${worstProduct?.name || '-'}</h1>
      </div>

      <div class="card">
        <p>Total Produk</p>
        <h1>${products.length}</h1>
      </div>

    </div>

    <div class="card">
      <h2>Produk Terlaris</h2>

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
    </div>

    <div class="card">
      <h2>Rekomendasi Bisnis</h2>

      <div class="strategy-list">

        <div class="strategy-item">
          📈 Fokuskan promosi pada
          <strong>${bestProduct?.name || '-'}</strong>
          karena menjadi penyumbang omzet terbesar.
        </div>

        <div class="strategy-item">
          📦 Evaluasi
          <strong>${worstProduct?.name || '-'}</strong>
          karena performanya paling rendah.
        </div>

        <div class="strategy-item">
          🎯 Tingkatkan rata-rata order
          dengan bundling produk premium.
        </div>

      </div>
    </div>

    <div class="card">
      <h2>Rencana Tindakan</h2>

      <textarea
        id="actionPlan"
        rows="6"
        placeholder="Tulis strategi bisnis..."
      >${localStorage.getItem('cylla_plan') || ''}</textarea>

      <button id="savePlanBtn">
        Simpan Rencana
      </button>
    </div>
  `;
}

export function setupStrategyEvents() {
  document
    .getElementById('savePlanBtn')
    ?.addEventListener('click', () => {

      localStorage.setItem(
        'cylla_plan',
        document.getElementById('actionPlan').value
      );

      showToast(
        'Rencana berhasil disimpan'
      );
    });
}