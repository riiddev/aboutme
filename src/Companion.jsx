import { memo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MiniSprite, pixelPaths } from './PixelArt.jsx';
import { NOTE } from './data.js';
import { Companion as Engine } from './companion.js';
import { useReducedMotion } from './lib.js';

// Tiny emote glyphs on the same pixel grid as the sprite.
const GLYPHS = {
  alert: ['.#.', '.#.', '.#.', '...', '.#.'],
  q: ['.##.', '#..#', '..#.', '....', '..#.'],
  dots: ['.......', '.......', '#.#.#..'],
  z: ['###', '..#', '.#.', '#..', '###'],
  spark: ['..#..', '..#..', '#####', '..#..', '..#..'],
  note: NOTE,
};
const TONE = { alert: '#A9F06D', q: '#BBA9FF', dots: '#EAF0F7', z: '#BBA9FF', spark: '#A9F06D', note: '#A9F06D' };

const Emotes = memo(function Emotes() {
  return (
    <svg className="cp__emote" viewBox="-1 -1 9 8" shapeRendering="crispEdges" aria-hidden="true">
      {Object.entries(GLYPHS).map(([name, rows]) => (
        <g key={name} data-g={name}>
          {pixelPaths(rows).map((p) => <path key={p.colour} d={p.d} fill={TONE[name]} />)}
        </g>
      ))}
    </svg>
  );
});

// A tiny, autonomous copy of the portfolio character. Everything it does lives in companion.js;
// React only renders the static DOM once. The layer is decorative: aria-hidden and pointer-events: none.
export default function Companion({ enabled = true }) {
  const layer = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!enabled || !layer.current) return undefined;
    const engine = new Engine(layer.current, { calm: reduced });
    engine.start();
    return () => engine.stop();
  }, [enabled, reduced]);

  return createPortal(
    <div ref={layer} className="cp-layer" aria-hidden="true">
      <div className="cp" data-state="idle" data-pose="stand">
        <i className="cp__shadow" />
        <div className="cp__flip"><MiniSprite /></div>
        <div className="cp__dust"><i /><i /><i /><i /></div>
        <Emotes />
      </div>
    </div>,
    document.body,
  );
}
