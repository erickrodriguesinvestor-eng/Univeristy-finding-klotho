/* Arena orchestrator — wires prompt → API → vote → history */
(function Arena() {
  let battleActive   = false;
  let battleResult   = null;
  let currentPrompt  = '';
  let currentCategory = 'geral';

  /* ── DOM refs ──────────────────────────────────────────── */
  const promptInput   = document.getElementById('prompt-input');
  const charCount     = document.getElementById('char-count');
  const categorySelect = document.getElementById('category-select');
  const btnBattle     = document.getElementById('btn-battle');
  const btnTie        = document.getElementById('btn-tie');
  const btnHistory    = document.getElementById('btn-history');
  const btnCloseHistory = document.getElementById('btn-close-history');
  const btnClearHistory = document.getElementById('btn-clear-history');
  const historyDrawer = document.getElementById('history-drawer');
  const exampleChips  = document.querySelectorAll('.example-chip');

  /* ── Init ──────────────────────────────────────────────── */
  function init() {
    UI.updateScore(History.getScore());
    bindEvents();
  }

  /* ── Event bindings ────────────────────────────────────── */
  function bindEvents() {
    promptInput.addEventListener('input', onPromptInput);
    promptInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) startBattle();
    });
    btnBattle.addEventListener('click', startBattle);
    btnTie.addEventListener('click', () => vote('tie'));

    document.getElementById('vote-mythos').addEventListener('click', () => vote('mythos'));
    document.getElementById('vote-fable').addEventListener('click',  () => vote('fable'));

    btnHistory.addEventListener('click', openHistory);
    btnCloseHistory.addEventListener('click', closeHistory);
    btnClearHistory.addEventListener('click', clearHistory);

    exampleChips.forEach(chip => {
      chip.addEventListener('click', () => {
        promptInput.value = chip.textContent;
        promptInput.dispatchEvent(new Event('input'));
        promptInput.focus();
      });
    });

    categorySelect.addEventListener('change', () => {
      currentCategory = categorySelect.value;
    });
  }

  /* ── Prompt input ──────────────────────────────────────── */
  function onPromptInput() {
    const len = promptInput.value.length;
    charCount.textContent = `${len} / 2000`;
  }

  /* ── Battle flow ───────────────────────────────────────── */
  async function startBattle() {
    const prompt = promptInput.value.trim();
    if (!prompt) { UI.toast('Digite uma pergunta primeiro.'); return; }
    if (battleActive) return;

    battleActive   = true;
    currentPrompt  = prompt;
    currentCategory = categorySelect.value;
    battleResult   = null;

    UI.hideVoteButtons();
    UI.highlightWinner(null);
    UI.showLoader('mythos');
    UI.showLoader('fable');
    document.getElementById('meta-mythos').textContent = '—';
    document.getElementById('meta-fable').textContent  = '—';
    btnBattle.disabled = true;

    try {
      const result = await API.battle(prompt, currentCategory);
      battleResult = result;

      if (result.mythos.ok) {
        UI.hideLoader('mythos');
        UI.showResponse('mythos', result.mythos.text, { latencyMs: result.mythos.latencyMs });
      } else {
        UI.hideLoader('mythos');
        UI.showError('mythos', result.mythos.error);
      }

      if (result.fable.ok) {
        UI.hideLoader('fable');
        UI.showResponse('fable', result.fable.text, { latencyMs: result.fable.latencyMs });
      } else {
        UI.hideLoader('fable');
        UI.showError('fable', result.fable.error);
      }

      if (result.mythos.ok || result.fable.ok) {
        UI.showVoteButtons();
      }
    } catch (err) {
      UI.toast('Falha na batalha: ' + err.message);
      UI.hideLoader('mythos');
      UI.hideLoader('fable');
    } finally {
      battleActive       = false;
      btnBattle.disabled = false;
    }
  }

  /* ── Vote ──────────────────────────────────────────────── */
  function vote(winner) {
    if (!battleResult) return;

    UI.hideVoteButtons();
    UI.highlightWinner(winner);

    const score = History.add({
      prompt: currentPrompt,
      category: currentCategory,
      winner,
      mythosText: battleResult.mythos?.text ?? '',
      fableText:  battleResult.fable?.text  ?? '',
    });

    UI.updateScore(score);

    const label = winner === 'tie' ? 'Empate registrado!' :
                  winner === 'mythos' ? 'Mythos 5 venceu!' : 'Fable 5 venceu!';
    UI.toast(label);
  }

  /* ── History drawer ────────────────────────────────────── */
  function openHistory() {
    UI.renderHistory(History.getAll());
    historyDrawer.classList.remove('hidden');
  }

  function closeHistory() {
    historyDrawer.classList.add('hidden');
  }

  function clearHistory() {
    if (!confirm('Limpar todo o histórico de batalhas?')) return;
    History.clear();
    UI.updateScore({ mythos: 0, fable: 0, tie: 0 });
    UI.renderHistory([]);
    UI.toast('Histórico limpo.');
  }

  /* ── Boot ──────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
