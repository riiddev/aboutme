import { memo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sprite } from './PixelArt.jsx';
import { prefersReduced, sectionStore, unit, PLATFORMS } from './lib.js';

gsap.registerPlugin(ScrollTrigger);

const rand = (min, max) => min + Math.random() * (max - min);
const clamp = (min, max, value) => Math.min(max, Math.max(min, value));

/*
 * Surfaces the companion can stand on. y is the feet position in viewport pixels when the
 * mid layer has not risen yet; `mid` says whether the surface rides with that layer (1) or
 * is fixed to the screen (0, the grass lane in front of the terrace wall).
 */
export function buildSurfaces(width, height) {
  const u = Math.max(2, width * 0.002);
  const terrace = height - 14 * u;
  const list = [
    { id: 'terrace', x0: 28, x1: width - 28, y: terrace, mid: 1, s: 1 },
    { id: 'grass', x0: 28, x1: width - 28, y: height - 3 * u, mid: 0, s: 1.3 },
  ];
  PLATFORMS.forEach((platform) => {
    const cx = width / 2 + (platform.x - 250) * u;
    const x0 = Math.max(28, cx - (platform.w * u) / 2 + u);
    const x1 = Math.min(width - 28, cx + (platform.w * u) / 2 - u);
    if (x1 - x0 < 14 * u) return;
    list.push({
      id: platform.id, x0, x1, cx, y: terrace - platform.top * u, mid: 1, s: 1,
      top: platform.top, ladderX: platform.ladder ? x0 + 1.5 * u : null,
    });
  });
  return list;
}

// Weighted behaviour choice. Pure, so it can be tested without a DOM.
export function pickBehavior({ surf, section, last, canPerch, roll = Math.random() }) {
  const ground = surf === 'terrace' || surf === 'grass';
  const w = {
    look: 3,
    walk: ground ? 4 : 0.6,
    run: ground ? 1.4 : 0,
    hop: 2,
    stunt: ground ? 0.8 : 0.5,
    perch: ground && surf === 'terrace' && canPerch ? 2 : 0,
    peek: ground ? 1.1 : 0,
    lane: ground ? 0.7 : 0,
    descend: ground ? 0 : 3.5,
  };
  if (section === 'about') w.look *= 1.3;
  if (section === 'projects') w.walk *= 1.3;
  if (section === 'skills') w.perch *= 2.5;
  if (section === 'activity') { w.run *= 2; w.stunt *= 2; }
  if (section === 'contact') w.peek *= 2;
  if (w[last] !== undefined) w[last] *= 0.25;
  const entries = Object.entries(w).filter(([, weight]) => weight > 0);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = roll * total;
  for (const [name, weight] of entries) {
    cursor -= weight;
    if (cursor <= 0) return name;
  }
  return entries[entries.length - 1][0];
}

