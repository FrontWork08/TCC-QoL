/* VitaIA — endpoint serverless seguro para Vercel usando Gemini */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no ambiente.' });

  try {
    const { system, prompt, history, imageData, max_tokens } = req.body || {};

    const contents = [];
    if (Array.isArray(history) && history.length) {
      for (const m of history) {
        if (!m?.content) continue;
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(m.content) }]
        });
      }
    } else if (prompt) {
      const parts = [];
      if (imageData) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageData } });
      }
      parts.push({ text: String(prompt) });
      contents.push({ role: 'user', parts });
    } else {
      return res.status(400).json({ error: 'Envie prompt ou history.' });
    }

    const body = {
      contents,
      generationConfig: {
        maxOutputTokens: Math.min(Number(max_tokens) || 1024, 2048),
        temperature: 0.7
      }
    };

    if (system) {
      body.systemInstruction = { parts: [{ text: String(system) }] };
    }

    const model = 'gemini-2.5-flash';
    const googleRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(body)
      }
    );

    const data = await googleRes.json();
    if (!googleRes.ok || data.error) {
      return res.status(googleRes.status || 500).json({
        error: data.error?.message || 'Erro ao consultar o Gemini.'
      });
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text = parts.map(p => p.text || '').join('').trim();

    if (!text) {
      return res.status(502).json({ error: 'O Gemini não retornou texto nesta resposta.' });
    }

    return res.status(200).json({ text, provider: 'gemini' });
  } catch (error) {
    console.error('api/ai:', error);
    return res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
  }
}
