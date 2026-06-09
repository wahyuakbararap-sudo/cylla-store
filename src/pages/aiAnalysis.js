import {
  getSales,
  getStocks,
  getFinance,
  getTarget,
} from '../data/storage.js';

import { showToast } from '../components/toast.js';

export function AIAnalysisPage() {
  return `
    <div class="card">
      <h2>AI Business Analyst</h2>
      <p class="muted">
        AI akan membaca penjualan, stok, keuangan, dan target untuk memberi masukan bisnis.
      </p>

      <button id="generateAnalysisBtn">
        Generate Analysis
      </button>
    </div>

    <div class="card">
      <h2>Hasil Analisa</h2>
      <div id="aiResult" class="ai-result empty-state">
        Belum ada analisa. Klik Generate Analysis.
      </div>
    </div>
  `;
}

export function setupAIAnalysisEvents() {
  document.getElementById('generateAnalysisBtn')?.addEventListener('click', async () => {
    const resultBox = document.getElementById('aiResult');
    const btn = document.getElementById('generateAnalysisBtn');

    btn.disabled = true;
    btn.innerText = 'Menganalisa...';

    resultBox.className = 'ai-result';
    resultBox.innerHTML = 'AI sedang membaca data toko...';

    try {
      const response = await fetch('/api/ai-analysis', {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal generate analysis');
      }

      resultBox.innerHTML = formatAIText(data.analysis);
      showToast('Analisa berhasil dibuat');
    } catch (error) {
      resultBox.innerHTML = `
        <div class="empty-state">
          ${error.message}
        </div>
      `;

      showToast('AI analysis gagal', 'error');
    } finally {
      btn.disabled = false;
      btn.innerText = 'Generate Analysis';
    }
  });
}

function formatAIText(text) {
  return text
    .replaceAll('## ', '<h3>')
    .replaceAll('\n\n', '</p><p>')
    .replaceAll('\n', '<br>')
    .replace('<h3>', '<h3>')
    .replaceAll('<h3>', '</p><h3>')
    .replace(/^<\/p>/, '');
}