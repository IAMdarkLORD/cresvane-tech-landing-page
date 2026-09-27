import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reducedMotion } from './motion-prefs.js';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;

export function initSmoothScroll() {
  if (reducedMotion) return null;

  lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    syncTouch: false,
    allowNestedScroll: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function refreshScroll() {
  lenis?.resize();
  ScrollTrigger.refresh();
}

export function scrollTo(target, options = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;

  if (lenis) {
    lenis.scrollTo(el, { offset: options.offset ?? -88, ...options });
    return;
  }

  const top = el.getBoundingClientRect().top + window.scrollY + (options.offset ?? -88);
  window.scrollTo({
    top,
    behavior: reducedMotion ? 'auto' : 'smooth',
  });
}

export function getLenis() {
  return lenis;
}

/** Lock page scroll while modals are open; panel uses data-lenis-prevent for its own scroll */
export function setPageScrollLocked(locked) {
  document.documentElement.classList.toggle('is-modal-open', locked);
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}
