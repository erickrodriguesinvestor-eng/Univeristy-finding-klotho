/* Battle history + score persistence via localStorage */
const History = {
  _get() {
    try { return JSON.parse(localStorage.getItem(MF_CONFIG.storage.historyKey) || '[]'); }
    catch { return []; }
  },

  _save(list) {
    localStorage.setItem(MF_CONFIG.storage.historyKey, JSON.stringify(list));
  },

  getScore() {
    try {
      return JSON.parse(localStorage.getItem(MF_CONFIG.storage.scoreKey) || '{"mythos":0,"fable":0,"tie":0}');
    } catch {
      return { mythos: 0, fable: 0, tie: 0 };
    }
  },

  _saveScore(score) {
    localStorage.setItem(MF_CONFIG.storage.scoreKey, JSON.stringify(score));
  },

  add(entry) {
    const list = this._get();
    list.unshift({
      id: Date.now(),
      prompt: entry.prompt,
      category: entry.category,
      winner: entry.winner,   // 'mythos' | 'fable' | 'tie'
      mythosText: entry.mythosText,
      fableText: entry.fableText,
      ts: new Date().toISOString(),
    });
    if (list.length > MF_CONFIG.storage.maxHistory) list.pop();
    this._save(list);

    const score = this.getScore();
    score[entry.winner] = (score[entry.winner] || 0) + 1;
    this._saveScore(score);

    return score;
  },

  getAll() { return this._get(); },

  clear() {
    localStorage.removeItem(MF_CONFIG.storage.historyKey);
    localStorage.removeItem(MF_CONFIG.storage.scoreKey);
  },
};
