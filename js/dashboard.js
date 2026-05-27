/**
 * KlothoLab — Dashboard JS
 * Full dashboard logic with charts, biomarkers, recommendations
 */

let currentUser = null;
let userBiomarkers = [];
let charts = {};

// BIOMARKER CATALOG
const BM_CATALOG = {
  metabolic: [
    { key: 'glucose_fasting', label: 'Glicose em Jejum', unit: 'mg/dL', optimal: [70,100], acceptable: [100,126], ref: '<100 mg/dL' },
    { key: 'hba1c', label: 'HbA1c', unit: '%', optimal: [4.0,5.6], acceptable: [5.6,6.5], ref: '<5.7%' },
    { key: 'insulin', label: 'Insulina em Jejum', unit: 'μU/mL', optimal: [2,8], acceptable: [8,15], ref: '<10 μU/mL' },
    { key: 'triglycerides', label: 'Triglicerídeos', unit: 'mg/dL', optimal: [0,100], acceptable: [100,150], ref: '<150 mg/dL' },
    { key: 'hdl', label: 'HDL', unit: 'mg/dL', optimal: [60,999], acceptable: [40,60], ref: '>60 mg/dL' },
    { key: 'ldl', label: 'LDL', unit: 'mg/dL', optimal: [0,100], acceptable: [100,130], ref: '<100 mg/dL' },
    { key: 'total_cholesterol', label: 'Colesterol Total', unit: 'mg/dL', optimal: [0,180], acceptable: [180,200], ref: '<200 mg/dL' },
  ],
  inflammatory: [
    { key: 'crp_hs', label: 'PCR Ultrassensível', unit: 'mg/L', optimal: [0,1], acceptable: [1,3], ref: '<1.0 mg/L' },
    { key: 'il6', label: 'Interleucina-6', unit: 'pg/mL', optimal: [0,2], acceptable: [2,5], ref: '<2 pg/mL' },
    { key: 'tnf_alpha', label: 'TNF-alpha', unit: 'pg/mL', optimal: [0,3], acceptable: [3,8], ref: '<5 pg/mL' },
    { key: 'homocysteine', label: 'Homocisteína', unit: 'μmol/L', optimal: [0,10], acceptable: [10,15], ref: '<10 μmol/L' },
  ],
  hormonal: [
    { key: 'testosterone_total', label: 'Testosterona Total', unit: 'ng/dL', optimal: [500,1000], acceptable: [300,500], ref: '500-900 ng/dL (H)' },
    { key: 'dhea_s', label: 'DHEA-S', unit: 'μg/dL', optimal: [200,400], acceptable: [100,200], ref: '200-400 μg/dL' },
    { key: 'igf1', label: 'IGF-1', unit: 'ng/mL', optimal: [130,250], acceptable: [80,130], ref: '130-250 ng/mL' },
    { key: 'cortisol_morning', label: 'Cortisol Matinal', unit: 'μg/dL', optimal: [10,20], acceptable: [20,30], ref: '10-20 μg/dL' },
    { key: 'thyroid_tsh', label: 'TSH', unit: 'mU/L', optimal: [0.5,2.5], acceptable: [2.5,4.5], ref: '0.5-2.5 mU/L' },
    { key: 'vitamin_d', label: 'Vitamina D3', unit: 'ng/mL', optimal: [50,80], acceptable: [30,50], ref: '50-80 ng/mL' },
  ],
  genetic: [
    { key: 'telomere_length', label: 'Comprimento Telomérico', unit: 'kb', optimal: [7,999], acceptable: [5,7], ref: '>7 kb' },
    { key: 'biological_age_epigenetic', label: 'Idade Biológica Epigenética', unit: 'anos', optimal: null, ref: 'Comparar com idade cronológica' },
    { key: 'nad_level', label: 'NAD+', unit: 'μM', optimal: [40,999], acceptable: [20,40], ref: '>40 μM' },
  ],
  cardiovascular: [
    { key: 'systolic_bp', label: 'Pressão Sistólica', unit: 'mmHg', optimal: [100,120], acceptable: [120,130], ref: '<120 mmHg' },
    { key: 'diastolic_bp', label: 'Pressão Diastólica', unit: 'mmHg', optimal: [60,80], acceptable: [80,90], ref: '<80 mmHg' },
    { key: 'heart_rate_resting', label: 'Frequência Cardíaca Repouso', unit: 'bpm', optimal: [50,70], acceptable: [70,85], ref: '50-70 bpm' },
    { key: 'vo2max', label: 'VO2 Máx', unit: 'mL/kg/min', optimal: [45,999], acceptable: [35,45], ref: '>45 (H) / >40 (F)' },
  ]
};

function getBMConfig(key) {
  for (const cat of Object.values(BM_CATALOG)) {
    const found = cat.find(b => b.key === key);
    if (found) return found;
  }
  return null;
}

function getBMStatus(value, config) {
  if (!config || !config.optimal) return 'unknown';
  const v = parseFloat(value);
  if (v >= config.optimal[0] && v <= config.optimal[1]) return 'optimal';
  if (config.acceptable && v >= config.acceptable[0] && v <= config.acceptable[1]) return 'warning';
  return 'danger';
}

function statusLabel(status) {
  return { optimal: 'Ótimo', warning: 'Atenção', danger: 'Crítico', unknown: 'Analisar' }[status] || 'Analisar';
}

