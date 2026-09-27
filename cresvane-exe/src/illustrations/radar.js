import gsap from 'gsap';

export const svg = `<svg viewBox="0 0 120 100" role="img" aria-label="Radar sweep">
  <circle cx="60" cy="50" r="40" fill="none" stroke="#1E3A55" stroke-width="1"/>
  <circle cx="60" cy="50" r="28" fill="none" stroke="#1E3A55" stroke-width="1"/>
  <g class="illus-radar-sweep"><line x1="60" y1="50" x2="100" y2="15" stroke="#00D9FF" stroke-width="2"/></g>
  <circle class="illus-radar-blip" cx="78" cy="32" r="4" fill="#FFB400" opacity="0"/>
</svg>`;

export function animate(el) {
  const tl = gsap.timeline({ repeat: -1 });
  tl.to(el.querySelector('.illus-radar-sweep'), { rotation: 360, transformOrigin: '60px 50px', duration: 3, ease: 'none' });
  tl.to(el.querySelector('.illus-radar-blip'), { opacity: 1, duration: 0.2, yoyo: true, repeat: 1 }, 0.5);
  return tl;
}
