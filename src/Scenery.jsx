import { memo, useMemo, useRef } from 'react';
import { pixelPaths } from './PixelArt.jsx';
import { PLATFORMS, FRONT_OBJECTS } from './lib.js';
import { useWorld } from './World.jsx';
import Companion from './Companion.jsx';

function seeded(seed) {
  let value = seed;
  return () => (value = (value * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

const TONES = {
  front: {
    leaf: ['#285d54', '#37836e', '#76bd76'],
    hi: '#A9F06D',
    stem: '#1c4a4c',
    flower: '#BBA9FF',
    flowerD: '#6f5fc2',
    core: '#EAF0F7',
  },
  back: {
    leaf: ['#1f4143', '#285d60', '#36756b'],
    hi: '#A9F06D',
    stem: '#18383f',
    flower: '#8f80d6',
    flowerD: '#6f5fc2',
    core: '#EAF0F7',
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

const WINDOW_TINTS = ['#EAF0F7', '#BBA9FF', '#A9F06D', '#BBA9FF', '#A9F06D', '#ffd9a3'];
// A deliberately composed pixel neighbourhood: varied rooflines, small shops,
// apartment lights, street furniture and traffic give the hero an inhabited scale.
const CITY_BUILDINGS = [
  { id: 'old-row', kind: 'rowhouse', left: '0.5%', width: '10.8%', height: '42%', rows: 4, cols: 3, sign: 'OPEN', wall: '#263858', light: '#f4c988' },
  { id: 'walkup', kind: 'apartment', left: '9.2%', width: '11.6%', height: '64%', rows: 6, cols: 3, wall: '#233653', light: '#cfeeb5', balconies: true },
  { id: 'brick-office', kind: 'office', left: '19.1%', width: '8.9%', height: '50%', rows: 5, cols: 2, wall: '#26324f', light: '#BBA9FF' },
  { id: 'clock-tower', kind: 'tower', left: '27.1%', width: '10.8%', height: '84%', rows: 8, cols: 3, wall: '#1c2c4b', light: '#EAF0F7', antenna: true },
  { id: 'corner-cafe', kind: 'cafe', left: '37.4%', width: '12.8%', height: '35%', rows: 3, cols: 3, sign: 'CAFE', wall: '#302d4e', light: '#ffd6a0' },
  { id: 'mid-rise', kind: 'apartment', left: '48.4%', width: '11.8%', height: '59%', rows: 6, cols: 3, wall: '#233752', light: '#BBA9FF', balconies: true },
  { id: 'narrow-house', kind: 'rowhouse', left: '59.2%', width: '8.1%', height: '48%', rows: 5, cols: 2, wall: '#2c3455', light: '#ffd9a3' },
  { id: 'night-hotel', kind: 'hotel', left: '66.4%', width: '12.9%', height: '72%', rows: 7, cols: 3, sign: 'INN', wall: '#202e4b', light: '#c9f59d' },
  { id: 'water-tower', kind: 'water', left: '78.3%', width: '10.6%', height: '43%', rows: 4, cols: 3, wall: '#283757', light: '#BBA9FF', antenna: true },
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
      <i className="cityscape__shade" />
      <i className="cityscape__signal" />
      <i className="cityscape__window-glow" />
    </div>
  );
});


// ---------------------------------------------------------------------------
// Layered pixel world. Depth, back to front:
//   sky -> mountains -> city -> fireflies/motes -> terrace (trees, houses, platforms)
//   -> companion -> terrace front (wall, chimney, lantern) -> grass strip (above content)
// Environment art is drawn in "units"; one unit is --u in CSS (see unit() in lib.js).
// ---------------------------------------------------------------------------

// Merge pixels into horizontal runs, one path per colour.
function cellsToPaths(cells) {
  const byColour = new Map();
  cells.forEach((colour, key) => {
    const [x, y] = key.split(',').map(Number);
    if (!byColour.has(colour)) byColour.set(colour, new Map());
    const rows = byColour.get(colour);
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(x);
  });
  return [...byColour].map(([colour, rows]) => {
    let d = '';
    rows.forEach((xs, y) => {
      xs.sort((a, b) => a - b);
      let start = xs[0];
      let prev = xs[0];
      for (let i = 1; i <= xs.length; i += 1) {
        if (xs[i] !== prev + 1) {
          const run = prev - start + 1;
          d += 'M' + start + ' ' + y + 'h' + run + 'v1h-' + run + 'z';
          start = xs[i];
        }
        prev = xs[i];
      }
    });
    return { colour, d };
  });
}

const Paths = ({ paths }) => paths.map((path) => <path key={path.colour} d={path.d} fill={path.colour} />);

function ridge(seed, width, lo, hi, base) {
  const random = seeded(seed);
  let h = (lo + hi) / 2;
  let slope = 1;
  const heights = [];
  for (let x = 0; x < width; x += 1) {
    if (random() < 0.3) slope = Math.floor(random() * 3) - 1;
    h += slope;
    if (h < lo) { h = lo; slope = 1; }
    if (h > hi) { h = hi; slope = -1; }
    heights.push(Math.round(h));
  }
  let fill = 'M0 ' + base;
  heights.forEach((height, x) => { fill += 'V' + (base - height) + 'H' + (x + 1); });
  fill += 'V' + base + 'Z';
  const caps = new Map();
  heights.forEach((height, x) => {
    caps.set(x + ',' + (base - height), '#3b3470');
    if (height > hi - 3) caps.set(x + ',' + (base - height + 1), '#6f5fc2');
  });
  return { fill, caps: cellsToPaths(caps) };
}

const Mountains = memo(function Mountains() {
  const far = useMemo(() => ridge(5, 500, 16, 46, 60), []);
  const near = useMemo(() => ridge(19, 500, 8, 26, 60), []);
  return (
    <svg className="wl-art mountains" viewBox="0 0 500 60" style={{ '--w': 500, '--h': 60 }} shapeRendering="crispEdges" aria-hidden="true">
      <path d={far.fill} fill="#1d1b42" />
      <Paths paths={far.caps} />
      <path d={near.fill} fill="#14152e" />
      <Paths paths={near.caps.map((path) => ({ ...path, colour: path.colour === '#3b3470' ? '#242250' : '#3b3470' }))} />
    </svg>
  );
});

const TREE = { dark: '#0a191d', mid: '#0e2426', lite: '#133130', bloom: '#4b3f8c', trunk: '#1a1524' };

function roundTree(put, random, cx, base, h) {
  const trunk = Math.max(5, Math.floor(h * 0.32));
  const rad = Math.floor((h - trunk) / 2);
  const cy = base - trunk - rad;
  for (let dy = -rad; dy <= rad; dy += 1) {
    const half = Math.round(Math.sqrt(rad * rad - dy * dy) * 1.15);
    for (let dx = -half; dx <= half; dx += 1) {
      const lit = dx < -half * 0.35 && dy < rad * 0.3;
      put(cx + dx, cy + dy, lit ? TREE.lite : dx > half * 0.4 ? TREE.dark : TREE.mid);
      if (random() < 0.018) put(cx + dx, cy + dy, TREE.bloom);
    }
  }
  for (let y = base - trunk; y < base; y += 1) { put(cx, y, TREE.trunk); put(cx + 1, y, TREE.trunk); }
}

function pineTree(put, cx, base, h) {
  const trunk = 3;
  const tiers = Math.max(3, Math.floor(h / 7));
  const tierH = Math.ceil((h - trunk) / tiers);
  for (let i = 0; i < h - trunk; i += 1) {
    const half = 1 + Math.floor(i / tierH) * 2 + Math.floor((i % tierH) * 0.7);
    for (let dx = -half; dx <= half; dx += 1) put(cx + dx, base - h + i, dx < -half * 0.3 ? TREE.lite : dx > half * 0.5 ? TREE.dark : TREE.mid);
  }
  for (let y = base - trunk; y < base; y += 1) put(cx, y, TREE.trunk);
}

const TERRACE = 56;
const LIT = ['#ffd9a3', '#BBA9FF', '#A9F06D'];

// Trees and houses behind the terrace wall. Windows are separate rects so some can blink.
function buildMid() {
  const random = seeded(77);
  const trees = new Map();
  const houses = new Map();
  const putTo = (map) => (x, y, colour) => { if (x >= 0 && x < 500 && y >= 0 && y < 70) map.set(x + ',' + y, colour); };
  const putTree = putTo(trees);
  const putHouse = putTo(houses);
  const windows = [];

  for (let x = 8; x < 492; x += 9 + Math.floor(random() * 15)) {
    const h = 22 + Math.floor(random() * 15);
    if (random() < 0.42) pineTree(putTree, x, TERRACE, h);
    else roundTree(putTree, random, x, TERRACE, h);
  }

  let x = -4;
  while (x < 500) {
    const w = 18 + Math.floor(random() * 14);
    const h = 11 + Math.floor(random() * 9);
    const top = TERRACE - h;
    for (let yy = top; yy < TERRACE; yy += 1) {
      for (let xx = x; xx < x + w; xx += 1) putHouse(xx, yy, xx > x + w - 3 ? '#0b0f1a' : '#121827');
    }
    if (random() < 0.6) {
      for (let i = 0; i < Math.floor(w / 2); i += 1) {
        for (let xx = x + i; xx < x + w - i; xx += 1) putHouse(xx, top - 1 - i, xx < x + w * 0.4 ? '#262f50' : '#1a2138');
      }
      putHouse(x + w - 5, top - 6, '#1a2138'); putHouse(x + w - 5, top - 5, '#1a2138');
      putHouse(x + w - 4, top - 6, '#1a2138'); putHouse(x + w - 4, top - 5, '#1a2138');
    } else {
      for (let xx = x - 1; xx < x + w + 1; xx += 1) putHouse(xx, top - 1, '#262f50');
    }
    for (let wx = x + 3; wx < x + w - 4; wx += 6) {
      for (let wy = top + 3; wy < TERRACE - 3; wy += 6) {
        if (random() < 0.62) {
          windows.push({ x: wx, y: wy, c: LIT[Math.floor(random() * LIT.length)], blink: random() < 0.3, delay: -(random() * 6).toFixed(1) });
        }
      }
    }
    x += w + 1 + Math.floor(random() * 5);
  }
  return { trees: cellsToPaths(trees), houses: cellsToPaths(houses), windows };
}

const MidArt = memo(function MidArt() {
  const art = useMemo(buildMid, []);
  return (
    <>
      <svg className="wl-art mid-art" viewBox="0 0 500 70" style={{ '--w': 500, '--h': 70 }} shapeRendering="crispEdges" aria-hidden="true">
        <g className="mg-trees"><Paths paths={art.trees} /></g>
        <g className="mg-houses">
          <Paths paths={art.houses} />
          {art.windows.map((win, index) => (
            <rect
              key={index}
              className={win.blink ? 'mg-win mg-win--blink' : 'mg-win'}
              x={win.x} y={win.y} width="2" height="3" fill={win.c}
              style={win.blink ? { '--window-delay': win.delay + 's' } : undefined}
            />
          ))}
        </g>
      </svg>
      {PLATFORMS.map((platform) => <Platform key={platform.id} platform={platform} />)}
    </>
  );
});

// ---- Platform and front-object pixel art ----
const OBJ = {
  o: '#0b0d18', w: '#4a3550', l: '#6e4a58', m: '#3b3470', M: '#6f5fc2', b: '#251f4a', L: '#BBA9FF',
  s: '#2a3447', S: '#3f4a64', g: '#A9F06D', r: '#1d1a38', q: '#14122a', c: '#2f2a5e', y: '#ffd9a3',
};

const boxRows = (w, h) => Array.from({ length: h }, (_, y) => (y === 0 || y === h - 1
  ? 'o'.repeat(w)
  : 'o' + Array.from({ length: w - 2 }, (__, x) => (x === y - 1 || x === w - 2 - y ? 'l' : 'w')).join('') + 'o'));
const padRows = (rows, width, left) => rows.map((row) => '.'.repeat(left) + row + '.'.repeat(width - left - row.length));

function platformRows(id) {
  if (id === 'crates') return [...padRows(boxRows(10, 6), 16, 5), ...boxRows(16, 7)];
  if (id === 'tank') {
    const barrel = ['oLLLLLLLLLLLLLLLLLLo'];
    for (let i = 1; i < 14; i += 1) barrel.push(i % 5 === 0 ? 'o' + 'b'.repeat(18) + 'o' : 'oM' + 'm'.repeat(16) + 'bo');
    barrel.push('o'.repeat(20));
    const legs = Array.from({ length: 8 }, (_, i) => (i % 2 === 0 ? 'ooooo' : 'o...o') + '.'.repeat(11) + 'oo' + '..');
    return [...barrel, ...legs];
  }
  const random = seeded(3);
  const wall = ['S'.repeat(26).replace(/S/g, () => (random() < 0.12 ? 'g' : 'S'))];
  for (let i = 1; i < 7; i += 1) wall.push(Array.from({ length: 26 }, (_, x) => ((x + i * 3) % 7 === 0 ? 'o' : 's')).join(''));
  return wall;
}

const PLATFORM_ART = Object.fromEntries(PLATFORMS.map((p) => [p.id, pixelPaths(platformRows(p.id))]));

const Platform = memo(function Platform({ platform }) {
  const rows = platformRows(platform.id);
  return (
    <svg
      className="mg-platform"
      viewBox={'0 0 ' + rows[0].length + ' ' + rows.length}
      style={{ '--w': rows[0].length, '--h': rows.length, '--x': platform.x }}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {PLATFORM_ART[platform.id].map((path) => <path key={path.colour} d={path.d} fill={OBJ[path.colour]} />)}
    </svg>
  );
});

const CHIMNEY = (() => {
  const rows = ['cccccccccccccc', 'cccccccccccccc', '.cccccccccccc.'];
  for (let i = 0; i < 31; i += 1) rows.push('..' + (i % 3 === 0 ? 'q'.repeat(10) : 'L' + 'r'.repeat(9)) + '..');
  return pixelPaths(rows);
})();
const LANTERN = (() => {
  const rows = ['..oooooo..', '.ogyyyygo.', '.oyyyyyyo.', '.oyyyyyyo.', '..oooooo..', '....oo....'];
  for (let i = 0; i < 30; i += 1) rows.push('....oo....');
  return pixelPaths(rows.map((row) => row.padEnd(10, '.')));
})();

const FrontObject = memo(function FrontObject({ object }) {
  const art = object.id === 'chimney' ? CHIMNEY : LANTERN;
  const width = object.id === 'chimney' ? 14 : 10;
  const height = object.id === 'chimney' ? 34 : 36;
  return (
    <div className={'mg-front mg-front--' + object.id} style={{ '--x': object.x, '--w': width, '--h': height }}>
      <svg viewBox={'0 0 ' + width + ' ' + height} shapeRendering="crispEdges" aria-hidden="true">
        {art.map((path) => <path key={path.colour} d={path.d} fill={OBJ[path.colour]} />)}
      </svg>
      {object.id === 'chimney' && <span className="mg-smoke"><i /><i /><i /></span>}
      {object.id === 'lantern' && <i className="mg-lantern-glow" />}
    </div>
  );
});

const MidFront = memo(function MidFront() {
  return (
    <>
      <div className="mg-wall" />
      {FRONT_OBJECTS.map((object) => <FrontObject key={object.id} object={object} />)}
    </>
  );
});

// Grass tiles are generated once as data-URI SVGs and repeated with CSS, so they cost no DOM.
function grassTile(seed, hMax, palette) {
  const random = seeded(seed);
  const cells = new Map();
  let x = 0;
  while (x < 64) {
    const h = 3 + Math.floor(random() * (hMax - 3));
    const w = random() < 0.3 ? 2 : 1;
    for (let dx = 0; dx < w && x + dx < 64; dx += 1) {
      for (let y = 0; y < h; y += 1) cells.set((x + dx) + ',' + (14 - 1 - y), y > h - 2 && random() < 0.35 ? palette[1] : palette[0]);
    }
    if (random() < 0.035) cells.set(x + ',' + (14 - h - 1), palette[2]);
    x += w + (random() < 0.5 ? 0 : 1);
  }
  const body = cellsToPaths(cells).map((p) => '<path d="' + p.d + '" fill="' + p.colour + '"/>').join('');
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 14" shape-rendering="crispEdges">' + body + '</svg>';
  return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
}

const Foreground = memo(function Foreground() {
  const back = useMemo(() => grassTile(31, 12, ['#10241c', '#1a3b2b', '#7a6bd0']), []);
  const front = useMemo(() => grassTile(8, 9, ['#0a1511', '#122b20', '#A9F06D']), []);
  return (
    <div className="fg" aria-hidden="true">
      <div className="fg__in">
        <div className="fg__grass fg__grass--back" style={{ backgroundImage: back }} />
        <div className="fg__grass fg__grass--front" style={{ backgroundImage: front }} />
      </div>
    </div>
  );
});

const MOTES = Array.from({ length: 12 }, (_, index) => ({
  '--left': ((index * 53 + 7) % 100) + '%',
  '--rise-delay': '-' + ((index * 1.7) % 14) + 's',
  '--rise-duration': (14 + ((index * 5) % 9)) + 's',
  '--drift': (((index % 5) - 2) * 14) + 'px',
}));

export const Sky = memo(function Sky() {
  const world = useRef(null);
  useWorld(world);
  const first = useMemo(() => stars(42, 3, '#EAF0F7'), []);
  const second = useMemo(() => stars(22, 9, '#BBA9FF'), []);
  const fireflies = useMemo(() => Array.from({ length: 8 }, (_, index) => ({
    '--left': ((index * 47 + 13) % 100) + '%',
    '--top': (40 + ((index * 31 + 9) % 52)) + '%',
    '--float-delay': '-' + ((index * 0.61) % 8) + 's',
    '--float-duration': (5 + ((index * 3) % 7)) + 's',
    '--fly-size': (index % 3 === 0 ? '4px' : '2px'),
  })), []);

  return (
    <div className="world" ref={world} data-scene="top">
      <div className="sky" aria-hidden="true">
        <div className="sky__dusk" />
        <div className="sky__nightfall" />
        <div className="sky__nebula" />
        <div className="sky__stars">
          <i style={{ boxShadow: first }} />
          <i className="twinkle" style={{ boxShadow: second }} />
        </div>
        <i className="moon" />
        <i className="shoot" />
        <i className="cloud c1" />
        <i className="cloud c2" />
        <i className="cloud cloud--pass" />
        <div className="sky__horizon" />
        <div className="wl wl--mountains"><div className="wl__in"><Mountains /></div></div>
        <div className="wl wl--city"><div className="wl__in"><Cityscape className="cityscape--world" /></div></div>
        <div className="sky__fireflies">
          {fireflies.map((style, index) => <i key={index} style={style} />)}
        </div>
        <div className="sky__motes">
          {MOTES.map((style, index) => <i key={index} style={style} />)}
        </div>
        <div className="wl wl--mid"><div className="wl__in"><MidArt /></div></div>
        <Companion />
        <div className="wl wl--midfront"><div className="wl__in"><MidFront /></div></div>
        <div className="sky__groundlight" />
      </div>
      <Foreground />
    </div>
  );
});
