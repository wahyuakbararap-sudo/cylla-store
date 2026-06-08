import { getSales, saveSales, addLog } from '../data/storage.js';
import { isAdmin } from '../auth/auth.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { confirmModal } from '../components/confirm.js';

function rupiah(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function SalesPage() {
  return `
    <div class="card">
      <div class="sales-header">
        <h2>Data Penjualan</h2>

        <div>
          <button id="exportSalesBtn" class="soft">Export CSV</button>
          ${isAdmin() ? `<button id="addSaleBtn">Tambah Data</button>` : ''}
        </div>
      </div>

      <div class="filter-row">
        <input id="searchSales" placeholder="Cari produk / marketplace..." />

        <select id="filterMarketplace">
          <option value="all">Semua Marketplace</option>
          <option value="Shopee">Shopee</option>
          <option value="Tokopedia">Tokopedia</option>
          <option value="TikTok Shop">TikTok Shop</option>
        </select>
      </div>

      <div id="salesTable"></div>
    </div>
  `;
}

function saleForm(item = null) {
  return `
    <label>Tanggal</label>
    <input
      id="saleDate"
      type="date"
      value="${item?.date || new Date().toISOString().slice(0, 10)}"
    />

    <label>Marketplace</label>
    <select id="saleMarketplace">
      <option ${item?.marketplace === 'Shopee' ? 'selected' : ''}>Shopee</option>
      <option ${item?.marketplace === 'Tokopedia' ? 'selected' : ''}>Tokopedia</option>
      <option ${item?.marketplace === 'TikTok Shop' ? 'selected' : ''}>TikTok Shop</option>
    </select>

    <label>Nama Produk</label>
    <input
      id="saleProduct"
      value="${item?.product || ''}"
      placeholder="Contoh: Canva Pro"
    />

    <label>Jumlah</label>
    <input
      id="saleQty"
      type="number"
      value="${item?.qty || ''}"
      placeholder="Contoh: 10"
    />

    <label>Harga</label>
    <input
      id="salePrice"
      type="number"
      value="${item?.price || ''}"
      placeholder="Contoh: 9000"
    />

    <label>Status</label>
    <select id="saleStatus">
      <option ${item?.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
      <option ${item?.status === 'Diproses' ? 'selected' : ''}>Diproses</option>
      <option ${item?.status === 'Dibatalkan' ? 'selected' : ''}>Dibatalkan</option>
    </select>
  `;
}

function getSalePayload() {
  return {
    date: document.getElementById('saleDate').value,
    marketplace: document.getElementById('saleMarketplace').value,
    product: document.getElementById('saleProduct').value.trim(),
    qty: Number(document.getElementById('saleQty').value),
    price: Number(document.getElementById('salePrice').value),
    status: document.getElementById('saleStatus').value,
  };
}

function renderSalesTable() {
  const keyword = document.getElementById('searchSales')?.value.toLowerCase() || '';
  const marketplace = document.getElementById('filterMarketplace')?.value || 'all';

  const filtered = getSales().filter((item) => {
    const matchKeyword =
      item.product.toLowerCase().includes(keyword) ||
      item.marketplace.toLowerCase().includes(keyword);

    const matchMarketplace =
      marketplace === 'all' || item.marketplace === marketplace;

    return matchKeyword && matchMarketplace;
  });

  if (!filtered.length) {
    document.getElementById('salesTable').innerHTML = `
      <div class="empty-state">
        Belum ada data penjualan yang cocok.
      </div>
    `;
    return;
  }

  document.getElementById('salesTable').innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Tanggal</th>
          <th>Marketplace</th>
          <th>Produk</th>
          <th>Qty</th>
          <th>Harga</th>
          <th>Total</th>
          <th>Status</th>
          ${isAdmin() ? '<th>Aksi</th>' : ''}
        </tr>
      </thead>

      <tbody>
        ${filtered.map((item) => `
          <tr>
            <td>${item.date}</td>
            <td>${item.marketplace}</td>
            <td>${item.product}</td>
            <td>${item.qty}</td>
            <td>${rupiah(item.price)}</td>
            <td>${rupiah(item.qty * item.price)}</td>
            <td>
              <span class="badge ${
                item.status === 'Selesai'
                  ? 'green'
                  : item.status === 'Diproses'
                    ? 'yellow'
                    : 'red'
              }">
                ${item.status}
              </span>
            </td>

            ${
              isAdmin()
                ? `
                  <td>
                    <button class="soft edit-sale" data-id="${item.id}">
                      Edit
                    </button>

                    <button class="danger delete-sale" data-id="${item.id}">
                      Hapus
                    </button>
                  </td>
                `
                : ''
            }
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  setupSaleButtons();
}

function setupSaleButtons() {
  document.querySelectorAll('.delete-sale').forEach((btn) => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);

      confirmModal('Yakin mau hapus data penjualan ini?', () => {
        const updated = getSales().filter((item) => item.id !== id);

        saveSales(updated);
        showToast('Data penjualan dihapus');
        renderSalesTable();
      });
    };
  });

  document.querySelectorAll('.edit-sale').forEach((btn) => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      const item = getSales().find((sale) => sale.id === id);

      openModal(
        'Edit Penjualan',
        saleForm(item),
        () => {
          const payload = getSalePayload();

          if (!payload.product || !payload.qty || !payload.price) {
            addLog(`Menambah penjualan ${payload.product}`);
            addLog(`Mengedit penjualan ${payload.product}`);
            addLog('Menghapus data penjualan');
            showToast('Produk, jumlah, dan harga wajib diisi', 'error');
            return;
          }

          const updated = getSales().map((sale) => {
            if (sale.id !== id) return sale;

            return {
              ...sale,
              ...payload,
            };
          });

          saveSales(updated);
          closeModal();
          showToast('Data penjualan berhasil diupdate');
          renderSalesTable();
        }
      );
    };
  });
}

function openAddSaleModal() {
  openModal(
    'Tambah Penjualan',
    saleForm(),
    () => {
      const payload = getSalePayload();

      if (!payload.product || !payload.qty || !payload.price) {
        showToast('Produk, jumlah, dan harga wajib diisi', 'error');
        return;
      }

      const sales = getSales();

      sales.push({
        id: Date.now(),
        ...payload,
      });

      saveSales(sales);
      closeModal();
      showToast('Data penjualan berhasil ditambah');
      renderSalesTable();
    }
  );
}

function exportSalesCSV() {
  let csv = 'Tanggal,Marketplace,Produk,Qty,Harga,Total,Status\n';

  getSales().forEach((item) => {
    csv += `${item.date},${item.marketplace},${item.product},${item.qty},${item.price},${item.qty * item.price},${item.status}\n`;
  });

  const blob = new Blob([csv], {
    type: 'text/csv',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = 'cylla-penjualan.csv';
  a.click();

  URL.revokeObjectURL(url);
  showToast('CSV berhasil diexport');
}

export function setupSalesEvents() {
  renderSalesTable();

  document.getElementById('searchSales').oninput = renderSalesTable;
  document.getElementById('filterMarketplace').onchange = renderSalesTable;

  document
    .getElementById('addSaleBtn')
    ?.addEventListener('click', openAddSaleModal);

  document
    .getElementById('exportSalesBtn')
    ?.addEventListener('click', exportSalesCSV);
}