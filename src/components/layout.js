import { logout, currentUser } from '../auth/auth.js';
import { exportBackup, importBackup } from './backup.js';
import { showToast } from './toast.js';
import { connectShopee } from '../services/shopee.js';

export function renderLayout(app, pageContent, activePage = 'dashboard', refreshPage) {
  const user = currentUser();

  const navs = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'sales', icon: '📦', label: 'Penjualan' },
    { id: 'stock', icon: '🏪', label: 'Stok' },
    { id: 'finance', icon: '💰', label: 'Keuangan' },
    { id: 'strategy', icon: '💡', label: 'Strategi' },
    { id: 'integration', icon: '🔌', label: 'Integrasi' },
  ];

  const title = navs.find((item) => item.id === activePage)?.label || 'Dashboard';

  app.innerHTML = `
    <aside class="sidebar">
      <div class="brand">🛒 <span>Cylla.Store</span></div>

      ${navs.map((item) => `
        <button class="nav ${activePage === item.id ? 'active' : ''}" data-page="${item.id}">
          ${item.icon} <span>${item.label}</span>
        </button>
      `).join('')}
    </aside>

    <main class="main">
      <header class="topbar">
        <div>
          <h2>${title}</h2>
          <p>${user.name} - ${user.role.toUpperCase()}</p>
        </div>

        <div class="top-actions">
          <button id="darkBtn" class="soft">🌙</button>
          <button id="backupBtn" class="soft">Backup</button>
          <label class="import-btn">
            Import
            <input id="importFile" type="file" accept="application/json" hidden />
          </label>
          <button id="shopeeBtn" class="soft">Shopee</button>
          <button id="logoutBtn" class="danger">Logout</button>
        </div>
      </header>

      <section id="page">${pageContent}</section>
    </main>
  `;

  document.getElementById('logoutBtn').onclick = logout;
  document.getElementById('backupBtn').onclick = exportBackup;
  document.getElementById('shopeeBtn').onclick = connectShopee;

  document.getElementById('darkBtn').onclick = () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('cylla_dark', document.body.classList.contains('dark') ? 'yes' : 'no');
    showToast('Tema berhasil diganti');
  };

  document.getElementById('importFile').onchange = (e) => {
    const file = e.target.files[0];
    if (file) importBackup(file, refreshPage);
  };
}