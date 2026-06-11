/* ============================================================
   PAINEL — métricas, gauge de probabilidade, histórico
   ============================================================ */

(function () {

  const $ = id => document.getElementById(id);

  /* ---------- Métricas ---------- */
  function renderMetricas() {
    const h = PMF.getHistorico();
    $('mSimulados').textContent = h.length;
    $('mBanco').textContent = BANCO_QUESTOES.length;

    let itens = 0;
    h.forEach(s => itens += s.total);
    $('mItens').textContent = itens;

    if (h.length) {
      const media = h.reduce((a, s) => a + s.percentualLiquido, 0) / h.length;
      const melhor = Math.max(...h.map(s => s.percentualLiquido));
      $('mMedia').textContent = PMF.fmtPct(media, 0);
      $('mMelhor').textContent = PMF.fmtPct(melhor, 0);
    } else {
      $('mMedia').textContent = '—';
      $('mMelhor').textContent = '—';
    }
  }

  /* ---------- Gauge de probabilidade ---------- */
  function renderProbabilidade() {
    const r = PMF.probabilidadeAprovacao();
    const circ = 2 * Math.PI * 82; // 515.2

    $('dTaxa').textContent = PMF.fmtPct(r.taxaAprovacao * 100, 1);
    $('dPresentes').textContent = r.presentes.toLocaleString('pt-BR');
    $('dCorte').textContent = PMF.fmtPct(Math.max(0, r.notaCorte), 0) + ' líquido';

    if (r.semDados) {
      $('gaugePct').textContent = '—';
      $('dDesempenho').textContent = 'faça um simulado';
      $('gaugeArco').style.strokeDashoffset = circ;
      return;
    }

    const p = r.probabilidade;
    $('gaugePct').textContent = PMF.fmtPct(p * 100, p < 0.1 ? 1 : 0);
    $('dDesempenho').textContent =
      PMF.fmtPct(r.desempenho.media, 0) + ' ± ' + r.desempenho.incerteza.toFixed(0) + ' p.p.';

    const arco = $('gaugeArco');
    arco.style.strokeDashoffset = circ * (1 - p);
    arco.style.stroke = p >= 0.6 ? '#10b981' : p >= 0.25 ? '#f59e0b' : '#ef4444';
  }

  /* ---------- Configuração ---------- */
  function carregarConfig() {
    const cfg = PMF.getConfig();
    $('cfgVagas').value = cfg.vagas;
    $('cfgInscritos').value = cfg.inscritos;
    $('cfgAbstencao').value = cfg.abstencao;
    $('cfgMedia').value = cfg.mediaConcorrentes;
    $('cfgDesvio').value = cfg.desvioConcorrentes;
  }

  $('btnSalvarCfg').addEventListener('click', () => {
    PMF.setConfig({
      vagas: Math.max(1, +$('cfgVagas').value || PMF.CFG_PADRAO.vagas),
      inscritos: Math.max(1, +$('cfgInscritos').value || PMF.CFG_PADRAO.inscritos),
      abstencao: Math.min(90, Math.max(0, +$('cfgAbstencao').value || 0)),
      mediaConcorrentes: Math.min(100, Math.max(0, +$('cfgMedia').value || PMF.CFG_PADRAO.mediaConcorrentes)),
      desvioConcorrentes: Math.min(40, Math.max(1, +$('cfgDesvio').value || PMF.CFG_PADRAO.desvioConcorrentes))
    });
    renderProbabilidade();
  });

  /* ---------- Treino por disciplina ---------- */
  function montarSelectDisciplinas() {
    const sel = $('selDisciplina');
    Object.keys(DISCIPLINAS).forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      const n = BANCO_QUESTOES.filter(q => q.d === d).length;
      opt.textContent = `${d} (${n} itens)`;
      sel.appendChild(opt);
    });
  }

  $('btnTreinoDisciplina').addEventListener('click', () => {
    const d = $('selDisciplina').value;
    location.href = 'simulado.html?modo=disciplina&disc=' + encodeURIComponent(d);
  });

  /* ---------- Desempenho por disciplina ---------- */
  function renderDisciplinas() {
    const stats = PMF.estatisticasPorDisciplina();
    const nomes = Object.keys(stats);
    const painel = $('painelDisciplinas');
    if (!nomes.length) return;

    painel.innerHTML = '';
    nomes.sort((a, b) => {
      const pa = PMF.percentualLiquido(stats[a].acertos, stats[a].erros, stats[a].total);
      const pb = PMF.percentualLiquido(stats[b].acertos, stats[b].erros, stats[b].total);
      return pa - pb;
    });

    nomes.forEach(nome => {
      const s = stats[nome];
      const pct = PMF.percentualLiquido(s.acertos, s.erros, s.total);
      const classe = pct < 40 ? 'fraca' : pct < 65 ? 'media' : '';
      const linha = document.createElement('div');
      linha.className = 'disc-linha';
      linha.innerHTML = `
        <div class="disc-cab">
          <span class="nome">${nome}</span>
          <span class="valor">${s.acertos}C · ${s.erros}E · ${s.branco}B — líquido ${PMF.fmtPct(pct, 0)}</span>
        </div>
        <div class="disc-barra"><div class="${classe}" style="width:${Math.min(100, pct)}%"></div></div>`;
      painel.appendChild(linha);
    });
  }

  /* ---------- Histórico ---------- */
  function renderHistorico() {
    const h = PMF.getHistorico();
    const painel = $('painelHistorico');
    if (!h.length) return;

    $('btnLimpar').classList.remove('oculto');

    const linhas = h.slice().reverse().map(s => {
      const pct = s.percentualLiquido;
      const tag = pct >= 65 ? 'tag-verde' : pct >= 40 ? 'tag-ambar' : 'tag-vermelha';
      const data = new Date(s.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
      return `<tr>
        <td>${data}</td>
        <td><span class="tag tag-azul">${s.modo}</span></td>
        <td class="num">${s.total}</td>
        <td class="num">${s.acertos}</td>
        <td class="num">${s.erros}</td>
        <td class="num">${s.branco}</td>
        <td class="num">${s.notaLiquida}</td>
        <td><span class="tag ${tag}">${PMF.fmtPct(pct, 0)}</span></td>
      </tr>`;
    }).join('');

    painel.innerHTML = `
      <table class="hist">
        <thead><tr>
          <th>Data</th><th>Modo</th><th>Itens</th><th>Certas</th><th>Erradas</th>
          <th>Branco</th><th>Líquida</th><th>%</th>
        </tr></thead>
        <tbody>${linhas}</tbody>
      </table>`;
  }

  $('btnLimpar').addEventListener('click', () => {
    if (confirm('Apagar todo o histórico de simulados? Essa ação não pode ser desfeita.')) {
      PMF.limparHistorico();
      location.reload();
    }
  });

  /* ---------- Init ---------- */
  carregarConfig();
  montarSelectDisciplinas();
  renderMetricas();
  renderProbabilidade();
  renderDisciplinas();
  renderHistorico();

})();
