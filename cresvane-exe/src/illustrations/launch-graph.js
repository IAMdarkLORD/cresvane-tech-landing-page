import gsap from 'gsap';

export const svg = `<svg viewBox="0 0 120 100" role="img" aria-label="Launch graph">
  <polyline class="illus-graph-line" points="15,75 40,60 65,45 90,30 105,15" fill="none" stroke="#00D9FF" stroke-width="2" stroke-dasharray="200" stroke-dashoffset="200"/>
  <circle class="illus-graph-dot" cx="105" cy="15" r="5" fill="#FFB400" opacity="0"/>
</svg>`;

export function animate(el) {
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
  tl.set(el.querySelector('.illus-graph-dot'), { opacity: 0, scale: 0.5, transformOrigin: '105px 15px' });
  tl.to(el.querySelector('.illus-graph-line'), { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out' });
  tl.to(el.querySelector('.illus-graph-dot'), { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' });
  tl.to(el.querySelector('.illus-graph-dot'), { scale: 1.2, duration: 0.5, yoyo: true, repeat: 1 });
  return tl;
}
