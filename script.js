"use strict";

document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

function closeNavigation() {
  if (!navToggle || !navLinks) return;
  navToggle.setAttribute("aria-expanded", "false");
  navLinks.classList.remove("is-open");
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    navLinks.classList.toggle("is-open", !open);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
  });

  document.addEventListener("click", (event) => {
    if (!navToggle.contains(event.target) && !navLinks.contains(event.target)) {
      closeNavigation();
    }
  });
}

/* Scroll progress and compact navigation, updated at most once per frame. */
const progressBar = document.querySelector("#progress-bar");
const siteNav = document.querySelector(".nav");
let scrollPending = false;

function updateScrollUI() {
  const root = document.documentElement;
  const distance = root.scrollHeight - window.innerHeight;
  const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;

  if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
  if (siteNav) siteNav.classList.toggle("is-scrolled", window.scrollY > 24);
  scrollPending = false;
}

window.addEventListener("scroll", () => {
  if (scrollPending) return;
  window.requestAnimationFrame(updateScrollUI);
  scrollPending = true;
}, { passive: true });

window.addEventListener("resize", updateScrollUI, { passive: true });
updateScrollUI();

/* Reveal each section once; show everything immediately for reduced motion. */
const revealElements = document.querySelectorAll(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

  revealElements.forEach((element) => observer.observe(element));
}

/* Gentle avatar tilt on pointer devices; never on touch or reduced-motion setups. */
const portrait = document.querySelector(".portrait");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (portrait && finePointer && !reducedMotion) {
  portrait.addEventListener("pointermove", (event) => {
    const bounds = portrait.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    portrait.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
  });

  portrait.addEventListener("pointerleave", () => {
    portrait.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  });
}

/* Provide a useful message if GitHub's contribution SVG cannot be loaded. */
const contributionImage = document.querySelector("#contribution-image");
const contributionFallback = document.querySelector("#contribution-fallback");

if (contributionImage && contributionFallback) {
  contributionImage.addEventListener("error", () => {
    contributionImage.hidden = true;
    contributionFallback.hidden = false;
  }, { once: true });
}

const year = document.querySelector("#current-year");
if (year) year.textContent = String(new Date().getFullYear());
