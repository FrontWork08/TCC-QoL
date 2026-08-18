/* ═══════════════════════════════════════════
   VitaIA — Proxy seguro para a API da Anthropic
   Roda como Vercel Serverless Function.
   A chave da API NUNCA fica exposta no navegador —
   ela vive apenas na variável de ambiente do servidor.
═══════════════════════════════════════════ */

export default async function handler(req, res) {
  // CORS básico (ajuste o domínio em produção se quiser travar mais)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY não configurada no servidor. Configure a variável de ambiente no Vercel/Netlify.'
    });
  }

  try {
    const { system, prompt, history, imageData, model, max_tokens } = req.body || {};

    // Monta a lista de mensagens no formato da API da Anthropic
    let messages = [];
    if (Array.isArray(history) && history.length) {
      messages = history.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));
    } else if (prompt) {
      if (imageData) {
        messages = [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageData } },
            { type: 'text', text: prompt }
          ]
        }];
      } else {
        messages = [{ role: 'user', content: prompt }];
      }
    } else {
      return res.status(400).json({ error: 'Envie "prompt" ou "history".' });
    }

    const body = {
      model: model || 'claude-haiku-4-5-20251001',
      max_tokens: max_tokens || 1024,
      messages
    };
    if (system) body.system = system;

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok || data.error) {
      return res.status(anthropicRes.status || 500).json({
        error: data.error?.message || 'Erro ao consultar a IA.'
      });
    }

    const text = data.content?.find(b => b.type === 'text')?.text || '';
    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: 'Erro inesperado no servidor: ' + err.message });
  }
}
