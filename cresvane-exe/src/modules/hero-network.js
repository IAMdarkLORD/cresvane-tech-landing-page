import { reducedMotion } from './motion-prefs.js';

export function initHeroNetwork(canvas) {
  if (reducedMotion) return { destroy: () => {} };

  const ctx = canvas.getContext('2d');
  const mobile = window.matchMedia('(max-width: 640px)').matches;
  const count = mobile ? 35 : 70;
  const mouse = { x: -1, y: -1 };
  let running = true;
  let w = 0;
  let h = 0;
  let dpr = 1;

  const nodes = Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0003,
    vy: (Math.random() - 0.5) * 0.0003,
  }));

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth * dpr;
    h = canvas.clientHeight * dpr;
    canvas.width = w;
    canvas.height = h;
  }

  resize();
  window.addEventListener('resize', resize);

  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) / r.width;
    mouse.y = (e.clientY - r.top) / r.height;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.x = -1;
  });

  const threshold = 120 * dpr;

  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > 1) n.vx *= -1;
      if (n.y < 0 || n.y > 1) n.vy *= -1;
      if (mouse.x >= 0) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 0.15) {
          n.x += dx * 0.002;
          n.y += dy * 0.002;
        }
      }
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = (a.x - b.x) * w;
        const dy = (a.y - b.y) * h;
        const dist = Math.hypot(dx, dy);
        if (dist < threshold) {
          ctx.strokeStyle = `rgba(30, 58, 85, ${1 - dist / threshold})`;
          ctx.beginPath();
          ctx.moveTo(a.x * w, a.y * h);
          ctx.lineTo(b.x * w, b.y * h);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x * w, n.y * h, 3 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 217, 255, 0.5)';
      ctx.fill();
    });
  }

  const hero = document.getElementById('hero');
  const obs = new IntersectionObserver(
    ([entry]) => {
      running = entry.isIntersecting && !document.hidden;
    },
    { threshold: 0 },
  );
  obs.observe(hero);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && hero.getBoundingClientRect().bottom > 0) running = true;
    else running = false;
  });

  let rafId;
  const loop = () => {
    tick();
    rafId = requestAnimationFrame(loop);
  };
  loop();

  return {
    destroy() {
      cancelAnimationFrame(rafId);
      obs.disconnect();
      window.removeEventListener('resize', resize);
    },
  };
}
