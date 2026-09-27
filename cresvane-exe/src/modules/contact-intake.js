import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { CONFIG } from '../config.js';
import { reducedMotion } from './motion-prefs.js';
import { scrollTo } from './smooth-scroll.js';
import { Sound } from './sound.js';

gsap.registerPlugin(SplitText);

const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

const STEPS = {
  build: {
    prompt: '> what are you looking to build?',
    multi: true,
    options: [
      'Website',
      'Web app',
      'Automation',
      'Integration',
      'Dashboard',
      'AI tool',
      'Not sure yet',
    ],
  },
  stage: {
    prompt: '> where are you right now?',
    multi: false,
    options: ['Just an idea', 'Have a plan', 'Already built, needs work', 'Need ongoing support'],
  },
  timeline: {
    prompt: '> when do you want to start?',
    multi: false,
    options: ['ASAP', 'This month', 'In 1–3 months', 'Just exploring'],
  },
  identity: {
    prompt: '> who should we talk to?',
    multi: false,
  },
};

let state = {
  step: 0,
  build: [],
  stage: '',
  timeline: '',
  name: '',
  contact: '',
  channelOpen: false,
  skippedIntake: false,
};

let timeInterval = null;
let calScriptPromise = null;

export function isEndpointConfigured() {
  const key = CONFIG.contact?.formEndpointKey;
  return key && !key.startsWith('[');
}

function intakeSummary() {
  const lines = [
    `Looking to build: ${state.build.join(' · ') || '—'}`,
    `Stage: ${state.stage || '—'}`,
    `Timeline: ${state.timeline || '—'}`,
  ];
  if (state.name) lines.push(`Name: ${state.name}`);
  if (state.contact) lines.push(`Contact: ${state.contact}`);
  return lines.join('\n');
}

export async function sendPayload(data) {
  const hp = document.getElementById(CONFIG.honeypotField);
  if (hp?.value || data[CONFIG.honeypotField]) return true;

  if (!isEndpointConfigured()) return false;

  const message =
    data.message ||
    Object.entries(data)
      .filter(([k]) => !k.startsWith('_') && k !== CONFIG.honeypotField)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

  try {
    const res = await fetch(WEB3FORMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: CONFIG.contact.formEndpointKey,
        subject: data._subject || 'Cresvane contact',
        name: data.name || 'Visitor',
        email: data.email || 'noreply@cresvane.local',
        message,
      }),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.error('Lead capture failed', err);
    return false;
  }
}

export async function submitEarlyAccess(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  Sound.click();
  return sendPayload({
    email,
    name: 'Early access',
    message: 'Early access list signup',
    _subject: 'Cresvane early access request',
  });
}

function isWhatsAppEnabled() {
  return CONFIG.contact.whatsappEnabled === true;
}

function validateContactField(value) {
  const v = value.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { ok: true, value: v, email: v };
  if (!isWhatsAppEnabled()) return { ok: false };
  const digits = v.replace(/\D/g, '');
  if (digits.length >= 8 && digits.length <= 15) return { ok: true, value: v, email: '' };
  return { ok: false };
}

function whatsappUrl(message) {
  if (!isWhatsAppEnabled()) return null;
  const num = (CONFIG.contact.whatsapp || '').replace(/\D/g, '');
  if (!num || num.length < 8) return null;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

function formatAbuDhabiTime() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: CONFIG.contact.timezone || 'Asia/Dubai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());
}

async function typePrompt(el, text) {
  el.textContent = text;
  if (reducedMotion) return;
  const split = new SplitText(el, { type: 'chars' });
  gsap.set(split.chars, { opacity: 0 });
  await gsap.to(split.chars, {
    opacity: 1,
    duration: 0.02,
    stagger: 0.018,
    ease: 'none',
  });
  split.revert();
}

function getRoot() {
  return document.getElementById('contact-intake-root');
}

function getLog() {
  return document.getElementById('intake-log');
}

function getActive() {
  return document.getElementById('intake-active');
}

function stepKeys() {
  return ['build', 'stage', 'timeline', 'identity'];
}

function currentStepKey() {
  return stepKeys()[state.step];
}

function canGoBack() {
  return state.step > 0 && !state.channelOpen;
}

function renderLog() {
  const log = getLog();
  if (!log) return;
  const parts = [];
  if (state.build.length) {
    parts.push({ q: STEPS.build.prompt, a: state.build.join(' · ') });
  }
  if (state.stage) parts.push({ q: STEPS.stage.prompt, a: state.stage });
  if (state.timeline) parts.push({ q: STEPS.timeline.prompt, a: state.timeline });
  log.innerHTML = parts
    .map(
      (p) => `
    <div class="intake-log__block">
      <p class="intake-log__q">${p.q}</p>
      <p class="intake-log__a">${p.a}</p>
    </div>`,
    )
    .join('');
}

