const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

export let reducedMotion = mq.matches;

export function applyMotionClass() {
  document.documentElement.classList.toggle('reduced-motion', reducedMotion);
}

mq.addEventListener('change', () => {
  reducedMotion = mq.matches;
  applyMotionClass();
});

applyMotionClass();
