import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sprite, Note } from './PixelArt.jsx';
import { Vines, Sky, Cityscape } from './Scenery.jsx';
import { About, Projects, Skills, Activity, Contact } from './Sections.jsx';
import { NAV, SPOTIFY, LINES, MOOD_LINES } from './data.js';
import {
  useReducedMotion,
  prefersReduced,
  useStore,
  sectionStore,
  moodStore,
  moodProps,
  goTo,
} from './lib.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

// Brief, non-blocking loader. Any key or pointer press skips it.
function Loader({ onDone }) {
  const root = useRef(null);

  useEffect(() => {
    let timeline;
    const context = gsap.context(() => {
      timeline = gsap.timeline({ onComplete: onDone })
        .fromTo('.loader__fill', { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'steps(10)' })
        .to('.loader__box', { opacity: 0, duration: 0.01 }, '+=0.05')
        .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.45, ease: 'steps(6)' });
    }, root);

    const skip = () => timeline?.progress(1);
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('pointerdown', skip, { once: true });

    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
      context.revert();
    };
  }, [onDone]);

  return (
    <div ref={root} className="loader" aria-hidden="true">
      <div className="loader__box px">
        <p>Loading Riiddev's world</p>
        <div className="loader__bar"><i className="loader__fill" /></div>
        <small>Press any key to skip</small>
      </div>
    </div>
  );
}

