import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  try {
    const { sales, stocks, finance, target } = req.body;

    const response = await client.responses.create({
      model: 'gpt-5.5',
      input: `
Kamu adalah analis bisnis untuk dashboard toko online bernama Cylla Store.

Analisa data berikut dan jawab dalam Bahasa Indonesia yang praktis, singkat, dan actionable.

Jangan terlalu generik.
Fokus ke:
1. Ringkasan kondisi toko
2. Produk yang performanya bagus
3. Produk yang perlu perhatian
4. Risiko stok
5. Risiko keuangan / margin
6. Rekomendasi tindakan 3 langkah

Data penjualan:
${JSON.stringify(sales, null, 2)}

Data stok:
${JSON.stringify(stocks, null, 2)}

Data keuangan:
${JSON.stringify(finance, null, 2)}

Target bulanan:
${target}

Format jawaban:
## Ringkasan
...

## Yang Bagus
...

## Yang Perlu Diperbaiki
...

## Risiko
...

## Rekomendasi 3 Langkah
1. ...
2. ...
3. ...
      `,
    });

    return res.status(200).json({
      analysis: response.output_text,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'AI analysis failed',
    });
  }
}