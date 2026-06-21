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

  const UPCOMING = [
    {
      title: "Prism",
      year: "Upcoming · In progress",
      accent: "violet",
      blurb: "A work in progress — a shift into downtempo electronic music, building soundscapes with synthesizers. Influenced by Röyksopp and Mylo.",
      cover: "assets/covers/prism.webp",
      url: "https://soundcloud.com/docility-m/sets/prism",
    },
  ];

  const MIXES = [
    {
      title: "Ambient Insomnia",
      date: "October 2014",
      accent: "violet",
      feed: "/dweejay/261014-ambient-insomnia/",
      url: "https://www.mixcloud.com/dweejay/261014-ambient-insomnia/",
    },
    {
      title: "Global Groove",
      date: "November 2016",
      accent: "sky",
      feed: "/dweejay/21-11-2016-global-groove/",
      url: "https://www.mixcloud.com/dweejay/21-11-2016-global-groove/",
    },
    {
      title: "Spring Has Sprung",
      date: "September 2014",
      accent: "aqua",
      feed: "/dweejay/01-09-2014-spring-has-sprung/",
      url: "https://www.mixcloud.com/dweejay/01-09-2014-spring-has-sprung/",
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
  /* The "On my turntable" grid is data-driven from a Discogs List.
     Curate the list on Discogs, then run  python tools/build-turntable.py
     to cache covers + metadata into assets/turntable/turntable.json, which is
     loaded at runtime below. Nothing here to edit by hand. */
  let TURNTABLE = []; // populated by renderTurntable() from turntable.json

  /* -------------------------------------------------------
     The scenery gallery  ← photos behind the music and the
     source of the album art. Drop photos (any orientation) in
     assets/gallery/ as ~1600px webp; run tools/optimize-photos.py.
     Fill in `alt` (accessibility) and `caption` (location + the
     track/album it inspired). See _raw/_map.txt for which number
     is which source photo.
  ------------------------------------------------------- */
  const GALLERY = [
    { src: "assets/gallery/01.webp", alt: "Two people on horseback in a field with a mountain in the background.", caption: "Iceland, 2014." },
    { src: "assets/gallery/02.webp", alt: "A glacier at dusk.", caption: "Iceland, 2014." },
    { src: "assets/gallery/03.webp", alt: "A fjord with a mountain in the background.", caption: "Iceland, 2014." },
    { src: "assets/gallery/04.webp", alt: "Snow and a puddle at sunset.", caption: "Iceland, 2014" },
    { src: "assets/gallery/05.webp", alt: "A river and waterfall in a snowcapped valley", caption: "Iceland, 2014." },
    { src: "assets/gallery/06.webp", alt: "Low cloudcover on a hill, with a barn in front.", caption: "Iceland, 2014." },
    { src: "assets/gallery/07.webp", alt: "A misty river in a forest valley.", caption: "Kamikochi, Japan, 2016." },
    { src: "assets/gallery/08.webp", alt: "A rocky river bed nestled in a forest valley.", caption: "Yakushima, Japan, 2016." },
    { src: "assets/gallery/09.webp", alt: "A view above the clouds from the top of Mount Fuji.", caption: "Mount Fuji, Japan, 2016." },
    { src: "assets/gallery/10.webp", alt: "A view above the clouds from the top of Mount Fuji, with the silhouette of a person in front.", caption: "Mount Fuji, Japan, 2016." },
    { src: "assets/gallery/11.webp", alt: "A view of colourful houses on a hillside.", caption: "Busan, 2024." },
    { src: "assets/gallery/12.webp", alt: "A colourful reflection of city lights on the water at night.", caption: "Busan, 2024." },
    { src: "assets/gallery/13.webp", alt: "A red hot spring covered in mist.", caption: "Beppu, Japan, 2024." },
    { src: "assets/gallery/14.webp", alt: "A concrete rectangle window, with a garden outside.", caption: "Naoshima, Japan, 2024." },
    { src: "assets/gallery/15.webp", alt: "A building covered in plants.", caption: "Naoshima, Japan, 2024." },
    { src: "assets/gallery/16.webp", alt: "A colourful mosaic on the side of a building.", caption: "Naoshima, Japan, 2024." },
    { src: "assets/gallery/17.webp", alt: "A rainbow reflection on an underwater aquarium.", caption: "Daydream Island, 2025." },
    { src: "assets/gallery/18.webp", alt: "A cloudy sky and its reflection on bay water, with yachts around.", caption: "Magnetic Island, 2025." },
    { src: "assets/gallery/19.webp", alt: "A beach at sunset with an illuminated ferris wheel.", caption: "Townsville, 2025." },
    { src: "assets/gallery/20.webp", alt: "A low-tide beach at sunset.", caption: "Townsville, 2025." },
    { src: "assets/gallery/21.webp", alt: "A building with windows lit up in a range of colours.", caption: "Tokyo, 2026." },
    { src: "assets/gallery/22.webp", alt: "A view of Tokyo from high above.", caption: "Tokyo, 2026." },
    { src: "assets/gallery/23.webp", alt: "A dense japanese garden with a pond.", caption: "Tokyo, 2026." },
    { src: "assets/gallery/24.webp", alt: "A distant view of a snow-capped Mount Fuji.", caption: "Mount Takao, Japan, 2026.." },
    { src: "assets/gallery/25.webp", alt: "A distant view of a snow-capped mountain.", caption: "Iceland, 2014." },
    { src: "assets/gallery/26.webp", alt: "Shadow of a person standing on top of a hill looking down a valley.", caption: "Iceland, 2014." },
  ];

  // sound: path to an audio file in assets/field-recordings/ — set to null if you don't have one yet
  // note: short description shown in the pin popup
  const MAP_LOCATIONS = [
    { name: "Iceland", year: "2014", lat: 64.96, lng: -19.02, note: "Recordings from aporee.org", sound: null },
    { name: "Kamikochi, Japan", year: "2016", lat: 36.245, lng: 137.653, note: "", sound: "assets/field-recordings/kamikochi.mp3" },
    { name: "Yakushima, Japan", year: "2016", lat: 30.356, lng: 130.556, note: "", sound: "assets/field-recordings/yakushima.mp3" },
    { name: "Kyoto, Japan", year: "2024", lat: 34.96473578392683, lng: 135.76729203413296, note: "", sound: "assets/field-recordings/kyoto.mp3" },
    { name: "Daydream Island, Australia", year: "2025", lat: -20.249, lng: 148.823, note: "", sound: "assets/field-recordings/daydream island.mp3" },
    { name: "Kaduruketha, Sri Lanka", year: "2016", lat: 6.755697480385614, lng: 81.10166118689993, note: "", sound: "assets/field-recordings/kaduruketha.mp3" },
    { name: "Kuala Lumpur, Malaysia", year: "2015", lat: 3.1464046071201124, lng: 101.62386402065428, note: "", sound: "assets/field-recordings/kuala-lumpur.mp3" },
    { name: "Tokyo, Japan", year: "2026", lat: 35.676, lng: 139.65, note: "", sound: "assets/field-recordings/tokyo.mp3" },
    { name: "Dambula, Sri Lanka", year: "2019", lat: 7.882229302197966, lng: 80.66179268173713, note: "", sound: "assets/field-recordings/dambula.mp3" },
    { name: "Shinjuku, Japan", year: "2026", lat: 35.66170576128572, lng: 139.66772834954452, note: "", sound: "assets/field-recordings/shinjuku.mp3" },
    { name: "Melbourne, Australia", year: "2012-2026", lat: -37.81282908788092, lng: 144.9782535060548, note: "", sound: "assets/field-recordings/melbourne.mp3" },
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
  let npActive = false;     // true while now-playing bar is shown
  let npAlbumData = null;   // the album object currently loaded in the bar
  let npSource = null;      // "sc" | "mix" | "field" — which source owns the bar
  let npFieldAudio = null;  // HTML5 Audio for field recording (kept alive when docked)
  let npFieldMarker = null; // Leaflet marker ref so expand can re-open the popup
  let currentMix = null;    // mix object currently open or docked

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

  /* -------------------------------------------------------
     "On my turntable" — a rotating coverflow carousel.
     No numbers; the list is shuffled on every load so a
     different album leads each visit. Auto-advances, pauses
     on hover/focus or while the popup is open, and respects
     reduced motion. Click the centred card to open details.
     Data comes from assets/turntable/turntable.json.
  ------------------------------------------------------- */
  let ttCards = [];          // the rendered card elements, in shuffled order
  let ttActive = 0;          // index of the centred card
  let ttTimer = null;        // auto-advance interval handle
  const TT_INTERVAL = 3800;  // ms between auto-advances

  /** Fisher–Yates shuffle (returns a new array). */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  async function renderTurntable() {
    const stage = document.getElementById("ttGrid");
    if (!stage) return;

    try {
      const res = await fetch("assets/turntable/turntable.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(res.status);
      TURNTABLE = shuffle(await res.json()); // randomise the running order each visit
    } catch {
      stage.closest(".turntable")?.classList.add("is-empty");
      return; // section quietly collapses until the list is built
    }

    const palette = Object.values(ACCENTS);

    ttCards = TURNTABLE.map((item, i) => {
      const label = item.artist ? `${item.title} by ${item.artist}` : item.title;

      const art = el("img", { class: "tt__art", src: item.art || "", alt: "", loading: "lazy" });
      if (!item.art) art.classList.add("is-missing");
      art.addEventListener("error", () => art.classList.add("is-missing"));

      const card = el(
        "button",
        { class: "tt", type: "button", "aria-label": `${label} — open details` },
        art,
        el("span", { class: "tt__fallback", "aria-hidden": "true", text: item.title }),
        el(
          "span",
          { class: "tt__meta", "aria-hidden": "true" },
          el("span", { class: "tt__title", text: item.title }),
          item.artist ? el("span", { class: "tt__artist", text: item.artist }) : null
        )
      );
      card.style.setProperty("--accent", palette[i % palette.length]);
      // Centred card opens details; any other card rotates to the centre.
      card.addEventListener("click", () => {
        if (i === ttActive) openTurntable(i, card);
        else ttGo(i);
      });
      stage.append(card);
      return card;
    });

    ttActive = Math.floor(Math.random() * ttCards.length); // randomise which leads
    layoutTurntable();
    setupCarouselControls();
    startTurntableAuto();
  }

  /** Position every card around the ring relative to the active one. */
  function layoutTurntable() {
    const n = ttCards.length;
    if (!n) return;
    ttCards.forEach((card, i) => {
      let off = (((i - ttActive) % n) + n) % n; // 0 … n-1
      if (off > n / 2) off -= n;                 // shortest signed distance
      const abs = Math.abs(off);
      const sign = Math.sign(off);

      let tx = 0, tz = 0, ry = 0, sc = 1, op = 1, z = 100, pe = "auto";
      if (abs === 1)      { tx = sign * 64;  tz = -120; ry = -sign * 38; sc = 0.82; op = 0.9;  z = 80; }
      else if (abs === 2) { tx = sign * 112; tz = -280; ry = -sign * 44; sc = 0.66; op = 0.45; z = 60; }
      else if (abs >= 3)  { tx = sign * 150; tz = -420; ry = -sign * 50; sc = 0.5;  op = 0;    z = 0; pe = "none"; }

      card.style.transform =
        `translate(-50%, -50%) translateX(${tx}%) translateZ(${tz}px) rotateY(${ry}deg) scale(${sc})`;
      card.style.zIndex = String(z);
      card.style.opacity = String(op);
      card.style.pointerEvents = pe;
      card.classList.toggle("is-active", abs === 0);
      card.setAttribute("aria-hidden", abs === 0 ? "false" : "true");
      card.tabIndex = abs === 0 ? 0 : -1; // only the centred card is in the tab order
    });
  }

  /** Rotate so card `i` becomes the centred one. */
  function ttGo(i) {
    const n = ttCards.length;
    if (!n) return;
    ttActive = ((i % n) + n) % n;
    layoutTurntable();
  }
  function ttStep(dir) { ttGo(ttActive + dir); }

  function setupCarouselControls() {
    const carousel = document.getElementById("ttCarousel");
    if (!carousel) return;

    document.getElementById("ttPrev")?.addEventListener("click", () => { ttStep(-1); restartTurntableAuto(); });
    document.getElementById("ttNext")?.addEventListener("click", () => { ttStep(1); restartTurntableAuto(); });

    // Pause auto-rotation while the visitor is interacting.
    carousel.addEventListener("mouseenter", stopTurntableAuto);
    carousel.addEventListener("mouseleave", startTurntableAuto);
    carousel.addEventListener("focusin", stopTurntableAuto);
    carousel.addEventListener("focusout", startTurntableAuto);
    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft")  { ttStep(-1); restartTurntableAuto(); }
      else if (event.key === "ArrowRight") { ttStep(1); restartTurntableAuto(); }
    });
  }

  function startTurntableAuto() {
    if (ttTimer != null || ttCards.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ttTimer = window.setInterval(() => {
      if (document.hidden) return;                              // save battery on hidden tabs
      if (!document.getElementById("ttPopup")?.hidden) return; // hold while details are open
      ttStep(1);
    }, TT_INTERVAL);
  }
  function stopTurntableAuto() {
    if (ttTimer != null) { clearInterval(ttTimer); ttTimer = null; }
  }
  function restartTurntableAuto() { stopTurntableAuto(); startTurntableAuto(); }

  /* -------------------------------------------------------
     Turntable popup — Discogs info + embedded YouTube player
  ------------------------------------------------------- */
  let ttOpener = null;

  function ytEmbed(id, autoplay) {
    const p = new URLSearchParams({ rel: "0", modestbranding: "1", autoplay: autoplay ? "1" : "0" });
    return `https://www.youtube.com/embed/${id}?${p}`;
  }

  function setupTurntablePopup() {
    const pop = document.getElementById("ttPopup");
    if (!pop) return;
    document.getElementById("ttClose").addEventListener("click", closeTurntable);
    document.getElementById("ttBackdrop").addEventListener("click", closeTurntable);
    document.addEventListener("keydown", (event) => {
      if (pop.hidden) return;
      if (event.key === "Escape") closeTurntable();
      else if (event.key === "Tab") trapFocus(event, pop);
    });
  }

  function loadVideo(id, autoplay) {
    const player = document.getElementById("ttPlayer");
    const frame = el("iframe", {
      src: ytEmbed(id, autoplay),
      title: "YouTube video player",
      allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
      allowfullscreen: "",
      loading: "lazy",
    });
    player.replaceChildren(frame);
    document.querySelectorAll("#ttVideos .ttpop__vid").forEach((b) =>
      b.setAttribute("aria-current", b.dataset.id === id ? "true" : "false")
    );
  }

  function openTurntable(index, opener) {
    const pop = document.getElementById("ttPopup");
    const item = TURNTABLE[index];
    if (!pop || !item) return;
    ttOpener = opener || document.activeElement;

    const cover = document.getElementById("ttCover");
    cover.src = item.art || "";
    cover.style.visibility = item.art ? "visible" : "hidden";
    document.getElementById("ttTitle").textContent = item.title;
    document.getElementById("ttArtist").textContent = item.artist || "";
    const meta = [item.year, item.format].filter(Boolean).join(" · ");
    document.getElementById("ttMeta").textContent = meta;
    document.getElementById("ttGenres").textContent = (item.genres || []).join(" · ");
    const note = document.getElementById("ttComment");
    note.textContent = item.comment || "";
    note.hidden = !item.comment;
    const link = document.getElementById("ttDiscogs");
    if (item.discogsUrl) { link.href = item.discogsUrl; link.hidden = false; } else { link.hidden = true; }

    // Tracklist
    const tracks = document.getElementById("ttTracks");
    tracks.replaceChildren(
      ...(item.tracklist || []).map((t) =>
        el("li", { class: "ttpop__track" },
          el("span", { class: "ttpop__pos", text: t.position || "" }),
          el("span", { class: "ttpop__tname", text: t.title || "" }),
          el("span", { class: "ttpop__dur", text: t.duration || "" })
        )
      )
    );
    document.getElementById("ttTracksWrap").hidden = !(item.tracklist || []).length;

    // YouTube videos
    const vids = item.videos || [];
    const list = document.getElementById("ttVideos");
    list.replaceChildren(
      ...vids.map((v) =>
        el("li", {},
          el("button", { class: "ttpop__vid", type: "button", "data-id": v.id, text: v.title || "Video" })
        )
      )
    );
    list.querySelectorAll(".ttpop__vid").forEach((b) =>
      b.addEventListener("click", () => loadVideo(b.dataset.id, true))
    );
    const body = document.getElementById("ttBody");
    if (vids.length) {
      body.classList.remove("is-empty");
      loadVideo(vids[0].id, false);
    } else {
      body.classList.add("is-empty");
      document.getElementById("ttPlayer").replaceChildren();
    }

    pop.hidden = false;
    document.documentElement.style.overflow = "hidden";
    document.getElementById("ttClose").focus({ preventScroll: true });
  }

  function closeTurntable() {
    const pop = document.getElementById("ttPopup");
    pop.hidden = true;
    document.documentElement.style.overflow = "";
    document.getElementById("ttPlayer").replaceChildren(); // stop playback
    if (ttOpener && typeof ttOpener.focus === "function") ttOpener.focus({ preventScroll: true });
  }

  /* -------------------------------------------------------
     DJ Mixes
  ------------------------------------------------------- */
  function renderMixes() {
    const grid = document.getElementById("mixGrid");
    if (!grid) return;
    const palette = Object.values(ACCENTS);
    const fragment = document.createDocumentFragment();
    MIXES.forEach((mix, i) => {
      const accent = ACCENTS[mix.accent] || palette[i % palette.length];
      const card = el("button", { class: "mix-card", type: "button", "aria-label": `${mix.title} — open mix` },
        el("span", { class: "mix-card__title", text: mix.title }),
        el("span", { class: "mix-card__date", text: mix.date })
      );
      card.style.setProperty("--accent", accent);
      card.addEventListener("click", () => openMix(i));
      fragment.append(card);
    });
    grid.append(fragment);
  }

  let mxOpener = null;

  function setupMixPopup() {
    const pop = document.getElementById("mxPopup");
    if (!pop) return;
    document.getElementById("mxClose").addEventListener("click", dockMix);
    document.getElementById("mxBackdrop").addEventListener("click", dockMix);
    document.addEventListener("keydown", (e) => {
      if (pop.hidden) return;
      if (e.key === "Escape") dockMix();
      else if (e.key === "Tab") trapFocus(e, pop);
    });
  }

  function dockMix() {
    const pop = document.getElementById("mxPopup");
    if (!pop || !currentMix) return;
    pop.hidden = true;
    document.documentElement.style.overflow = "";
    // Keep iframe alive — don't touch mxPlayer
    showNpBar("mix", { title: currentMix.title, subtitle: currentMix.date, art: null, canExpand: true });
    if (mxOpener && typeof mxOpener.focus === "function") mxOpener.focus({ preventScroll: true });
  }

  function openMix(index) {
    if (npActive) stopNowPlaying(); // clear any docked source before opening mix
    const pop = document.getElementById("mxPopup");
    const mix = MIXES[index];
    if (!pop || !mix) return;
    currentMix = mix;
    mxOpener = document.activeElement;
    document.getElementById("mxTitle").textContent = mix.title;
    document.getElementById("mxDate").textContent = mix.date;
    const link = document.getElementById("mxLink");
    link.href = mix.url;
    const src = `https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=0&autoplay=0&feed=${encodeURIComponent(mix.feed)}`;
    const frame = el("iframe", { src, title: `${mix.title} — Mixcloud player`, loading: "lazy", allow: "autoplay" });
    document.getElementById("mxPlayer").replaceChildren(frame);
    pop.hidden = false;
    document.documentElement.style.overflow = "hidden";
    document.getElementById("mxClose").focus({ preventScroll: true });
  }

  function closeMix() {
    const pop = document.getElementById("mxPopup");
    pop.hidden = true;
    document.documentElement.style.overflow = "";
    document.getElementById("mxPlayer").replaceChildren();
    if (mxOpener && typeof mxOpener.focus === "function") mxOpener.focus({ preventScroll: true });
  }

  /** Render the scenery gallery — an aspect-aware masonry of photos that
      open a full-screen lightbox. Portrait, landscape and panorama all keep
      their natural shape (no cropping). */
  function renderGallery() {
    const grid = document.getElementById("galleryGrid");
    if (!grid) return;

    const fragment = document.createDocumentFragment();

    GALLERY.forEach((photo, i) => {
      const img = el("img", { class: "shot__img", src: photo.src, alt: photo.alt || "", loading: "lazy" });
      const shot = el(
        "button",
        {
          class: "shot",
          type: "button",
          "aria-label": photo.caption || photo.alt || `Scenery photo ${i + 1}`,
        },
        img,
        photo.caption ? el("span", { class: "shot__cap", "aria-hidden": "true", text: photo.caption }) : null
      );
      img.addEventListener("error", () => shot.classList.add("is-missing"));
      shot.addEventListener("click", () => openLightbox(i));
      fragment.append(shot);
    });

    grid.append(fragment);
  }

  /* -------------------------------------------------------
     Lightbox — full-screen photo viewer with prev/next
  ------------------------------------------------------- */
  let lightboxIndex = 0;
  let lightboxOpener = null; // element to restore focus to on close

  function setupLightbox() {
    const box = document.getElementById("lightbox");
    if (!box) return;

    document.getElementById("lbClose").addEventListener("click", closeLightbox);
    document.getElementById("lbBackdrop").addEventListener("click", closeLightbox);
    document.getElementById("lbPrev").addEventListener("click", () => stepLightbox(-1));
    document.getElementById("lbNext").addEventListener("click", () => stepLightbox(1));

    document.addEventListener("keydown", (event) => {
      if (box.hidden) return;
      if (event.key === "Escape") closeLightbox();
      else if (event.key === "ArrowLeft") stepLightbox(-1);
      else if (event.key === "ArrowRight") stepLightbox(1);
      else if (event.key === "Tab") trapFocus(event, box);
    });
  }

  function openLightbox(index) {
    const box = document.getElementById("lightbox");
    if (!box) return;
    lightboxOpener = document.activeElement;
    showShot(index);
    box.hidden = false;
    document.documentElement.style.overflow = "hidden";
    document.getElementById("lbClose").focus({ preventScroll: true });
  }

  function stepLightbox(dir) {
    showShot((lightboxIndex + dir + GALLERY.length) % GALLERY.length);
  }

  function showShot(index) {
    lightboxIndex = index;
    const photo = GALLERY[index];
    const img = document.getElementById("lbImg");
    img.src = photo.src;
    img.alt = photo.alt || "";
    document.getElementById("lbCap").textContent = photo.caption || "";
    document.getElementById("lbCount").textContent = `${index + 1} / ${GALLERY.length}`;
  }

  function closeLightbox() {
    const box = document.getElementById("lightbox");
    box.hidden = true;
    document.documentElement.style.overflow = "";
    document.getElementById("lbImg").src = "";
    if (lightboxOpener && typeof lightboxOpener.focus === "function") {
      lightboxOpener.focus({ preventScroll: true });
    }
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
    // If bar is showing from a previous session, stop it first.
    if (npActive) stopNowPlaying(); // clears field audio and docked mix too
    const flipcard = document.getElementById("flipcard");
    originSleeve = sleeve;
    lastFocused = sleeve;
    npAlbumData = album;

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
      // Check if still playing — if so, dock instead of fully closing
      if (currentWidget) {
        currentWidget.isPaused((paused) => {
          if (!paused) {
            // Dock: keep iframe alive, show mini bar
            popup.classList.add("is-docked");
            popup.removeAttribute("hidden"); // must stay in DOM for iframe
            flipcard.style.transform = "none";
            flipcard.style.opacity = "";
            dockBar(true);
            // Wire PLAY_PROGRESS to the bar's fill
            currentWidget.bind(SC.Widget.Events.PLAY_PROGRESS, (data) => {
              const fill = document.getElementById("npFill");
              if (fill) fill.style.transform = `scaleX(${data.relativePosition || 0})`;
              const bar = document.getElementById("nowPlaying");
              if (bar) bar.classList.remove("is-paused");
            });
            currentWidget.bind(SC.Widget.Events.PAUSE, () => {
              document.getElementById("nowPlaying")?.classList.add("is-paused");
            });
            currentWidget.bind(SC.Widget.Events.PLAY, () => {
              document.getElementById("nowPlaying")?.classList.remove("is-paused");
            });
            currentWidget.bind(SC.Widget.Events.FINISH, () => {
              stopNowPlaying();
            });
          } else {
            // Not playing — full close
            popup.hidden = true;
            flipcard.classList.remove("is-flipped");
            flipcard.style.transform = "none";
            flipcard.style.opacity = "";
            document.getElementById("popupPlayer").replaceChildren();
            currentWidget = null;
            originSleeve = null;
          }
        });
      } else {
        popup.hidden = true;
        flipcard.classList.remove("is-flipped");
        flipcard.style.transform = "none";
        flipcard.style.opacity = "";
        document.getElementById("popupPlayer").replaceChildren();
        currentWidget = null;
        originSleeve = null;
      }
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
     Now-playing mini bar
  ------------------------------------------------------- */
  function setupNowPlaying() {
    const bar = document.getElementById("nowPlaying");
    if (!bar) return;

    document.getElementById("npPlayPause").addEventListener("click", () => {
      if (npSource === "sc" && currentWidget) {
        currentWidget.isPaused((paused) => {
          if (paused) { currentWidget.play(); bar.classList.remove("is-paused"); }
          else        { currentWidget.pause(); bar.classList.add("is-paused"); }
        });
      } else if (npSource === "field" && npFieldAudio) {
        if (npFieldAudio.paused) { npFieldAudio.play(); bar.classList.remove("is-paused"); }
        else                     { npFieldAudio.pause(); bar.classList.add("is-paused"); }
      }
    });

    document.getElementById("npExpand").addEventListener("click", () => {
      if (npSource === "sc") {
        const popup = document.getElementById("popup");
        if (!popup) return;
        popup.classList.remove("is-docked");
        popup.removeAttribute("hidden");
        document.documentElement.style.overflow = "hidden";
        dockBar(false);
        document.getElementById("popupClose").focus({ preventScroll: true });
      } else if (npSource === "mix") {
        const pop = document.getElementById("mxPopup");
        if (!pop) return;
        pop.removeAttribute("hidden");
        document.documentElement.style.overflow = "hidden";
        dockBar(false);
        document.getElementById("mxClose").focus({ preventScroll: true });
      } else if (npSource === "field" && npFieldMarker) {
        npFieldMarker.openPopup();
      }
    });

    document.getElementById("npStop").addEventListener("click", stopNowPlaying);
  }

  function showNpBar(source, { title, subtitle, art, canExpand }) {
    npSource = source;
    const bar = document.getElementById("nowPlaying");
    if (!bar) return;
    const artEl = document.getElementById("npArt");
    artEl.src = art || "";
    artEl.hidden = !art;
    document.getElementById("npTitle").textContent = title || "";
    document.getElementById("npAlbum").textContent = subtitle || "";
    document.getElementById("npPlayPause").hidden = source === "mix";
    document.getElementById("npExpand").hidden = !canExpand;
    bar.classList.remove("is-paused");
    bar.removeAttribute("hidden");
    requestAnimationFrame(() => bar.classList.add("is-visible"));
    npActive = true;
  }

  function dockBar(show) {
    if (show) {
      showNpBar("sc", {
        title: npAlbumData?.title || "",
        subtitle: npAlbumData?.year || "",
        art: npAlbumData?.cover || null,
        canExpand: true,
      });
    } else {
      const bar = document.getElementById("nowPlaying");
      if (!bar) return;
      bar.classList.remove("is-visible");
      npActive = false;
      bar.addEventListener("transitionend", () => { if (!npActive) bar.setAttribute("hidden", ""); }, { once: true });
    }
  }

  function stopNowPlaying() {
    if (npSource === "sc" || npSource === null) {
      const popup = document.getElementById("popup");
      if (popup) {
        popup.classList.remove("is-docked");
        document.getElementById("popupPlayer")?.replaceChildren();
        currentWidget = null;
        popup.hidden = true;
        document.documentElement.style.overflow = "";
      }
      npAlbumData = null;
    } else if (npSource === "mix") {
      document.getElementById("mxPlayer")?.replaceChildren();
      const pop = document.getElementById("mxPopup");
      if (pop) { pop.hidden = true; document.documentElement.style.overflow = ""; }
      currentMix = null;
    } else if (npSource === "field") {
      if (npFieldAudio) { npFieldAudio.pause(); npFieldAudio.currentTime = 0; npFieldAudio = null; }
      npFieldMarker = null;
    }
    dockBar(false);
    npSource = null;
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
     Interactive field recording location map (Leaflet.js)
  ------------------------------------------------------- */
  function renderFieldMap() {
    const container = document.getElementById("fieldMap");
    if (!container) return;
    if (typeof L === "undefined") {
      // Leaflet script hasn't executed yet — retry once the page is fully loaded
      window.addEventListener("load", renderFieldMap, { once: true });
      return;
    }

    const map = L.map(container, {
      center: [25, 115],
      zoom: 3,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    const PIN_COLOURS = Object.values(ACCENTS); // aqua, sky, violet, coral, gold, green
    let fieldVolume = 0.7;

    // Volume control overlay (bottom-left, above Leaflet attribution)
    const VolumeControl = L.Control.extend({
      options: { position: "bottomleft" },
      onAdd() {
        const div = L.DomUtil.create("div", "fmap__vol-control");
        div.innerHTML = `
          <svg class="fmap__vol-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M4 9v6h4l5 5V4L8 9H4z"/>
            <path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                  d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/>
          </svg>
          <input class="fmap__vol-slider" type="range" min="0" max="100" value="70" aria-label="Field recording volume">
        `;
        L.DomEvent.disableClickPropagation(div);
        div.querySelector(".fmap__vol-slider").addEventListener("input", (e) => {
          fieldVolume = Number(e.target.value) / 100;
          if (npFieldAudio) npFieldAudio.volume = fieldVolume;
        });
        return div;
      },
    });
    new VolumeControl().addTo(map);

    MAP_LOCATIONS.forEach((loc, i) => {
      const color = PIN_COLOURS[i % PIN_COLOURS.length];
      const icon = L.divIcon({
        className: "fmap__pin",
        html: `<span class="fmap__pin-dot" style="--pin-color:${color}"></span>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -12],
      });

      const popupHtml = `<strong>${loc.name}</strong><br><em>${loc.year}</em>`
        + (loc.note ? `<br>${loc.note}` : "")
        + (loc.sound ? `<br><span class="fmap__popup-sound">Field recording</span>` : "");

      const marker = L.marker([loc.lat, loc.lng], { icon })
        .addTo(map)
        .bindPopup(popupHtml, { className: "fmap__popup", maxWidth: 220 });

      marker.on("popupopen", (e) => {
        // Stop any currently playing field audio (different pin)
        if (npFieldAudio) { npFieldAudio.pause(); npFieldAudio.currentTime = 0; npFieldAudio = null; }
        // Clear any other docked source
        if (npActive && npSource !== "field") stopNowPlaying();

        if (loc.sound) {
          npFieldAudio = new Audio(loc.sound);
          npFieldAudio.loop = true;
          npFieldAudio.volume = fieldVolume;
          npFieldAudio.play().catch(() => {});
          npFieldAudio.addEventListener("pause", () => document.getElementById("nowPlaying")?.classList.add("is-paused"));
          npFieldAudio.addEventListener("play",  () => document.getElementById("nowPlaying")?.classList.remove("is-paused"));
          npFieldAudio.addEventListener("timeupdate", () => {
            const ratio = npFieldAudio ? npFieldAudio.currentTime / (npFieldAudio.duration || 1) : 0;
            document.getElementById("npFill")?.style.setProperty("transform", `scaleX(${ratio})`);
          });
          npFieldMarker = marker;
          showNpBar("field", { title: loc.name, subtitle: `Field recording · ${loc.year}`, art: null, canExpand: true });
          e.popup.getElement()?.querySelector(".fmap__popup-sound")?.classList.add("is-playing");
        }
      });

      // Popup close: audio keeps playing via the now-playing bar — nothing to do here
      marker.on("popupclose", () => {});
    });

    // The map container starts hidden by the .reveal animation. Once the CSS
    // transition ends and the container is fully visible, recalculate tile layout.
    container.closest(".fmap__wrap")?.addEventListener(
      "transitionend",
      () => map.invalidateSize(),
      { once: true }
    );
  }

  /* -------------------------------------------------------
     Colourful scroll progress bar across the top
  ------------------------------------------------------- */
  function setupScrollProgress() {
    const bar = document.getElementById("progress");
    if (!bar) return;
    const root = document.documentElement;
    let ticking = false;
    const update = () => {
      const max = root.scrollHeight - root.clientHeight;
      const ratio = max > 0 ? Math.min(1, root.scrollTop / max) : 0;
      bar.style.transform = `scaleX(${ratio})`;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  /* -------------------------------------------------------
     Soft colour glow that follows the pointer. Mouse-only,
     and disabled entirely for reduced-motion visitors.
  ------------------------------------------------------- */
  function setupSpotlight() {
    const glow = document.getElementById("spotlight");
    if (!glow) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let x = 0, y = 0, raf = null;
    const apply = () => {
      glow.style.setProperty("--mx", `${x}px`);
      glow.style.setProperty("--my", `${y}px`);
      raf = null;
    };
    window.addEventListener("pointermove", (event) => {
      x = event.clientX; y = event.clientY;
      glow.classList.add("is-on");
      if (raf == null) raf = requestAnimationFrame(apply);
    }, { passive: true });
    document.addEventListener("pointerleave", () => glow.classList.remove("is-on"));
  }

  /* -------------------------------------------------------
     Init (the script is deferred, so the DOM is ready)
  ------------------------------------------------------- */
  function init() {
    setupScrollProgress();
    setupSpotlight();
    renderSleeves(ALBUMS, "albumList");
    renderSleeves(EPs, "epList");
    renderSleeves(UPCOMING, "upcomingList");
    renderTurntable();
    renderMixes();
    setupMixPopup();
    renderFieldMap();
    renderGallery();
    setupGearFallbacks();
    setupPopup();
    setupNowPlaying();
    setupTurntablePopup();
    setupLightbox();
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