// HUD navigation and the tiny character that travels along the progress rail.
function Hud() {
  const active = useStore(sectionStore);

  return (
    <header className="hud">
      <a className="hud__brand" href="#top" onClick={(event) => goTo('top', event)}>Riiddev</a>
      <nav aria-label="Primary">
        <ul>
          {NAV.map(([id, label]) => (
            <li key={id}>
              <a
                href={'#' + id}
                aria-current={active === id ? 'location' : undefined}
                onClick={(event) => goTo(id, event)}
                {...moodProps(id)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="hud__rail" aria-hidden="true">
        <div className="hud__fill" />
        <Sprite px={2} crop={14} decorative className="hud__head" />
      </div>
    </header>
  );
}

// The character can be picked up, gets offended, then walks back to his spawn point.
function HeroCharacter({ music }) {
  const button = useRef(null);
  const bubble = useRef(null);
  const eyes = useRef(null);
  const drag = useRef(null);
  const position = useRef({ x: 0, y: 0 });
  const returnTimeline = useRef(null);
  const angerTimer = useRef(null);
  const suppressClick = useRef(false);
  const reduced = useReducedMotion();
  const mood = useStore(moodStore);
  const [lineIndex, setLineIndex] = useState(0);
  const [angry, setAngry] = useState(false);
  const [walking, setWalking] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [facing, setFacing] = useState('home');

  useEffect(() => {
    if (reduced || !eyes.current) return undefined;

    const quickX = gsap.quickTo(eyes.current, 'x', { duration: 0.12, ease: 'none' });
    const quickY = gsap.quickTo(eyes.current, 'y', { duration: 0.12, ease: 'none' });
    let frame = 0;
    let last = null;
    const look = () => {
      frame = 0;
      if (!last || !button.current) return;
      const rect = button.current.getBoundingClientRect();
      const dx = last.x - (rect.left + rect.width / 2);
      const dy = last.y - (rect.top + rect.height * 0.25);
      const distance = Math.hypot(dx, dy) || 1;
      const scale = Math.min(1, distance / 220);
      quickX(Math.round((dx / distance) * scale * 1.4));
      quickY(Math.round((dy / distance) * scale));
    };
    const move = (event) => {
      last = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(look);
    };
    const leave = () => { quickX(0); quickY(0); };
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(frame);
      gsap.killTweensOf(eyes.current);
    };
  }, [reduced]);

  useEffect(() => () => {
    returnTimeline.current?.kill();
    if (angerTimer.current) window.clearTimeout(angerTimer.current);
  }, []);

  const pointInScene = (x, y) => {
    if (!button.current) return { x, y };
    const scene = button.current.closest('.hero')?.getBoundingClientRect();
    if (!scene) return { x, y };
    const currentX = Number(gsap.getProperty(button.current, 'x')) || 0;
    const currentY = Number(gsap.getProperty(button.current, 'y')) || 0;
    const rect = button.current.getBoundingClientRect();
    const baseLeft = rect.left - currentX;
    const baseTop = rect.top - currentY;
    const width = rect.width;
    const height = rect.height;
    const minX = scene.left + 12 - baseLeft;
    const maxX = scene.right - 12 - (baseLeft + width);
    const minY = scene.top + 92 - baseTop;
    const maxY = scene.bottom - 24 - (baseTop + height);
    return {
      x: gsap.utils.clamp(Math.min(minX, maxX), Math.max(minX, maxX), x),
      y: gsap.utils.clamp(Math.min(minY, maxY), Math.max(minY, maxY), y),
    };
  };

  const returnHome = (x, y) => {
    if (!button.current) return;
    position.current = { x, y };
    setAngry(true);
    setWalking(false);
    setDragging(false);
    setFacing(x > 4 ? 'left' : x < -4 ? 'right' : 'home');

    if (reduced) {
      gsap.set([button.current, bubble.current].filter(Boolean), { x: 0, y: 0 });
      gsap.set(button.current, { rotation: 0, scaleX: 1, scaleY: 1 });
      position.current = { x: 0, y: 0 };
      setWalking(false);
      setFacing('home');
      angerTimer.current = window.setTimeout(() => setAngry(false), 1200);
      return;
    }

    const fallDistance = Math.abs(y);
    const walkDistance = Math.abs(x);
    const targets = [button.current, bubble.current].filter(Boolean);
    const timeline = gsap.timeline({
      onComplete: () => {
        position.current = { x: 0, y: 0 };
        gsap.set(targets, { x: 0, y: 0 });
        gsap.set(button.current, { rotation: 0, scaleX: 1, scaleY: 1 });
        setAngry(false);
        setWalking(false);
        setDragging(false);
        setFacing('home');
        returnTimeline.current = null;
      },
    });
    returnTimeline.current?.kill();
    returnTimeline.current = timeline;

    let walkStart = 0;

    if (y < -6) {
      // Gravity starts immediately on release; no horizontal motion until he lands.
      const fallDuration = Math.min(0.72, Math.max(0.24, fallDistance / 520));
      timeline
        .to(targets, {
          y: 0,
          duration: fallDuration,
          ease: 'power1.in',
        }, 0)
        .to(button.current, {
          rotation: x >= 0 ? 3 : -3,
          duration: 0.07,
          ease: 'steps(2)',
        }, 0)
        .to(button.current, {
          rotation: 0,
          duration: 0.07,
          ease: 'steps(2)',
        }, 0.07)
        .to(button.current, {
          scaleX: 1.12,
          scaleY: 0.82,
          duration: 0.065,
          ease: 'steps(2)',
        }, fallDuration)
        .to(button.current, {
          scaleX: 1,
          scaleY: 1,
          duration: 0.14,
          ease: 'power2.out',
        }, fallDuration + 0.06);
      walkStart = fallDuration + 0.22;
    } else if (y > 6) {
      // When dropped below his normal floor, he pops up to the standing height.
      const recoverDuration = Math.min(0.42, Math.max(0.2, fallDistance / 600));
      timeline
        .to(targets, {
          y: 0,
          duration: recoverDuration,
          ease: 'power2.out',
        }, 0)
        .to(button.current, {
          scaleX: 1.08,
          scaleY: 0.9,
          duration: 0.06,
          ease: 'steps(2)',
        }, recoverDuration)
        .to(button.current, {
          scaleX: 1,
          scaleY: 1,
          duration: 0.12,
          ease: 'power2.out',
        }, recoverDuration + 0.05);
      walkStart = recoverDuration + 0.17;
    } else {
      timeline
        .to(button.current, { rotation: x >= 0 ? 3 : -3, duration: 0.065, ease: 'steps(2)' }, 0)
        .to(button.current, { rotation: x >= 0 ? -3 : 3, duration: 0.065, ease: 'steps(2)' }, 0.065)
        .to(button.current, { rotation: 0, duration: 0.055, ease: 'steps(2)' }, 0.13);
      walkStart = 0.2;
    }

    // Once feet are back on the ground, only the horizontal walk takes him home.
    if (walkDistance > 8) {
      timeline
        .add(() => {
          setWalking(true);
          setFacing(x > 0 ? 'left' : 'right');
        }, walkStart)
        .to(targets, {
          x: 0,
          duration: Math.min(1.35, Math.max(0.32, walkDistance / 300)),
          ease: 'steps(9)',
        }, walkStart + 0.02);
    }
  };

  const handlePointerDown = (event) => {
    if (event.button !== 0 || angry || walking || !button.current) return;
    suppressClick.current = false;
    returnTimeline.current?.kill();
    returnTimeline.current = null;
    gsap.killTweensOf(button.current);
    gsap.killTweensOf(bubble.current);
    const x = Number(gsap.getProperty(button.current, 'x')) || position.current.x || 0;
    const y = Number(gsap.getProperty(button.current, 'y')) || position.current.y || 0;
    const rect = button.current.getBoundingClientRect();
    const scene = button.current.closest('.hero')?.getBoundingClientRect();
    if (!scene) return;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: x,
      originY: y,
      baseLeft: rect.left - x,
      baseTop: rect.top - y,
      width: rect.width,
      height: rect.height,
      scene,
      moved: false,
      x,
      y,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId || !button.current) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (!current.moved && Math.hypot(dx, dy) < 5) return;
    current.moved = true;
    setDragging(true);
    const minX = current.scene.left + 12 - current.baseLeft;
    const maxX = current.scene.right - 12 - (current.baseLeft + current.width);
    const minY = current.scene.top + 92 - current.baseTop;
    const maxY = current.scene.bottom - 24 - (current.baseTop + current.height);
    const x = gsap.utils.clamp(Math.min(minX, maxX), Math.max(minX, maxX), current.originX + dx);
    const y = gsap.utils.clamp(Math.min(minY, maxY), Math.max(minY, maxY), current.originY + dy);
    current.x = x;
    current.y = y;
    position.current = { x, y };
    setFacing(dx < -2 ? 'left' : dx > 2 ? 'right' : facing);
    gsap.set(button.current, { x, y, rotation: gsap.utils.clamp(-7, 7, dx * 0.055) });
    if (bubble.current) gsap.set(bubble.current, { x, y });
  };

  const handlePointerUp = (event) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    if (current.moved) {
      suppressClick.current = true;
      returnHome(current.x, current.y);
    } else {
      setDragging(false);
    }
  };

  const nudgeWithKeyboard = (event) => {
    const movements = {
      ArrowLeft: [-54, 0],
      ArrowRight: [54, 0],
      ArrowUp: [0, -40],
      ArrowDown: [0, 40],
    };
    const delta = movements[event.key];
    if (!delta || angry || walking || !button.current) return;
    event.preventDefault();
    const currentX = Number(gsap.getProperty(button.current, 'x')) || 0;
    const currentY = Number(gsap.getProperty(button.current, 'y')) || 0;
    const next = pointInScene(currentX + delta[0], currentY + delta[1]);
    setFacing(delta[0] < 0 ? 'left' : delta[0] > 0 ? 'right' : 'home');
    setWalking(true);
    gsap.to([button.current, bubble.current].filter(Boolean), {
      x: next.x, y: next.y,
      duration: reduced ? 0 : 0.18,
      ease: 'steps(4)',
      onComplete: () => {
        position.current = next;
        returnHome(next.x, next.y);
      },
    });
  };

  const poke = () => {
    if (suppressClick.current) { suppressClick.current = false; return; }
    if (angry || walking || !button.current) return;
    setLineIndex((value) => value + 1);
    if (!reduced) {
      gsap.timeline({ overwrite: 'auto' })
        .to(button.current, { y: -28, duration: 0.14, ease: 'steps(2)' })
        .to(button.current, { y: 0, duration: 0.14, ease: 'steps(2)' });
    }
  };

  const line = angry
    ? 'HEY! I was standing right there!'
    : music
      ? MOOD_LINES.music
      : (lineIndex > 0 ? LINES[(lineIndex - 1) % LINES.length] : (MOOD_LINES[mood] || LINES[0]));

  return (
    <div className="hc" data-music={music} data-mood={mood} data-angry={angry} data-walking={walking} data-dragging={dragging} data-facing={facing}>
      <p ref={bubble} className="bubble px" role="status" aria-live="polite">{line}</p>
      {music && [0, 1, 2].map((index) => (
        <Note
          key={index}
          className="note"
          style={{ '--d': (index * 0.8) + 's', '--x': (index * 22) + 'px' }}
        />
      ))}
      <button
        ref={button}
        type="button"
        className="hc__btn"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={poke}
        onKeyDown={nudgeWithKeyboard}
        aria-label="Riiddev's pixel character. Drag to move him; use the arrow keys to nudge him and watch him walk back home."
      >
        <Sprite eyesRef={eyes} angry={angry} />
      </button>
    </div>
  );
}

function Hero({ ready }) {
  const root = useRef(null);
  const timeline = useRef(null);
  const reduced = useReducedMotion();
  const [music, setMusic] = useState(false);

  useEffect(() => {
    if (reduced) return undefined;

    const context = gsap.context(() => {
      timeline.current = gsap.timeline({ paused: true })
        .from('.hero__wall', { scale: 1.08, duration: 1.35, ease: 'power2.out' }, 0)
        .from('.vines--front', { scaleY: 0, transformOrigin: '50% 0', duration: 1, ease: 'steps(10)' }, 0.04)
        .from('.hero__particles i', { scale: 0, opacity: 0, duration: 0.18, stagger: 0.025, ease: 'steps(3)' }, 0.05)
        .from('.hero__title .ch', {
          autoAlpha: 0, y: -30, rotation: () => gsap.utils.random(-5, 5),
          scale: 0.72, duration: 0.46, ease: 'back.out(1.8)', stagger: 0.055,
        }, 0.12)
        .from('.hc', {
          y: '-70vh', scaleX: 0.78, scaleY: 1.12, rotation: -7,
          duration: 0.95, ease: 'bounce.out',
        }, 0.47)
        .to('.hc', { scaleX: 1.06, scaleY: 0.92, duration: 0.09, ease: 'power1.out' }, 1.31)
        .to('.hc', { scaleX: 1, scaleY: 1, duration: 0.16, ease: 'power1.out' }, 1.4)
        .from('.hero__sub, .hero__actions', {
          autoAlpha: 0, y: 18, clipPath: 'inset(0 100% 0 0)',
          duration: 0.48, ease: 'power3.out', stagger: 0.12,
        }, 1.16)
        .from('.bubble', { scale: 0, rotation: -7, transformOrigin: '0 100%', duration: 0.28, ease: 'back.out(2.5)' }, 1.55);

      const scrub = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('.vines--back', { yPercent: 14, ease: 'none', scrollTrigger: scrub });
      gsap.to('.hero__wall', { yPercent: 8, ease: 'none', scrollTrigger: scrub });
      gsap.to('.lamp', { yPercent: -6, ease: 'none', scrollTrigger: scrub });
    }, root);

    return () => context.revert();
  }, [reduced]);

  useEffect(() => {
    if (ready) timeline.current?.play();
  }, [ready, reduced]);

  return (
    <section id="top" ref={root} className="hero" tabIndex={-1}>
      <div className="hero__wall" aria-hidden="true" />
      <Cityscape />
      <div className="hero__particles" aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => (
          <i
            key={index}
            style={{
              '--x': ((index * 37 + 11) % 100) + '%',
              '--y': ((index * 23 + 7) % 76) + '%',
              '--delay': '-' + ((index % 7) * 0.43) + 's',
              '--size': ((index % 3) + 1) * 3 + 'px',
            }}
          />
        ))}
      </div>
      <Vines seed={11} tone="back" className="vines vines--back" />
      <div className="lamp" aria-hidden="true"><i /><b /></div>
      <div className="hero__ground" aria-hidden="true" />
      <div className="hero__inner">
        <div className="hero__copy">
          <h1 className="hero__title" aria-label="Riiddev">
            {[...'Riiddev'].map((character, index) => (
              <span className="ch" aria-hidden="true" key={index}>{character}</span>
            ))}
          </h1>
          <p className="hero__sub">
            Learning frontend, poking at backend, and building things to see what happens. Not an expert. Just curious.
          </p>
          <div className="hero__actions">
            <a className="btn" href="#projects" onClick={(event) => goTo('projects', event)}>Explore projects</a>
            <button className="btn btn--ghost" aria-pressed={music} onClick={() => setMusic((value) => !value)}>
              {music ? 'Earbuds out' : 'Earbuds in'}
            </button>
          </div>
          {music && (
            <a className="textlink" href={SPOTIFY} target="_blank" rel="noreferrer">
              Open the playlist on Spotify
            </a>
          )}
        </div>
        <HeroCharacter music={music} />
      </div>
      <Vines seed={29} tone="front" maxHang={11} className="vines vines--front" />
    </section>
  );
}

