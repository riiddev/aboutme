import gsap from 'gsap';
import { sectionStore } from './lib.js';

/*
 * A tiny autonomous inhabitant of the page.
 *
 * - Lives in DOCUMENT coordinates inside an absolutely positioned layer, so the page scrolls it
 *   natively (no scroll lag, even with touch scrolling). Nothing here is React state.
 * - "Surfaces" (hero floor, headings, card tops...) are scanned from the real DOM. A surface only
 *   counts where the space above it is free of text/images/buttons, so it never stands on content.
 * - Behaviour = weighted random choice between generator-based actions, with cooldowns plus
 *   energy / boredom drift. Every action is a sequence of tweened poses; nothing teleports while visible.
 * - The layer and everything in it is pointer-events:none and aria-hidden. It only ever *reads* the DOM,
 *   apart from tiny decorative WAAPI `translate` dips on heading letters.
 */

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const pick = (list) => list[(Math.random() * list.length) | 0];
const sign = (v) => (v < 0 ? -1 : 1);
const ease = {
  in: (t) => t * t,
  out: (t) => 1 - (1 - t) ** 3,
  io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
};

const WALK = 46;
const RUN = 128;
const ACC = 260;
const G = 1450;
const MARGIN = 14;

// Anything the companion must not stand in front of for long.
const PROTECT = 'h1,h2,h3,p,figcaption,img,.btn,.chest-btn,.slot__name,.pixel-logo,.textlink,.hero__meta,.hc__btn,.hero__scroll,.about__mood';
// Visible edges it may stand on.
const LEDGES = '.fig,.btn,.sign,.project-row__chest,.sec > .wrap';
const INSPECT = '.btn,.chest-btn,.sign,.fig,.slot,.hero__title,.title';

const alphaOf = (color) => {
  const m = /rgba?\(([^)]+)\)/.exec(color || '');
  if (!m) return 0;
  const parts = m[1].split(/[\s,/]+/).filter(Boolean);
  return parts.length >= 4 ? parseFloat(parts[3]) : 1;
};

export class Companion {
  constructor(layer, { calm = false } = {}) {
    this.layer = layer;
    this.el = layer.querySelector('.cp');
    this.shadow = layer.querySelector('.cp__shadow');
    this.emoteEl = layer.querySelector('.cp__emote');
    this.eyesEl = layer.querySelector('.cp__eyesA');
    this.headEl = layer.querySelector('.cp__headA');
    this.blinkEl = layer.querySelector('.cp__blink');
    this.flipEl = layer.querySelector('.cp__flip');
    this.dust = [...layer.querySelectorAll('.cp__dust i')];
    this.calm = calm;
    this.coarse = matchMedia('(pointer: coarse)').matches;

    this.x = 0; this.y = 0; this.vx = 0; this.yo = 0; this.face = 1; this.air = false;
    this.lean = 0; this.sq = 0; this.crouch = 0; this.stretch = 0; this.lie = 0; this.sit = 0; this.tilt = 0;
    this.ex = 0; this.ey = 0; this.gx = null; this.gy = null; this.cyc = 0.4;
    this.clipOn = false; this.clipY = 0; this.groundY = 0; this.glitch = 0; this.loose = false;
    this.state = 'idle'; this.pose = 'stand'; this.stateT = 0;
    this.emoteName = ''; this.emoteT = 0;
    this.cur = null; this.surfaces = []; this.byEl = new Map();
    this.away = true; this.time = 0; this.dt = 0.016; this.cd = {}; this.lastAction = '';
    this.energy = 0.85; this.boredom = 0; this.justWoke = false;
    this.gen = null; this.pending = null; this.canInterrupt = true;
    this.offT = 0; this.running = false; this.first = true;
    this.lastScan = 0; this.dirty = true; this.scrollV = 0; this.lastSY = 0;
    this.mp = { x: -999, y: -999, t: 0, v: 0, ok: false };
    this.near = 9999; this.dustI = 0; this.rendered = {};
    this.syncSize();
  }

  /* ------------------------------------------------------------------ setup */

  syncSize() {
    this.u = innerWidth < 561 ? 1.25 : 1.5;
    this.k = this.u / 1.5;
    this.H = 40 * this.u;
    this.hw = 12 * this.u;
    this.feet = 48 * this.u;
    this.cx = 16 * this.u;
    this.spd = this.k * (this.coarse ? 0.9 : 1);
    this.maxDX = 230 * this.k;
    this.maxRise = 100 * this.k;
    this.maxDrop = 260;
    this.layer.style.setProperty('--u', this.u + 'px');
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.lastSY = scrollY;
    this.onResize = () => { this.dirty = true; this.syncSize(); if (this.calm) this.placeCalm(); };
    this.onMove = (e) => {
      if (e.pointerType === 'touch') return;
      const now = e.timeStamp || performance.now();
      const dt = Math.max(0.008, (now - this.mp.t) / 1000);
      const v = this.mp.ok ? Math.hypot(e.clientX - this.mp.x, e.clientY - this.mp.y) / dt : 0;
      this.mp = { x: e.clientX, y: e.clientY, t: performance.now(), v: lerp(this.mp.v, v, 0.5), ok: true };
    };
    this.onDown = (e) => {
      if (this.calm || this.away || !this.cur || e.pointerType === 'touch') return;
      const dx = e.clientX + scrollX - this.x;
      const dy = e.clientY + scrollY - (this.y - this.H * 0.5);
      if (Math.hypot(dx, dy) < 70 && this.ready('startle', 4)) this.want('startle', sign(-dx));
    };
    this.onVis = () => { this.last = performance.now(); };
    addEventListener('resize', this.onResize);
    if (!this.calm) {
      addEventListener('pointermove', this.onMove, { passive: true });
      addEventListener('pointerdown', this.onDown, { passive: true });
      document.addEventListener('visibilitychange', this.onVis);
    }
    this.ro = typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => {
        this.dirty = true;
        if (this.calm) { clearTimeout(this.calmT); this.calmT = setTimeout(() => this.placeCalm(), 150); }
      })
      : null;
    this.ro?.observe(document.body);
    this.unsub = sectionStore.subscribe(() => this.onSection());
    document.fonts?.ready.then(() => { this.dirty = true; if (this.calm) this.placeCalm(); });

