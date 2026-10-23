import { memo, useEffect, useMemo } from 'react';

function seeded(seed) {
  let value = seed;
  return () => (value = (value * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

const TONES = {
  front: {
    leaf: ['#152b42', '#244d70', '#34789c'],
    hi: '#9be8ff',
    stem: '#13283f',
    flower: '#aabaff',
    flowerD: '#8298eb',
    core: '#e8f5ff',
  },
  back: {
    leaf: ['#0f2035', '#193653', '#245174'],
    hi: '#5db9e7',
    stem: '#0d1d31',
    flower: '#8e9fff',
    flowerD: '#5464a6',
    core: '#b3c5e6',
  },
};

// Procedural bougainvillea canopy and pixel blossoms.
export const Vines = memo(function Vines({
  seed,
  tone = 'front',
  maxHang = 22,
  className = '',
}) {
  const paths = useMemo(() => {
    const width = 96;
    const random = seeded(seed);
    const palette = TONES[tone];
    const cells = new Map();
    const put = (x, y, colour) => {
      if (x >= 0 && x < width && y >= 0) cells.set(x + ',' + y, colour);
    };
    const depth = (x) => 5 + 4 * Math.sin(x * 0.21 + seed)
      + 3 * Math.sin(x * 0.07 + 1) + random() * 2;

    for (let x = 0; x < width; x += 1) {
      const d = depth(x);
      for (let y = 0; y < d; y += 1) {
        const r = random();
        put(x, y, r < 0.04 ? palette.hi : r < 0.35 ? palette.leaf[2] : r < 0.7 ? palette.leaf[1] : palette.leaf[0]);
      }
    }

    for (let i = 0; i < 15; i += 1) {
      let x = Math.floor(random() * width);
      let y = Math.floor(depth(x));
      const length = 6 + Math.floor(random() * Math.max(1, maxHang - 6));

      for (let k = 0; k < length; k += 1, y += 1) {
        put(x, y, palette.stem);
        if (k % 2 === 1) {
          put(x - 1, y, palette.leaf[1]);
          put(x + 1, y, palette.leaf[2]);
        }
        if (random() < 0.2) x += random() < 0.5 ? -1 : 1;
      }
      put(x, y, palette.leaf[2]);
    }

    for (let i = 0; i < 26; i += 1) {
      const x = 2 + Math.floor(random() * (width - 4));
      const y = 1 + Math.floor(random() * (depth(x) + 9));
      [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        put(x + dx, y + dy, dx || dy ? palette.flower : palette.core);
      });
      put(x + 1, y + 1, palette.flowerD);
    }

    const by = {};
    cells.forEach((colour, key) => {
      const [x, y] = key.split(',');
      (by[colour] ||= []).push('M' + x + ' ' + y + 'h1v1h-1z');
    });
    return Object.entries(by).map(([colour, segments]) => ({
      colour,
      d: segments.join(''),
    }));
  }, [seed, tone, maxHang]);

  return (
    <svg className={className} viewBox="0 0 96 44" preserveAspectRatio="xMidYMin slice" shapeRendering="crispEdges" aria-hidden="true">
      {paths.map((path) => <path key={path.colour} d={path.d} fill={path.colour} />)}
    </svg>
  );
});

const stars = (count, seed, colour) => {
  const random = seeded(seed);
  return Array.from({ length: count }, () => (
    (random() * 100).toFixed(1) + 'vw '
    + (random() * 100).toFixed(1) + 'vh ' + colour
  )).join(',');
};

const WINDOW_TINTS = ['#9be8ff', '#8e9fff', '#75caff', '#b7c5ff'];
const FAR_BUILDINGS = Array.from({ length: 24 }, (_, index) => ({
  left: (index * 4.45 - 1) + '%',
  width: (4.1 + ((index * 7) % 3) * 0.9) + '%',
  height: (13 + ((index * 13 + 7) % 18)) + 'vh',
  '--window-delay': ((index * 0.37) % 4) + 's',
  '--window-tint': WINDOW_TINTS[(index * 3 + 1) % WINDOW_TINTS.length],
}));
const NEAR_BUILDINGS = Array.from({ length: 11 }, (_, index) => ({
  left: (index * 9.7 - 2) + '%',
  width: (9 + ((index * 5) % 4)) + '%',
  height: (6 + ((index * 9 + 4) % 11)) + 'vh',
  '--window-tint': WINDOW_TINTS[(index + 2) % WINDOW_TINTS.length],
}));

// The skyline is made out of crisp local CSS shapes, not a remote image.
// Pointer movement gives the distant and near layers different parallax speeds.
function useSkyParallax() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    const root = document.documentElement;
    let last = 0;

    const move = (event) => {
      if (last) return;
      last = requestAnimationFrame(() => {
        last = 0;
        const x = (event.clientX / Math.max(1, window.innerWidth) - 0.5);
        const y = (event.clientY / Math.max(1, window.innerHeight) - 0.5);
        root.style.setProperty('--sky-far-x', (x * -14).toFixed(2) + 'px');
        root.style.setProperty('--sky-far-y', (y * -6).toFixed(2) + 'px');
        root.style.setProperty('--sky-near-x', (x * 24).toFixed(2) + 'px');
        root.style.setProperty('--sky-near-y', (y * 8).toFixed(2) + 'px');
      });
    };

    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      if (last) cancelAnimationFrame(last);
    };
  }, []);
}

// A cozy pixel backstreet: distant rooftops, lit windows, foreground rooftops,
// garden silhouettes, fireflies, and the existing moonlit sky.
export const Sky = memo(function Sky() {
  useSkyParallax();
  const first = useMemo(() => stars(44, 3, '#DDF8FF'), []);
  const second = useMemo(() => stars(18, 9, '#B4C5FF'), []);
  const fireflies = useMemo(() => Array.from({ length: 8 }, (_, index) => ({
    '--left': ((index * 47 + 13) % 100) + '%',
    '--top': (28 + ((index * 31 + 9) % 66)) + '%',
    '--float-delay': '-' + ((index * 0.61) % 8) + 's',
    '--float-duration': (5 + ((index * 3) % 7)) + 's',
    '--fly-size': (index % 3 === 0 ? '4px' : '2px'),
  })), []);

  return (
    <div className="sky" aria-hidden="true">
      <div className="sky__dusk" />
      <div className="sky__nebula" />
      <div className="sky__stars">
        <i style={{ boxShadow: first }} />
        <i className="twinkle" style={{ boxShadow: second }} />
      </div>
      <i className="moon" />
      <i className="cloud c1" />
      <i className="cloud c2" />
      <div className="sky__horizon" />
      <div className="skyline skyline--far">
        {FAR_BUILDINGS.map((style, index) => (
          <i className="skyline__building" key={index} style={style} />
        ))}
      </div>
      <div className="skyline skyline--near">
        {NEAR_BUILDINGS.map((style, index) => (
          <i className="skyline__building" key={index} style={style} />
        ))}
        <span className="skyline__garden skyline__garden--one" />
        <span className="skyline__garden skyline__garden--two" />
      </div>
      <div className="sky__fireflies">
        {fireflies.map((style, index) => <i key={index} style={style} />)}
      </div>
      <div className="sky__groundlight" />
    </div>
  );
});