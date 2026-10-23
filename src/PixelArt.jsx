import { memo } from 'react';
import { PALETTE, SPRITE, CHEST, CHEST_PALETTE, NOTE, PORTRAIT_SRC } from './data.js';

// Group pixels by colour into one SVG path each to keep the DOM light.
export function pixelPaths(rows, y0 = 0) {
  const by = {};

  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x += 1) {
      const colour = row[x];
      if (colour !== '.') {
        (by[colour] ||= []).push('M' + x + ' ' + (y + y0) + 'h1v1h-1z');
      }
    }
  });

  return Object.entries(by).map(([colour, segments]) => ({
    colour,
    d: segments.join(''),
  }));
}

const ROWS = SPRITE.map((row) => row.padEnd(24, '.').slice(0, 24));
const HEAD_ROWS = 13;
const HEAD = pixelPaths(ROWS.slice(0, HEAD_ROWS).map((row) => row.replaceAll('Y', 'S')));
const BODY = pixelPaths(ROWS.slice(HEAD_ROWS), HEAD_ROWS);
const EYES = pixelPaths(ROWS.slice(0, HEAD_ROWS).map((row) => row.replace(/[^Y]/g, '.')));

export const Sprite = memo(function Sprite({
  px = 10,
  crop = 40,
  eyesRef,
  decorative = false,
  className = '',
}) {
  const style = { '--px': px, width: (px * 24) + 'px' };
  const a11y = decorative
    ? { 'aria-hidden': true }
    : { role: 'img', 'aria-label': 'Pixel portrait of Riiddev' };

  if (PORTRAIT_SRC) {
    return (
      <img
        src={PORTRAIT_SRC}
        alt={decorative ? '' : 'Pixel portrait of Riiddev'}
        className={'sprite sprite--img ' + className}
        style={style}
      />
    );
  }

  return (
    <svg
      className={'sprite ' + className}
      style={style}
      viewBox={'0 0 24 ' + crop}
      shapeRendering="crispEdges"
      {...a11y}
    >
      <g className="sprite__body">
        {BODY.map((path) => <path key={path.colour} d={path.d} fill={PALETTE[path.colour]} />)}
      </g>
      <g className="sprite__head">
        {HEAD.map((path) => <path key={path.colour} d={path.d} fill={PALETTE[path.colour]} />)}
        <g ref={eyesRef}>
          <g className="sprite__blink">
            {EYES.map((path) => <path key={path.colour} d={path.d} fill={PALETTE[path.colour]} />)}
          </g>
        </g>
      </g>
    </svg>
  );
});

const LID = pixelPaths(CHEST.slice(0, 5));
const BASE = pixelPaths(CHEST.slice(5), 5);

export const Chest = memo(function Chest() {
  return (
    <svg className="chest" viewBox="0 -4 12 14" shapeRendering="crispEdges" aria-hidden="true">
      <rect className="chest__glow" x="1" y="4" width="10" height="1" fill={CHEST_PALETTE.y} />
      <g>{BASE.map((path) => <path key={path.colour} d={path.d} fill={CHEST_PALETTE[path.colour]} />)}</g>
      <g className="chest__lid">{LID.map((path) => <path key={path.colour} d={path.d} fill={CHEST_PALETTE[path.colour]} />)}</g>
    </svg>
  );
});

const NOTE_D = pixelPaths(NOTE).map((path) => path.d).join('');

export const Note = ({ className = '', style }) => (
  <svg className={className} style={style} viewBox="0 0 5 6" shapeRendering="crispEdges" aria-hidden="true">
    <path d={NOTE_D} fill="currentColor" />
  </svg>
);