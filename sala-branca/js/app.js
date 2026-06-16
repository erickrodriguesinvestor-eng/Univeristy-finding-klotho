(function () {
  'use strict';

  const REQUIRED_STREAK = 5;
  const STORAGE_KEY = 'salaBranca.state';

  const COLD_OK = [
    'Resultado dentro do padrão. Continue.',
    'Conforme.',
    'Registrado.',
    'Padrão mínimo atingido. Prossiga.',
    'Aceitável.'
  ];

  const COLD_ERROR = [
    'Erro registrado. Sequência zerada.',
    'Insuficiente. Repita desde o início.',
    'Fora do padrão. Reiniciando contagem.',
    'Inadequado. A sequência não tolera falhas.',
    'Desvio detectado. Reinicie.'
  ];

  const MODULES = {
    calculo: { label: 'CÁLCULO', gen: genCalculo },
    logica: { label: 'LÓGICA', gen: genLogica },
    memoria: { label: 'MEMÓRIA', gen: genMemoria },
    reacao: { label: 'CONTROLE', gen: genReacao }
  };

  let state = loadState();
  let current = null; // { key, streak, challenge, awaiting }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return freshState();
  }

  function freshState() {
    const stats = {};
    Object.keys(MODULES).forEach(k => {
      stats[k] = { cleared: false, attempts: 0, errors: 0 };
    });
    return { id: null, stats };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  // ---------- Entry ----------
  document.getElementById('btn-enter').addEventListener('click', () => {
    const input = document.getElementById('input-id');
    let id = input.value.trim().toUpperCase();
    if (!id) id = 'WR-' + randInt(1000, 9999);
    state.id = id;
    saveState();
    enterHub();
  });

  if (state.id) enterHub();

  function enterHub() {
    document.getElementById('hub-id').textContent = state.id;
    document.getElementById('hub-rank').textContent = 'RANK: ' + currentRankLabel();
    renderModuleList();
    showScreen('screen-hub');
  }

  function currentRankLabel() {
    const allCleared = Object.values(state.stats).every(s => s.cleared);
    return allCleared ? 'APTO PARA AVALIAÇÃO' : 'EM TREINAMENTO';
  }

  function renderModuleList() {
    const list = document.getElementById('module-list');
    list.innerHTML = '';
    Object.keys(MODULES).forEach(key => {
      const def = MODULES[key];
      const s = state.stats[key];
      const item = document.createElement('div');
      item.className = 'module-item' + (s.cleared ? ' cleared' : '');
      item.innerHTML = `<span>${def.label}</span><span class="status">${s.cleared ? 'CONCLUÍDO' : `${s.attempts} TENTATIVAS / ${s.errors} ERROS`}</span>`;
      item.addEventListener('click', () => startModule(key));
      list.appendChild(item);
    });
  }

  document.getElementById('btn-evaluate').addEventListener('click', () => {
    runEvaluation();
  });

  // ---------- Module flow ----------
  function startModule(key) {
    current = { key, streak: 0, challenge: null };
    document.getElementById('mod-name').textContent = MODULES[key].label;
    nextChallenge();
    showScreen('screen-module');
  }

  function nextChallenge() {
    document.getElementById('mod-feedback').textContent = '';
    document.getElementById('mod-feedback').className = 'feedback';
    document.getElementById('mod-streak').textContent = `SEQUÊNCIA: ${current.streak}/${REQUIRED_STREAK}`;
    const def = MODULES[current.key];
    current.challenge = def.gen();
    current.challenge.render(document.getElementById('mod-prompt'), document.getElementById('mod-input-area'), submitAnswer);
  }

  function submitAnswer(isCorrect) {
    const s = state.stats[current.key];
    s.attempts++;
    const fb = document.getElementById('mod-feedback');
    if (isCorrect) {
      current.streak++;
      fb.textContent = pick(COLD_OK);
      fb.className = 'feedback ok';
    } else {
      s.errors++;
      current.streak = 0;
      fb.textContent = pick(COLD_ERROR);
      fb.className = 'feedback error';
    }
    saveState();

    if (current.streak >= REQUIRED_STREAK) {
      s.cleared = true;
      saveState();
      fb.textContent = 'PADRÃO ATINGIDO. DISCIPLINA CONCLUÍDA.';
      fb.className = 'feedback ok';
      setTimeout(() => { enterHub(); }, 900);
      return;
    }
    setTimeout(nextChallenge, isCorrect ? 250 : 600);
  }

  document.getElementById('btn-abort').addEventListener('click', () => {
    enterHub();
  });

  // ---------- Challenge generators ----------
  function genCalculo() {
    const a = randInt(2, 30), b = randInt(2, 30);
    const ops = ['+', '-', '*'];
    const op = pick(ops);
    let answer;
    if (op === '+') answer = a + b;
    else if (op === '-') answer = a - b;
    else answer = a * b;
    const text = `${a} ${op} ${b} = ?`;
    return {
      render(promptEl, areaEl, submit) {
        promptEl.textContent = text;
        areaEl.innerHTML = `<input type="number" id="calc-input" placeholder="RESPOSTA">
          <button class="btn" id="calc-submit">CONFIRMAR</button>`;
        const input = document.getElementById('calc-input');
        const go = () => submit(parseInt(input.value, 10) === answer);
        document.getElementById('calc-submit').addEventListener('click', go);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
        input.focus();
      }
    };
  }

  function genLogica() {
    const start = randInt(1, 10);
    const step = randInt(2, 6);
    const len = 4;
    const seq = [];
    for (let i = 0; i < len; i++) seq.push(start + step * i);
    const answer = start + step * len;
    const text = `${seq.join('  ')}  →  ?`;
    return {
      render(promptEl, areaEl, submit) {
        promptEl.textContent = text;
        areaEl.innerHTML = `<input type="number" id="logic-input" placeholder="PRÓXIMO VALOR">
          <button class="btn" id="logic-submit">CONFIRMAR</button>`;
        const input = document.getElementById('logic-input');
        const go = () => submit(parseInt(input.value, 10) === answer);
        document.getElementById('logic-submit').addEventListener('click', go);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
        input.focus();
      }
    };
  }

  function genMemoria() {
    const len = randInt(5, 7);
    const digits = Array.from({ length: len }, () => randInt(0, 9));
    const sequenceStr = digits.join(' ');
    return {
      render(promptEl, areaEl, submit) {
        promptEl.textContent = sequenceStr;
        areaEl.innerHTML = `<div class="feedback">MEMORIZE. A SEQUÊNCIA DESAPARECERÁ.</div>`;
        let elapsed = 0;
        const showMs = 1400 + len * 250;
        setTimeout(() => {
          promptEl.textContent = '';
          areaEl.innerHTML = `<input type="text" id="mem-input" placeholder="DIGITE A SEQUÊNCIA (separada por espaço)">
            <button class="btn" id="mem-submit">CONFIRMAR</button>`;
          const input = document.getElementById('mem-input');
          const go = () => {
            const normalized = input.value.trim().replace(/\s+/g, ' ');
            submit(normalized === sequenceStr);
          };
          document.getElementById('mem-submit').addEventListener('click', go);
          input.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
          input.focus();
        }, showMs);
      }
    };
  }

  function genReacao() {
    return {
      render(promptEl, areaEl, submit) {
        promptEl.textContent = 'AGUARDE O SINAL';
        areaEl.innerHTML = `<div class="reaction-zone" id="reaction-zone">AGUARDANDO...</div>`;
        const zone = document.getElementById('reaction-zone');
        let ready = false;
        let startTime = 0;
        const delay = randInt(1200, 3200);

        zone.addEventListener('click', () => {
          if (!ready) {
            submit(false);
            return;
          }
          const reactionMs = Date.now() - startTime;
          submit(reactionMs <= 600);
        });

        setTimeout(() => {
          ready = true;
          startTime = Date.now();
          zone.classList.add('ready');
          zone.textContent = 'AGORA';
        }, delay);
      }
    };
  }

  // ---------- Final evaluation ----------
  function runEvaluation() {
    const stats = state.stats;
    const allCleared = Object.values(stats).every(s => s.cleared);
    const totalAttempts = Object.values(stats).reduce((sum, s) => sum + s.attempts, 0);
    const totalErrors = Object.values(stats).reduce((sum, s) => sum + s.errors, 0);
    const errorRate = totalAttempts > 0 ? totalErrors / totalAttempts : 1;

    let grade, message, eliminated = false;

    if (!allCleared) {
      grade = '—';
      message = 'PROTOCOLO INCOMPLETO. Disciplinas pendentes não permitem avaliação. Elemento classificado como inadequado.';
      eliminated = true;
    } else if (errorRate === 0) {
      grade = 'S';
      message = 'Desempenho sem desvios. Elemento dentro do padrão de excelência exigido.';
    } else if (errorRate <= 0.10) {
      grade = 'A';
      message = 'Desempenho consistente. Pequenos desvios registrados, dentro da margem tolerada.';
    } else if (errorRate <= 0.20) {
      grade = 'B';
      message = 'Desempenho regular. Desvios acima do ideal. Repetição recomendada.';
    } else if (errorRate <= 0.35) {
      grade = 'C';
      message = 'Desempenho insuficiente. Padrão exige revisão completa das disciplinas.';
    } else {
      grade = 'ELIMINADO';
      message = 'Taxa de erro incompatível com o padrão do programa. Elemento inadequado.';
      eliminated = true;
    }

    const resultEl = document.getElementById('eval-result');
    resultEl.innerHTML = `
      <span class="grade ${eliminated ? 'eliminado' : ''}">${grade}</span>
      <div>IDENTIFICADOR: ${state.id}</div>
      <div>TENTATIVAS TOTAIS: ${totalAttempts}</div>
      <div>ERROS TOTAIS: ${totalErrors}</div>
      <div>TAXA DE ERRO: ${(errorRate * 100).toFixed(1)}%</div>
      <div style="margin-top:16px;">${message}</div>
    `;
    showScreen('screen-evaluation');
  }

  document.getElementById('btn-restart').addEventListener('click', () => {
    state = freshState();
    saveState();
    showScreen('screen-entry');
    document.getElementById('input-id').value = '';
  });
})();
