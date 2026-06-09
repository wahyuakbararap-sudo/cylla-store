import {
  getSales,
  getStocks,
  getFinance,
  getTarget,
  saveTarget,
  getLogs,
} from '../data/storage.js';

import { showToast } from '../components/toast.js';
import Chart from 'chart.js/auto';

let revenueChart = null;
let marketChart = null;

function rupiah(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

function getStockLeft(item) {
  return Number(item.initial) + Number(item.incoming) - Number(item.sold);
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

  const todayOrders = doneSales.filter((item) => item.date === today).length;

  const totalCost =
    Number(finance.ads || 0) +
    Number(finance.fee || 0) +
    Number(finance.shipping || 0) +
    Number(finance.other || 0);

  const profit = monthRevenue - totalCost;

  const lowStocks = stocks.filter((item) => getStockLeft(item) < 10);

  const targetPercent = target > 0
    ? Math.min(100, Math.round((monthRevenue / target) * 100))
    : 0;

  return `
    <div class="dashboard-hero">
      <div>
        <p class="muted">Omzet bulan ini</p>
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
        <p>Order Hari Ini</p>
        <h1>${todayOrders}</h1>
      </div>

      <div class="card">
        <p>Laba Bulan Ini</p>
        <h1>${rupiah(profit)}</h1>
      </div>

      <div class="card">
        <p>Stok Menipis</p>
        <h1>${lowStocks.length}</h1>
      </div>
    </div>

    <div class="grid two">
      <div class="card">
        <h2>Tren Omzet 7 Hari</h2>
        <canvas id="revenueChart"></canvas>
      </div>

      <div class="card">
        <h2>Distribusi Marketplace</h2>
        <canvas id="marketChart"></canvas>
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
          <th>Marketplace</th>
          <th>Total</th>
        </tr>
      </thead>

      <tbody>
        ${sales.slice(-6).reverse().map((item) => `
          <tr>
            <td>${item.date}</td>
            <td>${item.product}</td>
            <td>${item.marketplace}</td>
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

  renderCharts();
}

function renderCharts() {
  const sales = getSales().filter((item) => item.status === 'Selesai');

  const last7Days = [...Array(7)].map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - index));
    return d.toISOString().slice(0, 10);
  });

  const revenueData = last7Days.map((date) => {
    return sales
      .filter((item) => item.date === date)
      .reduce((sum, item) => sum + item.qty * item.price, 0);
  });

  const marketMap = {};
  sales.forEach((item) => {
    marketMap[item.marketplace] =
      (marketMap[item.marketplace] || 0) + item.qty * item.price;
  });

  const revenueCanvas = document.getElementById('revenueChart');
  const marketCanvas = document.getElementById('marketChart');

  if (!revenueCanvas || !marketCanvas) return;

  if (revenueChart) revenueChart.destroy();
  if (marketChart) marketChart.destroy();

  revenueChart = new Chart(revenueCanvas, {
    type: 'line',
    data: {
      labels: last7Days.map((date) => date.slice(5)),
      datasets: [
        {
          label: 'Omzet',
          data: revenueData,
          tension: 0.35,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (value) => 'Rp ' + Number(value).toLocaleString('id-ID'),
          },
        },
      },
    },
  });

  marketChart = new Chart(marketCanvas, {
    type: 'doughnut',
    data: {
      labels: Object.keys(marketMap),
      datasets: [
        {
          data: Object.values(marketMap),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    },
  });
}