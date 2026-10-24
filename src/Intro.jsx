import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Sprite } from './PixelArt.jsx';
import { setScrollLocked } from './lib.js';

/*
 * Five-second opening. One GSAP timeline, labelled so "skip" can jump to the handoff.
 *   0.0  boot         pixel lights + scanline
 *   0.6  world        dusk sky, skyline layers, ground
 *   1.5  entrance     the character walks in, leaving a pixel trail
 *   2.6  identity     RIIDDEV assembles block by block
 *   3.6  signature    he hops onto his hero spot; the wordmark ripples
 *   4.5  handoff      pixel grid covers, hero is revealed, grid dissolves (ends 5.0)
 * The character lands exactly where the hero's character stands, so the page
 * continues from the intro instead of replacing it.
 */

const SEEN_KEY = 'riiddev-intro-v1';

export function shouldPlayIntro() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    if (new URLSearchParams(window.location.search).has('intro')) return true;
    return !window.localStorage.getItem(SEEN_KEY);
  } catch {
    return true;
  }
}

export function markIntroSeen() {
  try { window.localStorage.setItem(SEEN_KEY, '1'); } catch { /* storage unavailable */ }
}

export function clearIntroSeen() {
  try { window.localStorage.removeItem(SEEN_KEY); } catch { /* storage unavailable */ }
}

// 5x7 pixel letters for the wordmark.
const FONT = {
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
};
const WORD = 'RIIDDEV';
const MARK_W = WORD.length * 6 - 1; // 41 columns
const CURSOR_X = MARK_W + 2;

function buildMark() {
  const cells = [];
  [...WORD].forEach((letter, index) => {
    FONT[letter].forEach((row, y) => {
      [...row].forEach((value, x) => {
        if (value === '#') cells.push({ x: index * 6 + x, y, letter: index });
      });
    });
  });
  return cells;
}

