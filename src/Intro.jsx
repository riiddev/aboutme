import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { Sprite } from './PixelArt.jsx';
import { getSmoothScroller } from './lib.js';

// 5x7 bitmap letters. The wordmark is assembled from these cells, one block at a time.
const GLYPHS = {
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  I: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
};
const WORD = 'RIIDDEV';

function buildCells() {
  const cells = [];
  let cursor = 0;
  [...WORD].forEach((letter, letterIndex) => {
    const glyph = GLYPHS[letter];
    glyph.forEach((row, y) => {
      [...row].forEach((on, x) => {
        if (on === '#') cells.push({ x: cursor + x, y, letter: letterIndex });
      });
    });
    cursor += glyph[0].length + 1;
  });
  return { cells, width: cursor - 1 };
}

// Deterministic skyline so the scene never changes between renders.
function skyline(seed, count, minH, maxH, width) {
  let s = seed;
  const rand = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  const out = [];
  let x = 0;
  for (let i = 0; i < count; i += 1) {
    const w = 6 + Math.floor(rand() * 9);
    const h = minH + Math.floor(rand() * (maxH - minH));
    const lit = [];
    for (let wy = 4; wy < h - 3; wy += 4) {
      for (let wx = 2; wx < w - 2; wx += 3) {
        if (rand() > 0.82) lit.push([wx, wy, rand() > 0.7 ? 'g' : 'l']);
      }
    }
    out.push({ x, w, h, lit });
    x += w + Math.floor(rand() * 2);
    if (x > width) break;
  }
  return out;
}

const STARS = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 37 + 9) % 100,
  y: (i * 17 + 5) % 52,
  s: i % 5 === 0 ? 3 : 2,
}));
const BURST = Array.from({ length: 10 }, (_, i) => i);
const TRAIL = Array.from({ length: 14 }, (_, i) => i);
const TAGLINE = 'curious developer · learning by building';

function Skyline({ seed, count, minH, maxH, className }) {
  const blocks = useMemo(() => skyline(seed, count, minH, maxH, 220), [seed, count, minH, maxH]);
  const total = blocks.length ? blocks[blocks.length - 1].x + blocks[blocks.length - 1].w : 220;
  return (
    <svg className={className} viewBox={'0 0 ' + total + ' ' + maxH} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
      {blocks.map((b, i) => (
        <g key={i} transform={'translate(' + b.x + ' ' + (maxH - b.h) + ')'}>
          <rect width={b.w} height={b.h} className="intro__bldg" />
          {b.lit.map(([wx, wy, kind], j) => (
            <rect key={j} x={wx} y={wy} width="1.4" height="2" className={kind === 'g' ? 'intro__win intro__win--g' : 'intro__win'} />
          ))}
        </g>
      ))}
    </svg>
  );
}

/**
 * Cinematic opening. It replaces the old progress-bar loader.
 *   0.0-0.6  boot        CRT line opens, first pixel lights
 *   0.6-1.5  world       sky, skyline, ground and lamp assemble in layers
 *   1.5-2.6  character   Riiddev hops in and lands on the hero's exact spot
 *   2.6-3.6  identity    RIIDDEV is built block by block
 *   3.6-4.5  signature   jump, squash, spark burst, wordmark sweep, tagline
 *   4.5-5.0  handoff     pixel grid covers, hero is revealed beneath
 * onCover fires while the grid covers the screen (hero starts there), onDone when finished.
 */