function chipHtml(stepKey, def) {
  const selected = (val) => {
    if (def.multi) return state.build.includes(val);
    if (stepKey === 'stage') return state.stage === val;
    if (stepKey === 'timeline') return state.timeline === val;
    return false;
  };
  const role = def.multi ? 'group' : 'radiogroup';
  const chipRole = def.multi ? 'button' : 'radio';
  const chips = def.options
    .map((opt) => {
      const sel = selected(opt) ? ' is-selected' : '';
      const pressed = def.multi ? ` aria-pressed="${selected(opt)}"` : '';
      const checked = !def.multi && selected(opt) ? ' aria-checked="true"' : '';
      return `<button type="button" class="chip intake-chip" role="${chipRole}" data-value="${opt}"${pressed}${checked}>${opt}</button>`;
    })
    .join('');
  return `<div class="chip-group intake-chips" role="${role}" aria-label="${def.prompt}">${chips}</div>`;
}

async function renderStep() {
  const active = getActive();
  if (!active || state.channelOpen) return;

  const key = currentStepKey();
  const def = STEPS[key];
  renderLog();

  let backLink = '';
  if (canGoBack()) {
    backLink = `<button type="button" class="intake-back" id="intake-back">← back</button>`;
  }

  if (key === 'identity') {
    active.innerHTML = `
      ${backLink}
      <p class="intake-prompt" id="intake-prompt"></p>
      <div class="intake-identity">
        <div class="intake-field">
          <label class="intake-identity__label" for="intake-name">Name</label>
          <input type="text" id="intake-name" class="intake-identity__input" autocomplete="name" value="${escapeAttr(state.name)}"/>
        </div>
        <div class="intake-field">
          <label class="intake-identity__label" for="intake-contact">${isWhatsAppEnabled() ? 'Email or WhatsApp' : 'Email'}</label>
          <input type="text" id="intake-contact" class="intake-identity__input" autocomplete="email" value="${escapeAttr(state.contact)}" placeholder="${isWhatsAppEnabled() ? 'you@company.com or +971…' : 'you@company.com'}"/>
        </div>
        <span class="field-error" id="err-intake-contact">${isWhatsAppEnabled() ? 'Enter a valid email or WhatsApp number' : 'Enter a valid email'}</span>
      </div>
      <button type="button" class="intake-continue intake-continue--open" id="intake-open">Open channel ↵</button>
    `;
    await typePrompt(document.getElementById('intake-prompt'), def.prompt);
    bindIdentityStep();
    document.getElementById('intake-name')?.focus();
    return;
  }

  const showContinue =
    (key === 'build' && state.build.length > 0) ||
    (key === 'stage' && state.stage) ||
    (key === 'timeline' && state.timeline);

  active.innerHTML = `
    ${backLink}
    <p class="intake-prompt" id="intake-prompt"></p>
    ${chipHtml(key, def)}
    <button type="button" class="intake-continue${showContinue ? ' is-visible' : ''}" id="intake-continue" ${showContinue ? '' : 'hidden'}>Continue ↵</button>
  `;

  await typePrompt(document.getElementById('intake-prompt'), def.prompt);
  bindChipStep(key, def);
  const firstChip = active.querySelector('.intake-chip');
  firstChip?.focus();
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function bindBack() {
  document.getElementById('intake-back')?.addEventListener('click', () => {
    const key = currentStepKey();
    if (key === 'stage') state.stage = '';
    else if (key === 'timeline') state.timeline = '';
    state.step -= 1;
    renderStep();
  });
}

function bindChipStep(stepKey, def) {
  bindBack();
  const continueBtn = document.getElementById('intake-continue');
  const chips = document.querySelectorAll('#intake-active .intake-chip');

  const updateContinue = () => {
    let ok = false;
    if (stepKey === 'build') ok = state.build.length > 0;
    else if (stepKey === 'stage') ok = Boolean(state.stage);
    else if (stepKey === 'timeline') ok = Boolean(state.timeline);
    if (!continueBtn) return;
    continueBtn.hidden = !ok;
    continueBtn.classList.toggle('is-visible', ok);
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const val = chip.dataset.value;
      if (def.multi) {
        if (state.build.includes(val)) state.build = state.build.filter((x) => x !== val);
        else state.build = [...state.build, val];
        chip.classList.toggle('is-selected');
        chip.setAttribute('aria-pressed', String(chip.classList.contains('is-selected')));
      } else {
        chips.forEach((c) => {
          c.classList.remove('is-selected');
          c.setAttribute('aria-checked', 'false');
        });
        chip.classList.add('is-selected');
        chip.setAttribute('aria-checked', 'true');
        if (stepKey === 'stage') state.stage = val;
        if (stepKey === 'timeline') state.timeline = val;
      }
      Sound.tick();
      updateContinue();
    });

    chip.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        chip.click();
      }
    });
  });

  continueBtn?.addEventListener('click', () => {
    state.step += 1;
    renderStep();
  });

  continueBtn?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !continueBtn.hidden) {
      e.preventDefault();
      continueBtn.click();
    }
  });
}