export function runCompanion({ rig, body, eyes, fx }) {
  if (!rig || !body || !eyes) return () => {};

  const reduced = prefersReduced();
  const world = rig.closest('.world');
  const midLayer = world?.querySelector('.wl--mid');
  const midInner = world?.querySelector('.wl--mid .wl__in');
  const sparks = [...fx.children];

  let u = 2;
  let W = 0;
  let H = 0;
  let byId = {};
  const S = { x: 0, fy: 0, wMid: 1, scale: 1, surf: 'terrace' };
  const P = { x: 0, surf: 'terrace' }; // where the plan being built will have him by that point
  let alive = true;
  let shown = false;
  let current = null;
  let rest = null;
  let lastName = '';
  let reactUntil = 0;
  let hoverUntil = 0;
  let scrollUntil = 0;
  let startleUntil = 0;
  let hoverEl = null;

  const setX = gsap.quickSetter(rig, 'x', 'px');
  const setY = gsap.quickSetter(rig, 'y', 'px');
  const setScale = gsap.quickSetter(rig, 'scale');
  const eyeX = gsap.quickTo(eyes, 'x', { duration: 0.12, ease: 'none' });
  const eyeY = gsap.quickTo(eyes, 'y', { duration: 0.12, ease: 'none' });
  const lookDir = (a, b) => { eyeX(Math.round(a * 1.4)); eyeY(Math.round(b)); };
  const face = (dx) => { if (dx) rig.classList.toggle('is-left', dx < 0); };

  const place = () => {
    const surf = byId[S.surf] || byId.terrace;
    S.surf = surf.id;
    S.x = clamp(surf.x0, surf.x1, S.x || W * 0.7);
    S.fy = surf.y;
    S.wMid = surf.mid;
    S.scale = surf.s;
    rig.style.zIndex = surf.id === 'grass' ? 3 : 1;
    rig.classList.toggle('is-near', surf.id === 'grass');
  };

  const measure = () => {
    u = unit();
    W = window.innerWidth;
    H = window.innerHeight;
    byId = Object.fromEntries(buildSurfaces(W, H).map((surface) => [surface.id, surface]));
    place();
  };

  // Rides the rising mid layer; reads only cached GSAP values, so it is cheap per tick.
  const follow = () => {
    const shift = Number(gsap.getProperty(midLayer, 'y')) || 0;
    const sway = Number(gsap.getProperty(midInner, 'x')) || 0;
    setX(S.x - 12 * u + S.wMid * sway);
    setY(S.fy + S.wMid * shift - H);
    setScale(S.scale);
  };

  const reset = () => {
    if (rest) { rest.kill(); rest = null; }
    if (current) { current.kill(); current = null; }
    gsap.killTweensOf([S, body]);
    gsap.set(body, { y: 0, scaleX: 1, scaleY: 1, rotation: 0 });
    rig.classList.remove('is-walking', 'is-running', 'is-climbing', 'is-sitting');
    place();
    lookDir(0, 0);
  };

  const settle = () => {
    rig.classList.remove('is-walking', 'is-running', 'is-climbing', 'is-sitting');
    rest = gsap.delayedCall(rand(0.4, 2.2), next); // eslint-disable-line no-use-before-define
  };

  const start = (name, build, fresh = true) => {
    if (!alive || !shown) return;
    if (fresh) reset();
    lastName = name;
    P.x = S.x;
    P.surf = S.surf;
    const timeline = gsap.timeline({
      onComplete: () => {
        if (current === timeline) { current = null; settle(); }
      },
    });
    current = timeline;
    build(timeline);
  };

  // ---- Movement building blocks. They append to a timeline and track P (the planned position). ----
  const walkTo = (t, x, speed, cls = 'is-walking') => {
    const surf = byId[P.surf];
    const target = clamp(surf.x0, surf.x1, x);
    const dist = Math.abs(target - P.x);
    if (dist < 4) return;
    const dx = target - P.x;
    P.x = target;
    t.add(() => { face(dx); rig.classList.add(cls); })
      .to(S, { x: target, duration: dist / speed, ease: 'none' })
      .add(() => rig.classList.remove(cls));
  };

  const hopTo = (t, dest, x, { apex = 30, flip = false } = {}) => {
    const target = clamp(dest.x0, dest.x1, x);
    const dx = target - P.x;
    const dir = Math.sign(dx) || 1;
    const dur = clamp(0.42, 0.9, 0.36 + Math.abs(dx) / 900 + Math.abs(dest.y - byId[P.surf].y) / 900);
    P.x = target;
    P.surf = dest.id;
    const jump = gsap.timeline();
    jump.add(() => {
      face(dx);
      S.surf = dest.id;
      if (dest.id === 'grass') rig.style.zIndex = 3;
      rig.classList.toggle('is-near', dest.id === 'grass');
    }, 0)
      .to(S, { x: target, duration: dur, ease: 'none' }, 0)
      .to(S, { fy: dest.y, wMid: dest.mid, scale: dest.s, duration: dur, ease: 'power1.inOut' }, 0)
      .to(body, { y: -apex, duration: dur / 2, ease: 'power2.out' }, 0)
      .to(body, { y: 0, duration: dur / 2, ease: 'power2.in' }, dur / 2)
      .add(() => { if (dest.id !== 'grass') rig.style.zIndex = 1; }, dur / 2)
      .to(body, { scaleY: 0.84, scaleX: 1.1, duration: 0.07, ease: 'steps(2)' }, dur)
      .to(body, { scaleY: 1, scaleX: 1, duration: 0.16, ease: 'power2.out' }, dur + 0.07);
    if (flip) {
      jump.to(body, { rotation: dir * 360, duration: dur, ease: 'power1.inOut' }, 0)
        .set(body, { rotation: 0 }, dur);
    }
    t.add(jump);
  };

  const wait = (t, seconds) => t.to({}, { duration: seconds });

  const glances = (t, count) => {
    for (let i = 0; i < count; i += 1) {
      t.add(() => { lookDir(rand(-1, 1), rand(-0.7, 0.7)); if (Math.random() < 0.3) face(rand(-1, 1)); });
      wait(t, rand(0.6, 1.2));
    }
    t.add(() => lookDir(0, 0));
  };

  const sit = (t) => {
    t.add(() => { face(rand(-1, 1)); rig.classList.add('is-sitting'); })
      .to(body, { scaleY: 0.93, duration: 0.2, ease: 'steps(2)' });
    const beats = Math.round(rand(3, 6));
    for (let i = 0; i < beats; i += 1) {
      t.add(() => lookDir(rand(-1, 1), rand(-0.6, 0.6)))
        .to(body, { rotation: i % 2 ? 2.5 : -2.5, duration: 0.15, ease: 'steps(1)' });
      wait(t, rand(0.5, 0.9));
    }
    t.to(body, { scaleY: 1, rotation: 0, duration: 0.1 })
      .add(() => { rig.classList.remove('is-sitting'); lookDir(0, 0); });
  };

  const climbUp = (t, dest) => {
    walkTo(t, dest.ladderX, 70);
    const rise = byId.terrace.y - dest.y;
    t.add(() => { face(1); rig.classList.add('is-climbing'); })
      .to(S, { fy: dest.y, duration: rise / (22 * u), ease: 'steps(' + Math.max(4, Math.round(rise / (2 * u))) + ')' })
      .add(() => { rig.classList.remove('is-climbing'); S.surf = dest.id; })
      .to(S, { x: (dest.x0 + dest.x1) / 2, duration: 0.5, ease: 'power1.out' });
    P.x = (dest.x0 + dest.x1) / 2;
    P.surf = dest.id;
  };

  const burst = () => {
    sparks.forEach((spark, index) => {
      gsap.fromTo(spark,
        { x: 0, y: 0, opacity: 1, scale: 1 },
        { x: rand(-34, 34), y: rand(-64, -18), opacity: 0, scale: 0.4, duration: 0.7, ease: 'steps(6)', delay: index * 0.02 });
    });
  };

  const onGround = () => P.surf === 'terrace' || P.surf === 'grass';

  // ---- Autonomous behaviours ----
  const BEHAVIORS = {
    look: () => start('look', (t) => glances(t, Math.round(rand(2, 4)))),

    walk: () => start('walk', (t) => {
      const surf = byId[P.surf];
      const toRight = Math.random() < (P.x - surf.x0) / Math.max(1, surf.x1 - surf.x0) ? -1 : 1;
      walkTo(t, P.x + toRight * rand(70, 260), 62);
      glances(t, 1);
    }),

    run: () => start('run', (t) => {
      const surf = byId[P.surf];
      const toRight = Math.random() < (P.x - surf.x0) / Math.max(1, surf.x1 - surf.x0) ? -1 : 1;
      walkTo(t, P.x + toRight * rand(220, 520), 170, 'is-running');
    }),

    hop: () => start('hop', (t) => {
      const surf = byId[P.surf];
      hopTo(t, surf, P.x + rand(-50, 50), { apex: 22 });
      glances(t, 1);
    }),

    stunt: () => start('stunt', (t) => {
      const surf = byId[P.surf];
      const dir = Math.random() < 0.5 ? -1 : 1;
      hopTo(t, surf, P.x + dir * rand(70, 150), { apex: 56, flip: true });
      wait(t, 0.3);
    }),

    perch: () => start('perch', (t) => {
      const options = Object.values(byId).filter((surface) => surface.top);
      const dest = options[Math.floor(Math.random() * options.length)];
      if (!dest) { hopTo(t, byId.terrace, P.x + rand(-60, 60), { apex: 22 }); return; }
      if (dest.ladderX !== null && dest.ladderX !== undefined) {
        climbUp(t, dest);
      } else {
        const left = P.x < dest.cx;
        walkTo(t, left ? dest.x0 - 7 * u : dest.x1 + 7 * u, 66);
        hopTo(t, dest, left ? dest.x0 + 3 * u : dest.x1 - 3 * u, { apex: dest.top * u + 14 });
      }
      sit(t);
    }),

    descend: () => start('descend', (t) => {
      const surf = byId[P.surf];
      const left = P.x < (surf.x0 + surf.x1) / 2;
      hopTo(t, byId.terrace, left ? surf.x0 - 9 * u : surf.x1 + 9 * u, { apex: 26 });
      glances(t, 1);
    }),

    // Slips behind the terrace wall (or the grass), then rises somewhere else.
    peek: () => start('peek', (t) => {
      const surf = byId[P.surf];
      const hide = 44 * u * surf.s;
      const rise = (to) => t.to(S, { fy: surf.y + to, duration: 0.7, ease: 'steps(6)' });
      t.to(S, { fy: surf.y + hide, duration: 0.5, ease: 'steps(4)' })
        .add(() => { S.x = clamp(surf.x0 + 30, surf.x1 - 30, rand(surf.x0, surf.x1)); face(rand(-1, 1)); });
      rise(hide * 0.62);
      glances(t, 2);
      if (Math.random() < 0.5) {
        t.to(S, { fy: surf.y + hide, duration: 0.5, ease: 'steps(4)' })
          .add(() => { S.x = clamp(surf.x0 + 30, surf.x1 - 30, rand(surf.x0, surf.x1)); });
      }
      t.to(S, { fy: surf.y, duration: 0.55, ease: 'steps(5)' });
    }),

    // Drops to the grass in front of the wall, or climbs back up behind it.
    lane: () => start('lane', (t) => {
      const toGrass = P.surf === 'terrace';
      hopTo(t, byId[toGrass ? 'grass' : 'terrace'], P.x + rand(-80, 80), { apex: toGrass ? 18 : 52 });
      glances(t, 1);
    }),
  };

  function next() {
    rest = null;
    if (!alive || !shown || reduced) return;
    const name = pickBehavior({
      surf: S.surf,
      section: sectionStore.get(),
      last: lastName,
      canPerch: Object.values(byId).some((surface) => surface.top),
    });
    BEHAVIORS[name]();
  }

  // ---- Reactions ----
  const cheer = () => {
    const now = performance.now();
    if (!shown || reduced || now < reactUntil) return;
    reactUntil = now + 1600;
    start('cheer', (t) => {
      const surf = byId[P.surf];
      hopTo(t, surf, P.x + rand(-24, 24), { apex: 30 });
      t.add(burst);
      hopTo(t, surf, P.x + rand(-24, 24), { apex: 36, flip: Math.random() < 0.4 });
    });
  };

  const inspect = (target) => {
    const now = performance.now();
    if (!shown || reduced || now < hoverUntil || now < reactUntil) return;
    hoverUntil = now + 3500;
    reactUntil = now + 1500;
    const rect = target.getBoundingClientRect();
    start('inspect', (t) => {
      let lane = byId[P.surf];
      if (!(P.surf === 'terrace' || P.surf === 'grass')) {
        lane = byId.terrace;
        hopTo(t, lane, P.x + (Math.random() < 0.5 ? -70 : 70), { apex: 20 });
      }
      const x = clamp(lane.x0, lane.x1, rect.left + rect.width / 2);
      walkTo(t, x, Math.abs(x - P.x) > 240 ? 170 : 70, Math.abs(x - P.x) > 240 ? 'is-running' : 'is-walking');
      t.add(() => lookDir(0, -1))
        .to(body, { y: -14, duration: 0.14, ease: 'steps(3)' })
        .to(body, { y: 0, duration: 0.14, ease: 'steps(3)' });
      wait(t, 0.9);
      t.add(() => lookDir(0, 0));
    });
  };

  const notice = () => {
    const now = performance.now();
    if (!shown || reduced || now < reactUntil) return;
    reactUntil = now + 2000;
    start('notice', (t) => {
      hopTo(t, byId[P.surf], P.x + rand(-30, 30), { apex: 24 });
      t.add(() => lookDir(rand(-1, 1), -0.8));
      wait(t, 0.8);
      t.add(() => lookDir(0, 0));
    });
  };

  const sprint = () => {
    const now = performance.now();
    if (!shown || reduced || now < scrollUntil || now < reactUntil) return;
    scrollUntil = now + 5000;
    reactUntil = now + 2500;
    start('sprint', (t) => {
      if (!(P.surf === 'terrace' || P.surf === 'grass')) hopTo(t, byId.terrace, P.x + 60, { apex: 22 });
      const surf = byId[P.surf];
      const toRight = P.x < (surf.x0 + surf.x1) / 2;
      walkTo(t, toRight ? surf.x1 - rand(40, 160) : surf.x0 + rand(40, 160), 190, 'is-running');
      glances(t, 1);
    });
  };

  const startle = () => {
    const now = performance.now();
    if (!shown || reduced || now < startleUntil || now < reactUntil || !onGround()) return;
    startleUntil = now + 7000;
    reactUntil = now + 1200;
    start('startle', (t) => hopTo(t, byId[P.surf], P.x + rand(-40, 40), { apex: 26 }));
  };

  // ---- Wiring ----
  let frame = 0;
  let pointer = null;
  const onPointerMove = (event) => {
    pointer = event;
    if (frame || !shown) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!pointer) return;
      const centreY = S.fy - 20 * u * S.scale;
      const dx = pointer.clientX - S.x;
      const dy = pointer.clientY - centreY;
      const dist = Math.hypot(dx, dy) || 1;
      if (!(current && lastName === 'look')) {
        const strength = Math.min(1, dist / 220);
        lookDir((dx / dist) * strength, (dy / dist) * strength);
      }
      if (dist < 70) startle();
    });
  };
  const onOver = (event) => {
    if (event.pointerType !== 'mouse') return;
    const el = event.target.closest?.('.chest-btn, .contact .btn');
    if (el && el !== hoverEl) { hoverEl = el; inspect(el); } else if (!el) hoverEl = null;
  };
  const onFocus = (event) => {
    const el = event.target.closest?.('.chest-btn, .contact .btn');
    if (el) inspect(el);
  };
  const onClick = (event) => {
    if (event.button !== 0) return;
    if (event.target.closest?.('a.chest-btn, .contact .btn, .hero__actions .btn')) window.setTimeout(cheer, 180);
  };
  let resizeFrame = 0;
  const onResize = () => {
    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      if (!alive) return;
      reset();
      measure();
      if (shown && !reduced) settle();
      else follow();
    });
  };

  const show = () => {
    if (shown) return;
    measure();
    shown = true;
    if (reduced) {
      S.surf = byId.tank ? 'tank' : 'terrace';
      place();
      S.x = (byId[S.surf].x0 + byId[S.surf].x1) / 2;
      rig.classList.add('is-sitting');
      follow();
      gsap.set(rig, { autoAlpha: 1 });
      return;
    }
    reset();
    S.surf = 'terrace';
    place();
    const surf = byId.terrace;
    const hide = 44 * u;
    S.x = W - 90 - rand(0, 60);
    S.fy = surf.y + hide;
    gsap.ticker.add(follow);
    follow();
    gsap.set(rig, { autoAlpha: 1 });
    // Arrival: he peeks up from behind the terrace wall, looks around, then climbs out.
    start('arrive', (t) => {
      t.to(S, { fy: surf.y + hide * 0.58, duration: 0.8, ease: 'steps(6)' });
      glances(t, 2);
      t.to(S, { fy: surf.y, duration: 0.5, ease: 'steps(5)' });
    }, false);
  };

  const hide = () => {
    if (!shown) return;
    shown = false;
    reset();
    gsap.ticker.remove(follow);
    gsap.set(rig, { autoAlpha: 0 });
  };

  measure();
  const trigger = ScrollTrigger.create({
    trigger: '#top',
    start: 'bottom 72%',
    end: 'max',
    onToggle: (self) => (self.isActive ? show() : hide()),
  });
  if (trigger.isActive) show();

  const velocityTrigger = reduced ? null : ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => { if (Math.abs(self.getVelocity()) > 2400) sprint(); },
  });
  const unsubscribe = reduced ? () => {} : sectionStore.subscribe(notice);

  if (!reduced) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('focusin', onFocus);
    document.addEventListener('click', onClick);
  }
  window.addEventListener('resize', onResize);

  return () => {
    alive = false;
    shown = false;
    if (rest) rest.kill();
    if (current) current.kill();
    gsap.killTweensOf([S, body, eyes, ...sparks]);
    gsap.ticker.remove(follow);
    trigger.kill();
    velocityTrigger?.kill();
    unsubscribe();
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerover', onOver);
    document.removeEventListener('focusin', onFocus);
    document.removeEventListener('click', onClick);
    window.removeEventListener('resize', onResize);
    if (frame) cancelAnimationFrame(frame);
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
  };
}

export default memo(function Companion() {
  const rig = useRef(null);
  const body = useRef(null);
  const eyes = useRef(null);
  const fx = useRef(null);

  useEffect(() => runCompanion({
    rig: rig.current, body: body.current, eyes: eyes.current, fx: fx.current,
  }), []);

  return (
    <div ref={rig} className="companion" aria-hidden="true">
      <div ref={body} className="companion__body">
        <Sprite px={2} decorative eyesRef={eyes} className="companion__sprite" />
      </div>
      <div ref={fx} className="companion__fx">
        {Array.from({ length: 6 }, (_, index) => <i key={index} />)}
      </div>
    </div>
  );
});
