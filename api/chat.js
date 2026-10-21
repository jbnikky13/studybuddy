// Vercel serverless function. Configure OPENROUTER_API_KEY in Vercel Project Settings.
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const requestsByIp = new Map();

function send(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'Method not allowed.' });
  }

  const configuredOrigin = process.env.APP_ORIGIN;
  const origin = req.headers.origin;
  if (configuredOrigin && origin && origin !== configuredOrigin) {
    return send(res, 403, { error: 'Origin not allowed.' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const prior = requestsByIp.get(ip);
  if (!prior || now - prior.start >= WINDOW_MS) {
    requestsByIp.set(ip, { start: now, count: 1 });
  } else if (prior.count >= MAX_REQUESTS_PER_WINDOW) {
    res.setHeader('Retry-After', '60');
    return send(res, 429, { error: 'Too many requests. Please wait a minute and try again.' });
  } else {
    prior.count += 1;
  }

  const { system, user, maxTokens } = req.body || {};
  if (typeof system !== 'string' || typeof user !== 'string' ||
      !system.trim() || !user.trim() || system.length > 6000 || user.length > 12000) {
    return send(res, 400, { error: 'A valid question and study instruction are required.' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return send(res, 503, { error: 'AI is not configured yet. Add OPENROUTER_API_KEY in Vercel Project Settings.' });
  }

  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_ORIGIN || 'https://studybuddy.vercel.app',
        'X-Title': 'StudyBuddy Pharmacy'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1-0528:free',
        max_tokens: Number.isInteger(maxTokens) ? Math.max(100, Math.min(maxTokens, 2000)) : 1000,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      })
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const status = upstream.status === 429 ? 429 : 502;
      return send(res, status, {
        error: upstream.status === 429
          ? 'The AI provider is busy or rate-limited. Please retry shortly.'
          : 'The AI provider could not complete the request.'
      });
    }
    const answer = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (typeof answer !== 'string' || !answer.trim()) {
      return send(res, 502, { error: 'The AI provider returned no answer.' });
    }
    return send(res, 200, { answer });
  } catch (error) {
    return send(res, 502, { error: 'Unable to reach the AI provider. Please retry shortly.' });
  }
};
