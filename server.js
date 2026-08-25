/* ═══════════════════════════════════════════
   VitaIA — Servidor Express local
   Uso: npm start
   Serve o site e o endpoint seguro /api/ai usando Gemini.
═══════════════════════════════════════════ */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

app.get('/api/ai/status', (req, res) => {
  res.json({ ok: true, provider: 'gemini', model: GEMINI_MODEL, keyConfigured: Boolean(process.env.GEMINI_API_KEY) });
});

app.post('/api/ai', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Gemini: GEMINI_API_KEY não encontrada no .env');
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada. Verifique o arquivo .env e reinicie o servidor.' });
  }

  try {
    const { system, prompt, history, imageData, max_tokens } = req.body || {};
    const contents = [];

    if (Array.isArray(history) && history.length) {
      for (const m of history) {
        if (!m?.content) continue;
        contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(m.content) }] });
      }
    } else if (prompt) {
      const parts = [];
      if (imageData) parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageData } });
      parts.push({ text: String(prompt) });
      contents.push({ role: 'user', parts });
    } else {
      return res.status(400).json({ error: 'Envie prompt ou history.' });
    }

    const body = { contents, generationConfig: { maxOutputTokens: Math.min(Number(max_tokens) || 1024, 2048) } };
    if (system) body.systemInstruction = { parts: [{ text: String(system) }] };

    const googleRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey.trim() },
      body: JSON.stringify(body)
    });

    const data = await googleRes.json().catch(() => ({}));
    if (!googleRes.ok || data.error) {
      const message = data.error?.message || `HTTP ${googleRes.status} ao consultar o Gemini.`;
      console.error('Gemini API error:', googleRes.status, message);
      return res.status(googleRes.status || 500).json({ error: message });
    }

    const text = (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
    if (!text) {
      console.error('Gemini: resposta sem texto', JSON.stringify(data));
      return res.status(502).json({ error: 'O Gemini não retornou texto nesta resposta.' });
    }

    console.log(`Gemini (${GEMINI_MODEL}): resposta gerada com sucesso.`);
    return res.json({ text, provider: 'gemini', model: GEMINI_MODEL });
  } catch (err) {
    console.error('Gemini unexpected error:', err);
    return res.status(500).json({ error: 'Erro inesperado no servidor: ' + err.message });
  }
});

app.listen(PORT, () => console.log(`✅ VitaIA rodando em http://localhost:${PORT} — Gemini: ${GEMINI_MODEL}`));
