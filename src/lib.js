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
export const setSmoothScroller = (instance) => { smoothScroller = instance; };
export const getSmoothScroller = () => smoothScroller;

// The opening sequence plays once per browser; the footer offers a replay.
const INTRO_KEY = 'riiddev:intro:v1';
export const hasSeenIntro = () => {
  try { return window.localStorage.getItem(INTRO_KEY) === '1'; } catch { return false; }
};
export const markIntroSeen = () => {
  try { window.localStorage.setItem(INTRO_KEY, '1'); } catch { /* storage unavailable: intro simply plays again */ }
};

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