export default function Intro({ onCover, onDone }) {
  const root = useRef(null);
  const callbacks = useRef({ onCover, onDone });
  callbacks.current = { onCover, onDone };

  const { cells, width } = useMemo(buildCells, []);
  const grid = useMemo(() => {
    const w = typeof window === 'undefined' ? 1280 : window.innerWidth;
    const h = typeof window === 'undefined' ? 720 : window.innerHeight;
    const tile = Math.max(56, Math.ceil(w / 22));
    return { cols: Math.ceil(w / tile), rows: Math.ceil(h / tile) };
  }, []);

  // Lock scrolling while the intro is on screen (also keeps Lenis from scrolling behind it).
  useLayoutEffect(() => {
    const scroller = getSmoothScroller();
    const html = document.documentElement;
    const previous = html.style.overflow;
    window.scrollTo(0, 0);
    html.style.overflow = 'hidden';
    scroller?.stop();
    return () => {
      html.style.overflow = previous;
      scroller?.start();
    };
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    let finished = false;
    let main;
    let handoff;
    let skip = () => {};

    const finish = () => {
      if (finished) return;
      finished = true;
      callbacks.current.onDone();
    };

    const context = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const sprite = q('.intro__char')[0];
      const home = () => {
        const target = document.querySelector('.hc__btn');
        const r = target ? target.getBoundingClientRect() : null;
        const w = r?.width || 160;
        const h = r?.height || 260;
        return {
          w,
          h,
          x: r ? r.left : window.innerWidth * 0.62,
          y: r ? r.top : window.innerHeight * 0.4,
        };
      };
      const size = home();
      gsap.set(sprite, { width: size.w, height: size.h, x: -size.w - 40, y: size.y, autoAlpha: 1 });

      // Trail: a small pool of pixels dropped behind the character while it travels.
      const pool = q('.intro__trail i');
      let poolIndex = 0;
      let lastDrop = -999;
      const drop = () => {
        const x = Number(gsap.getProperty(sprite, 'x'));
        if (Math.abs(x - lastDrop) < 26) return;
        lastDrop = x;
        const dot = pool[poolIndex % pool.length];
        poolIndex += 1;
        const feetY = Number(gsap.getProperty(sprite, 'y')) + size.h - 6;
        gsap.fromTo(dot,
          { x: x + size.w * 0.3, y: feetY - gsap.utils.random(0, 10), autoAlpha: 1, scale: 1 },
          { autoAlpha: 0, scale: 0.4, y: '-=14', duration: 0.5, ease: 'steps(5)', overwrite: true });
      };

      main = gsap.timeline({ defaults: { ease: 'none' } });

      // 0.0 - 0.6  boot
      main
        .set(q('.intro__scene > *'), { autoAlpha: 0 }, 0)
        .fromTo('.intro__crt', { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.18, ease: 'steps(6)' }, 0)
        .fromTo('.intro__scene', { clipPath: 'inset(49.5% 0 49.5% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 0.24, ease: 'steps(6)' }, 0.2)
        .to('.intro__crt', { autoAlpha: 0, duration: 0.05 }, 0.42)
        .fromTo('.intro__stars i', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, stagger: { each: 0.016, from: 'random' } }, 0.28)
        .set('.intro__stars', { autoAlpha: 1 }, 0.28)

        // 0.6 - 1.5  world formation, layer by layer
        .set(['.intro__sky', '.intro__far', '.intro__near', '.intro__ground', '.intro__lamp'], { autoAlpha: 1 }, 0.6)
        .fromTo('.intro__sky', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.4, ease: 'steps(8)' }, 0.6)
        .fromTo('.intro__moon', { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.3, ease: 'steps(4)' }, 0.72)
        .fromTo('.intro__far', { yPercent: 100 }, { yPercent: 0, duration: 0.4, ease: 'steps(8)' }, 0.8)
        .fromTo('.intro__near', { yPercent: 100 }, { yPercent: 0, duration: 0.4, ease: 'steps(8)' }, 0.98)
        .fromTo('.intro__ground', { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.38, ease: 'steps(10)' }, 1.08)
        .fromTo('.intro__lamp', { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.26, ease: 'steps(6)' }, 1.2)
        .fromTo('.intro__lamp i', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 1.46)

        // 1.5 - 2.6  character hops in and lands on the hero's real position
        .add(() => sprite.setAttribute('data-walking', 'true'), 1.5)
        .to(sprite, {
          x: () => home().x,
          duration: 1.0,
          ease: 'power1.out',
          onUpdate: drop,
        }, 1.5)
        .to(sprite, { y: () => home().y - 34, duration: 0.14, ease: 'power2.out', yoyo: true, repeat: 5 }, 1.5)
        .add(() => { sprite.setAttribute('data-walking', 'false'); }, 2.6)
        .to(sprite, { y: () => home().y, duration: 0.01 }, 2.6)

        // 2.6 - 3.6  wordmark assembled block by block
        .fromTo('.intro__word', { autoAlpha: 1 }, { autoAlpha: 1, duration: 0.01 }, 2.6)
        .fromTo('.intro__cell',
          { autoAlpha: 0, y: () => gsap.utils.random(-7, -2), x: () => gsap.utils.random(-3, 3) },
          { autoAlpha: 1, x: 0, y: 0, duration: 0.18, ease: 'steps(3)', stagger: { amount: 0.8, from: 'random' } }, 2.6)

        // 3.6 - 4.5  signature moment: jump, land, burst, sweep, tagline
        .to(sprite, { y: () => home().y - 120, duration: 0.24, ease: 'power2.out' }, 3.6)
        .to(sprite, { y: () => home().y, duration: 0.2, ease: 'power2.in' }, 3.84)
        .to(sprite, { scaleX: 1.14, scaleY: 0.84, transformOrigin: '50% 100%', duration: 0.06, ease: 'steps(2)' }, 4.04)
        .to(sprite, { scaleX: 1, scaleY: 1, duration: 0.16, ease: 'power2.out' }, 4.1)
        .fromTo('.intro__burst i',
          { autoAlpha: 1, x: 0, y: 0 },
          {
            autoAlpha: 0, duration: 0.4, ease: 'steps(6)',
            x: (i) => Math.cos((i / BURST.length) * Math.PI * 2) * gsap.utils.random(40, 90),
            y: (i) => Math.sin((i / BURST.length) * Math.PI * 2) * gsap.utils.random(20, 52),
            immediateRender: false,
          }, 4.04)
        .to('.intro__cell--f', { fill: '#F2FFE0', duration: 0.06, ease: 'steps(1)', stagger: { amount: 0.34, from: 'start' }, yoyo: true, repeat: 1 }, 3.9)
        .fromTo('.intro__tag .t', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, stagger: 0.0125 }, 3.78);

      // 4.5 - 5.0  handoff, shared with the skip path
      handoff = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
        .fromTo('.intro__tile', { autoAlpha: 0 }, {
          autoAlpha: 1, duration: 0.01,
          stagger: { amount: 0.22, grid: [grid.rows, grid.cols], from: 'start' },
        }, 0)
        .add(() => {
          gsap.set('.intro__scene, .intro__word, .intro__tag, .intro__char, .intro__skip, .intro__crt, .intro__trail, .intro__burst', { autoAlpha: 0 });
          el.style.background = 'transparent';
          el.classList.add('is-handoff');
          callbacks.current.onCover();
        }, 0.26)
        .to('.intro__tile', {
          autoAlpha: 0, duration: 0.01,
          stagger: { amount: 0.22, grid: [grid.rows, grid.cols], from: 'end' },
        }, 0.3)
        .add(finish, 0.56);

      main.add(() => handoff.play(), 4.5);
      // Never hold the visitor hostage: the page after the intro is the point.
      main.eventCallback('onComplete', () => { if (handoff.paused()) handoff.play(); });

      skip = () => {
        if (!handoff.paused() || handoff.progress() > 0) return;
        main.pause();
        gsap.killTweensOf(sprite);
        handoff.play();
      };
    }, el);

    const onKey = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      skip();
    };
    const onPointer = () => skip();
    // Lenis listens on window; stopping the event here keeps the page from scrolling behind the intro.
    const block = (event) => { event.preventDefault(); event.stopPropagation(); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    el.addEventListener('wheel', block, { passive: false });
    el.addEventListener('touchmove', block, { passive: false });

    return () => {
      el.removeEventListener('wheel', block);
      el.removeEventListener('touchmove', block);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
      context.revert();
      main?.kill();
      handoff?.kill();
    };
  }, [grid]);

  return (
    <div ref={root} className="intro" role="presentation">
      <div className="intro__scene" aria-hidden="true">
        <div className="intro__sky" />
        <div className="intro__stars">{STARS.map((s, i) => (
          <i key={i} className={i % 6 === 0 ? 'is-lav' : ''} style={{ left: s.x + '%', top: s.y + '%', width: s.s, height: s.s }} />
        ))}</div>
        <div className="intro__moon" />
        <Skyline seed={7} count={30} minH={26} maxH={58} className="intro__far" />
        <Skyline seed={23} count={22} minH={32} maxH={72} className="intro__near" />
        <div className="intro__lamp"><i /></div>
        <div className="intro__ground" />
      </div>

      <div className="intro__word" aria-hidden="true">
        <svg viewBox={'-1 -1 ' + (width + 2) + ' 9'} shapeRendering="crispEdges">
          <g className="intro__shadow" transform="translate(.7 .7)">
            {cells.map((c, i) => <rect key={i} className="intro__cell intro__cell--s" x={c.x} y={c.y} width="1" height="1" />)}
          </g>
          <g>
            {cells.map((c, i) => <rect key={i} className="intro__cell intro__cell--f" x={c.x} y={c.y} width="1" height="1" />)}
          </g>
        </svg>
        <p className="intro__tag">{[...TAGLINE].map((ch, i) => <span className="t" key={i}>{ch === ' ' ? '\u00a0' : ch}</span>)}</p>
      </div>

      <div className="intro__trail" aria-hidden="true">{TRAIL.map((i) => <i key={i} />)}</div>
      <div className="intro__char" aria-hidden="true">
        <Sprite decorative />
        <div className="intro__burst">{BURST.map((i) => <i key={i} />)}</div>
      </div>

      <div className="intro__crt" aria-hidden="true" />
      <div className="intro__tiles" style={{ '--cols': grid.cols, '--rows': grid.rows }} aria-hidden="true">
        {Array.from({ length: grid.cols * grid.rows }, (_, i) => <i className="intro__tile" key={i} />)}
      </div>
      <button type="button" className="intro__skip">Skip intro <span aria-hidden="true">any key</span></button>
      <p className="intro__hint" aria-live="polite">Riiddev's world is loading. Press any key to skip.</p>
    </div>
  );
}