function bindIdentityStep() {
  bindBack();
  const nameEl = document.getElementById('intake-name');
  const contactEl = document.getElementById('intake-contact');
  const openBtn = document.getElementById('intake-open');

  openBtn?.addEventListener('click', () => openChannel());
  openBtn?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      openChannel();
    }
  });

  [nameEl, contactEl].forEach((el) => {
    el?.addEventListener('input', () => {
      state.name = nameEl.value.trim();
      state.contact = contactEl.value.trim();
    });
  });
}

async function postLead() {
  const contactCheck = validateContactField(state.contact);
  const payload = {
    name: state.name,
    email: contactCheck.email || `whatsapp:${state.contact.replace(/\D/g, '')}`,
    message: intakeSummary(),
    _subject: `New project inquiry — ${state.name}`,
    [CONFIG.honeypotField]: document.getElementById(CONFIG.honeypotField)?.value || '',
  };
  if (!state.skippedIntake) {
    await sendPayload(payload);
  }
}

async function openChannel() {
  const nameEl = document.getElementById('intake-name');
  const contactEl = document.getElementById('intake-contact');
  state.name = nameEl?.value.trim() || state.name;
  state.contact = contactEl?.value.trim() || state.contact;

  const err = document.getElementById('err-intake-contact');
  const contactCheck = validateContactField(state.contact);
  const nameOk = state.name.length >= 1;
  err?.classList.toggle('is-visible', !contactCheck.ok);
  if (!nameOk || !contactCheck.ok) {
    if (!nameOk) nameEl?.focus();
    else contactEl?.focus();
    return;
  }

  Sound.click();
  state.channelOpen = true;
  state.skippedIntake = false;

  const active = getActive();
  active.innerHTML = `
    <p class="intake-status-line">establishing connection…</p>
    <div class="intake-progress"><div class="intake-progress__fill" id="intake-progress-fill"></div></div>
  `;

  postLead();

  const fill = document.getElementById('intake-progress-fill');
  gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' });
  await new Promise((r) => setTimeout(r, 1200));

  Sound.chime();
  active.innerHTML = `<p class="intake-status-line intake-status-line--ok">channel open ✓</p>`;
  await new Promise((r) => setTimeout(r, 400));

  showConnectionOptions();
}

function showConnectionOptions() {
  const active = getActive();
  const { email, calLink } = CONFIG.contact;
  const wa = whatsappUrl(buildWhatsAppMessage());
  const calConfigured = calLink && !calLink.startsWith('[');
  const whatsappCard = wa
    ? `
      <button type="button" class="connect-card" data-action="whatsapp">
        <span class="connect-card__title">Message on WhatsApp</span>
        <span class="connect-card__hint">Opens WhatsApp with your summary</span>
      </button>`
    : '';

  active.innerHTML = `
    <div class="intake-connect" role="list">
      <button type="button" class="connect-card connect-card--primary" data-action="cal" ${calConfigured ? '' : 'disabled'}>
        <span class="connect-card__title">Book a 20-min call</span>
        <span class="connect-card__hint">Inline calendar — no new tab</span>
      </button>
      ${whatsappCard}
      <button type="button" class="connect-card" data-action="email">
        <span class="connect-card__title" id="copy-email-label">Copy email</span>
        <span class="connect-card__hint">${email}</span>
      </button>
    </div>
    <div class="intake-cal-wrap" id="intake-cal-wrap" hidden>
      <div class="intake-cal" id="intake-cal"></div>
      <p class="intake-cal-confirmed" id="intake-cal-confirmed" hidden>Call confirmed. You'll get a calendar invite shortly.</p>
    </div>
  `;

  active.querySelector('[data-action="cal"]')?.addEventListener('click', () => {
    if (!calConfigured) return;
    const wrap = document.getElementById('intake-cal-wrap');
    wrap.hidden = false;
    loadCalInline();
  });

  active.querySelector('[data-action="whatsapp"]')?.addEventListener('click', () => {
    if (!wa) return;
    window.open(wa, '_blank', 'noopener,noreferrer');
  });

  active.querySelector('[data-action="email"]')?.addEventListener('click', async () => {
    const label = document.getElementById('copy-email-label');
    const ok = await copyText(email);
    if (ok && label) {
      label.textContent = 'copied ✓';
      setTimeout(() => {
        label.textContent = 'Copy email';
      }, 2000);
    }
  });
}

