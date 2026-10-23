(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const C = window.SITE;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canAnimate = !reduceMotion && Boolean(window.gsap && window.ScrollTrigger);

  if (!C) {
    console.error("Portfolio content did not load. Check that content.js is available.");
    return;
  }

  function el(tag, attributes = {}, ...children) {
    const node = document.createElement(tag);

    for (const [key, value] of Object.entries(attributes)) {
      if (value == null || value === false) continue;
      if (key === "class") node.className = value;
      else if (key === "style") node.style.cssText = value;
      else if (key === "text") node.textContent = value;
      else node.setAttribute(key, value);
    }

    children.flat().forEach((child) => {
      if (child == null || child === false) return;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    });

    return node;
  }

  function splitLetters(element) {
    const text = element.textContent.trim();
    element.textContent = "";
    [...text].forEach((character) => {
      element.append(el("span", { class: "ch", "aria-hidden": "true" }, character));
    });
  }

  $$("[data-split]").forEach(splitLetters);

  function externalLink(link, className = "") {
    return el("a", {
      href: link.href,
      target: "_blank",
      rel: "noopener noreferrer",
      class: className,
      "aria-label": link.label ? `${link.label} (opens in a new tab)` : null
    }, link.label || "Open link", el("span", { class: "sr", "aria-hidden": "true" }, " (opens in a new tab)"));
  }

  const miniLinks = $("#mini-links");
  C.miniLinks.forEach((index) => {
    const link = C.links[index];
    if (link) miniLinks.append(el("li", {}, externalLink(link)));
  });

  const exploringList = $("#exploring-list");
  C.exploring.forEach((item) => {
    exploringList.append(el("li", { "data-pop": "" },
      el("h4", {}, item.title),
      el("p", {}, item.text)
    ));
  });

  const toolList = $("#tool-list");
  C.tools.forEach((tool) => {
    toolList.append(el("li", { class: "tool", "data-pop": "" },
      el("span", {
        class: "tool__tile",
        style: `background:${tool.bg};color:${tool.fg}`,
        "aria-hidden": "true"
      }, tool.abbr),
      el("span", { class: "tool__name" }, tool.name)
    ));
  });

  const contactList = $("#contact-list");
  C.links.forEach((link) => {
    const anchor = el("a", {
      href: link.href,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": `${link.label}: ${link.host} (opens in a new tab)`
    },
      el("span", {}, link.label),
      el("small", {}, link.host)
    );

    contactList.append(el("li", {}, anchor));
  });

  function renderProject(project) {
    const moreId = `more-${project.id}`;
    const coverChildren = [];

    if (project.image) {
      coverChildren.push(el("img", {
        class: "cover__img",
        src: project.image.src,
        alt: project.image.alt,
        loading: "lazy"
      }));
    } else {
      coverChildren.push(el("p", { class: "cover__title", "aria-hidden": "true" },
        project.cover.lines.map((line) => el("span", {}, line))
      ));
    }

    coverChildren.push(el("span", { class: "cover__kind" }, project.kind));

    const cover = el("div", {
      class: "cover",
      style: `--bg:${project.cover.bg};--fg:${project.cover.fg};--ac:${project.cover.accent}`,
      "aria-hidden": "true"
    }, coverChildren);

    cover.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" || reduceMotion) return;
      const bounds = cover.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      cover.style.setProperty("--mx", `${x * 100}%`);
      cover.style.setProperty("--my", `${y * 100}%`);
      cover.style.setProperty("--tx", `${(x - 0.5) * -14}px`);
      cover.style.setProperty("--ty", `${(y - 0.5) * -10}px`);
    });

    cover.addEventListener("pointerleave", () => {
      cover.style.removeProperty("--tx");
      cover.style.removeProperty("--ty");
    });

    const toggle = el("button", {
      class: "btn",
      type: "button",
      "aria-expanded": "false",
      "aria-controls": moreId
    }, "Show details");

    const detailItems = project.details.map((detail) => el("li", {}, detail));
    const details = el("div", { class: "more", id: moreId },
      el("div", { class: "more__inner" },
        el("ul", {}, detailItems),
        project.note ? el("p", { class: "note" }, project.note) : null
      )
    );

    const links = project.links.map((link) =>
      externalLink(link, `btn${link.primary ? " btn--solid" : ""}`)
    );

    const body = el("div", { class: "project__body" },
      project.status ? el("span", { class: "status" }, project.status) : null,
      el("h3", { id: `project-${project.id}` }, project.title),
      el("p", { class: "project__sub" }, project.sub),
      el("p", {}, project.summary),
      el("ul", { class: "chips", "aria-label": "Technologies used or explored" },
        project.tech.map((technology) => el("li", {}, technology))
      ),
      details,
      el("div", { class: "actions" }, toggle, links)
    );

    const card = el("article", {
      class: `project${project.wide ? " project--wide" : ""}`,
      "data-pop": ""
    }, cover, body);

    toggle.addEventListener("click", () => {
      const isOpen = card.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.textContent = isOpen ? "Hide details" : "Show details";
    });

    return card;
  }

  const projectList = $("#project-list");
  C.projects.forEach((project) => projectList.append(renderProject(project)));

  /* If a generated contribution graphic cannot load, show its direct profile fallback. */
  $$(".graphic img").forEach((image) => {
    const fallback = () => image.closest(".graphic")?.classList.add("is-broken");
    image.addEventListener("error", fallback, { once: true });
    if (image.complete && image.naturalWidth === 0) fallback();
  });

  /* The portrait cycles through short lines adapted from the profile README. */
  let lineIndex = 0;
  const bubble = $("#bubble");
  const portraitButton = $(".portrait");

  portraitButton.addEventListener("click", () => {
    lineIndex = (lineIndex + 1) % C.lines.length;
    bubble.textContent = C.lines[lineIndex];

    if (canAnimate) {
      window.gsap.fromTo(bubble,
        { scale: 0.86, transformOrigin: "0 100%" },
        { scale: 1, duration: 0.35, ease: "back.out(3)" }
      );
      window.gsap.fromTo(".portrait__disc",
        { rotate: -5 },
        { rotate: 0, duration: 0.7, ease: "elastic.out(1,.4)" }
      );
    }
  });

  /* Current/visited sections fill the little pixel markers in the navigation. */
  const navLinks = $$("[data-nav]");
  const linkById = Object.fromEntries(
    navLinks.map((link) => [link.getAttribute("href").slice(1), link])
  );

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const activeLink = linkById[entry.target.id];
        if (!activeLink) return;

        navLinks.forEach((link) => link.classList.remove("is-current"));
        activeLink.classList.add("is-current", "is-visited");
        activeLink.setAttribute("aria-current", "location");
        navLinks.filter((link) => link !== activeLink)
          .forEach((link) => link.removeAttribute("aria-current"));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });

    Object.keys(linkById).forEach((id) => {
      const section = document.getElementById(id);
      if (section) navObserver.observe(section);
    });
  }

  if (!canAnimate) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  /* One orchestrated hero entrance — the rest of the page stays quiet. */
  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from(".hero__title .ch", {
      yPercent: -110,
      rotate: -10,
      opacity: 0,
      duration: 0.7,
      stagger: 0.07,
      ease: "back.out(1.7)"
    })
    .from(".hero__sub > *", { opacity: 0, y: 10, duration: 0.4, stagger: 0.08 }, "-=0.3")
    .from(".portrait__disc", { scale: 0.5, opacity: 0, duration: 0.9, ease: "elastic.out(1,.55)" }, 0.25)
    .from(".portrait__ring", { scale: 0.8, opacity: 0, duration: 0.6 }, "-=0.6")
    .from(".bubble", { scale: 0, transformOrigin: "0 100%", duration: 0.4, ease: "back.out(2)" }, "-=0.2")
    .from(".sprite-lane", { opacity: 0, duration: 0.4 }, "-=0.2");

  try {
    const arrowPath = $(".doodle-arrow path");
    const pathLength = arrowPath?.getTotalLength();
    if (pathLength > 0) {
      gsap.set(arrowPath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
      intro.to(arrowPath, { strokeDashoffset: 0, duration: 0.8 }, "-=0.5")
        .from(".doodle-note", { opacity: 0, duration: 0.4 }, "-=0.3");
    }
  } catch {
    /* Small-screen CSS hides the arrow. The rest of the intro remains independent. */
  }

  const hero = $(".hero");
  const stage = $(".hero__stage");
  if (hero && stage && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    const moveX = gsap.quickTo(stage, "x", { duration: 0.6, ease: "power3" });
    const moveY = gsap.quickTo(stage, "y", { duration: 0.6, ease: "power3" });

    hero.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const bounds = hero.getBoundingClientRect();
      moveX(((event.clientX - bounds.left) / bounds.width - 0.5) * -20);
      moveY(((event.clientY - bounds.top) / bounds.height - 0.5) * -12);
    });
    hero.addEventListener("pointerleave", () => {
      moveX(0);
      moveY(0);
    });
  }

  $$("[data-speed]").forEach((node) => {
    gsap.to(node, {
      y: Number.parseFloat(node.dataset.speed) * 140,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
    });
  });

  gsap.to(".hero__inner", {
    y: 70,
    ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
  });

  gsap.from(".bigname .ch", {
    yPercent: 110, duration: 0.7, stagger: 0.06, ease: "power3.out",
    scrollTrigger: { trigger: ".bigname", start: "top 85%", once: true }
  });

  $$("[data-wipe]").forEach((node) => {
    gsap.fromTo(node,
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0% 0 0)", duration: 0.8, ease: "power3.inOut",
        clearProps: "clipPath",
        scrollTrigger: { trigger: node, start: "top 88%", once: true }
      }
    );
  });

  gsap.set("[data-pop]", { opacity: 0, y: 28, scale: 0.98 });
  ScrollTrigger.batch("[data-pop]", {
    start: "top 92%",
    once: true,
    onEnter: (items) => gsap.to(items, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.65, stagger: 0.07, ease: "power3.out",
      overwrite: true, clearProps: "transform,opacity"
    })
  });

  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
})();
