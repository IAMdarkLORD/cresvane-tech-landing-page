import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-600.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/loader.css';
import './styles/hero.css';
import './styles/deck.css';
import './styles/panel.css';
import './styles/ticker.css';
import './styles/contact.css';
import './styles/footer.css';

import { CONFIG } from './config.js';
import { reducedMotion } from './modules/motion-prefs.js';
import 'lenis/dist/lenis.css';
import { initSmoothScroll, scrollTo, refreshScroll } from './modules/smooth-scroll.js';
import { initLoader } from './modules/loader.js';
import { initHeroNetwork } from './modules/hero-network.js';
import { renderDeck } from './modules/deck.js';
import { initPanel, openPanel } from './modules/panel.js';
import { initReveals, heroEntrance, ensureDeckVisible, nudgeToDeck } from './modules/reveal.js';
import { initGlitch } from './modules/glitch.js';
import { initCursor } from './modules/cursor.js';
import { Sound } from './modules/sound.js';
import {
  renderContact,
  renderContactShortcuts,
  initContactIntake,
  scrollToContact,
} from './modules/contact-intake.js';

function applyMeta() {
  document.title = CONFIG.meta.title;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.content = CONFIG.meta.description;
  const theme = document.querySelector('meta[name="theme-color"]');
  if (theme) theme.content = CONFIG.meta.themeColor;
  const ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg) ogImg.content = CONFIG.meta.ogImage;
}

function renderStaticContent() {
  document.getElementById('hero-label').textContent = CONFIG.hero.label;
  document.getElementById('hero-headline').textContent = CONFIG.hero.headline;
  document.getElementById('hero-sub').textContent = CONFIG.hero.subheadline;
  document.getElementById('hero-story').textContent = CONFIG.hero.story;
  document.getElementById('hero-cue').textContent = CONFIG.hero.scrollCue;

  document.getElementById('deck-label').textContent = CONFIG.deck.label;
  document.getElementById('deck-title').textContent = CONFIG.deck.title;
  document.getElementById('contact-label').textContent = CONFIG.contact.label;
  document.getElementById('contact-heading').textContent = CONFIG.contact.title;
  document.getElementById('contact-subtitle').textContent = CONFIG.contact.subtitle;

  const sep = ' ■ ';
  const tickerText = CONFIG.tickerItems.join(sep) + sep;
  document.getElementById('ticker-track').innerHTML = `
    <span class="ticker__chunk">${tickerText}</span>
    <span class="ticker__chunk">${tickerText}</span>
  `;

  const footer = document.getElementById('footer');
  footer.innerHTML = `
    <div class="wordmark">Cresvane <span class="wordmark-tag">EXE</span></div>
    <p class="footer__desc">${CONFIG.footer.description}</p>
    <div class="footer__links">
      <a href="${CONFIG.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a href="${CONFIG.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>
      <a href="mailto:${CONFIG.email}">${CONFIG.email}</a>
    </div>
    <p class="footer__copy">${CONFIG.footer.copyright}</p>
    <p class="footer__signoff">${CONFIG.footer.signoff}</p>
  `;

  renderContact();
  renderDeck();
  ensureDeckVisible();
}

function bindChrome() {
  Sound.initToggle(document.getElementById('sound-toggle'));
  document.getElementById('top-contact').addEventListener('click', () => scrollToContact());
}

let appReady = false;
function onBootComplete() {
  if (appReady) return;
  appReady = true;
  initSmoothScroll();
  initReveals();
  refreshScroll();
  heroEntrance();
  initGlitch();
  initCursor();
  initContactIntake();
  ensureDeckVisible();
  setTimeout(() => {
    nudgeToDeck(scrollTo);
    ensureDeckVisible();
  }, 200);
}

applyMeta();
renderStaticContent();
bindChrome();
initPanel();

document.getElementById('deck-track').addEventListener('click', (e) => {
  const card = e.target.closest('.module-card');
  if (card) openPanel(Number(card.dataset.index), card);
});

const heroCanvas = document.getElementById('hero-canvas');
initHeroNetwork(heroCanvas);

initLoader(onBootComplete);