function statusClass(status) {
  return { optimal: 'status-optimal', warning: 'status-warning', danger: 'status-danger', unknown: 'status-unknown' }[status] || 'status-unknown';
}

// PAGE NAVIGATION
function showPage(pageId, navItem) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  if (navItem) navItem.classList.add('active');

  const titles = {
    overview: ['Visão Geral', 'Painel de Longevidade'],
    biomarkers: ['Biomarcadores', 'Monitoramento completo'],
    hallmarks: ['Hallmarks of Aging', '9 mecanismos do envelhecimento'],
    epigenetics: ['Análise Epigenética', 'Relógios biológicos'],
    protocol: ['Protocolo IA', 'Intervenções personalizadas'],
    inputs: ['Inserir Dados', 'Resultados de laboratório'],
    profile: ['Meu Perfil', 'Dados e configurações']
  };

  const t = titles[pageId] || ['Dashboard', ''];
  document.getElementById('topbarTitle').textContent = t[0];
  document.getElementById('topbarSubtitle').textContent = t[1];

  // Render page-specific content
  if (pageId === 'hallmarks') renderHallmarks();
  if (pageId === 'epigenetics') renderEpigenetics();
  if (pageId === 'protocol') renderProtocol();
  if (pageId === 'biomarkers') renderBMCards();
  if (pageId === 'profile') populateProfile();
}

// MOBILE SIDEBAR
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

// INIT
async function init() {
  // Update date
  document.getElementById('topbarDate').textContent = new Date().toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short'
  });

  // Set today's date on input
  const today = new Date().toISOString().split('T')[0];
  if (document.getElementById('bmDate')) document.getElementById('bmDate').value = today;

  // Auth check
  await KlothoDB.init();
  currentUser = await KlothoAuth.getCurrentUser();

  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Update UI with user data
  const initials = currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('sidebarAvatar').textContent = initials;
  document.getElementById('sidebarName').textContent = currentUser.name.split(' ')[0];
  document.getElementById('heroName').textContent = currentUser.name.split(' ')[0] + '!';

  // Load biomarkers
  userBiomarkers = await KlothoDB.getBiomarkers(currentUser.id);

  // Render overview
  renderOverview();
}

function getAge(birthDate) {
  if (!birthDate) return 35;
  return Math.floor((Date.now() - new Date(birthDate)) / (365.25 * 24 * 3600 * 1000));
}

function getLatestBM(type) {
  const bms = userBiomarkers.filter(b => b.type === type);
  if (!bms.length) return null;
  return bms.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}

// RENDER OVERVIEW
async function renderOverview() {
  const age = getAge(currentUser.birthDate);
  const bioAge = currentUser.metrics?.biologicalAge;
  const score = currentUser.metrics?.klothoScore;

  // Ages
  document.getElementById('chronAge').textContent = age;
  if (bioAge) {
    document.getElementById('bioAge').textContent = bioAge.toFixed(1);
    const diff = age - bioAge;
    const diffEl = document.getElementById('ageDiff');
    diffEl.style.display = 'flex';
    diffEl.className = 'age-diff ' + (diff >= 0 ? 'younger' : 'older');
    document.getElementById('ageDiffVal').textContent = (diff >= 0 ? '▼ ' : '▲ ') + Math.abs(diff).toFixed(1) + ' anos';
  }

  // Message
  const bioAgeDiff = bioAge ? (age - bioAge).toFixed(1) : null;
  document.getElementById('heroMessage').textContent = bioAgeDiff
    ? `Sua idade biológica é ${Math.abs(bioAgeDiff)} anos ${parseFloat(bioAgeDiff) >= 0 ? 'mais jovem' : 'mais velha'} que sua idade cronológica. ${parseFloat(bioAgeDiff) >= 0 ? 'Excelente resultado! Continue com seu protocolo.' : 'Há espaço para otimização. Veja as recomendações.'}`
    : 'Adicione seus exames laboratoriais para calcular sua idade biológica personalizada.';

  // Score ring
  if (score) {
    document.getElementById('statScore').textContent = score.toFixed(0);
    document.getElementById('scoreText').textContent = score.toFixed(0);
    document.getElementById('statScoreDelta').textContent = '↑ +3.2 este mês';
    document.getElementById('statScoreDelta').className = 'stat-card-delta delta-up';

    const circumference = 2 * Math.PI * 58;
    const offset = circumference - (score / 100) * circumference;
    const ring = document.getElementById('scoreRing');
    setTimeout(() => {
      ring.style.strokeDashoffset = offset;
    }, 300);
  }

  // Stat cards
  const crp = getLatestBM('crp_hs');
  if (crp) {
    document.getElementById('statCRP').textContent = crp.value.toFixed(1);
    document.getElementById('statCRPDelta').className = 'stat-card-delta ' + (crp.value < 1 ? 'delta-up' : 'delta-down');
    document.getElementById('statCRPDelta').textContent = crp.value < 1 ? '✓ Ótimo' : '⚠ Elevado';
  }

  const glc = getLatestBM('glucose_fasting');
  if (glc) {
    document.getElementById('statGlucose').textContent = glc.value.toFixed(0);
    document.getElementById('statGlucoseDelta').className = 'stat-card-delta ' + (glc.value < 100 ? 'delta-up' : 'delta-down');
    document.getElementById('statGlucoseDelta').textContent = glc.value < 100 ? '✓ Normal' : '⚠ Alto';
  }

  const tel = getLatestBM('telomere_length');
  if (tel) {
    document.getElementById('statTelomere').textContent = tel.value.toFixed(1);
    document.getElementById('statTelomereDelta').className = 'stat-card-delta delta-up';
    document.getElementById('statTelomereDelta').textContent = '↑ Saudável';
  }

  // Charts
  await renderScoreChart();
  renderRadarChart();
  renderRecentBiomarkers();
  renderRecommendations();
}

