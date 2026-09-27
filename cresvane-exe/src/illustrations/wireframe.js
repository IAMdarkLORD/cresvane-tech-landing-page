import gsap from 'gsap';

export const svg = `<svg viewBox="0 0 120 100" role="img" aria-label="Wireframe drawing">
  <rect class="illus-wf-1" x="15" y="20" width="90" height="12" fill="none" stroke="#00D9FF" stroke-width="1" stroke-dasharray="204" stroke-dashoffset="204"/>
  <rect class="illus-wf-2" x="15" y="40" width="40" height="50" fill="none" stroke="#8AA1B4" stroke-width="1" stroke-dasharray="180" stroke-dashoffset="180"/>
  <rect class="illus-wf-3" x="65" y="40" width="40" height="24" fill="none" stroke="#8AA1B4" stroke-width="1" stroke-dasharray="128" stroke-dashoffset="128"/>
</svg>`;

export function animate(el) {
  const tl = gsap.timeline();
  tl.to(el.querySelector('.illus-wf-1'), { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out' });
  tl.to(el.querySelector('.illus-wf-2'), { strokeDashoffset: 0, duration: 1, ease: 'power2.out' }, '-=0.6');
  tl.to(el.querySelector('.illus-wf-3'), { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out' }, '-=0.5');
  return tl;
}
