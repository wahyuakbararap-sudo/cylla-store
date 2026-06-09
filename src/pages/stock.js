import { getStocks, saveStocks, addLog } from '../data/storage.js';
import { isAdmin } from '../auth/auth.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

function getStockLeft(item) {
  return Number(item.initial) + Number(item.incoming) - Number(item.sold);
}

function getStockStatus(left) {
  if (left <= 0) return 'Habis';
  if (left < 10) return 'Menipis';
  return 'Aman';
}

function getBadgeClass(status) {
  if (status === 'Aman') return 'green';
  if (status === 'Menipis') return 'yellow';
  return 'red';
}

export function StockPage() {
  return `
    <div class="card">
      <div class="sales-header">
        <h2>Manajemen Stok</h2>
        ${isAdmin() ? `<button id="addStockBtn">Tambah Produk</button>` : ''}
      </div>

      <div class="filter-row">
        <input id="searchStock" placeholder="Cari nama produk..." />
        <select id="filterStockStatus">
          <option value="all">Semua Status</option>
          <option value="Aman">Aman</option>
          <option value="Menipis">Menipis</option>
          <option value="Habis">Habis</option>
        </select>
      </div>

      <div id="stockTable"></div>
    </div>

    <div class="card">
      <h3>Panel Produk Bermasalah</h3>
      <div id="stockAlertPanel"></div>
    </div>
  `;
}

function renderStockTable() {
  const keyword = document.getElementById('searchStock')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('filterStockStatus')?.value || 'all';

  const filtered = getStocks().filter((item) => {
    const left = getStockLeft(item);
    const status = getStockStatus(left);

    return item.product.toLowerCase().includes(keyword)
      && (statusFilter === 'all' || status === statusFilter);
  });

  if (!filtered.length) {
    document.getElementById('stockTable').innerHTML = `
      <div class="empty-state">Belum ada stok yang cocok.</div>
    `;
    renderStockAlertPanel();
    return;
  }

  document.getElementById('stockTable').innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Produk</th>
          <th>Awal</th>
          <th>Masuk</th>openStockModal()
          <th>Terjual</th>
          <th>Sisa</th>
          <th>Status</th>
          ${isAdmin() ? '<th>Aksi</th>' : ''}
        </tr>
      </thead>
      <tbody>
        ${filtered.map((item) => {
          const left = getStockLeft(item);
          const status = getStockStatus(left);

          return `
            <tr>
              <td>${item.product}</td>
              <td>${item.initial}</td>
              <td>${item.incoming}</td>
              <td>${item.sold}</td>
              <td>${left}</td>
              <td><span class="badge ${getBadgeClass(status)}">${status}</span></td>
              ${isAdmin() ? `
                <td>
                  <button class="soft edit-stock" data-id="${item.id}">Edit</button>
                  <button class="danger delete-stock" data-id="${item.id}">Hapus</button>
                </td>
              ` : ''}
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;

  setupStockButtons();
  renderStockAlertPanel();
}

function renderStockAlertPanel() {
  const problem = getStocks().filter((item) => getStockLeft(item) < 10);

  if (!problem.length) {
    document.getElementById('stockAlertPanel').innerHTML = `
      <p class="muted">Semua stok aman.</p>
    `;
    return;
  }

  document.getElementById('stockAlertPanel').innerHTML = `
    <div class="alert-list">
      ${problem.map((item) => {
        const left = getStockLeft(item);
        const status = getStockStatus(left);

        return `
          <div class="alert-item">
            <div>
              <strong>${item.product}</strong>
              <p class="muted">Sisa stok: ${left}</p>
            </div>
            <span class="badge ${getBadgeClass(status)}">${status}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function openStockModal(item = null) {
  const isEdit = Boolean(item);

  openModal(
    isEdit ? 'Edit Stok' : 'Tambah Produk',
    `
      <label>Nama Produk</label>
      <input id="stockProduct" value="${item?.product || ''}" placeholder="Contoh: Canva Pro" />

      <label>Stok Awal</label>
      <input id="stockInitial" type="number" value="${item?.initial || 0}" />

      <label>Stok Masuk</label>
      <input id="stockIncoming" type="number" value="${item?.incoming || 0}" />

      <label>Terjual</label>
      <input id="stockSold" type="number" value="${item?.sold || 0}" />
    `,
    () => {
      const product = document.getElementById('stockProduct').value.trim();
      const initial = Number(document.getElementById('stockInitial').value);
      const incoming = Number(document.getElementById('stockIncoming').value);
      const sold = Number(document.getElementById('stockSold').value);

      if (!product) {
        showToast('Nama produk wajib diisi', 'error');
        return;
      }

      let stocks = getStocks();

      if (isEdit) {
        stocks = stocks.map((stock) =>
          stock.id === item.id
            ? { ...stock, product, initial, incoming, sold }
            : stock
        );
      } else {
        stocks.push({
          id: Date.now(),
          product,
          initial,
          incoming,
          sold,
        });
      }

      saveStocks(stocks);

if (isEdit) {
  addLog(`Mengedit stok ${product}`);
} else {
  addLog(`Menambah stok ${product}`);
}

closeModal();
showToast(isEdit ? 'Stok berhasil diupdate' : 'Produk berhasil ditambah');
renderStockTable();
    }
  );
}

function setupStockButtons() {
  document.querySelectorAll('.delete-stock').forEach((btn) => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      saveStocks(getStocks().filter((item) => item.id !== id));
addLog('Menghapus data stok');
showToast('Produk berhasil dihapus');
renderStockTable();
    };
  });

  document.querySelectorAll('.edit-stock').forEach((btn) => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      const item = getStocks().find((stock) => stock.id === id);
      openStockModal(item);
    };
  });
}

export function setupStockEvents() {
  renderStockTable();

  document.getElementById('searchStock').oninput = renderStockTable;
  document.getElementById('filterStockStatus').onchange = renderStockTable;

  document.getElementById('addStockBtn')?.addEventListener('click', () => {
    openStockModal();
  });
}