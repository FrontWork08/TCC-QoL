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
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 30;
const rateBuckets = new Map();

app.disable('x-powered-by');
app.use(express.json({ limit: '6mb' }));
app.use(express.static(__dirname));

app.get('/api/ai/status', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ ok: true, provider: 'gemini', model: GEMINI_MODEL, keyConfigured: Boolean(process.env.GEMINI_API_KEY) });
});

app.post('/api/ai', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  const now = Date.now();
  const ip = req.ip || 'local';
  const bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.startedAt >= RATE_WINDOW_MS) {
    rateBuckets.set(ip, { startedAt: now, count: 1 });
  } else {
    bucket.count += 1;
    if (bucket.count > RATE_MAX_REQUESTS) {
      res.setHeader('Retry-After', '60');
      return res.status(429).json({ error: 'Muitas solicitações. Aguarde um minuto e tente novamente.' });
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Gemini: GEMINI_API_KEY não encontrada no .env');
    return res.status(503).json({ error: 'GEMINI_API_KEY não configurada. Verifique o arquivo .env e reinicie o servidor.' });
  }

  try {
    const { system, prompt, history, imageData, max_tokens } = req.body || {};

    if (typeof system === 'string' && system.length > 8_000) return res.status(413).json({ error: 'System prompt muito longo.' });
    if (typeof prompt === 'string' && prompt.length > 12_000) return res.status(413).json({ error: 'Mensagem muito longa.' });
    if (imageData && String(imageData).length > 4_000_000) return res.status(413).json({ error: 'Imagem muito grande.' });
    if (history && !Array.isArray(history)) return res.status(400).json({ error: 'Histórico inválido.' });
    if (Array.isArray(history) && history.length > 40) return res.status(413).json({ error: 'Histórico de conversa muito longo.' });

    const contents = [];
    let totalHistoryChars = 0;

    if (Array.isArray(history) && history.length) {
      for (const m of history) {
        if (!m?.content) continue;
        const content = String(m.content);
        totalHistoryChars += content.length;
        if (totalHistoryChars > 30_000) return res.status(413).json({ error: 'Histórico de conversa muito longo.' });
        contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: content }] });
      }
    } else if (prompt) {
      const parts = [];
      if (imageData) parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageData } });
      parts.push({ text: String(prompt) });
      contents.push({ role: 'user', parts });
    } else {
      return res.status(400).json({ error: 'Envie prompt ou history.' });
    }

    const requestedTokens = Number(max_tokens) || 1024;
    const body = {
      contents,
      generationConfig: { maxOutputTokens: Math.max(64, Math.min(requestedTokens, 1536)) }
    };
    if (system) body.systemInstruction = { parts: [{ text: String(system) }] };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18_000);

    let googleRes;
    try {
      googleRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey.trim() },
        body: JSON.stringify(body),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    const data = await googleRes.json().catch(() => ({}));
    if (!googleRes.ok || data.error) {
      console.error('Gemini API error:', googleRes.status, data.error?.message || 'erro sem mensagem');
      return res.status(googleRes.status === 429 ? 429 : 502).json({
        error: googleRes.status === 429
          ? 'Limite temporário da IA atingido. Tente novamente em instantes.'
          : 'Não foi possível consultar a IA agora. Tente novamente.'
      });
    }

    const text = (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
    if (!text) return res.status(502).json({ error: 'A IA não retornou texto nesta resposta.' });

    console.log(`Gemini (${GEMINI_MODEL}): resposta gerada com sucesso.`);
    return res.json({ text, provider: 'gemini', model: GEMINI_MODEL });
  } catch (err) {
    if (err?.name === 'AbortError') return res.status(504).json({ error: 'A IA demorou demais para responder. Tente novamente.' });
    console.error('Gemini unexpected error:', err);
    return res.status(500).json({ error: 'Erro inesperado no servidor.' });
  }
});

app.listen(PORT, () => console.log(`✅ VitaIA rodando em http://localhost:${PORT} — Gemini: ${GEMINI_MODEL}`));
