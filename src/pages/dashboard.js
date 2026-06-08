import {
  getSales,
  getStocks,
  getFinance,
  getTarget,
  saveTarget,
  getLogs,
} from '../data/storage.js';

import { showToast } from '../components/toast.js';

function rupiah(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function DashboardPage() {
  const sales = getSales();
  const stocks = getStocks();
  const finance = getFinance();
  const target = getTarget();
  const logs = getLogs();

  const today = new Date().toISOString().slice(0, 10);
  const month = new Date().toISOString().slice(0, 7);

  const doneSales = sales.filter((item) => item.status === 'Selesai');

  const todayRevenue = doneSales
    .filter((item) => item.date === today)
    .reduce((sum, item) => sum + item.qty * item.price, 0);

  const monthRevenue = doneSales
    .filter((item) => item.date.startsWith(month))
    .reduce((sum, item) => sum + item.qty * item.price, 0);

  const totalCost =
    Number(finance.ads || 0) +
    Number(finance.fee || 0) +
    Number(finance.shipping || 0) +
    Number(finance.other || 0);

  const profit = monthRevenue - totalCost;

  const lowStocks = stocks.filter((item) => {
    const left = Number(item.initial) + Number(item.incoming) - Number(item.sold);
    return left < 10;
  });

  const targetPercent = target > 0
    ? Math.min(100, Math.round((monthRevenue / target) * 100))
    : 0;

  return `
    <div class="dashboard-hero">
      <div>
        <p class="muted">Ringkasan bulan ini</p>
        <h1>${rupiah(monthRevenue)}</h1>
        <span class="hero-badge">Target tercapai ${targetPercent}%</span>
      </div>

      <div class="target-box">
        <label>Target Bulanan</label>
        <div class="target-input">
          <input id="targetInput" type="number" value="${target}" />
          <button id="saveTargetBtn">Simpan</button>
        </div>
      </div>
    </div>

    <div class="progress-wrap">
      <div class="progress-head">
        <span>Progress Target</span>
        <strong>${targetPercent}%</strong>
      </div>
      <div class="progress-bar">
        <div style="width:${targetPercent}%"></div>
      </div>
    </div>

    <div class="grid kpi">
      <div class="card">
        <p>Omzet Hari Ini</p>
        <h1>${rupiah(todayRevenue)}</h1>
      </div>

      <div class="card">
        <p>Order Selesai</p>
        <h1>${doneSales.length}</h1>
      </div>

      <div class="card">
        <p>Laba Bulan Ini</p>
        <h1>${rupiah(profit)}</h1>
      </div>

      <div class="card">
        <p>Stok Perhatian</p>
        <h1>${lowStocks.length}</h1>
      </div>
    </div>

    <div class="grid two">
      <div class="card">
        <h2>Tren Penjualan</h2>
        ${renderRevenueTrend(doneSales)}
      </div>

      <div class="card">
        <h2>Marketplace Terbaik</h2>
        ${renderMarketList(doneSales)}
      </div>
    </div>

    <div class="grid two">
      <div class="card">
        <h2>Penjualan Terbaru</h2>
        ${renderLatestSales(sales)}
      </div>

      <div class="card">
        <h2>Audit Log</h2>
        ${renderLogs(logs)}
      </div>
    </div>
  `;
}

function renderRevenueTrend(sales) {
  const map = {};

  sales.forEach((item) => {
    map[item.date] = (map[item.date] || 0) + item.qty * item.price;
  });

  const rows = Object.entries(map).slice(-7);

  if (!rows.length) {
    return `<div class="empty-state">Belum ada data omzet.</div>`;
  }

  const max = Math.max(...rows.map(([, value]) => value));

  return `
    <div class="mini-chart">
      ${rows.map(([date, value]) => `
        <div class="mini-bar">
          <div
            class="mini-fill"
            style="height:${Math.max(8, (value / max) * 120)}px"
            title="${rupiah(value)}"
          ></div>
          <small>${date.slice(5)}</small>
        </div>
      `).join('')}
    </div>
  `;
}

function renderMarketList(sales) {
  const map = {};

  sales.forEach((item) => {
    map[item.marketplace] = (map[item.marketplace] || 0) + item.qty * item.price;
  });

  const rows = Object.entries(map).sort((a, b) => b[1] - a[1]);

  if (!rows.length) {
    return `<div class="empty-state">Belum ada marketplace aktif.</div>`;
  }

  const total = rows.reduce((sum, [, value]) => sum + value, 0);

  return `
    <div class="market-list">
      ${rows.map(([market, value]) => {
        const percent = total ? Math.round((value / total) * 100) : 0;

        return `
          <div class="market-item">
            <div>
              <strong>${market}</strong>
              <p class="muted">${rupiah(value)}</p>
            </div>

            <span class="badge yellow">${percent}%</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderLatestSales(sales) {
  if (!sales.length) {
    return `<div class="empty-state">Belum ada penjualan.</div>`;
  }

  return `
    <table>
      <thead>
        <tr>
          <th>Tanggal</th>
          <th>Produk</th>
          <th>Total</th>
        </tr>
      </thead>

      <tbody>
        ${sales.slice(-5).reverse().map((item) => `
          <tr>
            <td>${item.date}</td>
            <td>${item.product}</td>
            <td>${rupiah(item.qty * item.price)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderLogs(logs) {
  if (!logs.length) {
    return `<div class="empty-state">Belum ada aktivitas.</div>`;
  }

  return `
    <div class="log-list">
      ${logs.slice(0, 8).map((log) => `
        <div class="log-item">
          <strong>${log.text}</strong>
          <p class="muted">${log.date}</p>
        </div>
      `).join('')}
    </div>
  `;
}

export function setupDashboardEvents() {
  document.getElementById('saveTargetBtn')?.addEventListener('click', () => {
    const value = Number(document.getElementById('targetInput').value || 0);

    saveTarget(value);
    showToast('Target bulanan berhasil disimpan');

    setTimeout(() => location.reload(), 500);
  });
}