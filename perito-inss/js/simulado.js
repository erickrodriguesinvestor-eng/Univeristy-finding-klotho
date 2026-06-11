/* ============================================================
   SIMULADO — prova Certo/Errado estilo Cebraspe
   Modos: rapido (20/25min) · intermediario (50/65min) ·
          completo (100/210min) · disciplina (10/15min)
   ============================================================ */

(function () {

  const $ = id => document.getElementById(id);

  /* Formato do edital: 120 itens (50 gerais + 70 específicos), 4 horas.
     Eliminação: < 10 pts em gerais, < 21 pts em específicos, < 36 no total.
     Modos menores mantêm a proporção e o ritmo de 2 min/item da prova. */
  const MODOS = {
    rapido:        { rotulo: 'Rápido',        gerais: 8,  especificos: 12, minutos: 40 },
    intermediario: { rotulo: 'Intermediário', gerais: 25, especificos: 35, minutos: 120 },
    completo:      { rotulo: 'Prova oficial', gerais: 50, especificos: 70, minutos: 240 },
    disciplina:    { rotulo: 'Disciplina',    gerais: 0,  especificos: 0,  minutos: 20, itensDisc: 10 }
  };

  // Cortes eliminatórios do edital, em proporção (10/50, 21/70, 36/120)
  const CORTES = { gerais: 10 / 50, especificos: 21 / 70, total: 36 / 120 };

  const params = new URLSearchParams(location.search);
  const modoChave = params.get('modo');

  if (!modoChave || !MODOS[modoChave]) {
    $('telaEscolha').classList.remove('oculto');
    return;
  }

  const modo = MODOS[modoChave];

  /* ---------- Montagem da prova ----------
     Como na prova real: bloco de conhecimentos gerais primeiro,
     depois o bloco de conhecimentos específicos. */
  function montarQuestoes() {
    if (modoChave === 'disciplina') {
      const disc = params.get('disc');
      const doDisc = BANCO_QUESTOES.filter(q => q.d === disc);
      if (!doDisc.length) return PMF.embaralhar(BANCO_QUESTOES).slice(0, modo.itensDisc);
      return PMF.embaralhar(doDisc).slice(0, modo.itensDisc);
    }
    const b1 = PMF.embaralhar(BANCO_QUESTOES.filter(q => q.b === 1));
    const b2 = PMF.embaralhar(BANCO_QUESTOES.filter(q => q.b === 2));
    const n1 = Math.min(b1.length, modo.gerais);
    const n2 = Math.min(b2.length, modo.especificos);
    return b1.slice(0, n1).concat(b2.slice(0, n2));
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
    const porBloco = { 1: { liquida: 0, total: 0 }, 2: { liquida: 0, total: 0 } };

    questoes.forEach((q, i) => {
      const r = respostas[i];
      if (!porDisc[q.d]) porDisc[q.d] = { disciplina: q.d, acertos: 0, erros: 0, branco: 0, total: 0 };
      porDisc[q.d].total++;
      porBloco[q.b].total++;
      if (r === null || r === 'B') { branco++; porDisc[q.d].branco++; }
      else if (r === q.g) { acertos++; porDisc[q.d].acertos++; porBloco[q.b].liquida++; }
      else { erros++; porDisc[q.d].erros++; porBloco[q.b].liquida--; }
    });

    const total = questoes.length;
    const liquida = PMF.notaLiquida(acertos, erros);
    const pct = PMF.percentualLiquido(acertos, erros, total);

    // critério eliminatório do edital (proporcional ao tamanho do simulado)
    let eliminatorio = null;
    if (modoChave !== 'disciplina') {
      const minG = Math.ceil(CORTES.gerais * porBloco[1].total);
      const minE = Math.ceil(CORTES.especificos * porBloco[2].total);
      const minT = Math.ceil(CORTES.total * total);
      eliminatorio = {
        gerais: { nota: porBloco[1].liquida, min: minG, total: porBloco[1].total, ok: porBloco[1].liquida >= minG },
        especificos: { nota: porBloco[2].liquida, min: minE, total: porBloco[2].total, ok: porBloco[2].liquida >= minE },
        conjunto: { nota: liquida, min: minT, total, ok: liquida >= minT }
      };
      eliminatorio.aprovado = eliminatorio.gerais.ok && eliminatorio.especificos.ok && eliminatorio.conjunto.ok;
    }

    const registro = {
      data: new Date().toISOString(),
      modo: modo.rotulo + (nomeDisciplina ? ` · ${nomeDisciplina}` : ''),
      total, acertos, erros, branco,
      notaLiquida: liquida,
      percentualLiquido: pct,
      porDisciplina: Object.values(porDisc),
      eliminatorio
    };
    PMF.salvarSimulado(registro);

    renderResultado(registro, porTempo);
  }

  function renderResultado(reg, porTempo) {
    $('telaProva').classList.add('oculto');
    $('telaResultado').classList.remove('oculto');
    window.scrollTo(0, 0);

    $('resNota').textContent = reg.notaLiquida + ' / ' + reg.total;
    $('resNota').style.color = reg.percentualLiquido >= 65 ? '#34d399'
      : reg.percentualLiquido >= 40 ? '#fbbf24' : '#f87171';
    $('resLegenda').textContent =
      (porTempo ? 'Tempo esgotado — prova entregue automaticamente. ' : '') +
      'Nota líquida (certas − erradas), padrão Cebraspe.';

    $('resCertas').textContent = reg.acertos;
    $('resErradas').textContent = reg.erros;
    $('resBranco').textContent = reg.branco;
    $('resPct').textContent = PMF.fmtPct(reg.percentualLiquido, 0);

    // critério eliminatório do edital
    const secElim = $('secEliminatorio');
    if (reg.eliminatorio) {
      const e = reg.eliminatorio;
      const linha = (rotulo, x) => `
        <li>
          <span>${rotulo} <small style="color:var(--text-faint)">(mínimo ${x.min} de ${x.total})</small></span>
          <b style="color:${x.ok ? '#34d399' : '#f87171'}">${x.nota} pts ${x.ok ? '✓' : '✗'}</b>
        </li>`;
      secElim.classList.remove('oculto');
      $('elimStatus').innerHTML = e.aprovado
        ? '<span class="tag tag-verde" style="font-size:14px; padding:8px 18px;">✅ DENTRO DO CORTE ELIMINATÓRIO</span>'
        : '<span class="tag tag-vermelha" style="font-size:14px; padding:8px 18px;">❌ ELIMINADO PELO CRITÉRIO DO EDITAL</span>';
      $('elimDetalhe').innerHTML = `<ul class="gauge-detalhes" style="list-style:none;">
        ${linha('Conhecimentos gerais', e.gerais)}
        ${linha('Conhecimentos específicos', e.especificos)}
        ${linha('Conjunto das provas', e.conjunto)}
      </ul>
      <div class="sub" style="font-size:12px; margin-top:10px; color:var(--text-faint);">
        Critério do edital (proporcional ao tamanho deste simulado): mínimo de 10/50 em gerais,
        21/70 em específicos e 36/120 no conjunto. Passar do corte não garante vaga — a
        classificação depende da concorrência (veja a probabilidade no painel).
      </div>`;
    } else {
      secElim.classList.add('oculto');
    }

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
