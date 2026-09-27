import gsap from 'gsap';
import { CONFIG } from '../config.js';
import { ILLUSTRATIONS } from '../illustrations/index.js';
import { Sound } from './sound.js';
import { scrollTo, setPageScrollLocked } from './smooth-scroll.js';
import { getCardByIndex } from './deck.js';
import { submitEarlyAccess, scrollToContact } from './contact-intake.js';

let activeIndex = -1;
let lastCard = null;
let tabTrap = null;
let openTween = null;

const panel = document.getElementById('module-panel');
const overlay = document.getElementById('panel-overlay');
const body = document.getElementById('panel-body');
const filename = document.getElementById('panel-filename');

function illusKey(mod) {
  const map = {
    radar: 'radar',
    wireframe: 'wireframe',
    code: 'code',
    nodes: 'nodes',
    graph: 'graph',
    grid: 'grid',
    lock: 'lock',
    signal: 'signal',
  };
  return map[mod.illustration] || mod.illustration;
}

function buildPanelContent(mod) {
  let html = `<h3 id="panel-title">${mod.panelTitle}</h3><p>${mod.panelText}</p>`;

  if (mod.locked) {
    html += `
      <form class="early-access" id="early-access-form">
        <input type="email" id="early-email" name="email" placeholder="your@email.com" required aria-label="Email for early access"/>
        <button type="submit">Request access</button>
      </form>
      <p id="early-msg" class="field-error" role="status"></p>
    `;
  } else if (mod.isBuildGrid) {
    html += `<p class="panel__section-label">What you get</p><div class="build-grid" id="build-grid"></div>`;
  } else if (mod.deliverables?.length) {
    html += `<p class="panel__section-label">What you get</p><ul class="panel__list">${mod.deliverables
      .map((d) => `<li>${d}</li>`)
      .join('')}</ul>`;
    if (mod.timeline) html += `<span class="timeline-chip">${mod.timeline}</span>`;
  }

  html += `<div class="panel__illus" data-illus-wrap></div>`;
  return html;
}

function resetPanelTransforms() {
  gsap.set(panel, { clearProps: 'transform,top,left,right,bottom,width,height' });
}

function trapFocus() {
  const focusable = panel.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  tabTrap = (e) => {
    if (e.key !== 'Tab' || !panel.classList.contains('is-open')) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', tabTrap);
}

function releaseTrap() {
  if (tabTrap) document.removeEventListener('keydown', tabTrap);
  tabTrap = null;
}

function afterOpen(mod) {
  if (mod.isBuildGrid) {
    const grid = document.getElementById('build-grid');
    mod.deliverables.forEach((text, i) => {
      const el = document.createElement('div');
      el.className = 'build-grid__item';
      el.textContent = text;
      grid.appendChild(el);
      gsap.delayedCall(0.15 + i * 0.12, () => el.classList.add('is-lit'));
    });
  }

  const wrap = body.querySelector('[data-illus-wrap]');
  const illus = ILLUSTRATIONS[illusKey(mod)];
  if (wrap && illus) {
    wrap.innerHTML = illus.svg;
    const svg = wrap.querySelector('svg');
    if (svg) {
      try {
        illus.animate(svg);
      } catch (_) {}
    }
  }

  const earlyForm = document.getElementById('early-access-form');
  if (earlyForm) {
    earlyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('early-email').value.trim();
      const msg = document.getElementById('early-msg');
      const ok = await submitEarlyAccess(email);
      msg.textContent = ok
        ? 'Request logged. We will be in touch.'
        : 'Could not send — try emailing us directly.';
      msg.classList.add('is-visible');
    });
  }

  panel.classList.add('is-content-visible');
}

export function openPanel(index, cardEl) {
  const mod = CONFIG.modules[index];
  if (mod.isContact) {
    Sound.click();
    scrollToContact();
    return;
  }

  Sound.click();
  lastCard = cardEl;
  activeIndex = index;

  openTween?.kill();
  resetPanelTransforms();

  filename.textContent = mod.panelFile || `module_${mod.num}.exe`;
  body.innerHTML = buildPanelContent(mod);
  panel.classList.remove('is-content-visible');

  panel.hidden = false;
  panel.removeAttribute('hidden');
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  panel.classList.add('is-open');
  setPageScrollLocked(true);
  body.scrollTop = 0;

  gsap.set(panel, { opacity: 0, x: 0, y: 0, scale: 1, clearProps: 'transform' });
  afterOpen(mod);

  openTween = gsap.to(panel, {
    opacity: 1,
    duration: 0.35,
    ease: 'power2.out',
    onComplete: () => {
      gsap.set(panel, { opacity: 1, clearProps: 'transform' });
      Sound.whoosh();
      document.getElementById('panel-close').focus();
      trapFocus();
    },
  });
}

export function closePanel() {
  if (activeIndex < 0) return;

  releaseTrap();
  openTween?.kill();
  panel.classList.remove('is-content-visible');

  gsap.to(panel, {
    opacity: 0,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: () => {
      panel.classList.remove('is-open');
      panel.hidden = true;
      panel.setAttribute('hidden', '');
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      resetPanelTransforms();
      gsap.set(panel, { opacity: 0 });
      setPageScrollLocked(false);
      activeIndex = -1;
      lastCard?.focus();
    },
  });
}

export function navPanel(dir) {
  const idx = activeIndex;
  if (idx < 0) return;

  let next = idx + dir;
  while (next >= 0 && next < CONFIG.modules.length) {
    if (!CONFIG.modules[next].isContact) {
      const card = getCardByIndex(next);
      const prevIndex = activeIndex;
      releaseTrap();
      openTween?.kill();
      panel.classList.remove('is-content-visible');
      resetPanelTransforms();
      panel.classList.remove('is-open');
      panel.hidden = true;
      overlay.classList.remove('is-open');
      activeIndex = -1;
      openPanel(next, card);
      return;
    }
    next += dir;
  }
}

export function initPanel() {
  document.getElementById('panel-close').addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);
  document.getElementById('panel-prev').addEventListener('click', () => navPanel(-1));
  document.getElementById('panel-next').addEventListener('click', () => navPanel(1));

  document.addEventListener('keydown', (e) => {
    if (activeIndex < 0) return;
    if (e.key === 'Escape') closePanel();
    if (e.key === 'ArrowLeft') navPanel(-1);
    if (e.key === 'ArrowRight') navPanel(1);
  });
}
