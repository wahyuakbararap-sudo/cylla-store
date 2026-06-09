import {
  getSales,
  getStocks,
  getFinance,
  getTarget,
} from '../data/storage.js';

import { showToast } from '../components/toast.js';

export function AIPage() {
  return `
    <div class="dashboard-hero">
      <div>
        <p class="muted">Gemini Business Analyst</p>
        <h1>AI Analyst</h1>
        <span class="hero-badge">Analisa otomatis dari data toko</span>
      </div>

      <div class="target-box">
        <strong>Data yang dianalisa</strong>
        <p style="margin-top:8px">
          Penjualan, stok, keuangan, dan target bulanan.
        </p>
      </div>
    </div>

    <div class="card">
      <h2>Generate Analisa</h2>
      <p class="muted">
        Klik tombol di bawah untuk minta Gemini membaca kondisi toko kamu.
      </p>

      <button id="generateAIButton" style="margin-top:14px">
        Generate AI Analysis
      </button>
    </div>

    <div class="card">
      <h2>Hasil Analisa</h2>
      <div id="aiResult" class="ai-result empty-state">
        Belum ada analisa. Klik Generate AI Analysis.
      </div>
    </div>
  `;
}

export function setupAIEvents() {
  document.getElementById('generateAIButton')?.addEventListener('click', async () => {
    const btn = document.getElementById('generateAIButton');
    const resultBox = document.getElementById('aiResult');

    btn.disabled = true;
    btn.innerText = 'Menganalisa...';

    resultBox.className = 'ai-result';
    resultBox.innerHTML = 'Gemini sedang membaca data toko...';

    try {
      const response = await fetch('/api/gemini-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sales: getSales(),
          stocks: getStocks(),
          finance: getFinance(),
          target: getTarget(),
        }),
      });

      const raw = await response.text();

let data = {};

try {
  data = raw ? JSON.parse(raw) : {};
} catch {
  throw new Error(raw || 'Server tidak mengembalikan JSON.');
}

if (!response.ok) {
  throw new Error(data.error || 'Gagal generate analisa');
}

      if (!response.ok) {
        throw new Error(data.error || 'Gagal generate analisa');
      }

      resultBox.innerHTML = formatAIText(data.analysis);
      showToast('Analisa Gemini berhasil dibuat');
    } catch (error) {
      resultBox.innerHTML = `
        <div class="empty-state">
          ${error.message}
        </div>
      `;

      showToast('AI Analysis gagal', 'error');
    } finally {
      btn.disabled = false;
      btn.innerText = 'Generate AI Analysis';
    }
  });
}

function formatAIText(text) {
  return text
    .replaceAll('## ', '<h3>')
    .replaceAll('\n\n', '</p><p>')
    .replaceAll('\n', '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
    .replaceAll('<p><h3>', '<h3>')
    .replaceAll('</h3></p>', '</h3>');
}