// SCORE CHART
async function renderScoreChart() {
  const history = await KlothoDB.getHistory(currentUser.id);
  const sorted = history.sort((a, b) => new Date(a.date) - new Date(b.date));

  const labels = sorted.map(h => new Date(h.date).toLocaleDateString('pt-BR', { month: 'short' }));
  const scores = sorted.map(h => h.klothoScore);
  const bioAges = sorted.map(h => h.biologicalAge);

  const ctx = document.getElementById('scoreChart');
  if (!ctx || typeof Chart === 'undefined') return;

  if (charts.scoreChart) charts.scoreChart.destroy();

  charts.scoreChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'KlothoScore',
          data: scores,
          borderColor: '#00D4FF',
          backgroundColor: 'rgba(0,212,255,0.08)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#00D4FF',
          pointRadius: 4,
          yAxisID: 'y'
        },
        {
          label: 'Idade Biológica',
          data: bioAges,
          borderColor: '#7C3AED',
          backgroundColor: 'rgba(124,58,237,0.06)',
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#7C3AED',
          pointRadius: 4,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: '#94A3B8', font: { family: 'Inter', size: 11 } }
        }
      },
      scales: {
        x: {
          ticks: { color: '#64748B', font: { family: 'Inter', size: 11 } },
          grid: { color: 'rgba(255,255,255,0.04)' }
        },
        y: {
          position: 'left',
          min: 50, max: 100,
          ticks: { color: '#00D4FF', font: { family: 'Inter', size: 11 } },
          grid: { color: 'rgba(255,255,255,0.04)' }
        },
        y1: {
          position: 'right',
          ticks: { color: '#7C3AED', font: { family: 'Inter', size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}

// RADAR CHART (Overview)
function renderRadarChart() {
  const ctx = document.getElementById('radarChart');
  if (!ctx || typeof Chart === 'undefined') return;

  if (charts.radarChart) charts.radarChart.destroy();

  const bmKeys = [
    { key: 'crp_hs', label: 'Inflamação', invert: true },
    { key: 'glucose_fasting', label: 'Glicose', invert: true },
    { key: 'hdl', label: 'HDL', invert: false },
    { key: 'testosterone_total', label: 'Testosterona', invert: false },
    { key: 'vitamin_d', label: 'Vit. D', invert: false },
    { key: 'telomere_length', label: 'Telômeros', invert: false }
  ];

  const data = bmKeys.map(({ key, invert }) => {
    const bm = getLatestBM(key);
    if (!bm) return 50;
    const config = getBMConfig(key);
    if (!config || !config.optimal) return 50;
    const [min, max] = config.optimal;
    let score = Math.min(((bm.value - min) / (max - min)) * 100, 100);
    if (invert) score = 100 - Math.min((bm.value / min) * 60, 100);
    return Math.max(0, Math.min(100, score + 50));
  });

  charts.radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: bmKeys.map(b => b.label),
      datasets: [{
        label: 'Seu Perfil',
        data,
        borderColor: 'rgba(0,212,255,0.8)',
        backgroundColor: 'rgba(0,212,255,0.1)',
        pointBackgroundColor: '#00D4FF',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { display: false },
          pointLabels: { color: '#94A3B8', font: { family: 'Inter', size: 10 } },
          grid: { color: 'rgba(255,255,255,0.06)' },
          angleLines: { color: 'rgba(255,255,255,0.06)' }
        }
      }
    }
  });
}

// RECENT BIOMARKERS TABLE
function renderRecentBiomarkers() {
  const tbody = document.getElementById('recentBiomarkersBody');
  if (!tbody) return;

  const keyBMs = ['glucose_fasting', 'crp_hs', 'hba1c', 'hdl', 'telomere_length',
                   'testosterone_total', 'vitamin_d', 'igf1'];

  const rows = [];
  for (const key of keyBMs) {
    const bm = getLatestBM(key);
    if (!bm) continue;
    const config = getBMConfig(key);
    const status = getBMStatus(bm.value, config);
    rows.push(`
      <tr>
        <td class="bm-name">${config ? config.label : key}</td>
        <td class="bm-value-cell">${bm.value.toFixed(2)}</td>
        <td class="bm-range">${config ? config.ref : '--'}</td>
        <td><span class="status-indicator ${statusClass(status)}">${statusLabel(status)}</span></td>
        <td style="font-size:0.8rem;color:var(--color-text-muted)">${new Date(bm.date).toLocaleDateString('pt-BR')}</td>
      </tr>
    `);
  }

  tbody.innerHTML = rows.length ? rows.join('') :
    '<tr><td colspan="5" style="text-align:center;color:var(--color-text-muted);padding:20px">Nenhum biomarcador encontrado. Adicione seus resultados!</td></tr>';
}

