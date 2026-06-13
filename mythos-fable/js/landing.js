/* Landing page — cosmos canvas particle field */
(function cosmosCanvas() {
  const canvas = document.getElementById('cosmos-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars = [], mouse = { x: 0, y: 0 };

  const STAR_COUNT = 180;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildStars();
  }

  function buildStars() {
    stars = Array.from({ length: STAR_COUNT }, () => ({
      x:   Math.random() * W,
      y:   Math.random() * H,
      r:   Math.random() * 1.5 + 0.3,
      vx:  (Math.random() - 0.5) * 0.15,
      vy:  (Math.random() - 0.5) * 0.15,
      /* alternate hue between mythos-violet and fable-emerald */
      hue: Math.random() < 0.5 ? 270 : 152,
      alpha: Math.random() * 0.6 + 0.2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    stars.forEach(s => {
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0) s.x = W;
      if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H;
      if (s.y > H) s.y = 0;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue},80%,70%,${s.alpha})`;
      ctx.fill();
    });

    /* subtle lines between nearby stars */
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 90) {
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          const alpha = (1 - d / 90) * 0.08;
          ctx.strokeStyle = `rgba(160,140,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();
