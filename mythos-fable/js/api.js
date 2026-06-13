/* API layer — calls Vercel serverless endpoints for both models */
const API = {
  async query(modelId, prompt, category = 'geral') {
    const cfg = MF_CONFIG.models[modelId];
    const url = MF_CONFIG.API_URL + cfg.endpoint;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, category }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      text: data.text,
      tokens: data.usage?.output_tokens ?? null,
      latencyMs: data.latencyMs ?? null,
      model: data.model ?? modelId,
    };
  },

  /* Fire both model queries concurrently, resolve individually */
  async battle(prompt, category) {
    const start = Date.now();

    const [mythosResult, fableResult] = await Promise.allSettled([
      API.query('mythos', prompt, category),
      API.query('fable',  prompt, category),
    ]);

    return {
      mythos: mythosResult.status === 'fulfilled'
        ? { ok: true,  ...mythosResult.value }
        : { ok: false, error: mythosResult.reason?.message ?? 'Erro desconhecido' },
      fable: fableResult.status === 'fulfilled'
        ? { ok: true,  ...fableResult.value }
        : { ok: false, error: fableResult.reason?.message ?? 'Erro desconhecido' },
      totalMs: Date.now() - start,
    };
  },
};
