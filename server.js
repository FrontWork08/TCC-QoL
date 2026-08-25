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

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

app.post('/api/ai', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada. Crie um arquivo .env com essa variável.' });
  }

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
      if (imageData) parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageData } });
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
    if (system) body.systemInstruction = { parts: [{ text: String(system) }] };

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
      return res.status(googleRes.status || 500).json({ error: data.error?.message || 'Erro ao consultar o Gemini.' });
    }

    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map(p => p.text || '')
      .join('')
      .trim();

    if (!text) return res.status(502).json({ error: 'O Gemini não retornou texto nesta resposta.' });
    return res.json({ text, provider: 'gemini' });
  } catch (err) {
    console.error('Gemini:', err);
    return res.status(500).json({ error: 'Erro inesperado no servidor: ' + err.message });
  }
});

app.listen(PORT, () => console.log(`✅ VitaIA rodando em http://localhost:${PORT}`));