function buildWhatsAppMessage() {
  const name = state.name || 'there';
  const build = state.build.length ? state.build.join(', ') : 'a project';
  const stage = state.stage || 'not specified';
  const timeline = state.timeline || 'not specified';
  return `Hi Cresvane, I'm ${name}. I'm looking to build: ${build}. Stage: ${stage}. Timeline: ${timeline}.`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(ta);
    }
  }
}

function loadCalScript() {
  if (window.Cal) return Promise.resolve();
  if (calScriptPromise) return calScriptPromise;
  calScriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://app.cal.com/embed/embed.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return calScriptPromise;
}

async function loadCalInline() {
  const el = document.getElementById('intake-cal');
  if (!el) return;
  try {
    await loadCalScript();
  } catch {
    console.error('Cal.com embed failed to load');
    return;
  }

  const contactCheck = validateContactField(state.contact);
  const notes = intakeSummary();

  window.Cal('inline', {
    elementOrSelector: el,
    calLink: CONFIG.contact.calLink,
    config: {
      name: state.name,
      email: contactCheck.email || undefined,
      notes,
    },
  });

  window.Cal('on', {
    action: 'bookingSuccessful',
    callback: () => {
      const msg = document.getElementById('intake-cal-confirmed');
      if (msg) msg.hidden = false;
    },
  });
}

function openChannelShortcuts() {
  state.channelOpen = true;
  state.skippedIntake = true;
  renderLog();
  const active = getActive();
  if (active) {
    active.innerHTML = `<p class="intake-status-line intake-status-line--ok">channel open ✓</p>`;
    setTimeout(showConnectionOptions, 200);
  }
}

export function renderContact() {
  const terminal = document.getElementById('contact-terminal');
  const { contact } = CONFIG;

  terminal.innerHTML = `
    <div class="panel__titlebar contact-intake__titlebar">
      <div class="panel__dots" aria-hidden="true"><span></span><span></span><span></span></div>
      <span class="panel__filename">${contact.windowTitle}</span>
    </div>
    <div class="intake-status" aria-live="polite">
      <span class="intake-status__online"><span class="intake-status__dot" aria-hidden="true"></span>Online</span>
      <span class="intake-status__time" id="intake-live-time"></span>
      <span class="intake-status__reply">${contact.replyTime}</span>
    </div>
    <div class="contact-intake" id="contact-intake-root">
      <input class="hp-field" type="text" id="${CONFIG.honeypotField}" name="${CONFIG.honeypotField}" tabindex="-1" autocomplete="off" aria-hidden="true"/>
      <div class="intake-log" id="intake-log" aria-live="polite"></div>
      <div class="intake-active" id="intake-active"></div>
      <p class="intake-cursor-line" aria-hidden="true"><span class="intake-cursor">_</span></p>
    </div>
  `;

  updateLiveTime();
  if (timeInterval) clearInterval(timeInterval);
  timeInterval = setInterval(updateLiveTime, 60_000);
}

function updateLiveTime() {
  const el = document.getElementById('intake-live-time');
  if (el) el.textContent = formatAbuDhabiTime();
}

export function renderContactShortcuts() {
  const el = document.getElementById('contact-shortcuts');
  if (!el) return;
  const { calLink } = CONFIG.contact;
  const calOk = calLink && !calLink.startsWith('[');
  const wa = whatsappUrl('Hi Cresvane — I’d like to talk about a project.');
  const links = [];
  if (calOk) links.push(`<button type="button" class="intake-shortcut-link" data-shortcut="cal">Book a call directly</button>`);
  if (wa) links.push(`<button type="button" class="intake-shortcut-link" data-shortcut="wa">WhatsApp us</button>`);

  el.innerHTML = `Already know what you need? → ${links.join(' <span class="intake-shortcut-sep">/</span> ')}`;

  el.querySelector('[data-shortcut="cal"]')?.addEventListener('click', () => {
    scrollToContact();
    openChannelShortcuts();
    setTimeout(() => {
      document.querySelector('[data-action="cal"]')?.click();
    }, 400);
  });

  el.querySelector('[data-shortcut="wa"]')?.addEventListener('click', () => {
    if (wa) window.open(wa, '_blank', 'noopener,noreferrer');
  });
}

export function focusContactIntake() {
  const chip = document.querySelector('#intake-active .intake-chip');
  const input = document.getElementById('intake-name');
  (chip || input || getRoot())?.focus?.();
}

export function scrollToContact() {
  scrollTo('#contact');
  setTimeout(focusContactIntake, 600);
}

export function initContactIntake() {
  state = {
    step: 0,
    build: [],
    stage: '',
    timeline: '',
    name: '',
    contact: '',
    channelOpen: false,
    skippedIntake: false,
  };
  renderContactShortcuts();
  renderStep();
}

/** @deprecated use initContactIntake */
export const initContactForm = initContactIntake;
