import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Chest } from './PixelArt.jsx';
import PixelLogo from './PixelLogo.jsx';
import { SIGNS, LANGS, TOOLS, PROJECTS, GITHUB, SPOTIFY } from './data.js';
import { useReducedMotion, moodProps } from './lib.js';

gsap.registerPlugin(ScrollTrigger);

// Staggered stepped title reveal, once per section.
function Title({ id, children }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    const context = gsap.context(() => {
      gsap.from('.ch', {
        autoAlpha: 0,
        y: -10,
        duration: 0.2,
        ease: 'steps(2)',
        stagger: 0.035,
        scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
      });
    }, ref);
    return () => context.revert();
  }, [reduced]);

  const text = String(children);
  return (
    <h2 id={id} ref={ref} className="title" aria-label={text}>
      {text.split(' ').map((word, index) => (
        <span className="w" aria-hidden="true" key={index}>
          {[...word].map((character, charIndex) => (
            <span className="ch" key={charIndex}>{character}</span>
          ))}
        </span>
      ))}
    </h2>
  );
}

const Section = ({ id, title, children }) => (
  <section id={id} className="sec" tabIndex={-1} aria-labelledby={id + '-t'}>
    <div className="wrap">
      <Title id={id + '-t'}>{title}</Title>
      {children}
    </div>
  </section>
);

