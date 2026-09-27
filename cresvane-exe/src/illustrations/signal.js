import gsap from 'gsap';

export const svg = `<svg viewBox="0 0 120 100" role="img" aria-label="Open channel signal">
  <circle cx="60" cy="50" r="12" fill="none" stroke="#FFB400" stroke-width="2"/>
  <circle class="illus-sig-1" cx="60" cy="50" r="22" fill="none" stroke="#FFB400" stroke-width="1" opacity="0.6"/>
  <circle class="illus-sig-2" cx="60" cy="50" r="32" fill="none" stroke="#FFB400" stroke-width="1" opacity="0.3"/>
</svg>`;

export function animate(el) {
  const tl = gsap.timeline({ repeat: -1 });
  tl.fromTo(el.querySelector('.illus-sig-1'), { scale: 1, transformOrigin: '60px 50px' }, { scale: 1.15, duration: 1, ease: 'sine.inOut' });
  tl.fromTo(el.querySelector('.illus-sig-2'), { scale: 1, transformOrigin: '60px 50px' }, { scale: 1.12, duration: 1, ease: 'sine.inOut' }, 0);
  return tl;
}
