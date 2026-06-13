/* UI utilities: toast, response rendering, history drawer */
const UI = {
  toast(msg, duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('toast-exit');
      el.addEventListener('animationend', () => el.remove());
    }, duration);
  },

  showLoader(modelId) {
    document.getElementById(`placeholder-${modelId}`)?.classList.add('hidden');
    document.getElementById(`response-${modelId}`)?.classList.add('hidden');
    document.getElementById(`loader-${modelId}`)?.classList.remove('hidden');
  },

  hideLoader(modelId) {
    document.getElementById(`loader-${modelId}`)?.classList.add('hidden');
  },

  showResponse(modelId, text, meta = {}) {
    const el = document.getElementById(`response-${modelId}`);
    if (!el) return;
    el.innerHTML = UI._renderText(text);
    el.classList.remove('hidden');

    const metaEl = document.getElementById(`meta-${modelId}`);
    if (metaEl && meta.latencyMs) {
      metaEl.textContent = `${(meta.latencyMs / 1000).toFixed(1)}s`;
    }
  },

  showError(modelId, errorMsg) {
    const el = document.getElementById(`response-${modelId}`);
    if (!el) return;
    el.innerHTML = `<span style="color:#ff6b6b;font-style:italic">Erro: ${errorMsg}</span>`;
    el.classList.remove('hidden');
  },

  showVoteButtons() {
    document.getElementById('vote-mythos')?.classList.remove('hidden');
    document.getElementById('vote-fable')?.classList.remove('hidden');
    document.getElementById('tie-wrap')?.classList.remove('hidden');
  },

  hideVoteButtons() {
    document.getElementById('vote-mythos')?.classList.add('hidden');
    document.getElementById('vote-fable')?.classList.add('hidden');
    document.getElementById('tie-wrap')?.classList.add('hidden');
  },

  updateScore(score) {
    const m = document.getElementById('score-mythos');
    const f = document.getElementById('score-fable');
    if (m) m.textContent = score.mythos || 0;
    if (f) f.textContent = score.fable || 0;
  },

  highlightWinner(winnerId) {
    document.getElementById('panel-mythos')?.classList.remove('winner');
    document.getElementById('panel-fable')?.classList.remove('winner');
    if (winnerId !== 'tie') {
      document.getElementById(`panel-${winnerId}`)?.classList.add('winner');
    }
  },

  renderHistory(battles) {
    const list = document.getElementById('history-list');
    if (!list) return;
    if (!battles.length) {
      list.innerHTML = '<p class="empty-state">Nenhuma batalha ainda.</p>';
      return;
    }
    list.innerHTML = battles.map(b => `
      <div class="history-item" data-id="${b.id}">
        <div class="history-prompt">${UI._esc(b.prompt)}</div>
        <div class="history-meta">
          <span>${UI._relTime(b.ts)}</span>
          <span>${b.category || 'geral'}</span>
          <span class="history-winner-badge winner-${b.winner}">
            ${b.winner === 'tie' ? 'Empate' : b.winner === 'mythos' ? 'Mythos 5' : 'Fable 5'}
          </span>
        </div>
      </div>
    `).join('');
  },

  /* Convert plain text with markdown-like paragraphs to HTML */
  _renderText(text) {
    return text
      .split('\n\n')
      .map(p => `<p>${UI._esc(p.trim()).replace(/\n/g, '<br>')}</p>`)
      .join('');
  },

  _esc(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },

  _relTime(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000)  return 'agora';
    if (diff < 3600000) return `${Math.floor(diff/60000)}min atrás`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h atrás`;
    return new Date(iso).toLocaleDateString('pt-BR');
  },
};
