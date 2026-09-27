import gsap from 'gsap';
import { reducedMotion } from './motion-prefs.js';

export function initCursor() {
  if (reducedMotion || 'ontouchstart' in window || navigator.maxTouchPoints > 0) {
    return;
  }

  document.body.classList.add('has-custom-cursor');
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  const pos = { x: 0, y: 0 };
  const ringPos = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    gsap.set(dot, { x: pos.x, y: pos.y, xPercent: -50, yPercent: -50 });
  });

  gsap.ticker.add(() => {
    ringPos.x += (pos.x - ringPos.x) * 0.15;
    ringPos.y += (pos.y - ringPos.y) * 0.15;
    gsap.set(ring, { x: ringPos.x, y: ringPos.y, xPercent: -50, yPercent: -50 });
  });

  const interactive = 'button, a, .module-card, .chip, select, input, textarea, .btn-text, .btn-icon';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactive)) ring.classList.add('is-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactive)) ring.classList.remove('is-hover');
  });
}
