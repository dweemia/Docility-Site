/* =========================================================
   Docility — interactions & SoundCloud embeds
   Plain ES2020, no dependencies. Wrapped in an IIFE so
   nothing leaks into the global scope.
   ========================================================= */
(() => {
  "use strict";

  /* -------------------------------------------------------
     Albums  ← edit this list to add or change releases.
     - accent: a palette name below (or any CSS colour); it
       tints the tile glow and the SoundCloud player.
     - cover:  a square image in assets/covers/.
     - url:    the album's SoundCloud "set" URL.
  ------------------------------------------------------- */
  const ACCENTS = {
    aqua:   "#36e0c8",
    sky:    "#46c6ff",
    violet: "#9a7bff",
    coral:  "#ff7a8f",
    gold:   "#ffd36e",
    green:  "#52e0a1",
  };

  const ALBUMS = [
    {
      title: "Prism",
      year: "Preview",
      accent: "violet",
      blurb: "An in-progress album of preview tracks — a shift into downtempo electronic music, building soundscapes with synthesizers. Influenced by Röyksopp and Mylo.",
      cover: "assets/covers/prism.png",
      url: "https://soundcloud.com/docility-m/sets/prism",
    },
    {
      title: "Reflections",
      year: "Album",
      accent: "aqua",
      blurb: "My first fully intentional album, and first move into percussive elements and vocal samples. Shaped by place and state of mind.",
      cover: "assets/covers/reflections.png",
      url: "https://soundcloud.com/docility-m/sets/reflections",
    },
    {
      title: "Open Sky",
      year: "2015–2020",
      accent: "sky",
      blurb: "My first album: a collection of individual ambient tracks made between 2015 and 2020, drawn from travel field recordings and inspired by dub techno and ambient records like Yagya's Rigning.",
      cover: "assets/covers/open-sky.png",
      url: "https://soundcloud.com/docility-m/sets/open-sky",
    },
    {
      title: "Contact",
      year: "EP · 2015",
      accent: "coral",
      blurb: "My first release (2015) — an experimental EP inspired by Carl Sagan's Contact and the idea of making first contact with aliens.",
      cover: "assets/covers/contact.png",
      url: "https://soundcloud.com/docility-m/sets/contact-ep",
    },
  ];

  /* -------------------------------------------------------
     Helpers
  ------------------------------------------------------- */

  /** Minimal DOM builder: el("p", { class: "x", text: "hi" }, ...children). */
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value == null) continue;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else node.setAttribute(key, value);
    }
    node.append(...children.filter((child) => child != null));
    return node;
  }

  /** Build the SoundCloud player URL for an album set. */
  function soundcloudSrc(url, accent) {
    const params = new URLSearchParams({
      url,
      color: accent,         // URLSearchParams encodes the leading "#"
      auto_play: "false",
      hide_related: "true",
      show_comments: "false",
      show_user: "true",
      show_reposts: "false",
      show_teaser: "false",
      show_artwork: "false", // the tile shows our own cover art
      visual: "false",       // classic player keeps the full tracklist
    });
    return `https://w.soundcloud.com/player/?${params}`;
  }

  /* -------------------------------------------------------
     Album cards
  ------------------------------------------------------- */
  function renderAlbums() {
    const list = document.getElementById("albumList");
    if (!list) return;

    const fragment = document.createDocumentFragment();

    ALBUMS.forEach((album, index) => {
      const accent = ACCENTS[album.accent] || album.accent || ACCENTS.aqua;

      const cover = el("img", {
        class: "album__art",
        src: album.cover,
        alt: `${album.title} — album cover`,
        loading: "lazy",
      });
      cover.addEventListener("error", () => cover.classList.add("is-missing"));

      const card = el(
        "article",
        { class: "album reveal" },
        el(
          "figure",
          { class: "album__cover" },
          el("span", { class: "album__fallback", "aria-hidden": "true", text: album.title }),
          cover,
          el("h3", { class: "sr-only", text: `${album.title} — ${album.year}` })
        ),
        el("p", { class: "album__blurb", text: album.blurb }),
        el(
          "div",
          { class: "album__player" },
          el("iframe", {
            title: `${album.title} — SoundCloud player`,
            src: soundcloudSrc(album.url, accent),
            height: "300",
            loading: "lazy",
            allow: "autoplay",
          })
        )
      );

      card.style.setProperty("--accent", accent);
      card.style.setProperty("--delay", `${(index % 2) * 0.1}s`);
      fragment.append(card);
    });

    list.append(fragment);
    initMasterVolume();
  }

  /** Master slider drives every player's volume via the SoundCloud Widget API. */
  function initMasterVolume() {
    const slider = document.getElementById("masterVol");
    if (!slider) return;

    if (typeof SC === "undefined" || !SC.Widget) {
      // Widget API unavailable (e.g. blocked) — hide the control; players still work.
      slider.closest(".master-vol")?.setAttribute("hidden", "");
      return;
    }

    const widgets = [...document.querySelectorAll(".album iframe")].map((frame) => SC.Widget(frame));
    const applyVolume = () => widgets.forEach((widget) => widget.setVolume(Number(slider.value)));

    widgets.forEach((widget) => widget.bind(SC.Widget.Events.READY, applyVolume));
    slider.addEventListener("input", applyVolume);
  }

  /* -------------------------------------------------------
     Hero equaliser bars
  ------------------------------------------------------- */
  function buildBars() {
    const wrap = document.getElementById("bars");
    if (!wrap) return;
    for (let i = 0; i < 7; i++) {
      const bar = document.createElement("span");
      bar.style.animationDelay = `${(Math.sin(i) * 0.4).toFixed(2)}s`;
      bar.style.animationDuration = `${(1.1 + (i % 3) * 0.25).toFixed(2)}s`;
      wrap.append(bar);
    }
  }

  /* -------------------------------------------------------
     Scroll-reveal animations
  ------------------------------------------------------- */
  function setupReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((item) => observer.observe(item));
  }

  /* -------------------------------------------------------
     Sticky nav background once scrolled
  ------------------------------------------------------- */
  function setupNav() {
    const nav = document.getElementById("nav");
    if (!nav) return;
    const update = () => nav.classList.toggle("is-stuck", window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* -------------------------------------------------------
     Subtle rain on a canvas (skipped for reduced motion)
  ------------------------------------------------------- */
  function setupRain() {
    const canvas = document.getElementById("rain");
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    const colors = ["#46c6ff", "#36e0c8", "#9a7bff", "#52e0a1"];
    let width, height, drops;
    let frameId = null;

    const makeDrop = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 8 + Math.random() * 16,
      speed: 2 + Math.random() * 4,
      alpha: 0.1 + Math.random() * 0.3,
      color: colors[(Math.random() * colors.length) | 0],
    });

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      drops = Array.from({ length: Math.min(140, Math.floor(width / 12)) }, makeDrop);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1.1;
      for (const drop of drops) {
        ctx.strokeStyle = drop.color;
        ctx.globalAlpha = drop.alpha;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();
        drop.y += drop.speed;
        if (drop.y > height) {
          drop.y = -drop.length;
          drop.x = Math.random() * width;
        }
      }
      ctx.globalAlpha = 1;
      frameId = requestAnimationFrame(draw);
    };

    const start = () => { if (frameId == null) draw(); };
    const stop = () => { if (frameId != null) { cancelAnimationFrame(frameId); frameId = null; } };

    resize();
    start();
    window.addEventListener("resize", resize);
    // Pause when the tab is hidden to save battery, and never stack loops.
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  }

  /* -------------------------------------------------------
     Init (the script is deferred, so the DOM is ready)
  ------------------------------------------------------- */
  function init() {
    renderAlbums();
    buildBars();
    setupReveal();
    setupNav();
    setupRain();
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