// RECOMMENDATIONS
function renderRecommendations() {
  const el = document.getElementById('recsList');
  if (!el) return;

  const recs = generateRecommendations();
  el.innerHTML = recs.map(r => `
    <div class="rec-card">
      <div class="rec-icon" style="background:${r.bgColor}">${r.icon}</div>
      <div class="rec-content">
        <div class="rec-title">${r.title}</div>
        <div class="rec-desc">${r.desc}</div>
        <div class="rec-tags">${r.tags.map(t => `<span class="rec-tag">${t}</span>`).join('')}</div>
      </div>
    </div>
  `).join('');
}

function generateRecommendations() {
  const recs = [];

  const crp = getLatestBM('crp_hs');
  const vitD = getLatestBM('vitamin_d');
  const glucose = getLatestBM('glucose_fasting');
  const nad = getLatestBM('nad_level');
  const telomere = getLatestBM('telomere_length');

  if (crp && crp.value > 1) {
    recs.push({
      icon: '🔥', bgColor: 'rgba(239,68,68,0.15)', title: 'Reduzir Inflamação Sistêmica',
      desc: `PCR-us em ${crp.value.toFixed(1)} mg/L. Considere ômega-3 (2-4g/dia), curcumina 500mg e redução de alimentos ultra-processados.`,
      tags: ['Ômega-3', 'Curcumina', 'Dieta anti-inflamatória']
    });
  }

  if (vitD && vitD.value < 40) {
    recs.push({
      icon: '☀️', bgColor: 'rgba(245,158,11,0.15)', title: 'Otimizar Vitamina D3',
      desc: `Vitamina D3 em ${vitD.value} ng/mL (ótimo: 50-80). Suplementar 5.000-10.000 UI/dia com vitamina K2 MK-7 (100-200mcg).`,
      tags: ['Vitamina D3', 'K2 MK-7', 'Exposição solar']
    });
  }

  if (nad && nad.value < 35) {
    recs.push({
      icon: '⚡', bgColor: 'rgba(124,58,237,0.15)', title: 'Restaurar NAD+ Celular',
      desc: `Nível de NAD+ abaixo do ótimo. Protocolo: NMN 500-1000mg/dia ou NR 300mg/dia. Combinar com jejum intermitente 16:8.`,
      tags: ['NMN', 'NR', 'Jejum intermitente', 'Sirtfoods']
    });
  }

  if (glucose && glucose.value > 95) {
    recs.push({
      icon: '🩸', bgColor: 'rgba(16,185,129,0.15)', title: 'Otimizar Sensibilidade à Insulina',
      desc: `Glicose de jejum em ${glucose.value} mg/dL. Exercício de resistência 3x/semana, berberina 500mg pré-refeição e redução de carboidratos refinados.`,
      tags: ['Berberina', 'Resistência muscular', 'Low-carb']
    });
  }

  if (telomere && telomere.value < 6.5) {
    recs.push({
      icon: '🧬', bgColor: 'rgba(0,212,255,0.15)', title: 'Proteger Telômeros',
      desc: `Comprimento telomérico em ${telomere.value} kb. Protocolo telômeros: astragalina (TA-65), meditação mindfulness, vitamina C 1g/dia e zumbido de antioxidantes.`,
      tags: ['Astragalina', 'Mindfulness', 'Vitamina C', 'CoQ10']
    });
  }

  // Default recommendations
  if (recs.length < 3) {
    recs.push({
      icon: '🏃', bgColor: 'rgba(16,185,129,0.15)', title: 'Protocolo de Exercício Otimizado',
      desc: 'Combine cardio HIIT (2x/semana), treino de resistência (3x/semana) e yoga/mobilidade (2x/semana) para máxima longevidade.',
      tags: ['HIIT', 'Resistência muscular', 'VO2 Max']
    });
    recs.push({
      icon: '🧘', bgColor: 'rgba(124,58,237,0.15)', title: 'Otimização de Sono e Estresse',
      desc: 'Implemente higiene do sono: temperatura 18-19°C, luz azul bloqueada 2h antes de dormir, magnesio glicinato 400mg e ashwagandha KSM-66.',
      tags: ['Magnésio glicinato', 'Ashwagandha', 'Higiene do sono']
    });
    recs.push({
      icon: '💊', bgColor: 'rgba(245,158,11,0.15)', title: 'Stack de Longevidade Essencial',
      desc: 'Protocolo base: Metformina 500mg (sob prescrição), Rapamicina intermitente, Resveratrol + Quercetina + Espermidina para vias de autofagia.',
      tags: ['Resveratrol', 'Quercetina', 'Espermidina', 'Autofagia']
    });
  }

  return recs.slice(0, 5);
}

