import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { CONFIG } from '../config.js';
import { reducedMotion } from './motion-prefs.js';

gsap.registerPlugin(SplitText);

function sampleMonogramPoints(count) {
  const off = document.createElement('canvas');
  const size = 200;
  off.width = size;
  off.height = size;
  const ctx = off.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 160px Space Grotesk, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('C', size / 2, size / 2 + 8);

  const { data } = ctx.getImageData(0, 0, size, size);
  const candidates = [];
  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const i = (y * size + x) * 4;
      if (data[i + 3] > 128) candidates.push({ x, y });
    }
  }
  const pts = [];
  for (let i = 0; i < count; i++) {
    const c = candidates[Math.floor(Math.random() * candidates.length)] || { x: size / 2, y: size / 2 };
    pts.push(c);
  }
  return pts;
}

export function initLoader(onComplete) {
  const loader = document.getElementById('loader');
  const skip = document.getElementById('loader-skip');
  const canvas = document.getElementById('loader-canvas');
  const linesWrap = document.getElementById('loader-lines');
  const pctEl = document.getElementById('loader-pct');
  const barFill = document.getElementById('loader-bar-fill');

  const finish = () => {
    sessionStorage.setItem('cresvane_booted', '1');
    document.documentElement.classList.add('booted');
    loader.classList.add('is-done');
    loader.style.display = 'none';
    loader.style.pointerEvents = 'none';
    onComplete?.();
  };

  if (sessionStorage.getItem('cresvane_booted')) {
    document.documentElement.classList.add('booted');
    loader.style.display = 'none';
    onComplete?.();
    return;
  }

  if (reducedMotion) {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.5,
      onComplete: finish,
    });
    return;
  }

  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let dpr = 1;
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth * dpr;
    h = canvas.clientHeight * dpr;
    canvas.width = w;
    canvas.height = h;
  };
  resize();

  const mobile = matchMedia('(max-width: 640px)').matches;
  const targetCount = mobile ? 250 : 600;
  const targets = sampleMonogramPoints(targetCount);
  const particles = targets.map((t) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    tx: (t.x / 200) * w * 0.35 + w * 0.5 - (w * 0.35) / 2,
    ty: (t.y / 200) * h * 0.35 + h * 0.5 - (h * 0.35) / 2,
  }));

  function drawParticles(progress) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    particles.forEach((p) => {
      const x = p.x + (p.tx - p.x) * progress;
      const y = p.y + (p.ty - p.y) * progress;
      ctx.beginPath();
      ctx.arc(x, y, 1.5 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = '#00d9ff';
      ctx.fill();
    });
  }

  CONFIG.loaderLines.forEach((line) => {
    const el = document.createElement('p');
    el.className = 'loader__line';
    el.textContent = line;
    linesWrap.appendChild(el);
  });

  const lineEls = [...linesWrap.querySelectorAll('.loader__line')];
  const splits = lineEls.map((el) => new SplitText(el, { type: 'chars' }));

  const master = gsap.timeline({
    onComplete: finish,
  });

  const counter = { n: 0 };
  drawParticles(0);
  master.to(counter, {
    n: 100,
    duration: 2.8,
    ease: 'power1.inOut',
      onUpdate() {
        const v = Math.round(counter.n);
        pctEl.textContent = `${v}%`;
        gsap.set(barFill, { scaleX: counter.n / 100, transformOrigin: 'left center' });
        const progress = counter.n / 100;
        drawParticles(progress < 0.55 ? 0 : (progress - 0.55) / 0.45);
      },
  });

  splits.forEach((split, i) => {
    gsap.set(split.chars, { opacity: 0 });
    master.to(
      split.chars,
      {
        opacity: 1,
        duration: 0.04,
        stagger: 0.025,
        ease: 'none',
      },
      0.2 + i * 0.65,
    );
  });

  master.to(
    loader,
    {
      filter: 'brightness(2)',
      duration: 0.08,
      yoyo: true,
      repeat: 1,
    },
    2.4,
  );

  master.to(
    loader,
    {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.7,
      ease: 'power3.inOut',
    },
    2.65,
  );

  master.call(() => drawParticles(1), null, 2.2);

  skip.addEventListener('click', () => {
    master.kill();
    finish();
  });
}
