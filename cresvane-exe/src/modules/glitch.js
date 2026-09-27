import gsap from 'gsap';
import { reducedMotion } from './motion-prefs.js';

export function initGlitch() {
  if (reducedMotion) return;

  const targets = document.querySelectorAll('.glitch-target');

  const pulse = () => {
    const el = targets[Math.floor(Math.random() * targets.length)];
    if (!el) return;
    el.classList.add('is-glitching');
    gsap.delayedCall(0.15, () => el.classList.remove('is-glitching'));
    gsap.delayedCall(4 + Math.random() * 3, pulse);
  };

  gsap.delayedCall(3, pulse);
}
