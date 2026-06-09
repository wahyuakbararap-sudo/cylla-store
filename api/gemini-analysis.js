import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  try {
    const { sales, stocks, finance, target } = req.body;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const prompt = `
Kamu adalah analis bisnis untuk dashboard toko online bernama Cylla Store.

Analisa data toko berikut secara praktis, singkat, dan actionable.
Jangan terlalu formal. Gunakan Bahasa Indonesia.

Fokus:
1. Ringkasan kondisi toko
2. Produk paling bagus
3. Produk yang perlu perhatian
4. Risiko stok
5. Risiko keuangan
6. Action plan 3 langkah

Data penjualan:
${JSON.stringify(sales, null, 2)}

Data stok:
${JSON.stringify(stocks, null, 2)}

Data keuangan:
${JSON.stringify(finance, null, 2)}

Target bulanan:
${target}

Format:
## Ringkasan
...

## Yang Bagus
...

## Yang Perlu Diperbaiki
...

## Risiko
...

## Action Plan
1. ...
2. ...
3. ...
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({
      analysis: text,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Gemini analysis failed',
    });
  }
}