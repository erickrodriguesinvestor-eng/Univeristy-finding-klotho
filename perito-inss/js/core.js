/* ============================================================
   CORE — armazenamento, estatísticas e modelo de probabilidade
   Plataforma de treino: Perito Médico Federal (INSS) — Cebraspe
   ============================================================ */

const PMF = (() => {

  const KEY_HIST = 'pmf_historico';
  const KEY_CFG  = 'pmf_config';

  /* ---------- Parâmetros de referência do concurso ----------
     Valores editáveis pelo usuário. Defaults inspirados no
     concurso de Perito Médico Federal (Cebraspe, 2022):
     ~1.000 vagas e dezenas de milhares de inscritos.
     São ESTIMATIVAS para fins de treino, não dados oficiais.  */
  const CFG_PADRAO = {
    vagas: 1000,
    inscritos: 25000,
    abstencao: 30,        // % de inscritos que faltam à prova
    mediaConcorrentes: 42, // % líquido médio estimado dos presentes
    desvioConcorrentes: 16 // desvio-padrão estimado (% líquido)
  };

  function getConfig() {
    try {
      return Object.assign({}, CFG_PADRAO, JSON.parse(localStorage.getItem(KEY_CFG) || '{}'));
    } catch { return Object.assign({}, CFG_PADRAO); }
  }

  function setConfig(cfg) {
    localStorage.setItem(KEY_CFG, JSON.stringify(cfg));
  }

  /* ---------- Histórico de simulados ---------- */
  function getHistorico() {
    try { return JSON.parse(localStorage.getItem(KEY_HIST) || '[]'); }
    catch { return []; }
  }

  function salvarSimulado(registro) {
    const h = getHistorico();
    h.push(registro);
    localStorage.setItem(KEY_HIST, JSON.stringify(h));
  }

  function limparHistorico() {
    localStorage.removeItem(KEY_HIST);
  }

  /* ---------- Pontuação Cebraspe ----------
     Cada item certo: +1; errado: −1; em branco: 0.
     Nota líquida = certos − errados.                  */
  function notaLiquida(acertos, erros) {
    return acertos - erros;
  }

  function percentualLiquido(acertos, erros, total) {
    if (!total) return 0;
    return Math.max(0, (acertos - erros) / total * 100);
  }

  /* ---------- Funções estatísticas ---------- */

  // CDF da normal padrão (aproximação de Abramowitz & Stegun, erro < 7.5e-8)
  function phi(z) {
    const sign = z < 0 ? -1 : 1;
    const x = Math.abs(z) / Math.SQRT2;
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return 0.5 * (1 + sign * y);
  }

  // Inversa da CDF normal padrão (aproximação de Acklam)
  function phiInv(p) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    const pl = 0.02425, ph = 1 - pl;
    let q, r;
    if (p < pl) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
             ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    if (p <= ph) {
      q = p - 0.5; r = q * q;
      return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
             (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    }
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  /* ---------- Estimativa de desempenho do candidato ----------
     Média ponderada dos percentuais líquidos dos simulados,
     com peso maior para os mais recentes (peso = índice+1).
     A incerteza diminui com o número de simulados.            */
  function desempenhoEstimado() {
    const h = getHistorico();
    if (!h.length) return null;
    let somaPesos = 0, soma = 0;
    h.forEach((s, i) => {
      const peso = i + 1;
      soma += s.percentualLiquido * peso;
      somaPesos += peso;
    });
    const media = soma / somaPesos;
    // incerteza da estimativa: alta com poucos simulados, piso de 6 p.p.
    const incerteza = Math.max(6, 22 / Math.sqrt(h.length));
    return { media, incerteza, n: h.length };
  }

  /* ---------- Probabilidade de aprovação ----------
     Modelo: notas líquidas dos concorrentes presentes ~
     Normal(mediaConcorrentes, desvioConcorrentes).
     A nota de corte é o percentil correspondente à razão
     vagas / presentes. P(aprovação) = P(nota do candidato,
     com sua incerteza, superar a nota de corte).        */
  function probabilidadeAprovacao() {
    const cfg = getConfig();
    const desemp = desempenhoEstimado();
    const presentes = Math.max(cfg.vagas, Math.round(cfg.inscritos * (1 - cfg.abstencao / 100)));
    const taxaAprovacao = Math.min(1, cfg.vagas / presentes);
    const percentilCorte = 1 - taxaAprovacao;
    const notaCorte = cfg.mediaConcorrentes + phiInv(percentilCorte) * cfg.desvioConcorrentes;

    if (!desemp) {
      return { semDados: true, taxaAprovacao, notaCorte, presentes, cfg };
    }

    const z = (desemp.media - notaCorte) / desemp.incerteza;
    const prob = phi(z);

    return {
      semDados: false,
      probabilidade: prob,
      taxaAprovacao,
      notaCorte,
      presentes,
      desempenho: desemp,
      cfg
    };
  }

  /* ---------- Estatísticas por disciplina ---------- */
  function estatisticasPorDisciplina() {
    const h = getHistorico();
    const stats = {};
    h.forEach(s => {
      (s.porDisciplina || []).forEach(d => {
        if (!stats[d.disciplina]) stats[d.disciplina] = { acertos: 0, erros: 0, branco: 0, total: 0 };
        stats[d.disciplina].acertos += d.acertos;
        stats[d.disciplina].erros += d.erros;
        stats[d.disciplina].branco += d.branco;
        stats[d.disciplina].total += d.total;
      });
    });
    return stats;
  }

  /* ---------- Utilidades ---------- */
  function embaralhar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function fmtPct(x, casas = 1) {
    return (x).toFixed(casas).replace('.', ',') + '%';
  }

  return {
    getConfig, setConfig, CFG_PADRAO,
    getHistorico, salvarSimulado, limparHistorico,
    notaLiquida, percentualLiquido,
    desempenhoEstimado, probabilidadeAprovacao, estatisticasPorDisciplina,
    embaralhar, fmtPct, phi, phiInv
  };
})();

window.PMF = PMF;