export function About() {
  return (
    <Section id="about" title="About me">
      <div className="about">
        <div className="about__text">
          <p>Hey, I'm Riiddev. I'm not an expert, and I'm not trying to act like one. I just like learning new things, trying them out, and seeing what I can make.</p>
          <p>These days I'm mostly into web design and frontend development: the little details, smooth interactions, and making a page feel good to use. I'm also starting to explore backend development, one level at a time.</p>
          <p className="about__mood px">Current mood: curious, a little pixelated, and taking it one step at a time.</p>
        </div>
        <ul className="signs">
          {SIGNS.map(([heading, paragraph]) => (
            <li key={heading} className="sign px" {...moodProps('about')}>
              <h3>{heading}</h3>
              <p>{paragraph}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function CursorProjectPreview({ project, cursorPoint, reduced }) {
  const preview = useRef(null);

  useEffect(() => {
    const element = preview.current;
    if (!element) return undefined;

    if (!project || reduced) {
      const hide = gsap.to(element, {
        autoAlpha: 0,
        scale: 0.94,
        rotation: 1.5,
        duration: 0.18,
        ease: 'power2.in',
      });
      return () => hide.kill();
    }

    const position = (point) => {
      const width = element.offsetWidth || 324;
      const height = element.offsetHeight || 248;
      const gap = 22;
      let x = point.x + gap;
      let y = point.y + gap;

      if (x + width > window.innerWidth - 12) x = point.x - width - gap;
      if (y + height > window.innerHeight - 12) y = point.y - height - gap;

      x = gsap.utils.clamp(12, Math.max(12, window.innerWidth - width - 12), x);
      y = gsap.utils.clamp(12, Math.max(12, window.innerHeight - height - 12), y);
      xTo(x);
      yTo(y);
    };

    const xTo = gsap.quickTo(element, 'x', { duration: 0.28, ease: 'power3.out' });
    const yTo = gsap.quickTo(element, 'y', { duration: 0.28, ease: 'power3.out' });
    const onMove = (event) => position({ x: event.clientX, y: event.clientY });
    const onResize = () => position(cursorPoint.current);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', onResize);
    position(cursorPoint.current);

    const show = gsap.fromTo(
      element,
      { autoAlpha: 0, scale: 0.92, rotation: -2 },
      { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.34, ease: 'power3.out' },
    );

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      show.kill();
      gsap.killTweensOf(element);
    };
  }, [project?.id, reduced]);

  return createPortal(
    <aside
      ref={preview}
      className="project-cursor-preview"
      aria-hidden="true"
    >
      {project && !reduced && (
        <>
          <div className="project-cursor-preview__chrome">
            <span className="window-dot window-dot--red" />
            <span className="window-dot window-dot--yellow" />
            <span className="window-dot window-dot--green" />
            <span className="project-cursor-preview__address">
              {project.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </span>
            <span className="project-cursor-preview__stamp">SITE SNAPSHOT</span>
          </div>
          <div className="project-cursor-preview__screen">
            <img
              key={project.id}
              src={project.previewImage}
              alt=""
              draggable="false"
              decoding="async"
            />
          </div>
          <div className="project-cursor-preview__footer">
            <div>
              <p>{project.category}</p>
              <h3>{project.displayName}</h3>
            </div>
            <span aria-hidden="true">↗</span>
          </div>
        </>
      )}
    </aside>,
    document.body,
  );
}

export function Projects() {
  const wrap = useRef(null);
  const cursorPoint = useRef({ x: 0, y: 0 });
  const [hoveredProject, setHoveredProject] = useState(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;

    const context = gsap.context(() => {
      gsap.from('.project-row', {
        autoAlpha: 0,
        y: 24,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: wrap.current, start: 'top 78%', once: true },
      });
    }, wrap);

    return () => context.revert();
  }, [reduced]);

  return (
    <Section id="projects" title="My projects">
      <div
        ref={wrap}
        className="project-explorer"
        onKeyDown={(event) => {
          if (event.key === 'Escape') setHoveredProject(null);
        }}
        onPointerMove={(event) => {
          if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
            cursorPoint.current = { x: event.clientX, y: event.clientY };
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse' || event.pointerType === 'pen') setHoveredProject(null);
        }}
      >
        <div className="project-explorer__list">
          <p className="lede">Small experiments, useful tools, and ideas I'm building one level at a time. Hover over a project to peek inside.</p>
          <ul className="chests chests--stack">
            {PROJECTS.map((project, index) => (
              <li
                className={'project-row' + (project.featured ? ' project-row--featured' : '')}
                key={project.id}
                onPointerLeave={(event) => {
                  if (event.pointerType === 'mouse' || event.pointerType === 'pen') setHoveredProject(null);
                }}
              >
                <a
                  className="chest-btn"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={'Open ' + project.displayName + ' in a new tab'}
                  onPointerEnter={(event) => {
                    if ((event.pointerType === 'mouse' || event.pointerType === 'pen') && !reduced) {
                      cursorPoint.current = { x: event.clientX, y: event.clientY };
                      setHoveredProject(project);
                    }
                  }}
                  onFocus={() => setHoveredProject(null)}
                >
                  <img
                    className="project-row__mobile-thumb"
                    src={project.previewImage}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="project-row__chest">
                    <Chest />
                    <span className="project-row__number">{String(index + 1).padStart(2, '0')}</span>
                  </span>
                  <span className="project-row__copy">
                    {project.featured && <span className="project-row__featured">Featured</span>}
                    <span className="project-row__category">{project.category}</span>
                    <span className="chest-name">{project.displayName}</span>
                    <span className="project-row__summary">{project.description}</span>
                    <span className="project-row__open">Open project <span aria-hidden="true">↗</span></span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <CursorProjectPreview project={hoveredProject} cursorPoint={cursorPoint} reduced={reduced} />
    </Section>
  );
}

const Slots = ({ items, tone }) => (
  <ul className="slots">
    {items.map(([logo, name], index) => (
      <li key={name} className={'slot slot--' + tone} {...moodProps('skills')}>
        <span className="slot__tile px" aria-hidden="true" data-index={String(index + 1).padStart(2, '0')}>
          <PixelLogo name={logo} />
          <i className="slot__scan" />
        </span>
        <span className="slot__name">{name}</span>
      </li>
    ))}
  </ul>
);

export function Skills() {
  return (
    <Section id="skills" title="Toolbox">
      <p className="lede">Languages and tools that show up in my projects. I'm still learning all of them.</p>
      <h3 className="sub">Languages</h3>
      <Slots items={LANGS} tone="green" />
      <h3 className="sub">Tools</h3>
      <Slots items={TOOLS} tone="lav" />
      <h3 className="sub">Just starting</h3>
      <ul className="slots">
        <li className="slot slot--ghost" {...moodProps('skills')}>
          <span className="slot__tile px" aria-hidden="true">?</span>
          <span className="slot__name">Backend basics</span>
        </li>
      </ul>
    </Section>
  );
}

function Figure({ src, alt, caption }) {
  const [failed, setFailed] = useState(false);
  const done = () => ScrollTrigger.refresh();

  return (
    <figure className="fig px">
      {failed ? (
        <p className="hint">This graph couldn't load. <a href={GITHUB}>See it on my GitHub profile</a>.</p>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={done}
          onError={() => {
            setFailed(true);
            done();
          }}
        />
      )}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function Activity() {
  return (
    <Section id="activity" title="Activity">
      <p className="lede">Both graphs are generated from my GitHub contributions and update automatically.</p>
      <div className="figs">
        <Figure
          src="https://cdn.jsdelivr.net/gh/riiddev/riiddev@output/pacman-contribution-graph.svg"
          alt="Animated Pac-Man eating the blocks of my GitHub contribution graph"
          caption="Pac-Man chasing the little blocks of progress."
        />
        <Figure
          src="https://cdn.jsdelivr.net/gh/riiddev/riiddev@main/profile-3d-contrib/profile-green.svg"
          alt="Three-dimensional visualization of my GitHub contribution history"
          caption="My contributions in 3D."
        />
      </div>
    </Section>
  );
}

export function Contact() {
  return (
    <Section id="contact" title="Say hi">
      <p className="lede">Three little corners of the internet where you can find me.</p>
      <div className="contact">
        <a className="btn" href={GITHUB} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
        <a className="btn btn--ghost" href="https://www.instagram.com/ahmdmfrd._/" target="_blank" rel="noreferrer">Instagram <span aria-hidden="true">↗</span></a>
        <a className="btn btn--ghost" href={SPOTIFY} target="_blank" rel="noreferrer">Spotify <span aria-hidden="true">↗</span></a>
      </div>
    </Section>
  );
}