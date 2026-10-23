const crypto = require('node:crypto');

function verifyInitData(initData, botToken) {
  if (typeof initData !== 'string' || !initData || initData.length > 8192) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash || !/^[a-f0-9]{64}$/i.test(hash)) return null;
  params.delete('hash');
  const pairs = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const checkString = pairs.map(([key, value]) => key + '=' + value).join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expected = crypto.createHmac('sha256', secret).update(checkString).digest();
  const supplied = Buffer.from(hash, 'hex');
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return null;
  const authDate = Number(params.get('auth_date'));
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(authDate) || authDate > now + 60 || now - authDate > 86400) return null;
  try {
    const user = JSON.parse(params.get('user') || '{}');
    if (!Number.isSafeInteger(Number(user.id)) || Number(user.id) <= 0) return null;
    return { id: String(user.id), firstName: String(user.first_name || 'Learner').slice(0, 100), username: String(user.username || '').slice(0, 100) };
  } catch { return null; }
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST.' });
  }
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!botToken || !supabaseUrl || !serviceKey) return res.status(503).json({ error: 'Progress sync is not configured on the server.' });
  const body = req.body || {};
  const identity = verifyInitData(body.initData, botToken);
  if (!identity) return res.status(401).json({ error: 'Open this app from the official Telegram Mini App button and try again.' });
  const base = supabaseUrl.replace(/\/$/, '') + '/rest/v1/telegram_miniapp_progress';
  const headers = { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey, 'Content-Type': 'application/json' };
  try {
    if (body.action === 'load') {
      const response = await fetch(base + '?telegram_user_id=eq.' + encodeURIComponent(identity.id) + '&select=telegram_user_id,seen_question_ids,answered_count,correct_count,history,updated_at&limit=1', { headers });
      if (!response.ok) throw new Error('Database read failed (' + response.status + ').');
      const rows = await response.json();
      return res.status(200).json({ ok: true, progress: rows[0] || null });
    }
    if (body.action !== 'save') return res.status(400).json({ error: 'Unknown action.' });
    const progress = body.progress || {};
    const seen = [...new Set((Array.isArray(progress.seen) ? progress.seen : []).filter(x => typeof x === 'string' && x.length <= 100))].slice(-500);
    const answered = Math.max(0, Math.min(1000000, Math.floor(Number(progress.answered) || 0)));
    const correct = Math.max(0, Math.min(answered, Math.floor(Number(progress.correct) || 0)));
    const history = (Array.isArray(progress.history) ? progress.history : []).filter(x => x && typeof x.id === 'string' && typeof x.correct === 'boolean' && Number.isFinite(Number(x.at))).slice(-500).map(x => ({ id: x.id.slice(0, 100), correct: x.correct, at: Math.floor(Number(x.at)) }));
    const payload = { telegram_user_id: identity.id, username: identity.username || null, first_name: identity.firstName, seen_question_ids: seen, answered_count: answered, correct_count: correct, history, updated_at: new Date().toISOString() };
    const response = await fetch(base + '?on_conflict=telegram_user_id', { method: 'POST', headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error('Database save failed (' + response.status + ').');
    return res.status(200).json({ ok: true, saved: true });
  } catch (error) {
    console.error('Mini App progress sync:', error.message);
    return res.status(502).json({ error: 'Could not sync progress right now.' });
  }
};
