/**
 * KlothoLab — Landing Page JS
 */

// COUNTER ANIMATION
function animateCounter(el, target, duration = 2000) {
  const start = performance.now();
  const startVal = 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.round(startVal + (target - startVal) * eased);
    el.textContent = current.toLocaleString('pt-BR');
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// INTERSECTION OBSERVER for counter trigger
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      if (!isNaN(target)) {
        animateCounter(el, target);
        observer.unobserve(el);
      }
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));

// SCIENCE RADAR CHART
function initRadar() {
  const canvas = document.getElementById('scienceRadar');
  if (!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');

  const labels = [
    'Epigenética',
    'Telômeros',
    'Proteostase',
    'Mitocôndrias',
    'Senescência',
    'Células-Tronco',
    'Inflamação',
    'Metabolismo',
    'Genômica'
  ];

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: 'Perfil Ideal',
          data: [90, 85, 88, 92, 87, 80, 91, 85, 89],
          borderColor: 'rgba(0, 212, 255, 0.8)',
          backgroundColor: 'rgba(0, 212, 255, 0.08)',
          pointBackgroundColor: 'rgba(0, 212, 255, 1)',
          pointBorderColor: 'transparent',
          borderWidth: 2
        },
        {
          label: 'Média da Plataforma',
          data: [72, 68, 74, 78, 70, 65, 73, 75, 71],
          borderColor: 'rgba(124, 58, 237, 0.8)',
          backgroundColor: 'rgba(124, 58, 237, 0.08)',
          pointBackgroundColor: 'rgba(124, 58, 237, 1)',
          pointBorderColor: 'transparent',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94A3B8',
            font: { family: 'Inter', size: 11 },
            boxWidth: 12,
            padding: 16
          }
        }
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            display: false,
            stepSize: 20
          },
          pointLabels: {
            color: '#94A3B8',
            font: { family: 'Inter', size: 11 }
          },
          grid: {
            color: 'rgba(255,255,255,0.06)'
          },
          angleLines: {
            color: 'rgba(255,255,255,0.06)'
          }
        }
      }
    }
  });
}

// BIOMARKERS DATA
const biomarkerData = {
  metabolic: [
    { name: 'Glicose em Jejum', value: '89', unit: 'mg/dL', status: 'optimal', color: '#10B981' },
    { name: 'HbA1c', value: '5.1', unit: '%', status: 'optimal', color: '#10B981' },
    { name: 'Insulina', value: '8.2', unit: 'μU/mL', status: 'optimal', color: '#10B981' },
    { name: 'Triglicerídeos', value: '112', unit: 'mg/dL', status: 'warning', color: '#F59E0B' },
    { name: 'HDL', value: '68', unit: 'mg/dL', status: 'optimal', color: '#10B981' },
    { name: 'LDL', value: '95', unit: 'mg/dL', status: 'optimal', color: '#10B981' },
    { name: 'VLDL', value: '22', unit: 'mg/dL', status: 'optimal', color: '#10B981' },
    { name: 'Colesterol Total', value: '185', unit: 'mg/dL', status: 'optimal', color: '#10B981' }
  ],
  hormonal: [
    { name: 'Testosterona Total', value: '620', unit: 'ng/dL', status: 'optimal', color: '#10B981' },
    { name: 'DHEA-S', value: '285', unit: 'μg/dL', status: 'optimal', color: '#10B981' },
    { name: 'IGF-1', value: '185', unit: 'ng/mL', status: 'optimal', color: '#10B981' },
    { name: 'Cortisol Matinal', value: '16.2', unit: 'μg/dL', status: 'optimal', color: '#10B981' },
    { name: 'TSH', value: '1.8', unit: 'mU/L', status: 'optimal', color: '#10B981' },
    { name: 'T4 Livre', value: '1.2', unit: 'ng/dL', status: 'optimal', color: '#10B981' },
    { name: 'Vitamina D3', value: '52', unit: 'ng/mL', status: 'optimal', color: '#10B981' },
    { name: 'Estradiol', value: '28', unit: 'pg/mL', status: 'optimal', color: '#10B981' }
  ],
  inflammatory: [
    { name: 'PCR Ultrassensível', value: '0.8', unit: 'mg/L', status: 'optimal', color: '#10B981' },
    { name: 'IL-6', value: '2.1', unit: 'pg/mL', status: 'optimal', color: '#10B981' },
    { name: 'TNF-α', value: '3.8', unit: 'pg/mL', status: 'optimal', color: '#10B981' },
    { name: 'Homocisteína', value: '9.2', unit: 'μmol/L', status: 'warning', color: '#F59E0B' },
    { name: 'Ferritina', value: '78', unit: 'ng/mL', status: 'optimal', color: '#10B981' },
    { name: 'Fibrinogênio', value: '285', unit: 'mg/dL', status: 'optimal', color: '#10B981' },
    { name: 'GlycanAge', value: '31', unit: 'anos', status: 'optimal', color: '#10B981' },
    { name: 'NF-κB Activity', value: '0.42', unit: 'AU', status: 'optimal', color: '#10B981' }
  ],
  genetic: [
    { name: 'Comprimento Telomérico', value: '7.2', unit: 'kb', status: 'optimal', color: '#10B981' },
    { name: 'Idade Epigenética', value: '31.4', unit: 'anos', status: 'optimal', color: '#10B981' },
    { name: 'GrimAge', value: '33.8', unit: 'anos', status: 'optimal', color: '#10B981' },
    { name: 'PhenoAge', value: '30.1', unit: 'anos', status: 'optimal', color: '#10B981' },
    { name: 'NAD+ Celular', value: '48', unit: 'μM', status: 'optimal', color: '#10B981' },
    { name: 'mTOR Activity', value: '0.68', unit: 'AU', status: 'optimal', color: '#10B981' },
    { name: 'AMPK Ratio', value: '1.24', unit: 'AU', status: 'optimal', color: '#10B981' },
    { name: 'Sirtuína 1', value: '1.85', unit: 'AU', status: 'optimal', color: '#10B981' }
  ]
};

function renderBiomarkers(tab) {
  const grid = document.getElementById('biomarkersGrid');
  if (!grid) return;

  const data = biomarkerData[tab] || [];
  grid.innerHTML = data.map(bm => `
    <div class="biomarker-card">
      <div class="biomarker-name">${bm.name}</div>
      <div class="biomarker-value" style="color:${bm.color}">${bm.value}</div>
      <div class="biomarker-unit">${bm.unit}</div>
      <div class="biomarker-status">
        <span class="dot" style="background:${bm.color}"></span>
        <span style="color:${bm.color};font-size:0.75rem;font-weight:600">
          ${bm.status === 'optimal' ? 'Ótimo' : bm.status === 'warning' ? 'Atenção' : 'Crítico'}
        </span>
      </div>
    </div>
  `).join('');
}

// TAB SWITCHING
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderBiomarkers(btn.dataset.tab);
  });
});

// INIT
document.addEventListener('DOMContentLoaded', () => {
  renderBiomarkers('metabolic');

  // Wait for Chart.js to load
  if (typeof Chart !== 'undefined') {
    initRadar();
  } else {
    // Wait a bit for CDN
    setTimeout(initRadar, 1000);
  }
});
