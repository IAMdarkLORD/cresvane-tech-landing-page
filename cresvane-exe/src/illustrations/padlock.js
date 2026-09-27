import gsap from 'gsap';

export const svg = `<svg viewBox="0 0 120 100" role="img" aria-label="Locked module">
  <rect class="illus-lock-body" x="40" y="50" width="40" height="35" rx="4" fill="none" stroke="#8AA1B4" stroke-width="2"/>
  <path class="illus-lock-shackle" d="M48 50 v-12 a12 12 0 0 1 24 0 v12" fill="none" stroke="#8AA1B4" stroke-width="2"/>
</svg>`;

export function animate(el) {
  const tl = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 1 });
  tl.to(el.querySelector('.illus-lock-shackle'), { y: -2, duration: 0.6, ease: 'sine.inOut' });
  return tl;
}