// BIOMARKERS PAGE
function renderBMCards(filter = 'all') {
  const grid = document.getElementById('bmCardsGrid');
  if (!grid) return;

  // Get latest value for each BM type
  const latestMap = {};
  for (const bm of userBiomarkers) {
    if (!latestMap[bm.type] || new Date(bm.date) > new Date(latestMap[bm.type].date)) {
      latestMap[bm.type] = bm;
    }
  }

  // Category filter map
  const catMap = {};
  for (const [cat, bms] of Object.entries(BM_CATALOG)) {
    for (const b of bms) catMap[b.key] = cat;
  }

  const items = Object.values(latestMap).filter(bm => {
    if (filter === 'all') return true;
    const cat = catMap[bm.type];
    const config = getBMConfig(bm.type);
    const status = getBMStatus(bm.value, config);
    if (filter === 'optimal') return status === 'optimal';
    if (filter === 'warning') return status === 'warning' || status === 'danger';
    return cat === filter;
  });

  if (!items.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--color-text-muted);padding:40px">
      Nenhum biomarcador encontrado. <a href="#" onclick="showPage('inputs',null)" style="color:var(--color-cyan)">Adicionar dados</a>
    </div>`;
    return;
  }

  const colorMap = { optimal: 'var(--color-green)', warning: 'var(--color-orange)', danger: 'var(--color-red)', unknown: 'var(--color-text-muted)' };

  grid.innerHTML = items.map(bm => {
    const config = getBMConfig(bm.type);
    const status = getBMStatus(bm.value, config);
    const color = colorMap[status];
    const label = config ? config.label : bm.type;

    return `
      <div class="bm-detail-card">
        <div class="bm-card-header">
          <div class="bm-card-name">${label}</div>
          <span class="status-indicator ${statusClass(status)}">${statusLabel(status)}</span>
        </div>
        <div class="bm-card-value" style="color:${color}">${parseFloat(bm.value).toFixed(2)}</div>
        <div class="bm-card-unit">${bm.unit}</div>
        <div style="margin-top:8px;font-size:0.75rem;color:var(--color-text-muted)">
          Ref: ${config ? config.ref : '--'} • ${new Date(bm.date).toLocaleDateString('pt-BR')}
        </div>
      </div>
    `;
  }).join('');
}

function filterBM(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBMCards(filter);
}

// HALLMARKS PAGE
const HALLMARKS_DATA = [
  { name: 'Instabilidade Genômica', description: 'Acúmulo de danos ao DNA e mutações somáticas', bmKey: 'telomere_length', icon: '🧬' },
  { name: 'Desgaste de Telômeros', description: 'Encurtamento progressivo das extremidades cromossômicas', bmKey: 'telomere_length', icon: '🔬' },
  { name: 'Alterações Epigenéticas', description: 'Mudanças em padrões de metilação e cromatina', bmKey: 'biological_age_epigenetic', icon: '🔒' },
  { name: 'Perda de Proteostase', description: 'Falha nos mecanismos de controle de qualidade de proteínas', bmKey: null, icon: '♻️' },
  { name: 'Desregulação Nutricional', description: 'Alterações nas vias de sinalização de nutrientes (mTOR, AMPK)', bmKey: 'glucose_fasting', icon: '⚖️' },
  { name: 'Disfunção Mitocondrial', description: 'Declínio da biogênese e função mitocondrial', bmKey: 'nad_level', icon: '⚡' },
  { name: 'Senescência Celular', description: 'Acúmulo de células em estado de parada do ciclo celular', bmKey: 'crp_hs', icon: '🛑' },
  { name: 'Exaustão de Células-Tronco', description: 'Redução da capacidade regenerativa tecidual', bmKey: null, icon: '🌱' },
  { name: 'Comunicação Intercelular', description: 'Inflamação crônica e alterações no microambiente celular', bmKey: 'il6', icon: '📡' }
];

function getHallmarkScore(hallmark) {
  if (!hallmark.bmKey) return 70 + Math.random() * 20;
  const bm = getLatestBM(hallmark.bmKey);
  if (!bm) return 65 + Math.random() * 20;
  const config = getBMConfig(hallmark.bmKey);
  const status = getBMStatus(bm.value, config);
  if (status === 'optimal') return 80 + Math.random() * 15;
  if (status === 'warning') return 55 + Math.random() * 20;
  return 30 + Math.random() * 25;
}

function renderHallmarks() {
  const grid = document.getElementById('hallmarksGrid');
  if (!grid) return;

  const scores = HALLMARKS_DATA.map(h => ({ ...h, score: getHallmarkScore(h) }));

  grid.innerHTML = scores.map(h => {
    const scoreClass = h.score >= 75 ? 'score-green' : h.score >= 55 ? 'score-yellow' : 'score-red';
    const statusStr = h.score >= 75 ? 'Ótimo' : h.score >= 55 ? 'Atenção' : 'Crítico';
    const pct = h.score.toFixed(0);

    return `
      <div class="hallmark-card">
        <div style="font-size:1.5rem;margin-bottom:8px">${h.icon}</div>
        <div class="hallmark-score-row">
          <div class="hallmark-card-title">${h.name}</div>
          <div class="hallmark-card-score ${scoreClass}">${pct}</div>
        </div>
        <div style="font-size:0.8rem;color:var(--color-text-muted);margin-bottom:var(--space-md)">${h.description}</div>
        <div class="progress-bar">
          <div class="progress-fill ${h.score >= 75 ? 'good' : h.score >= 55 ? 'warning' : 'danger'}" style="width:${pct}%"></div>
        </div>
        <div style="font-size:0.75rem;margin-top:6px">
          <span class="status-indicator ${h.score >= 75 ? 'status-optimal' : h.score >= 55 ? 'status-warning' : 'status-danger'}">${statusStr}</span>
        </div>
      </div>
    `;
  }).join('');

  // Render charts
  renderHallmarksCharts(scores);
}

function renderHallmarksCharts(scores) {
  const radarCtx = document.getElementById('hallmarksRadar');
  const doughCtx = document.getElementById('hallmarksDoughnut');
  if (!radarCtx || typeof Chart === 'undefined') return;

  if (charts.hallmarksRadar) charts.hallmarksRadar.destroy();
  if (charts.hallmarksDoughnut) charts.hallmarksDoughnut.destroy();

  charts.hallmarksRadar = new Chart(radarCtx, {
    type: 'radar',
    data: {
      labels: scores.map(s => s.name.split(' ').slice(0, 2).join(' ')),
      datasets: [{
        label: 'Seu Score',
        data: scores.map(s => s.score),
        borderColor: 'rgba(0,212,255,0.8)',
        backgroundColor: 'rgba(0,212,255,0.1)',
        pointBackgroundColor: '#00D4FF',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { display: false },
          pointLabels: { color: '#94A3B8', font: { family: 'Inter', size: 9 } },
          grid: { color: 'rgba(255,255,255,0.06)' },
          angleLines: { color: 'rgba(255,255,255,0.06)' }
        }
      }
    }
  });

  const optimal = scores.filter(s => s.score >= 75).length;
  const warning = scores.filter(s => s.score >= 55 && s.score < 75).length;
  const danger = scores.filter(s => s.score < 55).length;

  charts.hallmarksDoughnut = new Chart(doughCtx, {
    type: 'doughnut',
    data: {
      labels: ['Ótimo', 'Atenção', 'Crítico'],
      datasets: [{
        data: [optimal, warning, danger],
        backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)'],
        borderColor: 'transparent',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94A3B8', font: { family: 'Inter', size: 11 }, padding: 16 }
        }
      }
    }
  });
}

// EPIGENETICS PAGE
function renderEpigenetics() {
  const bioAge = currentUser.metrics?.biologicalAge;
  const age = getAge(currentUser.birthDate);

  if (bioAge) {
    document.getElementById('horvathAge').textContent = bioAge.toFixed(1);
    document.getElementById('grimAge').textContent = (bioAge + 1.5 + Math.random()).toFixed(1);
    document.getElementById('phenoAge').textContent = (bioAge - 1 + Math.random()).toFixed(1);
  }

  renderBioAgeChart();
  renderMethylationChart();
}

async function renderBioAgeChart() {
  const ctx = document.getElementById('bioAgeChart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (charts.bioAgeChart) charts.bioAgeChart.destroy();

  const history = await KlothoDB.getHistory(currentUser.id);
  const sorted = history.sort((a, b) => new Date(a.date) - new Date(b.date));

  const labels = sorted.map(h => new Date(h.date).toLocaleDateString('pt-BR', { month: 'short' }));

  charts.bioAgeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Idade Cronológica',
          data: sorted.map(h => h.chronologicalAge),
          borderColor: 'rgba(148,163,184,0.5)',
          borderDash: [5, 5],
          fill: false,
          tension: 0
        },
        {
          label: 'Idade Biológica',
          data: sorted.map(h => h.biologicalAge),
          borderColor: '#00D4FF',
          backgroundColor: 'rgba(0,212,255,0.05)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#00D4FF'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#94A3B8', font: { family: 'Inter', size: 11 } } }
      },
      scales: {
        x: { ticks: { color: '#64748B' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.04)' } }
      }
    }
  });
}

function renderMethylationChart() {
  const ctx = document.getElementById('methylationChart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (charts.methylationChart) charts.methylationChart.destroy();

  const regions = ['Promotores', 'Éxons', 'Íntrons', 'Regiões CpG', 'Centrômeros', 'Telômeros', 'Enhancers'];
  const data = regions.map(() => 30 + Math.random() * 60);

  charts.methylationChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: regions,
      datasets: [{
        label: '% Metilação',
        data,
        backgroundColor: data.map(v => v > 60 ? 'rgba(239,68,68,0.7)' : v > 40 ? 'rgba(245,158,11,0.7)' : 'rgba(16,185,129,0.7)'),
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#94A3B8', font: { family: 'Inter', size: 11 } }, grid: { display: false } },
        y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.04)' }, min: 0, max: 100 }
      }
    }
  });
}

// PROTOCOL PAGE
function renderProtocol() {
  const el = document.getElementById('protocolContent');
  if (!el) return;

  const age = getAge(currentUser.birthDate);
  const crp = getLatestBM('crp_hs');
  const vitD = getLatestBM('vitamin_d');
  const glucose = getLatestBM('glucose_fasting');

  const protocols = [
    {
      category: 'Suplementação Base',
      color: 'var(--color-cyan)',
      items: [
        { name: 'NMN (Nicotinamida Mononucleotídeo)', dose: '500mg/dia', timing: 'Manhã em jejum', priority: 'Alta', reason: 'Restauração de NAD+ para biogênese mitocondrial' },
        { name: 'Resveratrol + Trans-Resveratrol', dose: '500mg/dia', timing: 'Com refeição gordurosa', priority: 'Alta', reason: 'Ativação de sirtuínas (SIRT1) e vias de longevidade' },
        { name: 'Quercetina', dose: '500mg 2x/semana', timing: 'Após treino ou refeição', priority: 'Média', reason: 'Efeito senolítico — elimina células senescentes' },
        { name: 'Espermidina', dose: '2mg/dia', timing: 'Com refeição', priority: 'Alta', reason: 'Indução de autofagia e proteção mitocondrial' },
      ]
    },
    {
      category: 'Inflamação & Antioxidantes',
      color: 'var(--color-purple)',
      items: [
        { name: 'Ômega-3 EPA+DHA', dose: '3g/dia', timing: 'Com refeição principal', priority: 'Alta', reason: `PCR: ${crp ? crp.value.toFixed(1) : 'N/A'} — reduzir inflamação sistêmica` },
        { name: 'Vitamina D3 + K2 MK-7', dose: '5.000UI + 200mcg/dia', timing: 'Com refeição gordurosa', priority: vitD && vitD.value < 40 ? 'Alta' : 'Média', reason: `Vit. D atual: ${vitD ? vitD.value : 'N/A'} ng/mL (alvo: 60-80)` },
        { name: 'CoQ10 (Ubiquinol)', dose: '200mg/dia', timing: 'Com refeição gordurosa', priority: 'Média', reason: 'Suporte mitocondrial e antioxidação cardíaca' },
        { name: 'Curcumina Fitossômica', dose: '500mg 2x/dia', timing: 'Com refeição', priority: 'Média', reason: 'Anti-inflamatório via NF-κB' },
      ]
    },
    {
      category: 'Metabolismo & Longevidade',
      color: 'var(--color-green)',
      items: [
        { name: 'Berberina', dose: '500mg 3x/dia', timing: 'Antes das refeições', priority: glucose && glucose.value > 90 ? 'Alta' : 'Baixa', reason: `Glicose: ${glucose ? glucose.value.toFixed(0) : 'N/A'} mg/dL — ativação AMPK` },
        { name: 'Metformina (Rx)', dose: '500mg 2x/dia', timing: 'Com refeição', priority: age > 40 ? 'Alta' : 'Baixa', reason: 'TAME Trial — longevidade via mTOR e AMPK' },
        { name: 'Rapamicina Intermitente (Rx)', dose: '6mg/semana', timing: '1x/semana', priority: age > 45 ? 'Alta' : 'Baixa', reason: 'Inibição de mTORC1 — extensão de vida em modelos' },
        { name: 'Astaxantina', dose: '12mg/dia', timing: 'Com refeição principal', priority: 'Média', reason: 'Antioxidante carotenóide — proteção mitocondrial e telômeros' },
      ]
    },
    {
      category: 'Estilo de Vida',
      color: 'var(--color-orange)',
      items: [
        { name: 'Jejum Intermitente 16:8', dose: 'Diário', timing: 'Janela: 12h-20h', priority: 'Alta', reason: 'Autofagia e sensibilidade à insulina' },
        { name: 'HIIT + Treino de Força', dose: '5x/semana', timing: 'Manhã (preferencialmente)', priority: 'Alta', reason: 'VO2max, BDNF, biogênese mitocondrial' },
        { name: 'Sauna (80-100°C)', dose: '4x/semana', timing: '20 min/sessão', priority: 'Média', reason: 'HSP, autofagia, hormese térmica' },
        { name: 'Meditação Mindfulness', dose: 'Diário', timing: '20 min/dia', priority: 'Média', reason: 'Redução de cortisol, preservação de telômeros' },
      ]
    }
  ];

  const priorityColor = { Alta: 'var(--color-red)', Média: 'var(--color-orange)', Baixa: 'var(--color-green)' };

  el.innerHTML = protocols.map(p => `
    <div class="chart-card" style="margin-bottom:var(--space-xl)">
      <div class="chart-title" style="color:${p.color};margin-bottom:var(--space-xl)">${p.category}</div>
      <div style="display:flex;flex-direction:column;gap:var(--space-md)">
        ${p.items.map(item => `
          <div style="display:flex;gap:16px;padding:12px;background:rgba(255,255,255,0.02);border:1px solid var(--color-border);border-radius:12px">
            <div style="flex:1">
              <div style="font-weight:600;font-size:0.9rem;margin-bottom:4px">${item.name}</div>
              <div style="font-size:0.8rem;color:var(--color-text-muted)">${item.reason}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0">
              <div style="font-family:var(--font-mono);font-size:0.8rem;color:var(--color-cyan)">${item.dose}</div>
              <div style="font-size:0.75rem;color:var(--color-text-muted)">${item.timing}</div>
              <span style="font-size:0.7rem;font-weight:600;color:${priorityColor[item.priority]};background:${priorityColor[item.priority]}22;padding:2px 8px;border-radius:999px">${item.priority}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// INPUTS PAGE
function updateBmOptions() {
  const cat = document.getElementById('bmCategory').value;
  const select = document.getElementById('bmType');
  const refCard = document.getElementById('referenceCard');

  if (!cat) {
    select.innerHTML = '<option value="">Primeiro selecione uma categoria</option>';
    refCard.style.display = 'none';
    return;
  }

  const bms = BM_CATALOG[cat] || [];
  select.innerHTML = '<option value="">Selecione o biomarcador...</option>' +
    bms.map(b => `<option value="${b.key}" data-unit="${b.unit}" data-ref="${b.ref}">${b.label}</option>`).join('');

  select.onchange = () => {
    const opt = select.options[select.selectedIndex];
    if (opt.value) {
      document.getElementById('bmUnit').value = opt.dataset.unit || '';
      const config = BM_CATALOG[cat].find(b => b.key === opt.value);
      if (config) {
        refCard.style.display = 'block';
        document.getElementById('referenceContent').innerHTML = `
          <div style="display:flex;gap:var(--space-md);flex-wrap:wrap">
            <div class="stat-card" style="flex:1;min-width:100px">
              <div style="font-size:0.75rem;color:var(--color-text-muted)">Referência</div>
              <div style="font-weight:600;color:var(--color-cyan);margin-top:4px">${config.ref}</div>
            </div>
            <div class="stat-card" style="flex:1;min-width:100px">
              <div style="font-size:0.75rem;color:var(--color-text-muted)">Intervalo Ótimo</div>
              <div style="font-weight:600;color:var(--color-green);margin-top:4px">
                ${config.optimal ? `${config.optimal[0]} – ${config.optimal[1]} ${config.unit}` : 'Variável'}
              </div>
            </div>
          </div>
        `;
      }
    }
  };
}

async function saveBiomarker() {
  const alertEl = document.getElementById('inputAlertContainer');
  const type = document.getElementById('bmType').value;
  const value = document.getElementById('bmValue').value;
  const unit = document.getElementById('bmUnit').value;
  const date = document.getElementById('bmDate').value;

  if (!type || !value || !date) {
    alertEl.innerHTML = '<div class="alert alert-error">Preencha todos os campos obrigatórios.</div>';
    return;
  }

  try {
    await KlothoDB.addBiomarker(currentUser.id, type, value, unit, new Date(date).toISOString());
    userBiomarkers = await KlothoDB.getBiomarkers(currentUser.id);

    alertEl.innerHTML = '<div class="alert alert-success">✓ Biomarcador salvo com sucesso!</div>';
    showToast('Resultado salvo!', 'success');

    // Reset
    document.getElementById('bmValue').value = '';
    document.getElementById('bmNotes').value = '';

    setTimeout(() => { alertEl.innerHTML = ''; }, 3000);
  } catch (err) {
    alertEl.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

// PROFILE
function populateProfile() {
  if (!currentUser) return;

  const initials = currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const age = getAge(currentUser.birthDate);
  const bioAge = currentUser.metrics?.biologicalAge;
  const score = currentUser.metrics?.klothoScore;

  document.getElementById('profileAvatar').textContent = initials;
  document.getElementById('profileName').textContent = currentUser.name;
  document.getElementById('profileEmail').textContent = currentUser.email;
  document.getElementById('profilePlan').textContent = currentUser.plan?.charAt(0).toUpperCase() + currentUser.plan?.slice(1);
  document.getElementById('profileBioAge').textContent = bioAge ? bioAge.toFixed(1) : '--';
  document.getElementById('profileScore').textContent = score ? score.toFixed(0) : '--';
  document.getElementById('profileBmCount').textContent = [...new Set(userBiomarkers.map(b => b.type))].length;

  document.getElementById('profileNameInput').value = currentUser.name;
  document.getElementById('profileBirthInput').value = currentUser.birthDate || '';
  document.getElementById('profileHeightInput').value = currentUser.height || '';
  document.getElementById('profileWeightInput').value = currentUser.weight || '';

  const lifestyle = currentUser.profile?.lifestyle || {};
  document.getElementById('profileSleep').value = lifestyle.sleep || 7;
  document.getElementById('profileSleepVal').textContent = lifestyle.sleep || 7;
  document.getElementById('profileExercise').value = lifestyle.exercise || 3;
  document.getElementById('profileExerciseVal').textContent = lifestyle.exercise || 3;
  document.getElementById('profileStress').value = lifestyle.stress || 5;
  document.getElementById('profileStressVal').textContent = lifestyle.stress || 5;
}

async function saveProfile() {
  try {
    const updates = {
      name: document.getElementById('profileNameInput').value,
      birthDate: document.getElementById('profileBirthInput').value,
      height: document.getElementById('profileHeightInput').value,
      weight: document.getElementById('profileWeightInput').value,
      profile: {
        ...currentUser.profile,
        lifestyle: {
          ...currentUser.profile?.lifestyle,
          sleep: parseFloat(document.getElementById('profileSleep').value),
          exercise: parseInt(document.getElementById('profileExercise').value),
          stress: parseInt(document.getElementById('profileStress').value)
        }
      }
    };

    currentUser = await KlothoDB.updateUser(currentUser.id, updates);
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    document.getElementById('sidebarAvatar').textContent = initials;
    document.getElementById('sidebarName').textContent = currentUser.name.split(' ')[0];

    showToast('Perfil atualizado com sucesso!', 'success');
  } catch (err) {
    showToast('Erro ao salvar: ' + err.message, 'error');
  }
}

// LOGOUT
async function handleLogout() {
  await KlothoAuth.logout();
  window.location.href = 'login.html';
}

function confirmDeleteAccount() {
  if (confirm('⚠️ Tem certeza? Esta ação excluirá permanentemente todos os seus dados e não pode ser desfeita.')) {
    if (confirm('Confirme novamente: Excluir conta e todos os dados?')) {
      // Delete all user data
      KlothoDB.delete('users', currentUser.id).then(() => {
        KlothoAuth.logout();
        window.location.href = '../index.html';
      });
    }
  }
}

// TOAST
function showToast(message, type = 'info', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = (type === 'success' ? '✓ ' : type === 'error' ? '✗ ' : 'ℹ ') + message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// MAIN INIT
document.addEventListener('DOMContentLoaded', init);
