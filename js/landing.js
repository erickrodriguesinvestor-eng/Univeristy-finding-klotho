/**
 * ETERNAL HEALTH — Landing Page JS
 * Molecular grid canvas · Counter animation · Trace rule · Biomarker tabs · Radar
 */

/* =========================================
   MOLECULAR DOT GRID CANVAS
   ========================================= */
(function initMolecularGrid() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const SPACING = 50;
  const RADIUS  = 1;
  const AURUM   = '201,169,106';
  const ACTIVE_RATIO = 0.12;

  let width, height, cols, rows, dots;
  let animFrame;

  function Dot(x, y, active) {
    this.x = x;
    this.y = y;
    this.active = active;
    this.opacity   = active ? 0.15 + Math.random() * 0.25 : 0.04 + Math.random() * 0.04;
    this.targetOp  = this.opacity;
    this.speed     = 0.003 + Math.random() * 0.005;
    this.phase     = Math.random() * Math.PI * 2;
    this.connected = [];
  }

  function resize() {
    width  = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    height = canvas.height = canvas.offsetHeight || window.innerHeight;

    cols = Math.ceil(width / SPACING) + 1;
    rows = Math.ceil(height / SPACING) + 1;
    const total = cols * rows;

    dots = [];
    const activeCount = Math.floor(total * ACTIVE_RATIO);
    const activeSet = new Set();

    while (activeSet.size < activeCount) {
      activeSet.add(Math.floor(Math.random() * total));
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx  = r * cols + c;
        const dot  = new Dot(c * SPACING, r * SPACING, activeSet.has(idx));
        dots.push(dot);
      }
    }

    // Build connections between adjacent active dots (distance ≤ 1.5 cells)
    const threshold = SPACING * 1.5;
    for (let i = 0; i < dots.length; i++) {
      dots[i].connected = [];
      if (!dots[i].active) continue;
      for (let j = i + 1; j < dots.length; j++) {
        if (!dots[j].active) continue;
        const dx   = dots[i].x - dots[j].x;
        const dy   = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= threshold) {
          dots[i].connected.push(j);
        }
      }
    }
  }

  let lastTime = 0;

  function render(ts) {
    animFrame = requestAnimationFrame(render);
    const dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];

      if (d.active) {
        // Slow biological pulse — sine wave
        d.opacity = 0.15 + Math.sin(ts * 0.001 * d.speed * 200 + d.phase) * 0.175 + 0.175;
        d.opacity = Math.max(0.08, Math.min(0.55, d.opacity));

        // Draw faint connection lines
        for (let j = 0; j < d.connected.length; j++) {
          const other   = dots[d.connected[j]];
          const lineOp  = (d.opacity + other.opacity) * 0.18;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(${AURUM},${lineOp.toFixed(3)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Draw dot
      const op = d.opacity;
      ctx.beginPath();
      ctx.arc(d.x, d.y, RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${AURUM},${op.toFixed(3)})`;
      ctx.fill();
    }
  }

  // Observe resize
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(animFrame);
    resize();
    lastTime = performance.now();
    render(lastTime);
  });
  ro.observe(document.documentElement);

  resize();
  render(performance.now());
})();


/* =========================================
   COMMAND BAR — scroll class
   ========================================= */
(function initCommandBar() {
  const bar = document.getElementById('commandBar');
  if (!bar) return;

  const handler = () => {
    bar.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', handler, { passive: true });
  handler();
})();


/* =========================================
   HERO RULE TRACE + CLOCK BAR ANIMATIONS
   ========================================= */
(function initHeroAnimations() {
  // Trace the horizontal rule
  const rule = document.getElementById('heroRule');
  if (rule) {
    setTimeout(() => rule.classList.add('traced'), 800);
  }

  // Animate clock bar fills
  const fills = document.querySelectorAll('.clock-bar-fill');
  fills.forEach((el, i) => {
    const w = el.dataset.width || '70';
    setTimeout(() => {
      el.style.width = w + '%';
    }, 900 + i * 120);
  });
})();


/* =========================================
   BIOMARKER TABS
   ========================================= */
const BM_LANDING = {
  metabolic: [
    { name: 'Fasting Glucose', unit: 'mg/dL' },
    { name: 'HbA1c', unit: '%' },
    { name: 'Fasting Insulin', unit: 'μU/mL' },
    { name: 'Triglycerides', unit: 'mg/dL' },
    { name: 'HDL Cholesterol', unit: 'mg/dL' },
    { name: 'LDL Cholesterol', unit: 'mg/dL' },
    { name: 'Total Cholesterol', unit: 'mg/dL' },
    { name: 'HOMA-IR', unit: 'index' },
  ],
  hormonal: [
    { name: 'Total Testosterone', unit: 'ng/dL' },
    { name: 'DHEA-S', unit: 'μg/dL' },
    { name: 'IGF-1', unit: 'ng/mL' },
    { name: 'Morning Cortisol', unit: 'μg/dL' },
    { name: 'TSH', unit: 'mU/L' },
    { name: 'Vitamin D3', unit: 'ng/mL' },
    { name: 'Estradiol', unit: 'pg/mL' },
    { name: 'Progesterone', unit: 'ng/mL' },
  ],
  inflammatory: [
    { name: 'hs-CRP', unit: 'mg/L' },
    { name: 'Interleukin-6', unit: 'pg/mL' },
    { name: 'TNF-alpha', unit: 'pg/mL' },
    { name: 'Homocysteine', unit: 'μmol/L' },
    { name: 'Fibrinogen', unit: 'mg/dL' },
    { name: 'IL-1β', unit: 'pg/mL' },
    { name: 'Ferritin', unit: 'ng/mL' },
    { name: 'Uric Acid', unit: 'mg/dL' },
  ],
  genetic: [
    { name: 'Telomere Length', unit: 'kb' },
    { name: 'Epigenetic Bio Age', unit: 'years' },
    { name: 'NAD+', unit: 'μM' },
    { name: 'DunedinPACE', unit: 'pace' },
    { name: 'GrimAge Accel.', unit: 'years' },
    { name: '8-OHdG', unit: 'ng/mg cr.' },
    { name: 'Methylation %', unit: '%' },
    { name: 'mtDNA Copy Number', unit: 'copies/cell' },
  ]
};

function renderBMPanel(panelKey) {
  const grid = document.getElementById('bmTabGrid');
  if (!grid) return;
  const items = BM_LANDING[panelKey] || [];
  grid.innerHTML = items.map(b => `
    <div class="bm-chip">
      <div class="bm-chip-name">${b.name}</div>
      <div class="bm-chip-unit">${b.unit}</div>
    </div>
  `).join('');
}

(function initBMTabs() {
  const tabs = document.querySelectorAll('.bm-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderBMPanel(tab.dataset.panel);
    });
  });

  // Initial render
  renderBMPanel('metabolic');
})();


/* =========================================
   SCIENCE RADAR CHART
   ========================================= */
(function initScienceRadar() {
  const canvas = document.getElementById('scienceRadar');
  if (!canvas || typeof Chart === 'undefined') return;

  const AURUM_COLOR = 'rgba(201,169,106,';

  new Chart(canvas, {
    type: 'radar',
    data: {
      labels: [
        'Genomic Stability',
        'Telomere Length',
        'Epigenetic Age',
        'Proteostasis',
        'Metabolic Health',
        'Mitochondrial Fn.',
        'Senescence Score',
        'Stem Cell Reserve',
        'Cell Communication'
      ],
      datasets: [{
        label: 'Optimal Profile',
        data: [88, 82, 79, 85, 91, 76, 83, 71, 87],
        borderColor: AURUM_COLOR + '0.7)',
        backgroundColor: AURUM_COLOR + '0.08)',
        pointBackgroundColor: AURUM_COLOR + '0.9)',
        pointBorderColor: 'transparent',
        borderWidth: 1.5,
        pointRadius: 3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false },
          pointLabels: {
            color: '#878491',
            font: { family: "'Space Grotesk', system-ui", size: 9 }
          },
          grid:       { color: 'rgba(255,255,255,0.05)' },
          angleLines: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });
})();


/* =========================================
   INTERSECTION OBSERVER — fade-in sections
   ========================================= */
(function initFadeIn() {
  const sections = document.querySelectorAll(
    '.manifesto, .vital-signs, .the-nine, .the-system, .bm-tabs-section, .science-section, .plans'
  );

  const style = document.createElement('style');
  style.textContent = `
    .fade-section {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.7s cubic-bezier(0.23,1,0.32,1),
                  transform 0.7s cubic-bezier(0.23,1,0.32,1);
    }
    .fade-section.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  sections.forEach(el => el.classList.add('fade-section'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  sections.forEach(el => io.observe(el));
})();
