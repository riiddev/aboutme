import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Chest } from './PixelArt.jsx';
import PixelLogo from './PixelLogo.jsx';
import { SIGNS, LANGS, TOOLS, VERIFIED, GITHUB, SPOTIFY } from './data.js';
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

// Confirmed entries first; public repositories are merged in at runtime.
const KEY = 'riiddev:repos:v1';

function merge(apiRepos) {
  const map = new Map(VERIFIED.map((repo) => [repo.name, repo]));
  apiRepos.filter((repo) => !repo.fork).forEach((repo) => {
    const previous = map.get(repo.name);
    map.set(repo.name, {
      ...previous,
      name: repo.name,
      repoUrl: repo.html_url,
      description: repo.description || (previous && previous.description),
      language: repo.language,
      pushed: repo.pushed_at,
      live: repo.homepage || (previous && previous.live),
    });
  });
  return [...map.values()].slice(0, 8);
}

function useRepos() {
  const [state, setState] = useState({ repos: VERIFIED, source: 'verified' });

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const cached = JSON.parse(sessionStorage.getItem(KEY) || 'null');
        if (cached && Date.now() - cached.t < 600000) {
          setState({ repos: merge(cached.d), source: 'github' });
          return;
        }
      } catch {
        // Ignore unavailable storage or invalid cached JSON.
      }

      try {
        const response = await fetch('https://api.github.com/users/riiddev/repos?per_page=30&sort=pushed', {
          signal: controller.signal,
          headers: { Accept: 'application/vnd.github+json' },
        });
        if (!response.ok) throw new Error('GitHub API returned ' + response.status);

        const data = await response.json();
        try {
          sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d: data }));
        } catch {
          // Storage is optional; projects can still render.
        }
        setState({ repos: merge(data), source: 'github' });
      } catch (error) {
        if (error?.name !== 'AbortError') {
          setState((current) => ({ ...current, source: 'offline' }));
        }
      }
    })();

    return () => controller.abort();
  }, []);

  return state;
}

export function Projects() {
  const { repos, source } = useRepos();
  const [open, setOpen] = useState(null);
  const wrap = useRef(null);
  const panel = useRef(null);
  const reduced = useReducedMotion();
  const current = repos.find((repo) => repo.name === open);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [repos.length]);

  useEffect(() => {
    if (!open || reduced) return undefined;

    const context = gsap.context(() => {
      gsap.fromTo(
        panel.current,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 0.35, ease: 'steps(6)', clearProps: 'clipPath' },
      );
      gsap.fromTo('[data-open="true"] .spark',
        { x: 0, y: 0, opacity: 1 },
        {
          x: (index) => Math.cos((index * Math.PI) / 4) * 38,
          y: (index) => Math.sin((index * Math.PI) / 4) * 38 - 10,
          opacity: 0,
          duration: 0.55,
          ease: 'steps(5)',
        },
      );
    }, wrap);

    return () => context.revert();
  }, [open, reduced]);

  const formatDate = (date) => new Date(date).toLocaleDateString('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Section id="projects" title="Discoveries">
      <div ref={wrap} onKeyDown={(event) => event.key === 'Escape' && setOpen(null)}>
        <p className="lede">Crates I found while building. Open one to see what's inside.</p>
        <ul className="chests">
          {repos.map((repo) => (
            <li key={repo.name}>
              <button
                className="chest-btn"
                data-open={open === repo.name}
                aria-expanded={open === repo.name}
                aria-controls="repo-panel"
                onClick={() => setOpen((currentOpen) => currentOpen === repo.name ? null : repo.name)}
                {...moodProps('projects')}
              >
                <Chest />
                {Array.from({ length: 8 }, (_, index) => <i className="spark" key={index} aria-hidden="true" />)}
                <span className="chest-name">{repo.name}</span>
              </button>
            </li>
          ))}
        </ul>

        <div id="repo-panel" role="region" aria-live="polite" aria-label="Project details">
          {current ? (
            <article ref={panel} className="panel px px--green">
              <h3>{current.name}</h3>
              <p>{current.description || 'No description yet.'}</p>
              <p className="meta">
                {current.language && <span className="chip">{current.language}</span>}
                {current.pushed && <span>Last pushed {formatDate(current.pushed)}</span>}
              </p>
              <div className="panel__links">
                {current.repoUrl && <a className="btn" href={current.repoUrl} target="_blank" rel="noreferrer">View on GitHub</a>}
                {current.live && <a className="btn btn--ghost" href={current.live} target="_blank" rel="noreferrer">Open live site</a>}
              </div>
            </article>
          ) : (
            <p className="hint">Pick a crate. Escape closes it.</p>
          )}
        </div>
        {source === 'offline' && (
          <p className="hint">Couldn't reach GitHub just now, so this shows the projects I could confirm from my README.</p>
        )}
      </div>
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
      <p className="lede">GitHub is where my work lives. Follow along, look around, or listen to what I code to.</p>
      <div className="contact">
        <a className="btn" href={GITHUB} target="_blank" rel="noreferrer">GitHub profile</a>
        <a className="btn btn--ghost" href={GITHUB + '?tab=repositories'} target="_blank" rel="noreferrer">Repositories</a>
        <a className="btn btn--ghost" href="https://riiddev.github.io/portooo/" target="_blank" rel="noreferrer">Current portfolio</a>
        <a className="btn btn--ghost" href={SPOTIFY} target="_blank" rel="noreferrer">Playlist</a>
      </div>
    </Section>
  );
}