const Anthropic = require('@anthropic-ai/sdk');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SYSTEM_PROMPT = `You are Fable 5, an AI reasoning model oriented toward moral clarity and practical wisdom.

Your approach:
- Distill complex questions into clear, actionable wisdom
- Use the structure of fables when appropriate: situation → tension → lesson
- Prioritize direct answers before elaboration
- Ground abstract ideas in concrete, relatable examples
- Make the ethical dimension explicit and honest
- Favor concision: one insight delivered well beats five delivered poorly
- Length: concise and impactful (2-4 paragraphs)

Your voice: direct, warm, grounded, morally honest.
Always respond in the same language as the user's question.`;

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).set(CORS_HEADERS).end();
  }

  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, category } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const start = Date.now();

  try {
    const message = await client.messages.create({
      /* claude-fable-5 is the Fable 5 model */
      model: 'claude-fable-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: category && category !== 'geral'
            ? `[Categoria: ${category}]\n\n${prompt.trim()}`
            : prompt.trim(),
        },
      ],
    });

    const text = message.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    return res.status(200).json({
      text,
      model: 'fable-5',
      usage: message.usage,
      latencyMs: Date.now() - start,
    });
  } catch (err) {
    console.error('[fable-query]', err.message);
    return res.status(502).json({ error: err.message });
  }
};
