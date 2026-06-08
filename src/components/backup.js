import { showToast } from './toast.js';

export function exportBackup() {
  const data = {
    sales: JSON.parse(localStorage.getItem('cylla_sales') || '[]'),
    stocks: JSON.parse(localStorage.getItem('cylla_stocks') || '[]'),
    finance: JSON.parse(localStorage.getItem('cylla_finance') || '{}'),
    plan: localStorage.getItem('cylla_plan') || '',
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `cylla-backup-${Date.now()}.json`;
  a.click();

  showToast('Backup berhasil didownload');
}

export function importBackup(file, refresh) {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);

      localStorage.setItem('cylla_sales', JSON.stringify(data.sales || []));
      localStorage.setItem('cylla_stocks', JSON.stringify(data.stocks || []));
      localStorage.setItem('cylla_finance', JSON.stringify(data.finance || {}));
      localStorage.setItem('cylla_plan', data.plan || '');

      showToast('Backup berhasil direstore');
      refresh();
    } catch {
      showToast('File backup rusak / salah', 'error');
    }
  };

  reader.readAsText(file);
}