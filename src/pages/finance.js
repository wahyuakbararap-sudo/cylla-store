import { getSales, getFinance, saveFinance } from '../data/storage.js';
import { isAdmin } from '../auth/auth.js';
import { showToast } from '../components/toast.js';

function rupiah(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function FinancePage() {
  const sales = getSales();
  const finance = getFinance();

  const omzet = sales
    .filter((item) => item.status === 'Selesai')
    .reduce((total, item) => total + item.qty * item.price, 0);

  const totalCost =
    Number(finance.ads) +
    Number(finance.fee) +
    Number(finance.shipping) +
    Number(finance.other);

  const profit = omzet - totalCost;
  const avg = sales.length ? omzet / sales.length : 0;
  const margin = omzet ? ((profit / omzet) * 100).toFixed(1) : 0;

  return `
    <div class="grid kpi">
      <div class="card">
        <p>Pendapatan Kotor</p>
        <h1>${rupiah(omzet)}</h1>
      </div>

      <div class="card">
        <p>Total Biaya</p>
        <h1>${rupiah(totalCost)}</h1>
      </div>

      <div class="card">
        <p>Laba Bersih</p>
        <h1>${rupiah(profit)}</h1>
      </div>

      <div class="card">
        <p>Margin Laba</p>
        <h1>${margin}%</h1>
      </div>
    </div>

    <div class="card">
      <h2>Biaya Operasional</h2>

      <div class="finance-grid">
        <div>
          <label>Biaya Iklan</label>
          <input id="ads" type="number" value="${finance.ads}" ${!isAdmin() ? 'disabled' : ''} />
        </div>

        <div>
          <label>Fee Marketplace</label>
          <input id="fee" type="number" value="${finance.fee}" ${!isAdmin() ? 'disabled' : ''} />
        </div>

        <div>
          <label>Biaya Pengiriman</label>
          <input id="shipping" type="number" value="${finance.shipping}" ${!isAdmin() ? 'disabled' : ''} />
        </div>

        <div>
          <label>Biaya Lainnya</label>
          <input id="other" type="number" value="${finance.other}" ${!isAdmin() ? 'disabled' : ''} />
        </div>
      </div>

      ${isAdmin() ? `<button id="saveFinanceBtn">Simpan Biaya</button>` : ''}
    </div>

    <div class="card">
      <h2>Ringkasan Keuangan</h2>

      <table>
        <tbody>
          <tr><td>Total Transaksi</td><td>${sales.length}</td></tr>
          <tr><td>Rata-rata Order</td><td>${rupiah(avg)}</td></tr>
          <tr><td>Pendapatan</td><td>${rupiah(omzet)}</td></tr>
          <tr><td>Total Biaya</td><td>${rupiah(totalCost)}</td></tr>
          <tr><td>Laba Bersih</td><td>${rupiah(profit)}</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

export function setupFinanceEvents() {
  const btn = document.getElementById('saveFinanceBtn');

  if (!btn) return;

  btn.onclick = () => {
    saveFinance({
      ads: Number(document.getElementById('ads').value || 0),
      fee: Number(document.getElementById('fee').value || 0),
      shipping: Number(document.getElementById('shipping').value || 0),
      other: Number(document.getElementById('other').value || 0),
    });

    showToast('Biaya operasional berhasil disimpan');
  };
}