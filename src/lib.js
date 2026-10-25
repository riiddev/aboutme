import { useSyncExternalStore } from 'react';

const mq = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null;

export const prefersReduced = () => Boolean(mq && mq.matches);

export const useReducedMotion = () => useSyncExternalStore(
  (cb) => {
    if (!mq) return () => {};
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
  },
  prefersReduced,
  () => false,
);

// Small external stores let the character react without rerendering the entire app.
export function createStore(initial) {
  let value = initial;
  const subs = new Set();

  return {
    get: () => value,
    set(next) {
      if (next !== value) {
        value = next;
        subs.forEach((fn) => fn());
      }
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}

export const useStore = (store) => useSyncExternalStore(
  store.subscribe,
  store.get,
  store.get,
);

export const sectionStore = createStore('top');
export const moodStore = createStore('top');
export const resetMood = () => moodStore.set(sectionStore.get());

// Shared scroll controller lets navigation use the same weighted motion as wheel scrolling.
let smoothScroller = null;
let scrollLocked = false;
export const setSmoothScroller = (instance) => {
  smoothScroller = instance;
  if (instance && scrollLocked) instance.stop();
};

// The intro locks scrolling (native and Lenis) until its handoff.
export function setScrollLocked(on) {
  scrollLocked = on;
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('is-intro', on);
  if (!smoothScroller) return;
  if (on) smoothScroller.stop();
  else smoothScroller.start();
}

export const moodProps = (key) => ({
  onPointerEnter: () => moodStore.set(key),
  onPointerLeave: resetMood,
  onFocus: () => moodStore.set(key),
  onBlur: resetMood,
});

export function goTo(id, event) {
  event?.preventDefault();
  const element = document.getElementById(id);
  if (!element) return;

  const reduced = prefersReduced();
  if (!reduced && smoothScroller) {
    const hud = document.querySelector('.hud');
    const offset = -(hud?.getBoundingClientRect().height ?? 74) - 14;
    smoothScroller.scrollTo(element, {
      offset,
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
  } else {
    element.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start',
    });
  }
  history.replaceState(null, '', '#' + id);
  element.focus({ preventScroll: true });

  if (!reduced) {
    event?.currentTarget?.animate?.(
      [{ transform: 'translateY(0)' }, { transform: 'translateY(-4px)' }, { transform: 'translateY(0)' }],
      { duration: 180, easing: 'steps(3)' },
    );
  }
}

// ---- Shared world geometry ----
// One "unit" is the pixel size of the environment art. It must match --u in styles.css: max(2px, .2vw).
export const unit = () => Math.max(2, window.innerWidth * 0.002);
// The mid-ground art is 500 units wide and centred, so a world X (0..500) maps to the viewport like this.
export const worldX = (X) => window.innerWidth / 2 + (X - 250) * unit();

// Things the companion can stand on. x = centre in world units, w = width, top = height above the terrace line.
export const PLATFORMS = [
  { id: 'crates', x: 118, w: 16, top: 13 },
  { id: 'tank', x: 318, w: 20, top: 23, ladder: true },
  { id: 'bench', x: 438, w: 26, top: 7 },
];

// Objects drawn in front of the companion, so he can walk behind them.
export const FRONT_OBJECTS = [
  { id: 'chimney', x: 214 },
  { id: 'lantern', x: 372 },
];
