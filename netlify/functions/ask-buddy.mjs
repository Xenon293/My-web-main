const attempts = new Map();
const WINDOW = 8 * 60 * 60 * 1000;
const LIMIT = 5;

export default async (request) => {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  const { prompt } = await request.json().catch(() => ({}));
  if (typeof prompt !== 'string' || prompt.trim().length < 2 || prompt.length > 500) return Response.json({ error: 'Please ask a short question.' }, { status: 400 });
  const ip = request.headers.get('x-nf-client-connection-ip') || 'unknown';
  const now = Date.now(); const record = attempts.get(ip) || { count: 0, started: now };
  if (now - record.started >= WINDOW) { record.count = 0; record.started = now; }
  if (record.count >= LIMIT) return Response.json({ error: 'Buddy needs a rest. Try again in 8 hours.' }, { status: 429 });
  if (!process.env.GEMINI_API_KEY) return Response.json({ error: 'Gemini is not configured yet. Use the preset questions for now.' }, { status: 503 });
  record.count += 1; attempts.set(ip, record);
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ systemInstruction: { parts: [{ text: 'You are Buddy, a concise assistant for Haniel Molejon, a first-year IT student from Cebu, Philippines. Answer only about Haniel, this portfolio, his projects, learning goals, or safe web privacy. If unknown, say you do not know. Never claim access to private data, exact location, cookies, passwords, browsing history, or device files. Do not use emojis. Keep answers under 80 words.' }] }, contents: [{ role: 'user', parts: [{ text: prompt.trim() }] }] }) });
  if (!response.ok) { console.error('Gemini request failed:', response.status, await response.text()); return Response.json({ error: 'Gemini is temporarily unavailable.' }, { status: 502 }); }
  const data = await response.json(); return Response.json({ answer: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Buddy could not think of an answer.' });
};

export const config = { path: '/api/ask-buddy', rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip'] } };
