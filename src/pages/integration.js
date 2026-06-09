import Papa from 'papaparse';
import { getSales, saveSales, addLog } from '../data/storage.js';
import { showToast } from '../components/toast.js';

export function IntegrationPage() {
  return `
    <div class="card">
      <h2>Integrasi Marketplace</h2>
      <p class="muted">Import laporan penjualan dari Shopee/TikTok/Tokopedia ke dashboard.</p>
    </div>

    <div class="card">
      <h2>Import CSV Shopee</h2>

      <div class="import-box">
        <input id="shopeeCsv" type="file" accept=".csv" />
        <button id="importShopeeBtn">Import Data</button>
      </div>

      <p class="muted">
        Download laporan dari Shopee Seller Centre, lalu upload file CSV di sini.
      </p>
    </div>

    <div class="card">
      <h2>Preview Import</h2>
      <div id="importPreview" class="empty-state">Belum ada file diimport.</div>
    </div>
  `;
}

export function setupIntegrationEvents() {
  document.getElementById('importShopeeBtn').onclick = () => {
    const file = document.getElementById('shopeeCsv').files[0];

    if (!file) {
      showToast('Pilih file CSV dulu', 'error');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data;

        const imported = rows.map((row) => {
          const product =
            row['Nama Produk'] ||
            row['Product Name'] ||
            row['Nama Barang'] ||
            row['Produk'] ||
            'Produk Shopee';

          const qty =
            Number(row['Jumlah'] || row['Quantity'] || row['Qty'] || 1);

          const price =
            Number(
              String(
                row['Harga'] ||
                row['Harga Setelah Diskon'] ||
                row['Total Harga Produk'] ||
                row['Total'] ||
                0
              ).replace(/[^\d]/g, '')
            );

          const date =
            row['Waktu Pesanan Dibuat'] ||
            row['Tanggal'] ||
            row['Order Creation Date'] ||
            new Date().toISOString().slice(0, 10);

          return {
            id: Date.now() + Math.random(),
            date: String(date).slice(0, 10),
            marketplace: 'Shopee',
            product,
            qty,
            price,
            status: 'Selesai',
          };
        });

        const valid = imported.filter((item) => item.product && item.price > 0);

        saveSales([...getSales(), ...valid]);
        addLog(`Import ${valid.length} data Shopee`);
        showToast(`${valid.length} data Shopee berhasil diimport`);

        document.getElementById('importPreview').innerHTML = `
          <table>
            <thead>
              <tr>
                <th>Produk</th>
                <th>Qty</th>
                <th>Harga</th>
              </tr>
            </thead>
            <tbody>
              ${valid.slice(0, 10).map((item) => `
                <tr>
                  <td>${item.product}</td>
                  <td>${item.qty}</td>
                  <td>Rp ${item.price.toLocaleString('id-ID')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      },
    });
  };
}