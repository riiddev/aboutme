import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sprite, Note } from './PixelArt.jsx';
import { Vines, Sky } from './Scenery.jsx';
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

// The portrait follows the pointer with its eyes, hops on click, and reacts to section mood.
function HeroCharacter({ music }) {
  const button = useRef(null);
  const eyes = useRef(null);
  const reduced = useReducedMotion();
  const mood = useStore(moodStore);
  const [lineIndex, setLineIndex] = useState(0);

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
    const leave = () => {
      quickX(0);
      quickY(0);
    };

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);

    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(frame);
      gsap.killTweensOf(eyes.current);
    };
  }, [reduced]);

  const poke = () => {
    setLineIndex((value) => value + 1);
    if (!reduced && button.current) {
      gsap.timeline({ overwrite: 'auto' })
        .to(button.current, { y: -28, duration: 0.14, ease: 'steps(2)' })
        .to(button.current, { y: 0, duration: 0.14, ease: 'steps(2)' });
    }
  };

  const line = music ? MOOD_LINES.music : (MOOD_LINES[mood] || LINES[lineIndex % LINES.length]);

  return (
    <div className="hc" data-music={music} data-mood={mood}>
      <p className="bubble px" role="status">{line}</p>
      {music && [0, 1, 2].map((index) => (
        <Note
          key={index}
          className="note"
          style={{ '--d': (index * 0.8) + 's', '--x': (index * 22) + 'px' }}
        />
      ))}
      <button
        ref={button}
        className="hc__btn"
        onClick={poke}
        aria-label="Riiddev's pixel portrait. Press to hear a thought."
      >
        <Sprite eyesRef={eyes} />
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
        .from('.vines--front', { scaleY: 0, transformOrigin: '50% 0', duration: 1, ease: 'steps(10)' }, 0)
        .from('.hero__title .ch', { autoAlpha: 0, y: -30, duration: 0.3, ease: 'steps(3)', stagger: 0.07 }, 0.15)
        .from('.hc', { y: '-70vh', duration: 0.7, ease: 'steps(9)' }, 0.55)
        .from('.hero__sub, .hero__actions', { clipPath: 'inset(0 100% 0 0)', duration: 0.5, ease: 'steps(8)', stagger: 0.15 }, 1.1)
        .from('.bubble', { scale: 0, transformOrigin: '0 100%', duration: 0.2, ease: 'steps(2)' }, 1.5);

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