    if (this.calm) {
      this.boot = setTimeout(() => this.placeCalm(), 400);
      return;
    }
    // Registered after App's Lenis ticker so scroll position is already updated when we read it.
    this.boot = setTimeout(() => { if (this.running) gsap.ticker.add(this.tick); }, 0);
  }

  stop() {
    this.running = false;
    clearTimeout(this.boot);
    clearTimeout(this.calmT);
    gsap.ticker.remove(this.tick);
    removeEventListener('resize', this.onResize);
    removeEventListener('pointermove', this.onMove);
    removeEventListener('pointerdown', this.onDown);
    document.removeEventListener('visibilitychange', this.onVis);
    this.ro?.disconnect();
    this.unsub?.();
    try { this.gen?.return(); } catch { /* generator already closed */ }
    this.gen = null;
    this.dust.forEach((d) => d.getAnimations?.().forEach((a) => a.cancel()));
    this.el.style.visibility = 'hidden';
    this.el.style.clipPath = '';
  }

  /* ------------------------------------------------------------- world scan */

  progress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? clamp(scrollY / max, 0, 1) : 0;
  }

  hudH() { return document.querySelector('.hud')?.offsetHeight || 74; }

  geom(el, kind) {
    const sx = scrollX; const sy = scrollY;
    if (kind === 'floor') {
      const r = el.getBoundingClientRect();
      if (r.width < 50 || r.height < 10) return null;
      return { x1: r.left + sx, x2: r.right + sx, y: r.bottom + sy - clamp(r.height * 0.16, 10, 34) };
    }
    if (kind === 'title') {
      const words = el.querySelectorAll('.w');
      if (!words.length) return null;
      let top = 1e9; let l = 1e9; let rr = -1e9;
      words.forEach((w) => { top = Math.min(top, w.getBoundingClientRect().top); });
      words.forEach((w) => {
        const q = w.getBoundingClientRect();
        if (q.top < top + 8) { l = Math.min(l, q.left); rr = Math.max(rr, q.right); }
      });
      const fs = parseFloat(getComputedStyle(el).fontSize) || 40;
      return { x1: l + sx, x2: rr + sx, y: top + sy + fs * 0.1 };
    }
    if (kind === 'bar') {
      // The pixel underline after each heading (.title::after): a small visible platform.
      const words = el.querySelectorAll('.w');
      if (!words.length) return null;
      const last = words[words.length - 1].getBoundingClientRect();
      const first = words[0].getBoundingClientRect();
      if (last.top > first.top + 8) return null; // heading wrapped: the bar moved to another line
      const fs = parseFloat(getComputedStyle(el).fontSize) || 40;
      const bw = clamp(innerWidth * 0.05, 30, 68);
      const x1 = last.right + fs * 0.27 + 12;
      if (x1 + bw > el.getBoundingClientRect().right + 1) return null;
      return { x1: x1 + sx, x2: x1 + bw + sx, y: last.top + sy + fs * 0.7 };
    }
    const r = el.getBoundingClientRect();
    if (r.width < 30 || r.height < 6) return null;
    return { x1: r.left + sx, x2: r.right + sx, y: r.top + sy };
  }

  shown(el, kind) {
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.85) return false;
    const host = el.closest('.wrap, .project-row, .hero__actions');
    if (host && host !== el && parseFloat(getComputedStyle(host).opacity) < 0.85) return false;
    if (kind === 'title') {
      const c = el.querySelector('.ch');
      if (c && parseFloat(getComputedStyle(c).opacity) < 0.85) return false;
    }
    return true;
  }

  freeSpans(s, prot) {
    let a = s.x1 + MARGIN; let b = s.x2 - MARGIN;
    if (b < a) { a = (s.x1 + s.x2) / 2; b = a; }
    const zt = s.y - this.H - 2; const zb = s.y - 3;
    const cuts = [];
    for (const q of prot) {
      if (q.t >= zb || q.b <= zt) continue;
      if (q.el === s.el || q.el.contains(s.el) || s.el.contains(q.el)) continue;
      if (s.kind === 'floor' && q.big) continue;
      cuts.push([q.l - this.hw * 0.85, q.r + this.hw * 0.85]);
    }
    cuts.sort((p, q) => p[0] - q[0]);
    const out = [];
    let cursor = a;
    for (const [l, r] of cuts) {
      if (r < cursor) continue;
      if (l > b) break;
      if (l > cursor) out.push([cursor, Math.min(l, b)]);
      cursor = Math.max(cursor, r);
    }
    if (cursor <= b) out.push([cursor, b]);
    const min = a === b ? 0 : 24;
    return out.filter(([p, q]) => q - p >= min);
  }

  scan() {
    this.lastScan = performance.now();
    this.dirty = false;
    const sx = scrollX; const sy = scrollY;
    const lo = sy - innerHeight * 1.2; const hi = sy + innerHeight * 2.4;

    const prot = [];
    document.querySelectorAll(PROTECT).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const t = r.top + sy; const b = r.bottom + sy;
      if (b < lo || t > hi) return;
      if (el.classList.contains('title')) {
        // Headings are full-width boxes; only the words themselves are off-limits.
        el.querySelectorAll('.w').forEach((w) => {
          const q = w.getBoundingClientRect();
          prot.push({ el, l: q.left + sx, r: q.right + sx, t: q.top + sy, b: q.bottom + sy });
        });
        return;
      }
      prot.push({ el, l: r.left + sx, r: r.right + sx, t, b, big: el.classList.contains('hc__btn') });
    });

    const out = [];
    const add = (el, kind) => {
      const g = this.geom(el, kind);
      if (!g || g.y < lo || g.y > hi || !this.shown(el, kind)) return;
      const cs = getComputedStyle(el);
      const bw = parseFloat(cs.borderTopWidth) || 0;
      if (kind === 'ledge' && bw <= 0 && alphaOf(cs.backgroundColor) <= 0.5) return;
      const w = g.x2 - g.x1;
      const s = {
        el, kind, key: kind === 'bar' ? (el.__cpBar ||= {}) : el, ...g,
        pad: kind === 'ledge' ? (parseFloat(cs.paddingTop) || 0) + bw : 0,
        peek: kind === 'ledge' && w >= 70 && alphaOf(cs.backgroundColor) > 0.85,
      };
      s.free = this.freeSpans(s, prot);
      if (s.free.length) out.push(s);
    };

    const floor = document.querySelector('.hero__ground');
    if (floor) add(floor, 'floor');
    document.querySelectorAll('.sec .title').forEach((el) => { add(el, 'title'); add(el, 'bar'); });
    document.querySelectorAll(LEDGES).forEach((el) => add(el, 'ledge'));

    // Keep the current surface even if it is momentarily fully blocked, so it can walk out of trouble.
    if (this.cur && !out.some((s) => s.key === this.cur.key) && this.cur.el.isConnected) {
      const g = this.geom(this.cur.el, this.cur.kind);
      if (g) out.push({ ...this.cur, ...g, free: [] });
    }
    this.surfaces = out;
    this.byEl = new Map(out.map((s) => [s.key, s]));
    if (this.cur) this.cur = this.byEl.get(this.cur.key) || null;
  }

  refreshCur() {
    const s = this.cur;
    if (!s || this.air) return;
    if (!s.el.isConnected) { this.cur = null; return; }
    const g = this.geom(s.el, s.kind);
    if (!g) { this.cur = null; return; }
    s.x1 = g.x1; s.x2 = g.x2; s.y = g.y;
    this.y = s.y + this.yo;
    if (!this.loose) {
      const b = this.bounds();
      if (this.x < b[0] - 1) this.x = Math.min(b[0], this.x + 180 * this.dt);
      else if (this.x > b[1] + 1) this.x = Math.max(b[1], this.x - 180 * this.dt);
    }
    this.inBlock = !this.spanAt(s, this.x);
    if (this.clipOn) this.clipY = s.y;
  }

  bounds() {
    const s = this.cur;
    const a = s.x1 + MARGIN; const b = s.x2 - MARGIN;
    return b < a ? [(s.x1 + s.x2) / 2, (s.x1 + s.x2) / 2] : [a, b];
  }

  spanAt(s, x) { for (const sp of s.free) if (x >= sp[0] - 1 && x <= sp[1] + 1) return sp; return null; }

  nearestSpan(s, x) {
    let best = null; let bd = 1e9;
    for (const sp of s.free) {
      const d = x < sp[0] ? sp[0] - x : x > sp[1] ? x - sp[1] : 0;
      if (d < bd) { bd = d; best = sp; }
    }
    return best;
  }

  nearestFreeX(s, x) { const sp = this.nearestSpan(s, x); return sp ? clamp(x, sp[0], sp[1]) : x; }

  visibleY(y) { return y >= scrollY + this.hudH() + this.H + 8 && y <= scrollY + innerHeight - 8; }

  /* ---------------------------------------------------------------- the loop */

  tick = () => {
    if (!this.running) return;
    const now = performance.now();
    const dt = clamp((now - this.last) / 1000, 0, 0.05);
    this.last = now;
    this.dt = dt; this.time += dt; this.stateT += dt;
    const sy = scrollY;
    this.scrollV = lerp(this.scrollV, dt > 0 ? (sy - this.lastSY) / dt : 0, 1 - Math.exp(-dt * 10));
    this.lastSY = sy;
    if (this.dirty || now - this.lastScan > 1400) this.scan();
    this.refreshCur();
    this.sense();
    this.drift();
    this.drive();
    this.watch();
    this.render();
  };

  drift() {
    const dt = this.dt;
    this.sq = Math.max(0, this.sq - dt * 7);
    if (this.emoteT > 0) { this.emoteT -= dt; if (this.emoteT <= 0) this.emoteName = ''; }
    if (this.glitch > 0) this.glitch -= dt;
    const s = this.state;
    if (s === 'sleeping') this.energy += dt * 0.055;
    else if (s === 'sitting') this.energy += dt * 0.02;
    else if (s === 'running') this.energy -= dt * 0.03;
    else if (s === 'walking') this.energy -= dt * 0.01;
    else this.energy += dt * 0.004;
    this.energy = clamp(this.energy, 0, 1);
    if (s === 'idle' || s === 'looking' || s === 'sitting') this.boredom += dt * 0.016;
    else if (s !== 'sleeping') this.boredom -= dt * 0.04;
    this.boredom = clamp(this.boredom, 0, 1);

    // Gaze: toward travel, toward a nearby cursor, or wherever an action asked for.
    let tx = 0; let ty = 0;
    if (this.gx != null) { tx = this.gx; ty = this.gy || 0; }
    else if (s === 'walking' || s === 'running') tx = this.face * 1.6;
    else if (!this.coarse && this.mp.ok && s !== 'sleeping' && performance.now() - this.mp.t < 5000 && this.near < 360) {
      tx = clamp((this.mp.x + scrollX - this.x) / 90, -1.6, 1.6);
      ty = clamp((this.mp.y + scrollY - (this.y - this.H * 0.8)) / 120, -1, 1);
    }
    this.ex = lerp(this.ex, tx, 1 - Math.exp(-dt * 14));
    this.ey = lerp(this.ey, ty, 1 - Math.exp(-dt * 14));
  }

  sense() {
    if (this.away || !this.cur) return;
    const m = this.mp;
    const fresh = performance.now() - m.t < 900;
    if (!this.coarse && m.ok) {
      const dx = m.x + scrollX - this.x;
      const dy = m.y + scrollY - (this.y - this.H * 0.5);
      this.near = Math.hypot(dx, dy);
      if (this.canInterrupt && fresh) {
        if (this.near < 80 && m.v > 1300 && this.ready('startle', 6)) this.want('startle', sign(-dx));
        else if (this.near < 300 && m.v > 40 && this.state !== 'sleeping' && this.ready('curious', 12) && Math.random() < this.dt * 0.5) {
          this.cd.curious = this.time;
          this.want(Math.random() < 0.55 ? 'follow' : 'glance');
        }
      }
    }
    if (Math.abs(this.scrollV) > 2200 && this.canInterrupt && this.state !== 'sleeping' && this.ready('brace', 7)) this.want('brace');
  }

  ready(key, secs) { return !(this.cd[key] > this.time - secs); }

  want(name, ...args) {
    if (!this.canInterrupt || this.away) return;
    this.cd[name] = this.time;
    this.pending = { name, args, at: this.time };
  }

  drive() {
    if (this.pending && this.time - this.pending.at > 2) this.pending = null;
    if (this.pending && this.canInterrupt && !this.away) {
      const { name, args } = this.pending;
      this.pending = null;
      try { this.gen?.return(); } catch { /* ignore */ }
      this.gen = this[name](...args);
    }
    if (!this.gen) this.gen = this.decide();
    const r = this.gen.next();
    if (r.done) this.gen = null;
  }

  watch() {
    if (this.away) return;
    if (!Number.isFinite(this.x) || !Number.isFinite(this.y)) { this.hide(); this.cur = null; return; }
    const top = scrollY + this.hudH();
    const onScreen = this.y > top + this.H * 0.9 && this.y - this.H < scrollY + innerHeight - 4;
    this.offT = onScreen ? 0 : this.offT + this.dt;
    if (this.offT > 2.4 && this.canInterrupt && this.state !== 'leaving') {
      this.offT = 0;
      this.pending = null;
      try { this.gen?.return(); } catch { /* ignore */ }
      this.gen = this.leave(false);
    }
    if (this.stateT > 70 && this.canInterrupt && this.state !== 'sleeping') this.gen = null;
  }

  /* ---------------------------------------------------------------- helpers */

  set(state, pose = state) {
    if (this.state !== state) this.stateT = 0;
    this.state = state; this.pose = pose;
  }

  say(name, secs = 1.1) { this.emoteName = name; this.emoteT = secs; }

  puff(n = 2) {
    if (this.calm || !this.dust.length) return;
    for (let i = 0; i < n; i += 1) {
      const d = this.dust[this.dustI++ % this.dust.length];
      const dir = i % 2 ? 1 : -1;
      d.style.left = (this.cx + dir * rand(3, 9) * this.u) + 'px';
      d.animate(
        [{ transform: 'translate(0,0)', opacity: 0.85 }, { transform: `translate(${dir * rand(5, 10)}px,${-rand(4, 9)}px)`, opacity: 0 }],
        { duration: 300, easing: 'steps(4)' },
      );
    }
  }

  dip(s) {
    if (this.calm || s.kind !== 'title' || !s.el.animate) return;
    s.el.querySelectorAll('.ch').forEach((ch) => {
      const r = ch.getBoundingClientRect();
      if (Math.abs(r.left + scrollX + r.width / 2 - this.x) < 22) {
        ch.animate([{ translate: '0 0' }, { translate: '0 3px' }, { translate: '0 0' }], { duration: 240, easing: 'steps(3)' });
      }
    });
  }

  landOn(s) {
    const t = this.byEl.get(s.key) || s;
    this.cur = t; this.air = false; this.loose = false; this.vx = 0; this.yo = 0;
    this.y = t.y; this.groundY = t.y; this.sq = 1; this.canInterrupt = true;
    this.set('idle', 'stand');
    this.puff(2);
    this.dip(t);
  }

  hide() { this.away = true; this.gen = null; this.canInterrupt = true; this.clipOn = false; this.air = false; this.loose = false; }

  *wait(sec, fn) {
    let t = 0;
    while (t < sec) { t += this.dt; if (fn) fn(t); yield; }
  }

  *tws(map, dur, e = ease.io) {
    const from = {};
    for (const k in map) from[k] = this[k];
    let t = 0;
    while (t < dur) {
      t += this.dt;
      const f = e(Math.min(1, t / dur));
      for (const k in map) this[k] = lerp(from[k], map[k], f);
      yield;
    }
    for (const k in map) this[k] = map[k];
  }

  *stand(dur = 0.22) {
    this.gx = null; this.gy = null;
    if (this.lie > 0.01 || this.sit > 0.01 || Math.abs(this.lean) > 0.5 || this.yo > 0.5 || this.tilt || this.crouch || this.stretch) {
      this.pose = 'stand';
      yield* this.tws({ lie: 0, sit: 0, lean: 0, yo: 0, tilt: 0, crouch: 0, stretch: 0 }, dur, ease.out);
    }
    this.set('idle', 'stand');
  }

  stepWalk(tx, run = false, back = false) {
    const { dt } = this;
    const dx = tx - this.x; const dist = Math.abs(dx); const dir = sign(dx);
    const sp = (run ? RUN : WALK) * this.spd * (this.inBlock ? 1.5 : 1) * (this.energy < 0.25 ? 0.85 : 1);
    if (dist > 3) this.face = back ? -dir : dir;
    const stop = (this.vx * this.vx) / (2 * ACC);
    const want = dist <= stop + 1 ? 0 : dir * sp;
    this.vx += clamp(want - this.vx, -ACC * dt, ACC * dt);
    const nx = this.x + this.vx * dt;
    if ((tx - this.x) * (tx - nx) <= 0 && Math.abs(this.vx) < 80) { this.x = tx; this.vx = 0; } else this.x = nx;
    if (!this.loose) {
      const b = this.bounds();
      if (this.x < b[0]) { this.x = b[0]; this.vx = Math.max(0, this.vx); }
      else if (this.x > b[1]) { this.x = b[1]; this.vx = Math.min(0, this.vx); }
    }
    this.cyc = clamp(0.52 - Math.abs(this.vx) * 0.0029, 0.2, 0.7);
    const f = 1 - Math.exp(-dt * 12);
    this.lean = lerp(this.lean, this.face * (back ? -1 : 1) * (run ? 6 : 2) * Math.min(1, Math.abs(this.vx) / (run ? RUN : WALK)), f);
    return Math.abs(tx - this.x);
  }

  *walkTo(tx, run = false, back = false) {
    const b = this.bounds();
    const target = clamp(tx, b[0], b[1]);
    this.set(run ? 'running' : 'walking', run ? 'run' : 'walk');
    let t = 0;
    for (;;) {
      const d = this.stepWalk(target, run, back);
      t += this.dt;
      if ((d < 1.5 && Math.abs(this.vx) < 6) || t > 14) break;
      yield;
    }
    this.vx = 0;
  }

  // Ballistic arc that lands exactly on the (live) target.
  *fly(getTarget, clear) {
    const x0 = this.x; const y0 = this.y;
    const t0 = getTarget();
    const peak = Math.min(y0, t0.y) - clear;
    const vy0 = -Math.sqrt(2 * G * Math.max(1, y0 - peak));
    const T = -vy0 / G + Math.sqrt((2 * Math.max(1, t0.y - peak)) / G);
    this.air = true; this.groundY = y0;
    let t = 0;
    while (t < T) {
      t += this.dt;
      const k = Math.min(1, t / T);
      const live = getTarget();
      this.x = lerp(x0, t0.x, k) + (live.x - t0.x) * k;
      this.y = y0 + vy0 * t + 0.5 * G * t * t + (live.y - t0.y) * k;
      const vy = vy0 + G * t;
      this.pose = vy > 60 ? 'fall' : 'jump';
      this.groundY = vy > 0 ? live.y : y0;
      if (k >= 1) break;
      yield;
    }
    const end = getTarget();
    this.x = end.x; this.y = end.y;
  }

  /* ------------------------------------------------------------ the decision */

  options() {
    const s = this.cur; const now = this.time;
    const list = [];
    const add = (name, w, cool = 0, args = []) => {
      if (w <= 0 || (cool && this.cd[name] > now - cool)) return;
      list.push({ name, w: w * (this.lastAction === name ? 0.2 : 1), args });
    };
    const span = this.spanAt(s, this.x);
    const room = span ? span[1] - span[0] : 0;
    const wide = s.x2 - s.x1;
    const night = this.progress() > 0.62;
    add('idle', 20);
    add('lookAround', 16 + this.boredom * 10);
    if (room > 60) add('wander', 30 + this.energy * 14);
    add('hop', 5, 10);
    add('stretchOut', 4 + (this.justWoke ? 24 : 0), 30);
    add('sitDown', 9 + (1 - this.energy) * 14, 10);
    if (room >= 80 && wide >= 100) add('nap', (this.energy < 0.35 ? 14 : 1.2) * (night ? 2 : 1), 70);
    if (this.jumpOptions().length) add('jumpAct', 12 + this.boredom * 14, 5);
    if (this.grabOptions().length) add('grabClimb', 6 + this.boredom * 6, 25);
    if (s.peek && this.x > s.x1 + 36 && this.x < s.x2 - 36) add('peekHide', 7, 30);
    if (this.inspectTarget(true)) add('inspect', 10, 20);
    if (s.kind === 'floor') add('visitHero', 14, 30);
    if (s.kind === 'title') add('bonk', 7, 25);
    if (this.boredom > 0.6) add('bored', 12, 20);
    add('rare', 1.1, 140);
    return list;
  }

  *decide() {
    this.canInterrupt = true;
    if (this.away) { yield* this.enter(); return; }
    const s = this.cur;
    if (!s) { yield* this.leave(true); return; }
    if (!s.free.length) { yield* this.wait(2.5); if (this.cur && !this.cur.free.length) yield* this.leave(true); return; }
    if (this.inBlock) { yield* this.walkTo(this.nearestFreeX(s, this.x), true); return; }
    const list = this.options();
    let total = 0;
    for (const o of list) total += o.w;
    if (!total) { yield* this.wait(1); return; }
    let r = Math.random() * total;
    let chosen = list[0];
    for (const o of list) { r -= o.w; if (r <= 0) { chosen = o; break; } }
    this.cd[chosen.name] = this.time;
    this.lastAction = chosen.name;
    yield* this[chosen.name](...chosen.args);
  }

  /* ----------------------------------------------------------------- actions */

  *idle() {
    yield* this.stand();
    this.set('idle', 'stand');
    this.justWoke = false;
    yield* this.wait(rand(1.1, 3.6), () => { if (Math.random() < this.dt * 0.4) this.tilt = pick([-4, 0, 0, 4]); });
    this.tilt = 0;
  }

  *lookAround() {
    yield* this.stand();
    this.set('looking', 'stand');
    const n = 2 + ((Math.random() * 3) | 0);
    for (let i = 0; i < n; i += 1) {
      const d = pick([-1, 1]);
      this.gx = d * 1.6; this.gy = pick([0, 0, -1]);
      if (Math.random() < 0.5) this.face = d;
      yield* this.wait(rand(0.5, 1.1));
    }
    this.gx = null; this.gy = null;
  }

  *wander() {
    yield* this.stand(0.15);
    const s = this.cur;
    let sp = this.spanAt(s, this.x) || this.nearestSpan(s, this.x);
    if (s.free.length > 1 && Math.random() < 0.25) sp = pick(s.free);
    const dist = rand(40, 320) * (sp[1] - sp[0] > 400 ? 1 : 0.6);
    let dir = Math.random() < 0.5 ? -1 : 1;
    if (this.x + dir * 40 > sp[1] || this.x + dir * 40 < sp[0]) dir = -dir;
    const target = clamp(this.x + dir * dist, sp[0], sp[1]);
    const run = Math.abs(target - this.x) > 140 && Math.random() < 0.28 + this.energy * 0.12;
    yield* this.walkTo(target, run);
    yield* this.tws({ lean: 0 }, 0.15);
    this.set('idle', 'stand');
    yield* this.wait(rand(0.3, 1.2));
  }

  *hop(h = rand(12, 20)) {
    yield* this.stand(0.15);
    this.set('jumping', 'crouch');
    yield* this.tws({ crouch: 0.8 }, 0.09);
    this.crouch = 0;
    this.canInterrupt = false;
    const { x, y } = this;
    yield* this.fly(() => ({ x, y: this.cur ? this.cur.y + this.yo : y }), h * this.k);
    if (this.cur) this.landOn(this.cur); else this.hide();
  }

  *stretchOut() {
    yield* this.stand();
    this.set('idle', 'stretch');
    yield* this.tws({ stretch: 1 }, 0.5, ease.out);
    this.say('dots', 1.4);
    yield* this.wait(rand(0.8, 1.4));
    yield* this.tws({ stretch: 0 }, 0.3);
  }

  *sitDown() {
    yield* this.stand();
    const s = this.cur;
    this.set('sitting', 'sit');
    const dangle = s.kind === 'ledge' && s.pad >= 13;
    if (dangle) { this.pose = 'dangle'; yield* this.tws({ yo: 8 * this.u }, 0.3, ease.out); }
    else yield* this.tws({ sit: 1 }, 0.3, ease.out);
    const hold = rand(3, 8);
    yield* this.wait(hold, () => {
      if (Math.random() < this.dt * 0.5) { this.gx = pick([-1.5, 0, 1.5]); this.gy = pick([0, 0, -1]); }
      if (Math.random() < this.dt * 0.15) this.tilt = pick([-4, 0, 4]);
    });
    this.gx = null; this.gy = null; this.tilt = 0;
    yield* this.stand(0.3);
  }

  *nap() {
    const s = this.cur;
    yield* this.stand();
    const sp = this.spanAt(s, this.x);
    if (!sp) return;
    const lo = sp[0] + 20; const hi = sp[1] - 20;
    if (hi < lo) return;
    const target = clamp(this.x, lo, hi);
    if (Math.abs(target - this.x) > 3) yield* this.walkTo(target);
    this.set('sleeping', 'sit');
    yield* this.tws({ sit: 1 }, 0.35, ease.out);
    this.pose = 'lie';
    yield* this.tws({ lie: 1 }, 0.6, ease.io);
    const dur = rand(7, 15);
    let z = 0;
    yield* this.wait(dur, (t) => { if (t > z) { this.say('z', 1.8); z = t + 2.2; } });
    this.emoteName = '';
    this.set('idle', 'stand');
    yield* this.tws({ lie: 0 }, 0.6, ease.io);
    yield* this.tws({ sit: 0 }, 0.3, ease.out);
    this.justWoke = true;
    this.energy = Math.max(this.energy, 0.7);
  }

  *bored() {
    yield* this.stand();
    this.set('looking', 'tap');
    this.say('dots', 1.6);
    for (let i = 0; i < 3; i += 1) { this.gx = pick([-1.5, 1.5]); this.gy = pick([0, -1]); yield* this.wait(rand(0.7, 1.2)); }
    this.gx = null; this.gy = null;
    this.boredom = 0.1;
  }

  jumpOptions() {
    const s = this.cur; const out = [];
    if (!s || this.away) return out;
    for (const t of this.surfaces) {
      if (t.key === s.key) continue;
      for (const [a, b] of t.free) {
        let lx = clamp(this.x, a, b);
        const rise = this.y - t.y;
        // Jumping up onto something overhead: land a little to one side instead of straight through it.
        if (rise >= 0 && Math.abs(lx - this.x) < 24) {
          const side = Math.random() < 0.5 ? -1 : 1;
          const alt = clamp(this.x + side * rand(60, 120) * this.k, a, b);
          lx = Math.abs(alt - this.x) >= 24 ? alt : clamp(this.x - side * rand(60, 120) * this.k, a, b);
        }
        const dx = Math.abs(lx - this.x);
        if (dx > this.maxDX || rise > this.maxRise || rise < -this.maxDrop) continue;
        if (rise >= 0 && dx < 24) continue;
        if (!this.visibleY(t.y)) continue;
        out.push({ s: t, x: lx, rise });
      }
    }
    return out;
  }

  hangSpot(t, side) {
    const reach = 10.5 * this.u - 3;
    return side === 'l'
      ? { x: t.x1 - reach, y: t.y + 43 * this.u, face: 1, end: t.x1 }
      : { x: t.x2 + reach, y: t.y + 43 * this.u, face: -1, end: t.x2 };
  }

  grabOptions() {
    const s = this.cur; const out = [];
    if (!s || this.away || s.kind === 'floor') return out;
    const prot = this.protCache;
    for (const t of this.surfaces) {
      if (t.key === s.key || t.kind === 'floor' || t.x2 - t.x1 < 40) continue;
      for (const side of ['l', 'r']) {
        const sp = this.hangSpot(t, side);
        const rise = this.y - sp.y;
        if (rise < -40 || rise > this.maxRise + 24 || Math.abs(sp.x - this.x) > this.maxDX) continue;
        if (sp.x < scrollX + 8 || sp.x > scrollX + innerWidth - 8) continue;
        if (!this.visibleY(t.y + 20) || !this.sideFree(t, sp, prot)) continue;
        out.push({ s: t, side });
      }
    }
    return out;
  }

  sideFree(t, sp, prot) {
    if (!prot) {
      prot = [];
      document.querySelectorAll(PROTECT).forEach((el) => {
        const r = el.getBoundingClientRect();
        prot.push({ el, l: r.left + scrollX, r: r.right + scrollX, t: r.top + scrollY, b: r.bottom + scrollY });
      });
      this.protCache = prot;
      setTimeout(() => { this.protCache = null; }, 600);
    }
    const l = sp.x - this.hw; const r = sp.x + this.hw; const top = t.y + 3; const bot = t.y + 44 * this.u;
    return !prot.some((q) => q.el !== t.el && !q.el.contains(t.el) && q.r > l && q.l < r && q.b > top && q.t < bot && q.r - q.l > 2);
  }

  *jumpAct() {
    const opts = this.jumpOptions();
    if (!opts.length) return;
    const o = pick(opts);
    yield* this.stand(0.15);
    this.face = sign(o.x - this.x);
    this.set('jumping', 'crouch');
    yield* this.tws({ crouch: 0.8 }, 0.11);
    this.crouch = 0; this.canInterrupt = false;
    this.puff(1);
    this.set('jumping', 'jump');
    const clear = (o.rise > 0 ? 20 : 12 + Math.abs(o.x - this.x) * 0.06) * this.k;
    yield* this.fly(() => { const t = this.byEl.get(o.s.key) || o.s; return { x: o.x, y: t.y }; }, clear);
    this.landOn(o.s);
    this.boredom = Math.max(0, this.boredom - 0.3);
    if (Math.random() < 0.3) this.say('spark', 0.9);
  }

  *grabClimb() {
    const opts = this.grabOptions();
    if (!opts.length) return;
    const o = pick(opts);
    yield* this.stand(0.15);
    const live = () => this.hangSpot(this.byEl.get(o.s.key) || o.s, o.side);
    this.face = sign(live().x - this.x);
    this.set('jumping', 'crouch');
    yield* this.tws({ crouch: 0.9 }, 0.12);
    this.crouch = 0; this.canInterrupt = false;
    this.puff(1);
    this.set('jumping', 'jump');
    yield* this.fly(() => { const h = live(); return { x: h.x, y: h.y }; }, 14 * this.k);
    const t = this.byEl.get(o.s.key) || o.s;
    const spot = this.hangSpot(t, o.side);
    this.cur = t; this.air = false; this.loose = true; this.vx = 0;
    this.face = spot.face; this.yo = 43 * this.u; this.y = t.y + this.yo; this.lean = 0;
    this.set('hanging', 'hang');
    this.say('alert', 0.7);
    let tt = 0; const hold = rand(0.9, 2);
    while (tt < hold) { tt += this.dt; this.lean = Math.sin(tt * 5) * 3; yield; }
    this.lean = 0;
    this.set('climbing', 'climb');
    const hy = this.yo; const x0 = this.x;
    const dest = this.nearestFreeX(t, spot.end + (o.side === 'l' ? 18 : -18));
    const dur = 1.15; tt = 0;
    while (tt < dur) {
      tt += this.dt;
      const k = Math.min(1, tt / dur);
      this.yo = hy * (1 - ease.io(k)) + Math.sin(k * 20) * 1.2 * (1 - k);
      this.x = lerp(x0, dest, ease.io(clamp((k - 0.55) / 0.45, 0, 1)));
      yield;
    }
    this.yo = 0;
    this.landOn(t);
    this.say('spark', 0.9);
    this.boredom = 0;
  }

  *peekHide() {
    const s = this.cur;
    yield* this.stand();
    const a = s.x1 + 36; const b = s.x2 - 36;
    if (b < a) return;
    const tx = clamp(this.x, a, b);
    if (Math.abs(tx - this.x) > 3) yield* this.walkTo(tx);
    this.set('peeking', 'stand');
    this.canInterrupt = false;
    this.clipOn = true; this.clipY = this.cur.y;
    yield* this.tws({ crouch: 0.6 }, 0.12);
    yield* this.tws({ yo: this.H + 10, crouch: 0 }, 0.38, ease.in);
    const rounds = 1 + ((Math.random() * 3) | 0);
    for (let i = 0; i < rounds; i += 1) {
      yield* this.wait(rand(0.5, 1.4));
      if (Math.random() < 0.6) {
        const nx = rand(a, b); let tt = 0;
        while (Math.abs(nx - this.x) > 2 && tt < 4) { tt += this.dt; this.x += sign(nx - this.x) * Math.min(Math.abs(nx - this.x), 120 * this.dt); yield; }
      }
      this.gx = pick([-1.6, 1.6]); this.gy = 0;
      yield* this.tws({ yo: this.H * 0.58 }, 0.34, ease.out);
      this.pose = 'stand';
      yield* this.wait(rand(0.5, 0.9));
      this.gx = -this.gx;
      if (Math.random() < 0.5) this.say('q', 0.9);
      yield* this.wait(rand(0.5, 1));
      if (i < rounds - 1) yield* this.tws({ yo: this.H + 10 }, 0.25, ease.in);
    }
    this.gx = null; this.gy = null;
    yield* this.tws({ yo: 0 }, 0.4, ease.out);
    this.clipOn = false;
    this.canInterrupt = true;
    this.sq = 0.8;
    this.boredom = 0;
  }

  inspectTarget(probe = false) {
    if (this.away || !this.cur) return null;
    const hits = [];
    document.querySelectorAll(INSPECT).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 20 || r.bottom < this.hudH() || r.top > innerHeight) return;
      const cx = r.left + scrollX + r.width / 2; const cy = r.top + scrollY + r.height / 2;
      const dx = Math.abs(cx - this.x); const dy = Math.abs(cy - this.y);
      if (dx < 420 && dy < 260 && dx > 40 && el !== this.cur.el) hits.push({ cx, cy, d: dx + dy });
    });
    if (!hits.length) return null;
    if (probe) return hits[0];
    hits.sort((p, q) => p.d - q.d);
    return pick(hits.slice(0, 3));
  }

  *inspect() {
    const t = this.inspectTarget();
    if (!t) return;
    yield* this.stand();
    const s = this.cur;
    const goal = this.nearestFreeX(s, t.cx - sign(t.cx - this.x) * 70);
    if (Math.abs(goal - this.x) > 6) yield* this.walkTo(goal, Math.abs(goal - this.x) > 220);
    this.set('playing', 'stand');
    this.face = sign(t.cx - this.x);
    this.gx = clamp((t.cx - this.x) / 70, -1.6, 1.6);
    this.gy = clamp((t.cy - (this.y - this.H * 0.8)) / 90, -1, 1);
    this.say('q', 1.5);
    yield* this.tws({ lean: this.face * 5, tilt: this.face * 4 }, 0.3, ease.out);
    yield* this.wait(rand(1.4, 2.6));
    if (Math.random() < 0.45) { this.say('alert', 0.8); yield* this.tws({ lean: 0 }, 0.12); yield* this.hop(14); }
    this.boredom = Math.max(0, this.boredom - 0.35);
    yield* this.stand(0.25);
  }

  *visitHero() {
    const big = document.querySelector('.hc__btn');
    const lamp = document.querySelector('.lamp');
    const lr = lamp?.getBoundingClientRect();
    const lampOk = lr && lr.width > 0 && lr.height > 0;
    const br = big?.getBoundingClientRect();
    const bigOk = br && br.width > 0;
    const choice = lampOk && bigOk ? pick(['big', 'lamp', 'big']) : bigOk ? 'big' : lampOk ? 'lamp' : null;
    if (!choice) { yield* this.wait(0.6); return; }
    yield* this.stand();
    const s = this.cur;
    if (choice === 'lamp') {
      const px = lr.right + scrollX + 16;
      yield* this.walkTo(this.nearestFreeX(s, px), Math.abs(px - this.x) > 300);
      this.set('playing', 'pull');
      this.face = -1;
      this.gx = -1.6; this.gy = 0;
      for (let i = 0; i < 3; i += 1) {
        yield* this.tws({ lean: -this.face * 9 }, 0.35, ease.io);
        this.puff(1);
        yield* this.tws({ lean: -this.face * 2 }, 0.3, ease.io);
      }
      this.say('dots', 1.4);
      yield* this.tws({ lean: 0, tilt: 5 }, 0.3);
      yield* this.wait(0.9);
    } else {
      const left = this.x < br.left + scrollX + br.width / 2;
      const px = left ? br.left + scrollX + 24 : br.right + scrollX - 24;
      yield* this.walkTo(this.nearestFreeX(s, px), Math.abs(px - this.x) > 300);
      this.face = left ? 1 : -1;
      this.set('playing', 'wave');
      this.gx = this.face * 1.2; this.gy = -1;
      this.say('alert', 0.8);
      yield* this.wait(1.5);
      if (Math.random() < 0.5) {
        this.set('sitting', 'sit');
        yield* this.tws({ sit: 1, lean: this.face * 3 }, 0.3);
        this.say('note', 1.6);
        yield* this.wait(rand(2, 4));
      } else {
        this.set('playing', 'push');
        yield* this.tws({ lean: this.face * 7 }, 0.25);
        yield* this.wait(rand(1.4, 2.2));
      }
    }
    this.boredom = 0;
    yield* this.stand(0.3);
  }

  *bonk() {
    const s = this.cur;
    const chars = [...s.el.querySelectorAll('.ch')].map((c) => { const r = c.getBoundingClientRect(); return r.left + scrollX + r.width / 2; })
      .filter((cx) => this.spanAt(s, cx));
    if (!chars.length) return;
    yield* this.stand(0.15);
    yield* this.walkTo(pick(chars));
    yield* this.hop(18);
    this.say('spark', 0.9);
    yield* this.wait(0.4);
    yield* this.hop(14);
    this.boredom = Math.max(0, this.boredom - 0.2);
  }

  *celebrate(big = false) {
    yield* this.stand(0.15);
    this.set('playing', 'cheer');
    this.say('spark', 1.6);
    for (let i = 0; i < (big ? 3 : 2); i += 1) { yield* this.hop(16); yield* this.wait(0.12); this.set('playing', 'cheer'); }
    yield* this.wait(0.5);
  }

  *notice() {
    yield* this.stand(0.15);
    this.set('looking', 'stand');
    this.say('alert', 0.9);
    this.gx = pick([-1, 1]) * 1.4; this.gy = -1;
    yield* this.tws({ crouch: 0.3 }, 0.08);
    this.crouch = 0;
    yield* this.hop(10);
    yield* this.wait(0.5);
    this.gx = null; this.gy = null;
  }

  *startle(away = 1) {
    yield* this.stand(0.1);
    this.say('alert', 0.9);
    this.sq = 1;
    this.face = -away;
    yield* this.hop(12);
    const sp = this.nearestSpan(this.cur, this.x) || [this.x, this.x];
    const target = clamp(this.x + away * rand(60, 140), sp[0], sp[1]);
    if (Math.abs(target - this.x) > 8) yield* this.walkTo(target, true);
    yield* this.tws({ lean: 0 }, 0.15);
    this.set('looking', 'stand');
    this.face = -away; this.gx = -away * 1.6; this.gy = 0;
    yield* this.wait(rand(0.8, 1.4));
    this.gx = null;
  }

  *glance() {
    yield* this.stand(0.15);
    this.set('looking', 'stand');
    const end = this.time + rand(1.2, 2.2);
    while (this.time < end) {
      const dx = this.mp.x + scrollX - this.x;
      this.face = sign(dx);
      this.tilt = this.face * 4;
      yield;
    }
    this.tilt = 0;
  }

  *follow() {
    yield* this.stand(0.15);
    this.say('alert', 0.7);
    const end = this.time + rand(2.4, 4.6);
    while (this.time < end && this.near < 520) {
      const target = this.nearestFreeX(this.cur, this.mp.x + scrollX);
      const far = Math.abs(target - this.x);
      if (far > 28) {
        this.set(far > 200 ? 'running' : 'walking', far > 200 ? 'run' : 'walk');
        this.stepWalk(target, far > 200);
      } else {
        this.stepWalk(this.x);
        this.set('looking', 'stand');
        this.face = sign(this.mp.x + scrollX - this.x);
      }
      yield;
    }
    // Loses interest, shrugs, and wanders off the other way.
    this.vx = 0;
    yield* this.tws({ lean: 0, tilt: pick([-5, 5]) }, 0.2);
    this.set('looking', 'stand');
    this.say('dots', 1.1);
    yield* this.wait(0.9);
    this.tilt = 0;
    const sp = this.nearestSpan(this.cur, this.x);
    if (sp) yield* this.walkTo(clamp(this.x - sign(this.mp.x + scrollX - this.x) * rand(60, 160), sp[0], sp[1]));
  }

  *brace() {
    yield* this.stand(0.1);
    this.set('looking', 'brace');
    this.say('alert', 0.8);
    yield* this.tws({ crouch: 0.6 }, 0.1);
    let t = 0;
    while (Math.abs(this.scrollV) > 500 && t < 2.2) { t += this.dt; yield; }
    yield* this.tws({ crouch: 0 }, 0.2);
  }

  *rare() {
    const pickOne = pick(['moonwalk', 'spin', 'crtBlip']);
    yield* this[pickOne]();
  }

  *moonwalk() {
    yield* this.stand();
    const sp = this.spanAt(this.cur, this.x);
    if (!sp) return;
    const dir = this.x - sp[0] > sp[1] - this.x ? -1 : 1;
    const target = clamp(this.x + dir * rand(120, 220), sp[0], sp[1]);
    this.say('note', 2);
    yield* this.walkTo(target, false, true);
    this.say('spark', 0.8);
    yield* this.wait(0.5);
  }

  *spin() {
    yield* this.stand();
    this.canInterrupt = false;
    yield* this.tws({ crouch: 0.7 }, 0.1);
    this.crouch = 0;
    const { x, y } = this;
    this.set('jumping', 'jump');
    let acc = 0;
    const arc = this.fly(() => ({ x, y: this.cur ? this.cur.y + this.yo : y }), 26 * this.k);
    for (;;) {
      acc += this.dt;
      if (acc > 0.07) { acc = 0; this.face = -this.face; }
      if (arc.next().done) break;
      yield;
    }
    if (!this.cur) { this.hide(); return; }
    this.landOn(this.cur);
    this.say('spark', 1);
  }

  *crtBlip() {
    yield* this.stand();
    this.glitch = 0.45;
    this.say('q', 0.9);
    yield* this.wait(0.7);
  }

  /* -------------------------------------------------------- coming and going */

  *leave(visibleExit) {
    this.set('leaving', 'stand');
    this.canInterrupt = false;
    if (visibleExit && !this.calm && !this.away) {
      this.glitch = 0.5;
      yield* this.wait(0.35);
    }
    this.hide();
    this.cd.enter = this.time;
  }

  *enter() {
    this.set('away', 'stand');
    yield* this.wait(this.first ? rand(0.9, 1.5) : rand(0.8, 2.4));
    this.scan();
    const vis = this.surfaces.filter((s) => s.free.length && this.visibleY(s.y));
    if (!vis.length) { yield* this.wait(1.2); return; }
    const floor = vis.find((s) => s.kind === 'floor');
    const s = this.first && floor ? floor : pick(vis);
    this.first = false;
    const sp = pick(s.free);
    const x = sp[1] > sp[0] ? rand(sp[0], sp[1]) : sp[0];
    const top = scrollY + this.hudH();
    const modes = [];
    if (s.kind === 'floor') modes.push('walk', 'walk', 'drop');
    else modes.push(s.y - top < 380 ? 'drop' : 'blip', 'drop');
    if (s.y - top >= 380) modes.splice(modes.indexOf('drop'), 1);
    if (s.peek && s.x2 - s.x1 > 90) modes.push('pop');
    const mode = pick(modes);

    this.vx = 0; this.lean = 0; this.lie = 0; this.sit = 0; this.crouch = 0; this.stretch = 0; this.tilt = 0; this.yo = 0;
    this.canInterrupt = false;
    if (mode === 'walk') {
      // Walks in from just outside the screen edge along the hero floor.
      const fromLeft = Math.random() < 0.5;
      this.cur = s; this.air = false; this.loose = true;
      this.x = fromLeft ? scrollX - this.hw - 12 : scrollX + innerWidth + this.hw + 12;
      this.y = s.y; this.face = fromLeft ? 1 : -1;
      this.away = false;
      this.set('walking', 'walk');
      let t = 0;
      for (;;) {
        const d = this.stepWalk(x, false);
        t += this.dt;
        if ((d < 1.5 && Math.abs(this.vx) < 6) || t > 16) break;
        yield;
      }
      this.vx = 0;
    } else if (mode === 'drop') {
      // Falls out from under the nav bar.
      this.cur = s; this.away = false; this.loose = true;
      this.x = x; this.y = top - 4; this.face = pick([-1, 1]);
      this.set('jumping', 'fall');
      yield* this.fly(() => ({ x, y: (this.byEl.get(s.key) || s).y }), 0);
    } else if (mode === 'blip') {
      // Too far below to fall from the nav: boots up in place with a short CRT flicker (echoes the intro).
      this.cur = s; this.air = false; this.away = false;
      this.x = x; this.y = s.y; this.face = pick([-1, 1]);
      this.glitch = 0.5;
      this.set('idle', 'stand');
      yield* this.wait(0.55);
    } else {
      // Rises from behind an opaque block.
      this.cur = s; this.away = false; this.air = false;
      this.x = x; this.face = pick([-1, 1]);
      this.yo = this.H + 10; this.clipOn = true; this.clipY = s.y; this.y = s.y + this.yo;
      this.set('peeking', 'stand');
      yield* this.wait(0.3);
      this.gx = pick([-1.6, 1.6]);
      yield* this.tws({ yo: this.H * 0.58 }, 0.35, ease.out);
      yield* this.wait(0.8);
      this.say('q', 0.9);
      yield* this.wait(0.7);
      this.gx = null;
      yield* this.tws({ yo: 0 }, 0.4, ease.out);
      this.clipOn = false;
    }
    this.landOn(this.byEl.get(s.key) || s);
    this.say('alert', 0.7);
  }

  /* -------------------------------------------------------- reduced motion */

  placeCalm() {
    if (!this.running) return;
    this.scan();
    const id = sectionStore.get();
    const title = this.surfaces.find((s) => s.kind === 'title' && s.el.closest('section')?.id === id);
    const floor = this.surfaces.find((s) => s.kind === 'floor');
    const s = (id === 'top' ? floor : title) || title || floor;
    if (!s) { this.hide(); this.render(); return; }
    const sp = s.free[0];
    this.cur = s; this.x = sp[0] + Math.min(40, (sp[1] - sp[0]) / 2); this.y = s.y;
    this.air = false; this.away = false; this.face = 1; this.yo = 0; this.sit = 1; this.crouch = 0;
    this.set('sitting', 'sit');
    this.render();
  }

  onSection() {
    if (this.calm) { this.placeCalm(); return; }
    if (this.away || !this.running || this.state === 'sleeping') return;
    const id = sectionStore.get();
    if (id === 'contact' && this.ready('celebrate', 50)) this.want('celebrate', true);
    else if (Math.random() < 0.35 && this.ready('notice', 10)) this.want('notice');
  }

  /* ------------------------------------------------------------------ render */

  render() {
    const el = this.el; const R = this.rendered;
    if (this.away) {
      if (R.vis !== 'hidden') { el.style.visibility = 'hidden'; R.vis = 'hidden'; }
      return;
    }
    const u = this.u;
    const px = Math.round(this.x - this.cx);
    const py = Math.round(this.y - this.feet);
    const t = `translate3d(${px}px,${py}px,0)`;
    if (R.t !== t) { el.style.transform = t; R.t = t; }

    const face = this.face;
    const s = Math.max(this.sq, this.crouch);
    const sx = (1 + 0.12 * s - 0.05 * this.stretch) * face;
    const sy = 1 - 0.16 * s + 0.1 * this.stretch;
    const tx = -20 * u * this.lie * face;
    const ty = -12 * u * this.lie + 4.8 * u * this.sit;
    const rot = this.lean + this.lie * 90 * face;
    const f = `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
    if (R.f !== f) { this.flipEl.style.transform = f; R.f = f; }

    // Clip: the companion "goes behind" an opaque block by hiding everything below its top edge.
    let hidden = false; let clip = '';
    if (this.clipOn) {
      const boxBottom = this.y - this.feet + 50 * u;
      const cut = boxBottom - this.clipY;
      if (cut >= 50 * u) hidden = true;
      else if (cut > 0) clip = `inset(-60px -60px ${cut.toFixed(1)}px -60px)`;
    }
    if (R.clip !== clip) { el.style.clipPath = clip; R.clip = clip; }
    const vis = hidden ? 'hidden' : 'visible';
    if (R.vis !== vis) { el.style.visibility = vis; R.vis = vis; }

    const air = Math.max(0, this.groundY - this.y);
    const sh = `translateY(${Math.round(air)}px) scale(${clamp(1 - air / 160, 0.4, 1).toFixed(2)},1)`;
    if (this.air || R.sh !== sh) { this.shadow.style.transform = sh; R.sh = sh; this.shadow.style.opacity = this.air ? clamp(0.7 - air / 200, 0.2, 0.7) : ''; }

    const lx = Math.round(this.ex * face); const ly = Math.round(this.ey);
    const eyes = `translate(${lx}px,${ly}px)`;
    if (R.eyes !== eyes) { this.eyesEl.style.transform = eyes; R.eyes = eyes; }
    const head = `translate(${lx > 0.5 ? 1 : lx < -0.5 ? -1 : 0} 0) rotate(${(this.tilt * face).toFixed(0)} 12 13)`;
    if (R.head !== head) { this.headEl.setAttribute('transform', head); R.head = head; }

    if (R.state !== this.state) { el.dataset.state = this.state; R.state = this.state; }
    if (R.pose !== this.pose) { el.dataset.pose = this.pose; R.pose = this.pose; }
    const cyc = this.cyc.toFixed(2);
    if (R.cyc !== cyc) { el.style.setProperty('--cyc', cyc + 's'); R.cyc = cyc; }
    const gl = this.glitch > 0 ? '1' : '0';
    if (R.gl !== gl) { if (gl === '1') el.dataset.glitch = '1'; else delete el.dataset.glitch; R.gl = gl; }

    if (R.emote !== this.emoteName) {
      const e = this.emoteEl;
      if (this.emoteName) {
        e.dataset.e = this.emoteName;
        e.style.animation = 'none'; void e.offsetWidth; e.style.animation = '';
      } else delete e.dataset.e;
      R.emote = this.emoteName;
    }
    const em = this.lie > 0.5 ? `translate(${(face * 34 * u).toFixed(0)}px,${(8 * u).toFixed(0)}px)` : '';
    if (R.em !== em) { this.emoteEl.style.translate = em; R.em = em; }
  }
}
