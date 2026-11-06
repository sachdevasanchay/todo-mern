// Turns a sentence like "call mom tomorrow 5pm" into task fields using Google Gemini.
// The API key stays on the server and is never sent to the browser.

const buildPrompt = (now) => `You convert one sentence from a user into a to-do task.
Right now it is: ${now} (the user's local time).

Reply with ONLY a JSON object. No explanation and no code fences. Use exactly these keys:
{"title": string, "description": string, "date": "YYYY-MM-DD", "start": "HH:mm" or null, "end": "HH:mm" or null, "priority": "low" or "medium" or "high" or null}

Rules:
- title: short and clear (max 8 words), without the date or time words. Keep the user's own language.
- date: work out words like today, tomorrow, Monday, next Friday, "in 3 days" from the current date. If no date is mentioned, use today's date.
- start: 24-hour time if the user mentions a time. morning = 09:00, afternoon = 14:00, evening = 18:00, night = 20:00. If no time is mentioned, null.
- end: only if an end time or a duration is mentioned (for example "for 2 hours"), otherwise null.
- priority: "high" for urgent, important or ASAP. "low" for whenever or optional. Otherwise null.
- description: any extra detail from the sentence, otherwise an empty string.`;

const getModels = () =>
  (process.env.GEMINI_MODEL || 'gemini-3.5-flash,gemini-3.5-flash-lite')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);

const callGemini = (model, system, text) =>
  fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text }] }],
      generationConfig: { temperature: 0.2 },
    }),
    signal: AbortSignal.timeout(20000),
  });

// Pull the first {...} out of the reply (works even if the model adds extra words)
const extractJson = (raw) => {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
};

// Never trust AI output: check every field before sending it to the app
const clean = (o) => {
  const title = String(o.title || '').trim().slice(0, 120);
  if (!title) return null;
  const time = (v) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : '');
  const date = /^\d{4}-\d{2}-\d{2}$/.test(o.date) && !Number.isNaN(Date.parse(o.date)) ? o.date : '';
  const start = time(o.start);
  let end = time(o.end);
  if (!start || (end && end <= start)) end = ''; // an end time only makes sense after a start time
  return {
    title,
    description: String(o.description || '').trim().slice(0, 1000),
    date,
    start,
    end,
    priority: ['low', 'medium', 'high'].includes(o.priority) ? o.priority : '',
  };
};

// POST /api/ai/parse-task   body: { text, now }
export const parseTask = async (req, res, next) => {
  try {
    const text = String(req.body.text || '').trim();
    if (!text) return res.status(400).json({ message: 'Type or say what you want to add' });
    if (text.length > 500) return res.status(400).json({ message: 'That is too long. Keep it under 500 characters.' });
    if (!process.env.GEMINI_API_KEY) return res.status(503).json({ message: 'AI is not set up on the server yet' });

    const now = String(req.body.now || '').slice(0, 40) || new Date().toISOString();

    let reply = null;
    let status = 0;
    for (const model of getModels()) {
      const r = await callGemini(model, buildPrompt(now), text);
      status = r.status;
      if (r.ok) { reply = await r.json(); break; }
      console.error(`Gemini ${model} -> ${r.status}`, (await r.text()).slice(0, 300));
      if (r.status !== 404) break; // only try the next model when this one does not exist
    }

    if (!reply) {
      if (status === 429) return res.status(429).json({ message: 'AI is busy right now. Try again in a minute.' });
      if (status === 404) return res.status(502).json({ message: 'AI model not available. Set GEMINI_MODEL on the server.' });
      if ([400, 401, 403].includes(status)) return res.status(502).json({ message: 'The AI key was rejected. Check GEMINI_API_KEY on the server.' });
      return res.status(502).json({ message: 'AI is unavailable right now. Please add the task manually.' });
    }

    const raw = (reply.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
    const task = extractJson(raw) && clean(extractJson(raw));
    if (!task) return res.status(422).json({ message: 'Could not understand that. Try rephrasing it.' });

    res.json(task);
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return res.status(504).json({ message: 'AI took too long. Please try again.' });
    }
    if (error.name === 'TypeError') {
      return res.status(502).json({ message: 'Could not reach the AI service.' });
    }
    next(error);
  }
};
