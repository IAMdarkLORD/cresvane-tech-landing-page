import { CONFIG } from '../config.js';
import { ILLUSTRATIONS } from '../illustrations/index.js';
import { Sound } from './sound.js';

const illusTimelines = new Map();

function statusClass(status) {
  if (status === 'locked') return 'status-chip--locked';
  if (status === 'open') return 'status-chip--open';
  return 'status-chip--ready';
}

function mountIllustration(wrap, key) {
  const illus = ILLUSTRATIONS[key];
  if (!illus) {
    wrap.innerHTML = `<span style="font-family:var(--font-mono);font-size:.65rem;color:var(--color-muted)">${key}</span>`;
    return;
  }
  wrap.innerHTML = illus.svg;
  const svg = wrap.querySelector('svg');
  if (svg) {
    try {
      const tl = illus.animate(svg);
      illusTimelines.set(wrap, tl);
    } catch (_) {
      /* illustration animation failed — card still shows */
    }
  }
}

export function renderDeck() {
  const track = document.getElementById('deck-track');
  track.innerHTML = '';

  CONFIG.modules.forEach((mod, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'module-card';
    btn.dataset.index = String(index);
    btn.setAttribute('role', 'listitem');
    btn.setAttribute('aria-label', `${mod.name}: ${mod.teaser}`);

    if (mod.isContact) btn.classList.add('module-card--contact');
    if (mod.locked) btn.classList.add('module-card--locked');

    const mapKey = mod.illustration;

    btn.innerHTML = `
      <span class="module-card__num">${mod.num}</span>
      <span class="module-card__name">${mod.name}</span>
      <span class="module-card__teaser">${mod.teaser}</span>
      ${mod.locked ? '<span class="module-card__pending">access pending</span>' : ''}
      <div class="module-card__illus" data-illus="${mapKey}"></div>
      <span class="status-chip ${statusClass(mod.status)}">${mod.statusLabel}</span>
    `;

    const illusWrap = btn.querySelector('.module-card__illus');
    mountIllustration(illusWrap, mapKey);

    btn.addEventListener('mouseenter', () => Sound.hover());

    track.appendChild(btn);
  });

  track.addEventListener('scroll', updateDeckProgress, { passive: true });
  updateDeckProgress();
}

export function updateDeckProgress() {
  const track = document.getElementById('deck-track');
  const fill = document.getElementById('deck-progress-fill');
  if (!track || !fill) return;
  const max = track.scrollWidth - track.clientWidth;
  const pct = max > 0 ? track.scrollLeft / max : 0;
  const idx = Math.round(pct * (CONFIG.modules.length - 1));
  const width = ((idx + 1) / CONFIG.modules.length) * 100;
  fill.style.transform = `scaleX(${width / 100})`;
  fill.style.width = '100%';
}

export function getCardByIndex(index) {
  return document.querySelector(`.module-card[data-index="${index}"]`);
}

export function initDeckEntrance() {
  const cards = document.querySelectorAll('.module-card');
  return cards;
}
