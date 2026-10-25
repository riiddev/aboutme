import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReduced, sectionStore } from './lib.js';

gsap.registerPlugin(ScrollTrigger);

const rand = (min, max) => min + Math.random() * (max - min);
const vh = (fraction) => () => window.innerHeight * fraction;
const vw = (fraction) => () => window.innerWidth * fraction;

// Pointer depth: [selector, x px, y px]. Nearer layers travel further, opposite to the pointer.
const POINTER_LAYERS = [
  ['.wl--mountains .wl__in', 4, 2],
  ['.wl--city .wl__in', 9, 4],
  ['.wl--mid .wl__in', 18, 7],
  ['.wl--midfront .wl__in', 18, 7],
  ['.fg__in', 34, 10],
];

/*
 * Drives the whole background. Everything here animates transforms or opacity on a
 * handful of layer elements; nothing writes CSS variables to <html> and nothing uses
 * filters, so a scroll tick costs a few compositor-friendly style writes.
 *
 *  - one scrubbed timeline (page progress 0..1): dusk -> night, moon, stars, layer rise
 *  - one scrubbed tween on the hero: the city recedes so text stays readable
 *  - data-scene on the wrapper follows the active section; CSS transitions do the reveals
 *  - pointer parallax via quickTo (no per-move React or style-variable work)
 *  - rare environmental surprises: a passing cloud, a shooting star
 */
export function useWorld(ref) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const reduced = prefersReduced();
    let alive = true;
    const timers = new Set();

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        paused: reduced,
        scrollTrigger: reduced ? undefined : { start: 0, end: 'max', scrub: true, invalidateOnRefresh: true },
      });

      timeline
        .to('.sky__dusk', { opacity: 0, duration: 0.62 }, 0)
        .fromTo('.sky__nightfall', { opacity: 0.12 }, { opacity: 1, duration: 0.78 }, 0)
        .fromTo('.sky__nebula', { opacity: 0 }, { opacity: 0.7, duration: 1 }, 0)
        .fromTo('.sky__stars', { opacity: 0.35 }, { opacity: 1, duration: 0.5 }, 0)
        .fromTo('.sky__horizon', { opacity: 0.3 }, { opacity: 0.8, duration: 1 }, 0)
        .fromTo('.sky__groundlight', { opacity: 0 }, { opacity: 0.6, duration: 1 }, 0)
        .fromTo('.moon', { opacity: 0, x: vw(0.04), y: vh(0.1) }, { opacity: 1, x: vw(-0.12), y: vh(-0.03), duration: 0.7 }, 0.12)
        .fromTo('.cityscape__window-glow', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0)
        .fromTo('.cityscape__shade', { opacity: 0 }, { opacity: 0.4, duration: 0.6 }, 0.1)
        // Layers rise at different rates; each has extra art or fill beneath it so no gap opens.
        .to('.wl--mountains', { y: vh(-0.03), duration: 1 }, 0)
        .to('.wl--city', { y: vh(-0.05), duration: 1 }, 0)
        .to('.wl--mid, .wl--midfront', { y: vh(-0.08), duration: 1 }, 0);

      if (reduced) {
        timeline.progress(0.4);
        return;
      }

      // The skyline fades back once the hero is behind you, so project text never fights window lights.
      const hero = document.getElementById('top');
      if (hero) {
        gsap.to('.wl--city', {
          opacity: 0.38, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
        });
      }
    }, root);

    // Scene state: the active section selects environmental reveals (see styles.css).
    const setScene = () => { root.dataset.scene = sectionStore.get(); };
    setScene();
    const unsubscribe = sectionStore.subscribe(setScene);

    // Pointer depth.
    let removePointer = () => {};
    if (!reduced && window.matchMedia('(pointer: fine)').matches) {
      const targets = POINTER_LAYERS.map(([selector, dx, dy]) => {
        const element = root.querySelector(selector);
        if (!element) return null;
        const options = { duration: 1, ease: 'power3.out' };
        return { dx, dy, x: gsap.quickTo(element, 'x', options), y: gsap.quickTo(element, 'y', options) };
      }).filter(Boolean);
      let frame = 0;
      let last = null;
      const move = (event) => {
        last = event;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const nx = last.clientX / Math.max(1, window.innerWidth) - 0.5;
          const ny = last.clientY / Math.max(1, window.innerHeight) - 0.5;
          targets.forEach((target) => { target.x(-nx * target.dx * 2); target.y(-ny * target.dy * 2); });
        });
      };
      window.addEventListener('pointermove', move, { passive: true });
      removePointer = () => {
        window.removeEventListener('pointermove', move);
        if (frame) cancelAnimationFrame(frame);
      };
    }

    // Occasional surprises, scheduled with jitter and skipped while the tab is hidden.
    const every = (min, max, fn) => {
      const loop = () => {
        if (!alive) return;
        const call = gsap.delayedCall(rand(min, max), () => {
          timers.delete(call);
          if (!document.hidden) fn();
          loop();
        });
        timers.add(call);
      };
      loop();
    };

    if (!reduced) {
      every(24, 42, () => {
        if (!['top', 'about', 'projects'].includes(sectionStore.get())) return;
        const cloud = root.querySelector('.cloud--pass');
        if (!cloud) return;
        gsap.fromTo(cloud,
          { x: -300, y: rand(0.08, 0.34) * window.innerHeight, autoAlpha: 0.55 },
          { x: window.innerWidth + 300, duration: rand(30, 42), ease: 'none', onComplete: () => gsap.set(cloud, { autoAlpha: 0 }) });
      });

      every(16, 34, () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max <= 0 || window.scrollY / max < 0.3) return;
        const star = root.querySelector('.shoot');
        if (!star) return;
        const x = rand(0.08, 0.6) * window.innerWidth;
        const y = rand(0.04, 0.26) * window.innerHeight;
        gsap.timeline()
          .set(star, { x, y, autoAlpha: 1 })
          .to(star, { x: x + 220, y: y + 110, duration: 0.55, ease: 'power1.in' })
          .set(star, { autoAlpha: 0 });
      });
    }

    return () => {
      alive = false;
      timers.forEach((call) => call.kill());
      timers.clear();
      unsubscribe();
      removePointer();
      ctx.revert();
    };
  }, [ref]);
}
