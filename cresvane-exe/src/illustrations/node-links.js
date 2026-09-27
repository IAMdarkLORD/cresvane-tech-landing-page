import gsap from 'gsap';

export const svg = `<svg viewBox="0 0 120 100" role="img" aria-label="Integration nodes">
  <circle cx="25" cy="50" r="8" fill="#0F2236" stroke="#00D9FF"/>
  <circle cx="95" cy="25" r="8" fill="#0F2236" stroke="#00D9FF"/>
  <circle cx="95" cy="75" r="8" fill="#0F2236" stroke="#00D9FF"/>
  <line x1="33" y1="50" x2="87" y2="25" stroke="#1E3A55"/>
  <line x1="33" y1="50" x2="87" y2="75" stroke="#1E3A55"/>
  <circle class="illus-packet" cx="33" cy="50" r="3" fill="#FFB400"/>
</svg>`;

export function animate(el) {
  const packet = el.querySelector('.illus-packet');
  const tl = gsap.timeline({ repeat: -1 });
  tl.set(packet, { attr: { cx: 33, cy: 50 } });
  tl.to(packet, { attr: { cx: 87, cy: 25 }, duration: 0.8, ease: 'power1.inOut' });
  tl.set(packet, { attr: { cx: 33, cy: 50 } });
  tl.to(packet, { attr: { cx: 87, cy: 75 }, duration: 0.8, ease: 'power1.inOut' });
  return tl;
}
