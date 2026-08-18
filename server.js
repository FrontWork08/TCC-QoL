/* ═══════════════════════════════════════════
   VitaIA — Servidor Express (alternativa ao Vercel)
   Uso: node server.js
   Serve os arquivos estáticos do site E o endpoint
   seguro /api/ai que fala com a Anthropic guardando
   a chave apenas no servidor.
═══════════════════════════════════════════ */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' })); // 10mb para permitir fotos em base64
app.use(express.static(__dirname));

app.post('/api/ai', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada. Crie um arquivo .env com essa variável.' });
  }

  try {
    const { system, prompt, history, imageData, model, max_tokens } = req.body || {};

    let messages = [];
    if (Array.isArray(history) && history.length) {
      messages = history.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
    } else if (prompt) {
      messages = imageData
        ? [{ role: 'user', content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageData } },
            { type: 'text', text: prompt }
          ]}]
        : [{ role: 'user', content: prompt }];
    } else {
      return res.status(400).json({ error: 'Envie "prompt" ou "history".' });
    }

    const body = { model: model || 'claude-haiku-4-5-20251001', max_tokens: max_tokens || 1024, messages };
    if (system) body.system = system;

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(body)
    });
    const data = await anthropicRes.json();
    if (!anthropicRes.ok || data.error) {
      return res.status(anthropicRes.status || 500).json({ error: data.error?.message || 'Erro ao consultar a IA.' });
    }
    const text = data.content?.find(b => b.type === 'text')?.text || '';
    return res.json({ text });
  } catch (err) {
    return res.status(500).json({ error: 'Erro inesperado no servidor: ' + err.message });
  }
});

app.listen(PORT, () => console.log(`✅ VitaIA rodando em http://localhost:${PORT}`));
