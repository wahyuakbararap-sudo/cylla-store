import { SEED_SALES, SEED_STOCKS } from './seed.js';

export function getSales() {
  const data = localStorage.getItem('cylla_sales');

  if (!data) {
    localStorage.setItem('cylla_sales', JSON.stringify(SEED_SALES));
    return SEED_SALES;
  }

  return JSON.parse(data);
}

export function saveSales(data) {
  localStorage.setItem('cylla_sales', JSON.stringify(data));
}

export function getStocks() {
  const data = localStorage.getItem('cylla_stocks');

  if (!data) {
    localStorage.setItem('cylla_stocks', JSON.stringify(SEED_STOCKS));
    return SEED_STOCKS;
  }

  return JSON.parse(data);
}

export function saveStocks(data) {
  localStorage.setItem('cylla_stocks', JSON.stringify(data));
}

export function getSession() {
  return JSON.parse(localStorage.getItem('cylla_session'));
}

export function saveSession(user) {
  localStorage.setItem('cylla_session', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('cylla_session');
}

export function getFinance() {
  const data = localStorage.getItem('cylla_finance');

  if (!data) {
    const seed = {
      ads: 0,
      fee: 0,
      shipping: 0,
      other: 0,
    };

    localStorage.setItem(
      'cylla_finance',
      JSON.stringify(seed)
    );

    return seed;
  }

  return JSON.parse(data);
}

export function saveFinance(data) {
  localStorage.setItem(
    'cylla_finance',
    JSON.stringify(data)
  );
}

export function getTarget() {
  return Number(localStorage.getItem('cylla_target') || 1000000);
}

export function saveTarget(value) {
  localStorage.setItem('cylla_target', Number(value || 0));
}

export function getLogs() {
  return JSON.parse(localStorage.getItem('cylla_logs') || '[]');
}

export function addLog(text) {
  const logs = getLogs();

  logs.unshift({
    id: Date.now(),
    text,
    date: new Date().toLocaleString('id-ID'),
  });

  localStorage.setItem('cylla_logs', JSON.stringify(logs.slice(0, 50)));
}