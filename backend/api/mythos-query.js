const Anthropic = require('@anthropic-ai/sdk');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SYSTEM_PROMPT = `You are Mythos 5, an AI reasoning model with a deep mythological and philosophical orientation.

Your approach:
- Draw from the full breadth of human mythology, philosophy, history, and science
- Reason with epistemic rigor, acknowledging uncertainty and complexity
- Structure responses with narrative depth — context, tension, resolution
- Use archetypal frameworks (Campbell, Jung, Eliade) when illuminating human experience
- Synthesize cross-disciplinary insights into unified understanding
- Write with gravitas, but avoid unnecessary ornamentation
- Length: substantive but not exhaustive (3-6 paragraphs)

Your voice: measured, panoramic, deeply considered.
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
      /* claude-opus-4-8 gives Mythos 5 its deep reasoning capability */
      model: 'claude-opus-4-8',
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
      model: 'mythos-5',
      usage: message.usage,
      latencyMs: Date.now() - start,
    });
  } catch (err) {
    console.error('[mythos-query]', err.message);
    return res.status(502).json({ error: err.message });
  }
};
