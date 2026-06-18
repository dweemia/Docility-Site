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
      year: "Album · In progress",
      accent: "violet",
      blurb: "A work in progress — a shift into downtempo electronic music, building soundscapes with synthesizers. Influenced by Röyksopp and Mylo.",
      cover: "assets/covers/prism.webp",
      url: "https://soundcloud.com/docility-m/sets/prism",
    },
    {
      title: "Reflections",
      year: "Album · 2026",
      accent: "aqua",
      blurb: "Inspired by places in both the world and mind. Expanding the use of percussive elements and vocal samples.",
      cover: "assets/covers/reflections.webp",
      url: "https://soundcloud.com/docility-m/sets/reflections",
    },
    {
      title: "Open Sky",
      year: "Album · 2015–2020",
      accent: "sky",
      blurb: "A collection of individual ambient tracks made between 2015 and 2020, drawn from travel field recordings and inspired by dub techno and ambient records like Yagya's Rigning.",
      cover: "assets/covers/open-sky.webp",
      url: "https://soundcloud.com/docility-m/sets/open-sky",
    },
  ];

  const EPs = [
    {
      title: "Contact",
      year: "EP · 2015",
      accent: "coral",
      blurb: "My first release (2015) — an experimental EP inspired by Carl Sagan's Contact and the idea of making first contact with aliens.",
      cover: "assets/covers/contact.webp",
      url: "https://soundcloud.com/docility-m/sets/contact-ep",
    },
  ];

  /* -------------------------------------------------------
     What's on my turntable  ← 25 things currently on my mind.
     Each tile shows the artwork and links straight out to where
     you can listen. To edit one:
       title:  album / track / artist name (shown on hover)
       artist: the artist (omit for an artist-only entry)
       art:    a square thumbnail in assets/turntable/ (≤300px webp)
       url:    the page to open in a new tab (Spotify, Bandcamp, …)
     Tiles with no art fall back to a coloured gradient + title.
  ------------------------------------------------------- */
  const TURNTABLE = [
    { title: "Title 1",  artist: "Artist", art: "assets/turntable/01.webp", url: "#" },
    { title: "Title 2",  artist: "Artist", art: "assets/turntable/02.webp", url: "#" },
    { title: "Title 3",  artist: "Artist", art: "assets/turntable/03.webp", url: "#" },
    { title: "Title 4",  artist: "Artist", art: "assets/turntable/04.webp", url: "#" },
    { title: "Title 5",  artist: "Artist", art: "assets/turntable/05.webp", url: "#" },
    { title: "Title 6",  artist: "Artist", art: "assets/turntable/06.webp", url: "#" },
    { title: "Title 7",  artist: "Artist", art: "assets/turntable/07.webp", url: "#" },
    { title: "Title 8",  artist: "Artist", art: "assets/turntable/08.webp", url: "#" },
    { title: "Title 9",  artist: "Artist", art: "assets/turntable/09.webp", url: "#" },
    { title: "Title 10", artist: "Artist", art: "assets/turntable/10.webp", url: "#" },
    { title: "Title 11", artist: "Artist", art: "assets/turntable/11.webp", url: "#" },
    { title: "Title 12", artist: "Artist", art: "assets/turntable/12.webp", url: "#" },
    { title: "Title 13", artist: "Artist", art: "assets/turntable/13.webp", url: "#" },
    { title: "Title 14", artist: "Artist", art: "assets/turntable/14.webp", url: "#" },
    { title: "Title 15", artist: "Artist", art: "assets/turntable/15.webp", url: "#" },
    { title: "Title 16", artist: "Artist", art: "assets/turntable/16.webp", url: "#" },
    { title: "Title 17", artist: "Artist", art: "assets/turntable/17.webp", url: "#" },
    { title: "Title 18", artist: "Artist", art: "assets/turntable/18.webp", url: "#" },
    { title: "Title 19", artist: "Artist", art: "assets/turntable/19.webp", url: "#" },
    { title: "Title 20", artist: "Artist", art: "assets/turntable/20.webp", url: "#" },
    { title: "Title 21", artist: "Artist", art: "assets/turntable/21.webp", url: "#" },
    { title: "Title 22", artist: "Artist", art: "assets/turntable/22.webp", url: "#" },
    { title: "Title 23", artist: "Artist", art: "assets/turntable/23.webp", url: "#" },
    { title: "Title 24", artist: "Artist", art: "assets/turntable/24.webp", url: "#" },
    { title: "Title 25", artist: "Artist", art: "assets/turntable/25.webp", url: "#" },
  ];

  /* -------------------------------------------------------
     The scenery filmstrip  ← photos behind the music and the
     source of the album art. Drop wide (landscape) photos in
     assets/gallery/ as ~1600px webp and give each a caption.
  ------------------------------------------------------- */
  const GALLERY = [
    { src: "assets/gallery/01.webp", alt: "Describe the scene", caption: "Where it was taken — and what it inspired" },
    { src: "assets/gallery/02.webp", alt: "Describe the scene", caption: "Where it was taken — and what it inspired" },
    { src: "assets/gallery/03.webp", alt: "Describe the scene", caption: "Where it was taken — and what it inspired" },
    { src: "assets/gallery/04.webp", alt: "Describe the scene", caption: "Where it was taken — and what it inspired" },
    { src: "assets/gallery/05.webp", alt: "Describe the scene", caption: "Where it was taken — and what it inspired" },
    { src: "assets/gallery/06.webp", alt: "Describe the scene", caption: "Where it was taken — and what it inspired" },
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
      color: accent.replace(/^#/, ""), // SoundCloud expects bare hex (e.g. 36e0c8)
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
     Record sleeves + flip-over popup
  ------------------------------------------------------- */
  let currentWidget = null; // SoundCloud widget for the open popup
  let lastFocused = null;   // element to restore focus to on close
  let originSleeve = null;  // the sleeve a popup was opened from (for the leap animation)

  /** Render a set of releases as record sleeves into the given container. */
  function renderSleeves(releases, listId) {
    const list = document.getElementById(listId);
    if (!list) return;

    const fragment = document.createDocumentFragment();

    releases.forEach((album) => {
      const accent = ACCENTS[album.accent] || album.accent || ACCENTS.aqua;

      const cover = el("img", {
        class: "sleeve__art",
        src: album.cover,
        alt: `${album.title} — album cover`,
        loading: "lazy",
      });
      cover.addEventListener("error", () => cover.classList.add("is-missing"));

      const sleeve = el(
        "button",
        { class: "sleeve", type: "button", "aria-label": `${album.title} — open details` },
        el("span", { class: "sleeve__fallback", "aria-hidden": "true", text: album.title }),
        cover
      );
      sleeve.style.setProperty("--accent", accent);
      sleeve.addEventListener("click", () => openPopup(album, accent, sleeve));
      fragment.append(sleeve);
    });

    list.append(fragment);
  }

  /** Render the 5×5 "on my turntable" grid — numbered tiles that link out. */
  function renderTurntable() {
    const grid = document.getElementById("ttGrid");
    if (!grid) return;

    const palette = Object.values(ACCENTS);
    const fragment = document.createDocumentFragment();

    TURNTABLE.forEach((item, i) => {
      const rank = String(i + 1).padStart(2, "0");
      const label = item.artist ? `${item.title} by ${item.artist}` : item.title;

      const art = el("img", { class: "tt__art", src: item.art, alt: "", loading: "lazy" });
      art.addEventListener("error", () => art.classList.add("is-missing"));

      const tile = el(
        "a",
        {
          class: "tt",
          href: item.url || "#",
          target: "_blank",
          rel: "noopener",
          "aria-label": `${rank} — ${label}`,
        },
        el("span", { class: "tt__num", "aria-hidden": "true", text: rank }),
        art,
        el("span", { class: "tt__fallback", "aria-hidden": "true", text: item.title }),
        el(
          "span",
          { class: "tt__meta", "aria-hidden": "true" },
          el("span", { class: "tt__title", text: item.title }),
          item.artist ? el("span", { class: "tt__artist", text: item.artist }) : null
        )
      );
      tile.style.setProperty("--accent", palette[i % palette.length]);
      fragment.append(tile);
    });

    grid.append(fragment);
  }

  /** Render the scenery filmstrip — a full-bleed horizontal scroller. */
  function renderGallery() {
    const strip = document.getElementById("filmstrip");
    if (!strip) return;

    const fragment = document.createDocumentFragment();

    GALLERY.forEach((photo) => {
      const img = el("img", { class: "frame__img", src: photo.src, alt: photo.alt || "", loading: "lazy" });
      const frame = el(
        "figure",
        { class: "frame" },
        img,
        photo.caption ? el("figcaption", { class: "frame__cap", text: photo.caption }) : null
      );
      img.addEventListener("error", () => frame.classList.add("is-missing"));
      fragment.append(frame);
    });

    strip.append(fragment);
  }

  function setupPopup() {
    const popup = document.getElementById("popup");
    if (!popup) return;

    document.getElementById("popupClose").addEventListener("click", closePopup);
    document.getElementById("popupBackdrop").addEventListener("click", closePopup);
    document.addEventListener("keydown", (event) => {
      if (popup.hidden) return;
      if (event.key === "Escape") closePopup();
      else if (event.key === "Tab") trapFocus(event, popup);
    });

    // The volume slider always drives whichever player is currently open.
    const slider = document.getElementById("popupVol");
    slider.addEventListener("input", () => {
      if (currentWidget) currentWidget.setVolume(Number(slider.value));
    });
  }

  /** Keep Tab focus cycling inside the open modal. */
  function trapFocus(event, popup) {
    const focusable = popup.querySelectorAll(
      'button, [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openPopup(album, accent, sleeve) {
    const popup = document.getElementById("popup");
    const flipcard = document.getElementById("flipcard");
    originSleeve = sleeve;
    lastFocused = sleeve;

    flipcard.style.setProperty("--accent", accent);
    const cover = document.getElementById("popupCover");
    cover.src = album.cover;
    cover.alt = `${album.title} — album cover`;
    document.getElementById("popupThumb").src = album.cover;
    document.getElementById("popupTitle").textContent = album.title;
    document.getElementById("popupYear").textContent = album.year;
    document.getElementById("popupBlurb").textContent = album.blurb;

    const iframe = el("iframe", {
      title: `${album.title} — SoundCloud player`,
      src: soundcloudSrc(album.url, accent),
      height: "300",
      loading: "lazy",
      allow: "autoplay",
    });
    document.getElementById("popupPlayer").replaceChildren(iframe);
    currentWidget = wireVolume(iframe, document.getElementById("popupVol"));

    // Reveal, place the card over the clicked sleeve, then let it leap to the
    // centre and flip over to show the details.
    popup.hidden = false;
    flipcard.classList.remove("is-flipped");
    flipcard.style.transition = "none";
    flipcard.style.transform = "none";
    const centred = flipcard.getBoundingClientRect();
    flipcard.style.transform = originTransform(sleeve.getBoundingClientRect(), centred);
    void flipcard.offsetWidth;          // commit the "at the sleeve" position…
    flipcard.style.transition = "";      // …restore the CSS transition…
    flipcard.style.transform = "none";   // …and animate out to the centre.
    flipcard.classList.add("is-flipped"); // the inner's 0.15s delay flips it after the leap

    document.documentElement.style.overflow = "hidden";
    document.getElementById("popupClose").focus({ preventScroll: true });
  }

  /** Transform that maps the card's `to` rect onto the `from` rect (translate + uniform scale). */
  function originTransform(from, to) {
    const dx = (from.left + from.width / 2) - (to.left + to.width / 2);
    const dy = (from.top + from.height / 2) - (to.top + to.height / 2);
    const scale = from.width / to.width;
    return `translate(${dx}px, ${dy}px) scale(${scale})`;
  }

  /** Connect a volume slider to a player; returns the widget (or null if the API is blocked). */
  function wireVolume(iframe, slider) {
    if (typeof SC === "undefined" || !SC.Widget) {
      slider.closest(".popup__vol")?.setAttribute("hidden", "");
      return null;
    }
    const widget = SC.Widget(iframe);
    widget.bind(SC.Widget.Events.READY, () => widget.setVolume(Number(slider.value)));
    return widget;
  }

  function closePopup() {
    const popup = document.getElementById("popup");
    const flipcard = document.getElementById("flipcard");

    // Shrink the card back into the sleeve it came from, then hide it.
    if (originSleeve) {
      flipcard.style.transform = originTransform(originSleeve.getBoundingClientRect(), flipcard.getBoundingClientRect());
    }
    flipcard.style.opacity = "0";
    document.documentElement.style.overflow = "";

    // Finish once the leap-back/fade has actually ended (transitionend), with a
    // timeout fallback so reduced-motion / interrupted transitions still clean up.
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      flipcard.removeEventListener("transitionend", onEnd);
      popup.hidden = true;
      flipcard.classList.remove("is-flipped");
      flipcard.style.transform = "none";
      flipcard.style.opacity = "";
      document.getElementById("popupPlayer").replaceChildren(); // stop playback
      currentWidget = null;
      originSleeve = null;
    };
    const onEnd = (event) => {
      if (event.target === flipcard && event.propertyName === "opacity") finish();
    };
    flipcard.addEventListener("transitionend", onEnd);
    window.setTimeout(finish, 600);

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus({ preventScroll: true });
    }
  }

  /* -------------------------------------------------------
     Tools page: reveal a labelled placeholder if a gear image
     is missing (mirrors the album-cover fallback).
  ------------------------------------------------------- */
  function setupGearFallbacks() {
    const images = document.querySelectorAll(".gear__art, .gear-feature__shot");
    images.forEach((img) => {
      const flag = () => img.classList.add("is-missing");
      if (img.complete && img.naturalWidth === 0) flag(); // already failed before this ran
      img.addEventListener("error", flag);
    });
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
    renderSleeves(ALBUMS, "albumList");
    renderSleeves(EPs, "epList");
    renderTurntable();
    renderGallery();
    setupGearFallbacks();
    setupPopup();
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
