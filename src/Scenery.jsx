import { memo, useEffect, useMemo } from 'react';

function seeded(seed) {
  let value = seed;
  return () => (value = (value * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

const TONES = {
  front: {
    leaf: ['#285d54', '#37836e', '#76bd76'],
    hi: '#d5eb78',
    stem: '#1c4a4c',
    flower: '#ff9bc2',
    flowerD: '#de679c',
    core: '#ffd166',
  },
  back: {
    leaf: ['#1f4143', '#285d60', '#36756b'],
    hi: '#69d7e5',
    stem: '#18383f',
    flower: '#b8a3ff',
    flowerD: '#ff9bc2',
    core: '#fff2d7',
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

const WINDOW_TINTS = ['#ffd166', '#ff9bc2', '#69d7e5', '#b8a3ff', '#7be0b6', '#ff9f68'];
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



// A deliberately composed pixel neighbourhood: varied rooflines, small shops,
// apartment lights, street furniture and traffic give the hero an inhabited scale.
const CITY_BUILDINGS = [
  { id: 'old-row', kind: 'rowhouse', left: '0.5%', width: '10.8%', height: '42%', rows: 4, cols: 3, sign: 'OPEN', wall: '#263858', light: '#f4c988' },
  { id: 'walkup', kind: 'apartment', left: '9.2%', width: '11.6%', height: '64%', rows: 6, cols: 3, wall: '#233653', light: '#a7dff0', balconies: true },
  { id: 'brick-office', kind: 'office', left: '19.1%', width: '8.9%', height: '50%', rows: 5, cols: 2, wall: '#26324f', light: '#d8c4ff' },
  { id: 'clock-tower', kind: 'tower', left: '27.1%', width: '10.8%', height: '84%', rows: 8, cols: 3, wall: '#1c2c4b', light: '#d2e3fa', antenna: true },
  { id: 'corner-cafe', kind: 'cafe', left: '37.4%', width: '12.8%', height: '35%', rows: 3, cols: 3, sign: 'CAFE', wall: '#302d4e', light: '#ffd6a0' },
  { id: 'mid-rise', kind: 'apartment', left: '48.4%', width: '11.8%', height: '59%', rows: 6, cols: 3, wall: '#233752', light: '#b8a3ff', balconies: true },
  { id: 'narrow-house', kind: 'rowhouse', left: '59.2%', width: '8.1%', height: '48%', rows: 5, cols: 2, wall: '#2c3455', light: '#ffd9a3' },
  { id: 'night-hotel', kind: 'hotel', left: '66.4%', width: '12.9%', height: '72%', rows: 7, cols: 3, sign: 'INN', wall: '#202e4b', light: '#a9e3f1' },
  { id: 'water-tower', kind: 'water', left: '78.3%', width: '10.6%', height: '43%', rows: 4, cols: 3, wall: '#283757', light: '#d4c4ff', antenna: true },
  { id: 'last-block', kind: 'office', left: '88.2%', width: '12%', height: '53%', rows: 5, cols: 3, wall: '#202f4d', light: '#ffd69a' },
];

export const Cityscape = memo(function Cityscape({ className = '' }) {
  return (
    <div className={className ? `cityscape ${className}` : "cityscape"} aria-hidden="true">
      <div className="cityscape__ridge cityscape__ridge--one" />
      <div className="cityscape__ridge cityscape__ridge--two" />
      <div className="cityscape__buildings">
        {CITY_BUILDINGS.map((building, index) => (
          <div
            key={building.id}
            className={'city-building city-building--' + building.kind}
            style={{
              '--left': building.left,
              '--width': building.width,
              '--height': building.height,
              '--cols': building.cols,
              '--rows': building.rows,
              '--wall': building.wall,
              '--window-light': building.light,
            }}
          >
            <i className="city-building__roof" />
            {building.antenna && <i className="city-building__antenna" />}
            {building.sign && <span className="city-building__sign">{building.sign}</span>}
            <div className="city-building__windows">
              {Array.from({ length: building.rows * building.cols }, (_, windowIndex) => (
                <i
                  key={windowIndex}
                  style={{
                    '--window-delay': '-' + (((index * 11 + windowIndex * 7) % 31) / 10) + 's',
                  }}
                />
              ))}
            </div>
            {building.balconies && (
              <div className="city-building__balconies">
                {Array.from({ length: building.rows - 1 }, (_, balconyIndex) => (
                  <i key={balconyIndex} />
                ))}
              </div>
            )}
            {building.kind === 'cafe' && <div className="city-building__awning"><i /><i /><i /><i /><i /><i /></div>}
          </div>
        ))}
      </div>

      <span className="city-tree city-tree--left"><i /><b /></span>
      <span className="city-tree city-tree--right"><i /><b /></span>
      <span className="city-lamp city-lamp--left"><i /></span>
      <span className="city-lamp city-lamp--right"><i /></span>
      <div className="city-sidewalk"><i className="city-sidewalk__crack" /></div>
      <div className="city-street">
        <i className="city-street__lane" />
        <i className="city-street__crossing" />
        <span className="city-vehicle">
          <i className="city-vehicle__body" />
          <i className="city-vehicle__windows" />
          <i className="city-vehicle__wheels" />
          <i className="city-vehicle__lamp" />
        </span>
        <span className="city-person city-person--one" style={{ '--person-left': '24%', '--coat': '#a7c5e8', '--walk-duration': '17s', '--walk-delay': '-5s' }}>
          <i className="city-person__head" /><i className="city-person__body" /><i className="city-person__legs" />
        </span>
        <span className="city-person city-person--two" style={{ '--person-left': '73%', '--coat': '#c9a7ec', '--walk-duration': '21s', '--walk-delay': '-13s' }}>
          <i className="city-person__head" /><i className="city-person__body" /><i className="city-person__legs" />
        </span>
        <span className="city-person city-person--three" style={{ '--person-left': '47%', '--coat': '#e5b17d', '--walk-duration': '26s', '--walk-delay': '-9s' }}>
          <i className="city-person__head" /><i className="city-person__body" /><i className="city-person__legs" />
        </span>
      </div>
      <i className="cityscape__signal" />
      <i className="cityscape__window-glow" />
    </div>
  );
});


// A cozy pixel backstreet: distant rooftops, lit windows, foreground rooftops,
// garden silhouettes, fireflies, and the existing moonlit sky.
export const Sky = memo(function Sky() {
  useSkyParallax();
  const first = useMemo(() => stars(42, 3, '#ffe5a7'), []);
  const second = useMemo(() => stars(22, 9, '#ff9bc2'), []);
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
      <Cityscape className="cityscape--world" />
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