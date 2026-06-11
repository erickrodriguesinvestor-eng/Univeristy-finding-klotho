/* ============================================================
   VIDEOAULAS — render dos módulos, progresso e filtros
   Progresso salvo em localStorage: { "moduloId:indice": true }
   ============================================================ */

(function () {

  const KEY = 'pmf_aulas_assistidas';
  const $ = id => document.getElementById(id);

  function getAssistidas() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch { return {}; }
  }
  function setAssistida(chave, valor) {
    const a = getAssistidas();
    if (valor) a[chave] = true; else delete a[chave];
    localStorage.setItem(KEY, JSON.stringify(a));
  }

  function urlYoutube(busca) {
    return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(busca);
  }

  /* ---------- Progresso geral ---------- */
  function renderProgresso() {
    const assist = getAssistidas();
    let total = 0, feitas = 0, total8020 = 0, feitas8020 = 0;
    MODULOS_VIDEO.forEach(m => {
      m.aulas.forEach((a, i) => {
        total++;
        const ok = !!assist[m.id + ':' + i];
        if (ok) feitas++;
        if (a.alta) { total8020++; if (ok) feitas8020++; }
      });
    });
    const pctGeral = total ? Math.round(feitas / total * 100) : 0;
    const pct8020 = total8020 ? Math.round(feitas8020 / total8020 * 100) : 0;
    $('vgTotal').textContent = total;
    $('vgAssistidas').textContent = feitas;
    $('vgProgresso').textContent = pctGeral + '%';
    $('vgBarra').style.width = pctGeral + '%';
    $('vgTotal8020').textContent = total8020;
    $('vgAssistidas8020').textContent = feitas8020;
    $('vgProgresso8020').textContent = pct8020 + '%';
    $('vgBarra8020').style.width = pct8020 + '%';
  }

  /* ---------- Render dos módulos ---------- */
  let filtroAtual = 'todos';

  function passaFiltroModulo(m) {
    if (filtroAtual === 'b1') return m.bloco === 1;
    if (filtroAtual === 'b2') return m.bloco === 2;
    return true;
  }

  function passaFiltroAula(m, a, i) {
    if (filtroAtual === '8020' && !a.alta) return false;
    if (filtroAtual === 'pendentes' && getAssistidas()[m.id + ':' + i]) return false;
    return true;
  }

  function renderModulos() {
    const assist = getAssistidas();
    const lista = $('listaModulos');
    lista.innerHTML = '';

    MODULOS_VIDEO.forEach(m => {
      if (!passaFiltroModulo(m)) return;
      const aulasVisiveis = m.aulas.map((a, i) => ({ a, i })).filter(({ a, i }) => passaFiltroAula(m, a, i));
      if (!aulasVisiveis.length) return;

      const feitas = m.aulas.filter((_, i) => assist[m.id + ':' + i]).length;
      const pct = Math.round(feitas / m.aulas.length * 100);

      const det = document.createElement('details');
      det.className = 'vmodulo';
      det.open = filtroAtual !== 'todos';
      det.innerHTML = `
        <summary>
          <span class="vmod-icone">${m.icone}</span>
          <span class="vmod-info">
            <span class="vmod-titulo">${m.titulo}</span>
            <span class="vmod-meta">${m.bloco === 1 ? 'Bloco I — Básicos' : 'Bloco II — Específicos'} ·
              ${m.aulas.length} aulas · ${m.aulas.filter(a => a.alta).length} 🔥</span>
          </span>
          <span class="vmod-pct">${pct}%</span>
        </summary>
        <div class="vmod-8020">📌 <b>80/20 do módulo:</b> ${m.peso8020}</div>
        <div class="vmod-aulas"></div>`;

      const cont = det.querySelector('.vmod-aulas');
      aulasVisiveis.forEach(({ a, i }) => {
        const chave = m.id + ':' + i;
        const feita = !!assist[chave];
        const linha = document.createElement('div');
        linha.className = 'vaula' + (feita ? ' feita' : '');
        linha.innerHTML = `
          <label class="vaula-check">
            <input type="checkbox" ${feita ? 'checked' : ''} aria-label="Marcar aula como assistida">
          </label>
          <div class="vaula-corpo">
            <div class="vaula-titulo">${a.t}
              ${a.alta ? '<span class="tag tag-fogo">🔥 ALTA INCIDÊNCIA</span>' : ''}
            </div>
            ${a.dica ? `<div class="vaula-dica">💡 ${a.dica}</div>` : ''}
          </div>
          <a class="btn vaula-btn" href="${urlYoutube(a.busca)}" target="_blank" rel="noopener">▶ Assistir</a>`;

        linha.querySelector('input').addEventListener('change', ev => {
          setAssistida(chave, ev.target.checked);
          linha.classList.toggle('feita', ev.target.checked);
          renderProgresso();
          // atualiza % no summary do módulo
          const f = m.aulas.filter((_, j) => getAssistidas()[m.id + ':' + j]).length;
          det.querySelector('.vmod-pct').textContent = Math.round(f / m.aulas.length * 100) + '%';
        });

        cont.appendChild(linha);
      });

      lista.appendChild(det);
    });

    if (!lista.children.length) {
      lista.innerHTML = '<div class="vazio">Nenhuma aula neste filtro. 🎉</div>';
    }
  }

  /* ---------- Filtros ---------- */
  document.querySelectorAll('[data-vfiltro]').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('[data-vfiltro]').forEach(x => x.classList.remove('ativo'));
      b.classList.add('ativo');
      filtroAtual = b.dataset.vfiltro;
      renderModulos();
    });
  });

  /* ---------- Init ---------- */
  renderProgresso();
  renderModulos();

})();