export default function App() {
  const [loaded, setLoaded] = useState(prefersReduced);

  useEffect(() => {
    const context = gsap.context(() => {
      const root = document.documentElement;
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          root.style.setProperty('--p', self.progress.toFixed(4));
          root.style.setProperty('--t', Math.min(1, self.progress * 1.6).toFixed(3));
        },
      });
      ScrollTrigger.create({
        trigger: '#top',
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => root.style.setProperty('--h', self.progress.toFixed(3)),
      });

      ['top', 'about', 'projects', 'skills', 'activity', 'contact'].forEach((id) => {
        ScrollTrigger.create({
          trigger: '#' + id,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (self.isActive) {
              sectionStore.set(id);
              moodStore.set(id);
            }
          },
        });
      });

      if (!prefersReduced()) {
        gsap.utils.toArray('.sec').forEach((section) => {
          const targets = section.querySelectorAll(
            '.lede, .about__text > p, .sign, .sub, .slot, .chest-btn, .fig, .contact .btn',
          );
          if (targets.length) {
            gsap.fromTo(targets,
              { autoAlpha: 0, y: 38, rotateX: -7, transformPerspective: 800 },
              {
                autoAlpha: 1, y: 0, rotateX: 0, duration: 0.72,
                stagger: 0.045, ease: 'power3.out',
                scrollTrigger: { trigger: section, start: 'top 72%', once: true },
              },
            );
          }
          const title = section.querySelector('.title');
          if (title) {
            gsap.to(title, {
              y: -14, ease: 'none',
              scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.7 },
            });
          }
        });
      }
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => context.revert();
  }, []);

  return (
    <>
      <a className="skip" href="#about" onClick={(event) => goTo('about', event)}>Skip to content</a>
      <Sky />
      <Hud />
      <main>
        <Hero ready={loaded} />
        <About />
        <Projects />
        <Skills />
        <Activity />
        <Contact />
      </main>
      <footer className="foot"><p>Built with React, GSAP and a lot of tiny squares.</p></footer>
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
    </>
  );
}