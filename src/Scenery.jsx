import { memo, useMemo } from 'react';

function seeded(seed) {
  let value = seed;
  return () => (value = (value * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

const TONES = {
  front: {
    leaf: ['#25492c', '#3b7036', '#4f8f3f'],
    hi: '#A9F06D',
    stem: '#2f5a2e',
    flower: '#BBA9FF',
    flowerD: '#8d78e6',
    core: '#EAF0F7',
  },
  back: {
    leaf: ['#1a3320', '#24472a', '#2f5a32'],
    hi: '#4f8f3f',
    stem: '#1f3d24',
    flower: '#7f72c4',
    flowerD: '#5f55a0',
    core: '#a9a4c9',
  },
};

// Procedural bougainvillea: canopy, hanging vines, and lavender blossoms.
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
      const length = 6 + Math.floor(random() * (maxHang - 6));

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

// Fixed sky: dusk fades to night using --t (set from scroll progress).
export const Sky = memo(function Sky() {
  const first = useMemo(() => stars(60, 3, '#EAF0F7'), []);
  const second = useMemo(() => stars(30, 9, '#BBA9FF'), []);

  return (
    <div className="sky" aria-hidden="true">
      <div className="sky__dusk" />
      <div className="sky__stars">
        <i style={{ boxShadow: first }} />
        <i className="twinkle" style={{ boxShadow: second }} />
      </div>
      <i className="moon" />
      <i className="cloud c1" />
      <i className="cloud c2" />
    </div>
  );
});