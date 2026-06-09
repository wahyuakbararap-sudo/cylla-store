import {
  getTarget,
  saveTarget,
} from '../data/storage.js';

import {
  exportBackup,
  importBackup,
} from '../components/backup.js';

import { showToast } from '../components/toast.js';

export function SettingsPage() {
  const target = getTarget();

  return `
    <div class="card">
      <h2>Settings</h2>
      <p class="muted">Kelola tema, target bulanan, backup, dan reset data.</p>
    </div>

    <div class="grid two">
      <div class="card">
        <h2>Tampilan</h2>

        <button id="toggleDarkBtn" class="soft">
          Toggle Dark Mode
        </button>
      </div>

      <div class="card">
        <h2>Target Bulanan</h2>

        <label>Target Omzet</label>
        <input id="targetSettingInput" type="number" value="${target}" />

        <button id="saveTargetSettingBtn" style="margin-top:12px">
          Simpan Target
        </button>
      </div>
    </div>

    <div class="grid two">
      <div class="card">
        <h2>Backup Data</h2>
        <p class="muted">Download semua data lokal menjadi file JSON.</p>

        <button id="backupSettingBtn">
          Download Backup
        </button>
      </div>

      <div class="card">
        <h2>Restore Data</h2>
        <p class="muted">Upload file backup JSON untuk mengembalikan data.</p>

        <input id="restoreSettingFile" type="file" accept="application/json" />
      </div>
    </div>

    <div class="card">
      <h2>Danger Zone</h2>
      <p class="muted">Reset semua data localStorage. Gunakan dengan hati-hati.</p>

      <button id="resetDataBtn" class="danger">
        Reset Semua Data
      </button>
    </div>
  `;
}

export function setupSettingsEvents(refresh) {
  document.getElementById('toggleDarkBtn')?.addEventListener('click', () => {
    document.body.classList.toggle('dark');

    localStorage.setItem(
      'cylla_dark',
      document.body.classList.contains('dark') ? 'yes' : 'no'
    );

    showToast('Tema berhasil diganti');
  });

  document.getElementById('saveTargetSettingBtn')?.addEventListener('click', () => {
    const value = Number(document.getElementById('targetSettingInput').value || 0);

    saveTarget(value);
    showToast('Target berhasil disimpan');
  });

  document.getElementById('backupSettingBtn')?.addEventListener('click', exportBackup);

  document.getElementById('restoreSettingFile')?.addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (file) {
      importBackup(file, refresh);
    }
  });

  document.getElementById('resetDataBtn')?.addEventListener('click', () => {
    const ok = confirm('Yakin reset semua data?');

    if (!ok) return;

    localStorage.removeItem('cylla_sales');
    localStorage.removeItem('cylla_stocks');
    localStorage.removeItem('cylla_finance');
    localStorage.removeItem('cylla_plan');
    localStorage.removeItem('cylla_logs');
    localStorage.removeItem('cylla_target');

    showToast('Semua data berhasil direset');
    setTimeout(() => location.reload(), 600);
  });
}