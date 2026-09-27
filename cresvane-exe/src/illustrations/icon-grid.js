import gsap from 'gsap';

const cells = [0, 1, 2, 3, 4, 5]
  .map(
    (i) => {
      const x = 20 + (i % 3) * 32;
      const y = 25 + Math.floor(i / 3) * 35;
      return `<rect class="illus-grid-cell" data-i="${i}" x="${x}" y="${y}" width="22" height="22" rx="4" fill="#0F2236" stroke="#1E3A55"/>`;
    },
  )
  .join('');

export const svg = `<svg viewBox="0 0 120 100" role="img" aria-label="Service grid">${cells}</svg>`;

export function animate(el) {
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.3 });
  const cells = el.querySelectorAll('.illus-grid-cell');
  cells.forEach((cell, i) => {
    tl.to(cell, { stroke: '#00D9FF', duration: 0.25, ease: 'power1.out' }, i * 0.2);
    tl.to(cell, { stroke: '#1E3A55', duration: 0.25, ease: 'power1.in' }, i * 0.2 + 0.35);
  });
  return tl;
}