function seeded(seed) {
  let value = seed;
  return () => (value = (value * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

// Layered skyline as one path per colour, so the SVG stays tiny.
function buildSkyline(seed, base, minH, maxH, wall, lit) {
  const random = seeded(seed);
  const wallPath = [];
  const litPaths = lit.map(() => []);
  let x = -2;
  while (x < 168) {
    const w = 7 + Math.floor(random() * 9);
    const h = minH + Math.floor(random() * (maxH - minH));
    const top = base - h;
    wallPath.push(`M${x} ${top}h${w}v${h}h-${w}z`);
    for (let wx = x + 2; wx < x + w - 2; wx += 3) {
      for (let wy = top + 3; wy < base - 3; wy += 4) {
        if (random() < 0.3) litPaths[Math.floor(random() * lit.length)].push(`M${wx} ${wy}h1v2h-1z`);
      }
    }
    x += w + (random() < 0.3 ? 1 : 0);
  }
  return { wall, wallD: wallPath.join(''), lit: lit.map((colour, i) => ({ colour, d: litPaths[i].join('') })) };
}

const STAR_COLOURS = ['#EAF0F7', '#BBA9FF', '#A9F06D'];

function gridSize() {
  const cols = window.innerWidth < 640 ? 8 : 16;
  const rows = Math.max(4, Math.ceil((cols * window.innerHeight) / window.innerWidth));
  return { cols, rows };
}

export default function Intro({ onHandoff, onDone }) {
  const root = useRef(null);
  const scene = useRef(null);
  const tlRef = useRef(null);
  const skipRef = useRef(null);
  const handoffCb = useRef(onHandoff);
  const doneCb = useRef(onDone);
  handoffCb.current = onHandoff;
  doneCb.current = onDone;

  const [grid] = useState(gridSize);
  const mark = useMemo(buildMark, []);
  const far = useMemo(() => buildSkyline(7, 48, 14, 34, '#161a33', ['#BBA9FF', '#EAF0F7']), []);
  const near = useMemo(() => buildSkyline(23, 48, 8, 24, '#0f1424', ['#A9F06D', '#EAF0F7', '#BBA9FF']), []);
  const stars = useMemo(() => {
    const random = seeded(41);
    return Array.from({ length: 26 }, () => ({
      '--x': (random() * 100).toFixed(1) + '%',
      '--y': (random() * 56).toFixed(1) + '%',
      '--s': (random() < 0.2 ? 6 : 3) + 'px',
      '--c': STAR_COLOURS[Math.floor(random() * STAR_COLOURS.length)],
    }));
  }, []);

  useLayoutEffect(() => {
    const el = root.current;
    const sceneEl = scene.current;
    if (!el || !sceneEl) return undefined;

    setScrollLocked(true);
    window.scrollTo(0, 0);

    // Where the hero character will stand: the intro character lands on that exact spot.
    const target = document.querySelector('.hc__btn')?.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = target?.width || Math.min(240, vw * 0.4);
    const height = target?.height || width * (40 / 24);
    const left = target?.left ?? vw * 0.62;
    const feet = target?.bottom ?? vh * 0.82;
    const top = feet - height;

    const q = (selector) => el.querySelector(selector);
    const all = (selector) => gsap.utils.toArray(selector, el);
    const char = q('.intro__char');
    const ground = q('.intro__ground');
    const city = all('.intro__city');
    const title = q('.intro__title');
    const cells = all('.intro__grid i');
    const trail = all('.intro__trail i');

    gsap.set(char, { left, top, width, height });
    gsap.set(ground, { top: feet });
    city.forEach((node) => { node.style.bottom = (vh - feet + 6) + 'px'; });
    const markHeight = (Math.min(vw * 0.86, 760) * 8) / 46;
    const titleTop = gsap.utils.clamp(vh * 0.1, vh * 0.34, top - markHeight - 70);
    gsap.set(title, { top: titleTop });

    const offscreen = -(left + width + 24);
    const walkStop = -Math.min(width * 0.75, left - 12 > 0 ? left - 12 : width * 0.75);
    const walkStart = 1.5;
    const walkEnd = 2.6;
    const hopAt = 3.55;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      markIntroSeen();
      setScrollLocked(false);
      doneCb.current?.();
    };

    const ctx = gsap.context(() => {
      const rects = all('.intro__mark .px-main');
      const shadow = q('.intro__mark .px-shadow');
      const cursor = q('.intro__mark .px-cursor');

      // Initial states are set explicitly; every fromTo below uses immediateRender:false
      // so nothing flashes before its moment on the timeline.
      gsap.set(char, { x: offscreen });
      gsap.set([shadow, cursor], { opacity: 0 });
      gsap.set(rects, { opacity: 0 });
      gsap.set(city, { autoAlpha: 0, yPercent: 100 });
      gsap.set(ground, { opacity: 0 });
      gsap.set(trail, { opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'none' } });
      tlRef.current = tl;

      // 0.0 – 0.6 boot: scanline sweep, CRT texture, pixel lights
      tl.to('.intro__crt', { opacity: 1, duration: 0.2, ease: 'steps(3)' }, 0)
        .fromTo('.intro__sweep', { top: 0, opacity: 1 }, { top: '100%', duration: 0.5, ease: 'steps(10)', immediateRender: false }, 0.05)
        .set('.intro__sweep', { opacity: 0 }, 0.56)
        .to('.intro__stars i', { opacity: 1, duration: 0.08, ease: 'steps(1)', stagger: { amount: 0.5, from: 'random' } }, 0.05);

      // 0.6 – 1.5 world formation, back to front. The ground goes in first so the
      // skyline rises out from behind it.
      tl.to('.intro__sky', { opacity: 1, duration: 0.6, ease: 'steps(6)' }, 0.6)
        .set(ground, { opacity: 1 }, 0.7)
        .set('.intro__moon', { opacity: 1 }, 0.85)
        .set(city[0], { autoAlpha: 1 }, 0.75)
        .to(city[0], { yPercent: 0, duration: 0.5, ease: 'steps(8)' }, 0.75)
        .set(city[1], { autoAlpha: 1 }, 0.98)
        .to(city[1], { yPercent: 0, duration: 0.45, ease: 'steps(8)' }, 0.98)
        .fromTo('.intro__city path[data-lit]', { opacity: 0 }, { opacity: 1, duration: 0.1, ease: 'steps(1)', stagger: { amount: 0.3, from: 'random' }, immediateRender: false }, 1.2);

      // 1.5 – 2.6 character enters, leaving a pixel trail
      tl.add(() => char.classList.add('is-walking'), walkStart)
        .to(char, { x: walkStop, duration: walkEnd - walkStart, ease: 'none' }, walkStart)
        .add(() => char.classList.remove('is-walking'), walkEnd);
      trail.forEach((square, index) => {
        const progress = (index + 1) / (trail.length + 1);
        const at = walkStart + (walkEnd - walkStart) * progress;
        const charX = offscreen + (walkStop - offscreen) * progress;
        tl.set(square, {
          left: left + charX + width * 0.28 + (index % 2) * 6,
          top: feet - 10 - (index % 3) * 7,
          backgroundColor: index % 2 ? '#BBA9FF' : '#A9F06D',
        }, at)
          .fromTo(square, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.4, duration: 0.4, ease: 'steps(4)', immediateRender: false }, at);
      });

      // 2.6 – 3.6 wordmark assembles block by block
      tl.fromTo(rects,
        { opacity: 1, x: () => gsap.utils.random(-24, 24), y: () => gsap.utils.random(-16, 16) },
        { x: 0, y: 0, duration: 0.45, ease: 'steps(5)', stagger: { amount: 0.55, from: 'random' }, immediateRender: false }, 2.6)
        .set(shadow, { opacity: 1 }, 3.2)
        .set(cursor, { opacity: 1 }, 3.3);

      // 3.6 – 4.5 signature: hop onto the hero spot, land, ripple the wordmark, reveal the line
      tl.to(char, { x: 0, duration: 0.5, ease: 'none' }, hopAt)
        .to(char, { y: -height * 0.28, duration: 0.25, ease: 'power2.out' }, hopAt)
        .to(char, { y: 0, duration: 0.25, ease: 'power2.in' }, hopAt + 0.25)
        .to(char, { scaleX: 1.1, scaleY: 0.86, duration: 0.07, ease: 'steps(2)' }, hopAt + 0.5)
        .to(char, { scaleX: 1, scaleY: 1, duration: 0.16, ease: 'power2.out' }, hopAt + 0.57)
        .to(rects, { y: -1.2, duration: 0.1, ease: 'steps(2)', stagger: { each: 0.012, from: 'center' }, yoyo: true, repeat: 1 }, hopAt + 0.52)
        .to('.intro__line', { opacity: 1, duration: 0.3, ease: 'steps(4)' }, hopAt + 0.45)
        .to(cursor, { opacity: 0, duration: 0.01, repeat: 5, yoyo: true, repeatDelay: 0.09 }, hopAt + 0.5);

      // 4.5 – 5.0 handoff: the grid covers, the hero is revealed underneath, the grid dissolves
      tl.addLabel('handoff', 4.5)
        .to(cells, { scale: 1.02, duration: 0.14, ease: 'steps(3)', stagger: { amount: 0.1, from: 'random' } }, 'handoff')
        .add(() => {
          char.classList.remove('is-walking');
          sceneEl.style.visibility = 'hidden';
          el.style.background = 'transparent';
          const skipButton = el.querySelector('.intro__skip');
          if (skipButton) skipButton.style.display = 'none';
          setScrollLocked(false);
          handoffCb.current?.();
        }, 'handoff+=0.25')
        .to(cells, { scale: 0, duration: 0.14, ease: 'steps(3)', stagger: { amount: 0.1, from: 'random' } }, 'handoff+=0.26')
        .add(finish, 5.0);
    }, el);

    // Skip fast-forwards to the handoff so the pixel-grid reveal still plays.
    const skip = () => {
      const tl = tlRef.current;
      if (tl && tl.time() < 4.5) tl.seek('handoff');
    };
    skipRef.current = skip;
    const onKey = (event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        skip();
      }
    };
    el.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', onKey);
    el.querySelector('.intro__skip')?.focus({ preventScroll: true });

    return () => {
      el.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', onKey);
      skipRef.current = null;
      tlRef.current = null;
      ctx.revert();
      setScrollLocked(false);
    };
  }, []);

  return (
    <div ref={root} className="intro">
      <div ref={scene} className="intro__scene" aria-hidden="true">
        <div className="intro__sky" />
        <div className="intro__stars">
          {stars.map((style, index) => <i key={index} style={style} />)}
        </div>
        <i className="intro__moon" />
        {[far, near].map((layer, index) => (
          <svg key={index} className="intro__city" viewBox="0 0 160 48" preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges">
            <path d={layer.wallD} fill={layer.wall} />
            {layer.lit.map((group) => <path key={group.colour} data-lit d={group.d} fill={group.colour} />)}
          </svg>
        ))}
        <div className="intro__ground" />
        <div className="intro__trail">
          {Array.from({ length: 12 }, (_, index) => <i key={index} />)}
        </div>
        <div className="intro__title">
          <svg className="intro__mark" viewBox="0 0 46 8" shapeRendering="crispEdges">
            <g className="px-shadow" fill="#6f5fc2">
              {mark.map((cell, index) => <rect key={index} x={cell.x + 0.5} y={cell.y + 0.5} width="1" height="1" />)}
            </g>
            <g fill="#EAF0F7">
              {mark.map((cell, index) => <rect className="px-main" key={index} x={cell.x} y={cell.y} width="1" height="1" />)}
            </g>
            <rect className="px-cursor" x={CURSOR_X} y="0" width="3" height="7" fill="#A9F06D" />
          </svg>
          <p className="intro__line">curious developer · learning by building</p>
        </div>
        <div className="intro__char">
          <Sprite px={10} decorative />
        </div>
        <div className="intro__sweep" />
        <div className="intro__crt" />
      </div>
      <div
        className="intro__grid"
        aria-hidden="true"
        style={{ '--cols': grid.cols, '--rows': grid.rows }}
      >
        {Array.from({ length: grid.cols * grid.rows }, (_, index) => <i key={index} />)}
      </div>
      <button
        type="button"
        className="intro__skip"
        onClick={() => skipRef.current?.()}
      >
        Skip intro
      </button>
    </div>
  );
}
