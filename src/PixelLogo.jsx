import { memo } from 'react';

const PALETTES = {
  html: { O: '#E34F26', R: '#F06529', W: '#FFFFFF' },
  css: { B: '#1572B6', C: '#33A9DC', W: '#FFFFFF' },
  javascript: { Y: '#F7DF1E', K: '#171717' },
  typescript: { B: '#3178C6', W: '#FFFFFF' },
  appsScript: { R: '#EA4335', Y: '#FBBC04', G: '#34A853', B: '#4285F4', W: '#0D1118' },
  react: { C: '#61DAFB' },
  vite: { P: '#8B5CF6', B: '#41D1FF', Y: '#FFD62E' },
  gsap: { G: '#88CE02' },
  remotion: { B: '#0B84F3', C: '#67C7FF', W: '#EAF0F7' },
  github: { K: '#0D1118', W: '#EAF0F7', G: '#A9F06D' },
};

const GRIDS = {
  html: [
    '....OOOOOOOO....',
    '...OOOOOOOOOO...',
    '...OOOOOOOOOO...',
    '...OOOWWWWWWOO...',
    '...OOOWWWWWWOO...',
    '...OOOOWWWWOOO...',
    '...OOOOOOWWWOO...',
    '...OOOOOOWWWOO...',
    '...OOOWWWWWWOO...',
    '...OOOWWWWWWOO...',
    '...OOOOOOWWWOO...',
    '...OOOOOOWWWOO...',
    '...OOOOOOWWWOO...',
    '...OOOOOOWWWOO...',
    '....OOOOOOOO....',
    '.....OOOOOO.....',
  ],
  css: [
    '....BBBBBBBB....',
    '...BBBBBBBBBB...',
    '...BBBBBBBBBB...',
    '...BBBWWWWBBB...',
    '...BBBWWWWBBB...',
    '...BBBBWWWWBB...',
    '...BBBBBBBBBB...',
    '...BBBBWWWWBB...',
    '...BBBBWWWWBB...',
    '...BBBWWWWBBB...',
    '...BBBWWWWBBB...',
    '...BBBBBBBBBB...',
    '...BBBBBBBBBB...',
    '...BBBBBBBBBB...',
    '....BBBBBBBB....',
    '.....BBBBBB.....',
  ],
  javascript: [
    'YYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYY',
  ],
  typescript: [
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
  ],
  appsScript: [
    '......GG........',
    '.....GGGGB......',
    '....GG.RRBB.....',
    '...GG.RRRRBB....',
    '..YY..RRRRBB....',
    '.YYYY..RRBB.....',
    'YYYYYY..BB......',
    'YYYYYY.BBBB.....',
    '.YYYY.BBBBBB....',
    '..YY.BBBBBBBB...',
    '.....BBBBBBBB...',
    '......BBBBBB....',
    '.......BBBB.....',
    '........BB......',
    '................',
    '................',
  ],
  react: [
    '....CCCCCCCC....',
    '..CCC......CCC..',
    '.CC..CC..CC..CC.',
    'CC....C..C....CC',
    'C.CC..C..C..CC.C',
    'C...CCCCCCCC...C',
    '.C.CC.CCCC.CC.C.',
    '..C..CCCCCC..C..',
    '..C..CCCCCC..C..',
    '.C.CC.CCCC.CC.C.',
    'C...CCCCCCCC...C',
    'C.CC..C..C..CC.C',
    'CC....C..C....CC',
    '.CC..CC..CC..CC.',
    '..CCC......CCC..',
    '....CCCCCCCC....',
  ],
  vite: [
    '.......PP.......',
    '......PPPP......',
    '..BBBBPPPPPPP...',
    '..BBBBBPPPPPP...',
    '...BBBBPPPPP....',
    '....BBBBPPPP....',
    '.....BBBBPPP....',
    '......BBBBPP....',
    '.......BBBPP....',
    '........BBPP....',
    '.........BPP....',
    '.........YY.....',
    '........YYY.....',
    '.......YYY......',
    '......YY........',
    '.....Y..........',
  ],
  gsap: [
    '................',
    '.GGGG..GGGGG.GGG.',
    'GG....GG...G.G..G',
    'GG....GG...G.G..G',
    'GGGG..GGGGG.GGG.',
    '...GG.GG...G.G...',
    '...GG.GG...G.G...',
    '.GGGG.GG...G.G...',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  remotion: [
    '................',
    '....CCCC........',
    '....CCCCBB......',
    '....CCCCBBBB....',
    '....CCCCBBBBBB..',
    '....BBBBBBBBBBB.',
    '....BBBBBBBBBB..',
    '....BBBBBBBB....',
    '....BBBBBB......',
    '....BBBB........',
    '....BB..........',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  github: [
    '....WW....WW....',
    '...WWWW..WWWW...',
    '..WWWWWWWWWWWW..',
    '.WWWWWWWWWWWWWW.',
    '.WWW.WWWWWW.WWW.',
    'WWWW.WWWWWW.WWWW',
    'WWWW.WWWWWW.WWWW',
    'WWWWWWWWWWWWWWWW',
    '..WWWWWWWWWWWW..',
    '...WWWWWWWWWW...',
    '....WWWWWWWW....',
    '.....WWWWWW.....',
    '.....WW..WW.....',
    '....WW....WW....',
    '...WW......WW...',
    '................',
  ],
};

const GLYPHS = {
  J: ['.###.', '..##.', '..##.', '..##.', '..##.', '##.#.', '.###.'],
  S: ['.####', '##...', '##...', '.###.', '...##', '...##', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  A: ['.###.', '##.##', '##.##', '#####', '##.##', '##.##', '##.##'],
  P: ['####.', '##.##', '##.##', '####.', '##...', '##...', '##...'],
  '5': ['#####', '##...', '##...', '####.', '...##', '...##', '####.'],
  '3': ['####.', '...##', '...##', '.###.', '...##', '...##', '####.'],
};

function PixelText({ text, x, y, color, scale = 1, gap = 1 }) {
  let offset = x;
  const blocks = [];
  [...text].forEach((letter) => {
    (GLYPHS[letter] || []).forEach((row, rowIndex) => {
      [...row].forEach((cell, colIndex) => {
        if (cell === '#') blocks.push(
          <rect key={letter + offset + '-' + rowIndex + '-' + colIndex}
            x={offset + colIndex * scale} y={y + rowIndex * scale}
            width={scale} height={scale} fill={color} />,
        );
      });
    });
    offset += 5 * scale + gap;
  });
  return blocks;
}

function cellsFrom(grid, palette) {
  return grid.flatMap((row, y) => [...row].map((token, x) => (
    token !== '.' && palette[token]
      ? <rect key={x + '-' + y} x={x} y={y} width="1" height="1" fill={palette[token]} />
      : null
  )));
}

const PixelLogo = memo(function PixelLogo({ name, className = '' }) {
  const palette = PALETTES[name] || PALETTES.github;
  return (
    <svg
      className={'pixel-logo pixel-logo--' + name + ' ' + className}
      viewBox="0 0 16 16"
      role="img"
      aria-label={name === 'appsScript' ? 'Google Apps Script logo in pixel art' : name + ' logo in pixel art'}
      shapeRendering="crispEdges"
    >
      {cellsFrom(GRIDS[name] || GRIDS.github, palette)}
      {name === 'html' && <PixelText text="5" x={5} y={4} color={palette.W} scale={1} gap={0} />}
      {name === 'css' && <PixelText text="3" x={5} y={4} color={palette.W} scale={1} gap={0} />}
      {name === 'javascript' && <PixelText text="JS" x={2} y={8} color={palette.K} scale={1} gap={1} />}
      {name === 'typescript' && <PixelText text="TS" x={2} y={8} color={palette.W} scale={1} gap={1} />}
      {name === 'gsap' && <PixelText text="GSAP" x={1} y={4} color={palette.G} scale={0.75} gap={0.2} />}
    </svg>
  );
});

export default PixelLogo;