/* VitaIA — endpoint serverless seguro para Vercel usando Gemini */

const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 20;
const rateBuckets = new Map();

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(req) {
  const now = Date.now();
  const ip = clientIp(req);
  const bucket = rateBuckets.get(ip);

  if (!bucket || now - bucket.startedAt >= RATE_WINDOW_MS) {
    rateBuckets.set(ip, { startedAt: now, count: 1 });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_MAX_REQUESTS;
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // chamadas sem Origin (ex.: testes/health tooling)
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

function textSize(value) {
  return typeof value === 'string' ? value.length : 0;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (!sameOrigin(req)) {
    return res.status(403).json({ error: 'Origem não autorizada.' });
  }

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  if (isRateLimited(req)) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ error: 'Muitas solicitações. Aguarde um minuto e tente novamente.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  if (!apiKey) return res.status(503).json({ error: 'Serviço de IA temporariamente indisponível.' });

  try {
    const { system, prompt, history, imageData, max_tokens } = req.body || {};

    if (textSize(system) > 8_000 || textSize(prompt) > 12_000) {
      return res.status(413).json({ error: 'Mensagem muito longa.' });
    }
    if (imageData && textSize(imageData) > 4_000_000) {
      return res.status(413).json({ error: 'Imagem muito grande.' });
    }
    if (history && !Array.isArray(history)) {
      return res.status(400).json({ error: 'Histórico inválido.' });
    }
    if (Array.isArray(history) && history.length > 40) {
      return res.status(413).json({ error: 'Histórico de conversa muito longo.' });
    }

    const contents = [];
    let totalHistoryChars = 0;

    if (Array.isArray(history) && history.length) {
      for (const m of history) {
        if (!m?.content) continue;
        const content = String(m.content);
        totalHistoryChars += content.length;
        if (totalHistoryChars > 30_000) {
          return res.status(413).json({ error: 'Histórico de conversa muito longo.' });
        }
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: content }]
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

    const requestedTokens = Number(max_tokens) || 1024;
    const body = {
      contents,
      generationConfig: {
        maxOutputTokens: Math.max(64, Math.min(requestedTokens, 1536))
      }
    };
    if (system) body.systemInstruction = { parts: [{ text: String(system) }] };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18_000);

    let googleRes;
    try {
      googleRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey.trim()
          },
          body: JSON.stringify(body),
          signal: controller.signal
        }
      );
    } finally {
      clearTimeout(timeout);
    }

    const data = await googleRes.json().catch(() => ({}));
    if (!googleRes.ok || data.error) {
      const status = googleRes.status === 429 ? 429 : 502;
      console.error('Gemini API:', googleRes.status, data.error?.message || 'erro sem mensagem');
      return res.status(status).json({
        error: status === 429
          ? 'Limite temporário da IA atingido. Tente novamente em instantes.'
          : 'Não foi possível consultar a IA agora. Tente novamente.'
      });
    }

    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || '')
      .join('')
      .trim();

    if (!text) return res.status(502).json({ error: 'A IA não retornou texto nesta resposta.' });

    return res.status(200).json({ text, provider: 'gemini', model });
  } catch (error) {
    if (error?.name === 'AbortError') {
      return res.status(504).json({ error: 'A IA demorou demais para responder. Tente novamente.' });
    }
    console.error('api/ai:', error);
    return res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
  }
}
