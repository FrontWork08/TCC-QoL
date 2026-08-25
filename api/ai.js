/* VitaIA — endpoint serverless seguro para Vercel */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada no ambiente de produção.' });

  try {
    const { system, prompt, history, imageData, model, max_tokens } = req.body || {};
    let messages = [];

    if (Array.isArray(history) && history.length) {
      messages = history.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));
    } else if (prompt) {
      messages = imageData
        ? [{ role: 'user', content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageData } },
            { type: 'text', text: prompt }
          ] }]
        : [{ role: 'user', content: prompt }];
    } else {
      return res.status(400).json({ error: 'Envie prompt ou history.' });
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-haiku-4-5-20251001',
        max_tokens: Math.min(Number(max_tokens) || 1024, 2048),
        ...(system ? { system } : {}),
        messages
      })
    });

    const data = await anthropicRes.json();
    if (!anthropicRes.ok || data.error) {
      return res.status(anthropicRes.status || 500).json({ error: data.error?.message || 'Erro ao consultar a IA.' });
    }

    const text = data.content?.find(part => part.type === 'text')?.text || '';
    return res.status(200).json({ text });
  } catch (error) {
    console.error('api/ai:', error);
    return res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
  }
}
