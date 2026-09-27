let ctx = null;
let master = null;
let ambient = null;
let enabled = false;
const MASTER_VOL = 0.12;

function ensureContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
}

function rampMaster(target, dur = 0.5) {
  if (!master || !ctx) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
  master.gain.linearRampToValueAtTime(target * MASTER_VOL, ctx.currentTime + dur);
}

function startAmbient() {
  if (!ctx || ambient) return;
  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  o1.type = 'sine';
  o2.type = 'sine';
  o1.frequency.value = 110;
  o2.frequency.value = 112;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  const g = ctx.createGain();
  g.gain.value = 0.15;
  o1.connect(filter);
  o2.connect(filter);
  filter.connect(g);
  g.connect(master);
  o1.start();
  o2.start();
  ambient = { o1, o2 };
}

function stopAmbient() {
  if (ambient) {
    try {
      ambient.o1.stop();
      ambient.o2.stop();
    } catch (_) {}
    ambient = null;
  }
}

export const Sound = {
  isEnabled: () => enabled,

  toggle() {
    ensureContext();
    if (enabled) {
      enabled = false;
      rampMaster(0, 0.5);
      setTimeout(stopAmbient, 550);
      localStorage.setItem('cresvane_sound', 'off');
    } else {
      enabled = true;
      startAmbient();
      rampMaster(1, 2);
      localStorage.setItem('cresvane_sound', 'on');
    }
    return enabled;
  },

  initToggle(btn) {
    const sync = () => {
      btn.textContent = enabled ? 'Sound ON' : 'Sound OFF';
      btn.classList.toggle('is-on', enabled);
      btn.setAttribute('aria-pressed', String(enabled));
    };
    btn.addEventListener('click', () => {
      ensureContext();
      Sound.toggle();
      sync();
    });
    sync();
  },

  hover() {
    if (!enabled || !ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 2400;
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    o.connect(g);
    g.connect(master);
    o.start();
    o.stop(ctx.currentTime + 0.03);
  },

  tick() {
    if (!enabled || !ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 880;
    o.type = 'sine';
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    o.connect(g);
    g.connect(master);
    o.start();
    o.stop(ctx.currentTime + 0.04);
  },

  chime() {
    if (!enabled || !ctx) return;
    [660, 990, 1320].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      o.type = 'sine';
      const t = ctx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + 0.2);
    });
  },

  click() {
    if (!enabled || !ctx) return;
    [520, 680].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      o.type = 'triangle';
      const t = ctx.currentTime + i * 0.06;
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + 0.12);
    });
  },

  whoosh() {
    if (!enabled || !ctx) return;
    const n = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    src.connect(filter);
    filter.connect(g);
    g.connect(master);
    src.start();
  },
};
