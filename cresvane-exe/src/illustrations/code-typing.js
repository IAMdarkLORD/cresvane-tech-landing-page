import gsap from 'gsap';

export const svg = `<svg viewBox="0 0 120 100" role="img" aria-label="Code compiling">
  <text x="15" y="35" font-family="monospace" font-size="10" fill="#8AA1B4">&lt;build /&gt;</text>
  <rect x="15" y="50" width="90" height="6" fill="#1E3A55" rx="2"/>
  <rect class="illus-code-bar" x="15" y="50" width="0" height="6" fill="#00D9FF" rx="2"/>
  <text class="illus-code-done" x="15" y="80" font-family="monospace" font-size="8" fill="#28C840" opacity="0">compiled ✓</text>
</svg>`;

export function animate(el) {
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
  tl.set(el.querySelector('.illus-code-done'), { opacity: 0 });
  tl.set(el.querySelector('.illus-code-bar'), { attr: { width: 0 } });
  tl.to(el.querySelector('.illus-code-bar'), { attr: { width: 90 }, duration: 1.8, ease: 'power1.inOut' });
  tl.to(el.querySelector('.illus-code-done'), { opacity: 1, duration: 0.3 });
  return tl;
}
