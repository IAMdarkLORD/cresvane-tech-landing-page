import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { reducedMotion } from './motion-prefs.js';

gsap.registerPlugin(SplitText);

/** Deck cards must stay visible — never use ScrollTrigger opacity on #deck / .module-card */
export function ensureDeckVisible() {
  const deck = document.getElementById('deck');
  const cards = document.querySelectorAll('.module-card');
  if (deck) deck.style.opacity = '1';
  cards.forEach((card) => {
    card.style.opacity = '1';
    card.style.visibility = 'visible';
    card.style.transform = '';
  });
  gsap.set(deck, { clearProps: 'opacity,transform' });
  gsap.set(cards, { clearProps: 'all' });
}

export function initReveals() {
  ensureDeckVisible();
  if (reducedMotion) return;

  const deckTitle = document.getElementById('deck-title');
  if (deckTitle) {
    gsap.from(deckTitle, { y: 14, duration: 0.45, ease: 'power2.out', delay: 0.15 });
  }
}

export function heroEntrance() {
  const headline = document.getElementById('hero-headline');
  if (!headline || reducedMotion) return;

  const split = new SplitText(headline, { type: 'lines' });
  gsap.from(split.lines, {
    opacity: 0,
    y: 20,
    stagger: 0.1,
    duration: 0.55,
    ease: 'power2.out',
    delay: 0.1,
  });
}

/** After boot, bring module row into view if it is still off-screen */
export function nudgeToDeck(scrollTo) {
  const first = document.querySelector('.module-card');
  if (!first) return;

  const rect = first.getBoundingClientRect();
  if (rect.top > window.innerHeight * 0.5) {
    scrollTo('#deck-track', { offset: -96, duration: 1 });
    setTimeout(() => {
      const r = first.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.5) {
        const y = r.top + window.scrollY - 96;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      ensureDeckVisible();
    }, 400);
  }
}
