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
  angry = false,
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
        className={'sprite sprite--img ' + className + (angry ? ' sprite--angry' : '')}
        style={style}
      />
    );
  }

  return (
    <svg
      className={'sprite ' + className + (angry ? ' sprite--angry' : '')}
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
        {angry && (
          <g className="sprite__anger" shapeRendering="crispEdges" aria-hidden="true">
            <path d="M7 6h4v1H9v1H8V7H7z M13 7V6h4v1h-2v1h-1V7z" fill="#c0526b" />
            <path d="M20 2h1v2h-1z M22 4h1v1h-1z" fill="#ff7f87" />
          </g>
        )}
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

// ---- Companion sprite -------------------------------------------------------
// The same character, split into movable parts (head, torso, two legs) so the tiny
// roaming companion can reuse the existing art instead of introducing new artwork.
const LEG_START = ROWS.findIndex((row, index) => index > HEAD_ROWS && row[11] === '.' && row[12] === '.');
const TORSO = pixelPaths(ROWS.slice(HEAD_ROWS, LEG_START), HEAD_ROWS);
const LEG_L = pixelPaths(ROWS.slice(LEG_START).map((row) => row.slice(0, 12).padEnd(24, '.')), LEG_START);
const LEG_R = pixelPaths(ROWS.slice(LEG_START).map((row) => '.'.repeat(12) + row.slice(12)), LEG_START);
const paint = (paths) => paths.map((path) => <path key={path.colour} d={path.d} fill={PALETTE[path.colour]} />);

// Sleeves and hands use the sprite's own shirt and skin colours; they only show while
// the companion waves, cheers, pushes, or hangs from a ledge.
const SLEEVE = PALETTE.N;
const HAND = PALETTE.S;

export const MiniSprite = memo(function MiniSprite() {
  return (
    <svg className="cp__svg" viewBox="-4 -8 32 50" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <g className="cp__legL">{paint(LEG_L)}</g>
      <g className="cp__legR">{paint(LEG_R)}</g>
      <g className="cp__torso">{paint(TORSO)}</g>
      <g className="cp__armB">
        <rect x="1" y="15" width="2" height="6" fill={SLEEVE} />
        <rect x="1" y="21" width="2" height="2" fill={HAND} />
      </g>
      <g className="cp__headA">
        <g className="cp__head">
          {paint(HEAD)}
          <g className="cp__eyesA">
            <g className="cp__blink">{paint(EYES)}</g>
          </g>
        </g>
      </g>
      <g className="cp__armF">
        <rect x="21" y="15" width="2" height="6" fill={SLEEVE} />
        <rect x="21" y="21" width="2" height="2" fill={HAND} />
      </g>
      <g className="cp__hang">
        <rect x="21" y="-3" width="2" height="19" fill={SLEEVE} />
        <rect x="20" y="-5" width="4" height="2" fill={HAND} />
        <rect x="1" y="15" width="2" height="5" fill={SLEEVE} />
        <rect x="1" y="20" width="2" height="2" fill={HAND} />
      </g>
    </svg>
  );
});
