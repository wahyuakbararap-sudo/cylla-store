import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY belum terpasang di environment variable.',
      });
    }

    const { sales = [], stocks = [], finance = {}, target = 0 } = req.body || {};

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const prompt = `
Kamu adalah analis bisnis untuk dashboard toko online bernama Cylla Store.

Analisa data berikut secara praktis, singkat, dan actionable.
Gunakan bahasa Indonesia santai tapi profesional.

Data:
Penjualan: ${JSON.stringify(sales)}
Stok: ${JSON.stringify(stocks)}
Keuangan: ${JSON.stringify(finance)}
Target: ${target}

Buat format:
## Ringkasan
## Yang Bagus
## Yang Perlu Diperbaiki
## Risiko
## Action Plan 3 Langkah
`;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    return res.status(200).json({
      analysis,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Gemini analysis failed',
    });
  }
}