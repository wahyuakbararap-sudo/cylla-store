import './style.css';

import { login, currentUser } from './auth/auth.js';
import { renderLayout } from './components/layout.js';
import { DashboardPage, setupDashboardEvents, } from './pages/dashboard.js';
import { SalesPage, setupSalesEvents } from './pages/sales.js';
import { StockPage, setupStockEvents } from './pages/stock.js';
import { FinancePage, setupFinanceEvents, } from './pages/finance.js';
import { StrategyPage, setupStrategyEvents, } from './pages/strategy.js';

const app = document.getElementById('app');

function renderPage(page = 'dashboard') {
  let content = '';

  if (page === 'sales') content = SalesPage();
  else if (page === 'stock') content = StockPage();
  else if (page === 'finance') content = FinancePage();
  else if (page === 'strategy') content = StrategyPage();
  else content = DashboardPage();

  renderLayout(app, content, page, () => renderPage(page));
  setupNavigation();

  if (page === 'dashboard') setupDashboardEvents();
  if (page === 'sales') setupSalesEvents();
  if (page === 'stock') setupStockEvents();
  if (page === 'finance') setupFinanceEvents();
  if (page === 'strategy') setupStrategyEvents();
}

function setupNavigation() {
  document.querySelectorAll('[data-page]').forEach((button) => {
    button.onclick = () => {
      renderPage(button.dataset.page);
    };
  });
}

function renderLogin() {
  app.innerHTML = `
    <div class="login-page">
      <div class="login-box">
        <div class="login-logo">C</div>

        <h1>Cylla.Store</h1>
        <p>Masuk ke dashboard monitoring toko.</p>

        <label>Email</label>
        <input id="email" placeholder="Masukkan email" autocomplete="off" />

        <label>Password</label>
        <input id="password" type="password" placeholder="Masukkan password" />

        <button id="loginBtn">Masuk</button>

        <small id="error"></small>
      </div>
    </div>
  `;

  document.getElementById('loginBtn').onclick = () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    const user = login(email, password);

    if (!user) {
      document.getElementById('error').innerText = 'Email atau password salah.';
      return;
    }

    renderPage('dashboard');
  };
}

if (currentUser()) {
  renderPage('dashboard');
} else {
  renderLogin();
}