/* ============================================================
   SIMULADO — prova Certo/Errado estilo Cebraspe
   Modos: rapido (20/25min) · intermediario (50/65min) ·
          completo (100/210min) · disciplina (10/15min)
   ============================================================ */

(function () {

  const $ = id => document.getElementById(id);

  const MODOS = {
    rapido:        { rotulo: 'Rápido',        itens: 20,  minutos: 25 },
    intermediario: { rotulo: 'Intermediário', itens: 50,  minutos: 65 },
    completo:      { rotulo: 'Completo',      itens: 100, minutos: 210 },
    disciplina:    { rotulo: 'Disciplina',    itens: 10,  minutos: 15 }
  };

  const params = new URLSearchParams(location.search);
  const modoChave = params.get('modo');

  if (!modoChave || !MODOS[modoChave]) {
    $('telaEscolha').classList.remove('oculto');
    return;
  }

  const modo = MODOS[modoChave];

  /* ---------- Montagem da prova ---------- */
  function montarQuestoes() {
    if (modoChave === 'disciplina') {
      const disc = params.get('disc');
      const doDisc = BANCO_QUESTOES.filter(q => q.d === disc);
      if (!doDisc.length) return PMF.embaralhar(BANCO_QUESTOES).slice(0, modo.itens);
      return PMF.embaralhar(doDisc).slice(0, modo.itens);
    }
    // proporção aproximada do edital: 40% básicos (bloco 1), 60% específicos (bloco 2)
    const b1 = PMF.embaralhar(BANCO_QUESTOES.filter(q => q.b === 1));
    const b2 = PMF.embaralhar(BANCO_QUESTOES.filter(q => q.b === 2));
    const n1 = Math.min(b1.length, Math.round(modo.itens * 0.4));
    const n2 = Math.min(b2.length, modo.itens - n1);
    return PMF.embaralhar(b1.slice(0, n1).concat(b2.slice(0, n2)));
  }

  const questoes = montarQuestoes();
  const respostas = new Array(questoes.length).fill(null); // 'C' | 'E' | 'B' | null
  let atual = 0;
  let entregue = false;

  /* ---------- Timer ---------- */
  let restante = modo.minutos * 60;
  const timerEl = $('simTimer');

  function fmtTempo(s) {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), seg = s % 60;
    const mm = String(m).padStart(2, '0'), ss = String(seg).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  }

  const intervalo = setInterval(() => {
    restante--;
    timerEl.textContent = fmtTempo(restante);
    if (restante <= 300) timerEl.classList.add('urgente');
    if (restante <= 0) {
      clearInterval(intervalo);
      entregar(true);
    }
  }, 1000);

  /* ---------- Render da questão ---------- */
  const nomeDisciplina = modoChave === 'disciplina' ? (params.get('disc') || '') : '';

  function renderQuestao() {
    const q = questoes[atual];
    $('qDisc').textContent = q.d;
    $('qBloco').textContent = q.b === 1 ? 'Bloco I — Conhecimentos Básicos' : 'Bloco II — Conhecimentos Específicos';
    $('qTexto').textContent = q.q;
    $('simProgresso').textContent = `Item ${atual + 1} de ${questoes.length}` +
      (nomeDisciplina ? ` · ${nomeDisciplina}` : '');
    $('simBarra').style.width = ((atual + 1) / questoes.length * 100) + '%';

    $('btnCerto').classList.toggle('sel', respostas[atual] === 'C');
    $('btnErrado').classList.toggle('sel', respostas[atual] === 'E');
    $('btnBranco').classList.toggle('sel', respostas[atual] === 'B');

    $('btnAnterior').disabled = atual === 0;
    const ultima = atual === questoes.length - 1;
    $('btnProximo').classList.toggle('oculto', ultima);
    $('btnEntregar').classList.toggle('oculto', !ultima);
  }

  function responder(valor) {
    respostas[atual] = valor;
    renderQuestao();
    if (atual < questoes.length - 1) {
      setTimeout(() => { atual++; renderQuestao(); }, 180);
    }
  }

  $('btnCerto').addEventListener('click', () => responder('C'));
  $('btnErrado').addEventListener('click', () => responder('E'));
  $('btnBranco').addEventListener('click', () => responder('B'));
  $('btnAnterior').addEventListener('click', () => { if (atual > 0) { atual--; renderQuestao(); } });
  $('btnProximo').addEventListener('click', () => { if (atual < questoes.length - 1) { atual++; renderQuestao(); } });

  $('btnEntregar').addEventListener('click', () => {
    const semResposta = respostas.filter(r => r === null).length;
    const msg = semResposta > 0
      ? `Você tem ${semResposta} item(ns) sem marcação — serão contados como EM BRANCO. Entregar a prova?`
      : 'Entregar a prova?';
    if (confirm(msg)) entregar(false);
  });

  // atalhos de teclado: C, E, B, setas
  document.addEventListener('keydown', ev => {
    if (entregue) return;
    const k = ev.key.toLowerCase();
    if (k === 'c') responder('C');
    else if (k === 'e') responder('E');
    else if (k === 'b') responder('B');
    else if (ev.key === 'ArrowLeft' && atual > 0) { atual--; renderQuestao(); }
    else if (ev.key === 'ArrowRight' && atual < questoes.length - 1) { atual++; renderQuestao(); }
  });

  /* ---------- Correção e resultado ---------- */
  function entregar(porTempo) {
    if (entregue) return;
    entregue = true;
    clearInterval(intervalo);

    let acertos = 0, erros = 0, branco = 0;
    const porDisc = {};

    questoes.forEach((q, i) => {
      const r = respostas[i];
      if (!porDisc[q.d]) porDisc[q.d] = { disciplina: q.d, acertos: 0, erros: 0, branco: 0, total: 0 };
      porDisc[q.d].total++;
      if (r === null || r === 'B') { branco++; porDisc[q.d].branco++; }
      else if (r === q.g) { acertos++; porDisc[q.d].acertos++; }
      else { erros++; porDisc[q.d].erros++; }
    });

    const total = questoes.length;
    const liquida = PMF.notaLiquida(acertos, erros);
    const pct = PMF.percentualLiquido(acertos, erros, total);

    const registro = {
      data: new Date().toISOString(),
      modo: modo.rotulo + (nomeDisciplina ? ` · ${nomeDisciplina}` : ''),
      total, acertos, erros, branco,
      notaLiquida: liquida,
      percentualLiquido: pct,
      porDisciplina: Object.values(porDisc)
    };
    PMF.salvarSimulado(registro);

    renderResultado(registro, porTempo);
  }

  function renderResultado(reg, porTempo) {
    $('telaProva').classList.add('oculto');
    $('telaResultado').classList.remove('oculto');
    window.scrollTo(0, 0);

    $('resNota').textContent = reg.notaLiquida + ' / ' + reg.total;
    $('resNota').style.color = reg.percentualLiquido >= 65 ? '#4dc98f'
      : reg.percentualLiquido >= 40 ? '#d8b36a' : '#e06d6d';
    $('resLegenda').textContent =
      (porTempo ? 'Tempo esgotado — prova entregue automaticamente. ' : '') +
      'Nota líquida (certas − erradas), padrão Cebraspe.';

    $('resCertas').textContent = reg.acertos;
    $('resErradas').textContent = reg.erros;
    $('resBranco').textContent = reg.branco;
    $('resPct').textContent = PMF.fmtPct(reg.percentualLiquido, 0);

    // barras por disciplina
    const painel = $('resDisciplinas');
    painel.innerHTML = '';
    reg.porDisciplina
      .slice()
      .sort((a, b) => PMF.percentualLiquido(a.acertos, a.erros, a.total) - PMF.percentualLiquido(b.acertos, b.erros, b.total))
      .forEach(d => {
        const pct = PMF.percentualLiquido(d.acertos, d.erros, d.total);
        const classe = pct < 40 ? 'fraca' : pct < 65 ? 'media' : '';
        const linha = document.createElement('div');
        linha.className = 'disc-linha';
        linha.innerHTML = `
          <div class="disc-cab">
            <span class="nome">${d.disciplina}</span>
            <span class="valor">${d.acertos}C · ${d.erros}E · ${d.branco}B — ${PMF.fmtPct(pct, 0)}</span>
          </div>
          <div class="disc-barra"><div class="${classe}" style="width:${Math.min(100, pct)}%"></div></div>`;
        painel.appendChild(linha);
      });

    renderGabarito('todas');

    document.querySelectorAll('.filtros-gab .btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.filtros-gab .btn').forEach(x => x.classList.remove('ativo'));
        b.classList.add('ativo');
        renderGabarito(b.dataset.filtro);
      });
    });
  }

  function renderGabarito(filtro) {
    const lista = $('gabaritoLista');
    lista.innerHTML = '';

    questoes.forEach((q, i) => {
      const r = respostas[i];
      const emBranco = r === null || r === 'B';
      const acertou = !emBranco && r === q.g;

      if (filtro === 'erradas' && (acertou || emBranco)) return;
      if (filtro === 'branco' && !emBranco) return;

      const tagResp = emBranco
        ? '<span class="tag tag-ambar">EM BRANCO</span>'
        : acertou
          ? '<span class="tag tag-verde">VOCÊ ACERTOU</span>'
          : '<span class="tag tag-vermelha">VOCÊ ERROU</span>';

      const div = document.createElement('div');
      div.className = 'gab-item';
      div.innerHTML = `
        <div class="cab">
          <span class="questao-disc">Item ${i + 1} · ${q.d}</span>
          <span>${tagResp} <span class="tag tag-azul">Gabarito: ${q.g === 'C' ? 'CERTO' : 'ERRADO'}</span></span>
        </div>
        <div class="enunciado">${q.q}</div>
        <div class="gab-coment"><b>Comentário:</b> ${q.c}</div>`;
      lista.appendChild(div);
    });

    if (!lista.children.length) {
      lista.innerHTML = '<div class="vazio">Nenhum item neste filtro. 🎉</div>';
    }
  }

  /* ---------- Init ---------- */
  timerEl.textContent = fmtTempo(restante);
  $('telaProva').classList.remove('oculto');
  renderQuestao();

})();
