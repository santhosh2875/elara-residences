(() => {
  "use strict";

  const site = window.SITE;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FADE_MS = reducedMotion ? 1 : 800; // keep in step with --fade in styles.css
  const STILL_TYPES = ["jpg", "png", "webp", "jpeg"];

  // Placeholder colours, one per view, shown until real media is added.
  const TINTS = [
    "linear-gradient(160deg, #c9a878 0%, #8d8f95 45%, #3d4c58 100%)",
    "linear-gradient(160deg, #7fa3ad 0%, #56707a 50%, #2a3b44 100%)",
    "linear-gradient(160deg, #6f9a86 0%, #3f6f72 50%, #1f3a44 100%)",
    "linear-gradient(160deg, #8fb7d6 0%, #5c7fa6 50%, #2b3f5c 100%)",
    "linear-gradient(160deg, #b9b3a6 0%, #7c8a8c 50%, #36454d 100%)",
    "linear-gradient(160deg, #e8b98a 0%, #b07a78 50%, #40384e 100%)",
  ];

  const $ = (id) => document.getElementById(id);
  const stage = $("stage");
  const list = $("viewList");
  const caption = $("caption");
  const titleEl = $("title");
  const factsEl = $("facts");

  $("brand").textContent = site.brand;
  $("place").textContent = site.place;
  document.title = `${site.brand[0]}${site.brand.slice(1).toLowerCase()} | ${site.place}`;

  let current = -1;
  let topZ = 1;
  let switchId = 0;
  let captionTimer = 0;

  const views = site.views.map((data, i) => {
    const base = `${site.mediaFolder}/${data.file}`;
    const tint = TINTS[i % TINTS.length];

    const layer = document.createElement("div");
    layer.className = "layer";
    layer.style.backgroundImage = tint;

    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "none";
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    const hint = document.createElement("p");
    hint.className = "hint";
    hint.hidden = true;
    hint.innerHTML =
      `No media for this view yet. Add <code>${data.file}.mp4</code> ` +
      `(and a still, <code>${data.file}.jpg</code>) to <code>${site.mediaFolder}</code>.`;

    layer.append(video, hint);
    stage.append(layer);

    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "view-btn";
    btn.setAttribute("aria-pressed", "false");
    const thumb = document.createElement("span");
    thumb.className = "thumb";
    thumb.style.backgroundImage = tint;
    const label = document.createElement("span");
    label.textContent = data.label;
    btn.append(thumb, label);
    btn.addEventListener("click", () => show(i));
    li.append(btn);
    list.append(li);

    const view = { ...data, base, layer, video, hint, btn, thumb, hasVideo: null, hasStill: null };

    video.addEventListener("loadeddata", () => {
      view.hasVideo = true;
      updateHint(view);
    });
    video.addEventListener("error", () => {
      view.hasVideo = false;
      video.remove();
      updateHint(view);
    });

    findStill(view, 0);
    return view;
  });

  // Try each image type in turn; the first that loads becomes the still.
  function findStill(view, n) {
    if (n >= STILL_TYPES.length) {
      view.hasStill = false;
      updateHint(view);
      return;
    }
    const url = `${view.base}.${STILL_TYPES[n]}`;
    const img = new Image();
    img.onload = () => {
      view.hasStill = true;
      view.layer.style.backgroundImage = `url("${url}")`;
      view.thumb.style.backgroundImage = `url("${url}")`;
      updateHint(view);
    };
    img.onerror = () => findStill(view, n + 1);
    img.src = url;
  }

  function updateHint(view) {
    view.hint.hidden = !(view.hasVideo === false && view.hasStill === false);
  }

  function loadVideo(view) {
    if (view.hasVideo === false || view.video.getAttribute("src")) return;
    view.video.preload = "auto";
    view.video.src = `${view.base}.mp4`;
  }

  function show(i) {
    if (i === current) return;
    const first = current === -1;
    const next = views[i];
    current = i;
    const id = ++switchId;

    loadVideo(next);

    // Bring the new layer to the front and fade it in over the old one, so
    // the picture never dips to the background colour in between.
    next.layer.classList.remove("is-active");
    next.layer.style.transition = "none";
    void next.layer.offsetWidth;
    next.layer.style.transition = "";
    next.layer.style.zIndex = String(++topZ);
    next.layer.classList.add("is-active");

    if (!reducedMotion && next.hasVideo !== false) {
      try {
        next.video.currentTime = 0;
      } catch (_) {
        /* not seekable yet */
      }
      next.video.play().catch(() => {});
    }

    views.forEach((v) => v.btn.setAttribute("aria-pressed", String(v === next)));
    setCaption(next, !first);

    // Once the fade has finished, hide and pause everything underneath.
    window.setTimeout(() => {
      if (id !== switchId) return;
      views.forEach((v) => {
        if (v === next) return;
        v.layer.classList.remove("is-active");
        v.video.pause();
      });
    }, FADE_MS + 60);
  }

  function setCaption(view, animate) {
    const apply = () => {
      titleEl.textContent = view.title;
      factsEl.textContent = view.facts;
    };
    window.clearTimeout(captionTimer);
    if (!animate || reducedMotion) {
      caption.classList.remove("is-leaving");
      apply();
      return;
    }
    caption.classList.add("is-leaving");
    captionTimer = window.setTimeout(() => {
      apply();
      caption.classList.remove("is-leaving");
    }, 270);
  }

  // sections.js reports when the rest of the page has scrolled over the hero,
  // so the clip is not decoded while nobody can see it.
  document.addEventListener("hero:visibility", (event) => {
    const view = views[current];
    if (!view || view.hasVideo === false) return;
    if (!event.detail.visible) view.video.pause();
    else if (!reducedMotion) view.video.play().catch(() => {});
  });

  show(0);
  requestAnimationFrame(() => document.body.classList.add("is-ready"));
  window.setTimeout(() => document.body.classList.add("is-settled"), 1400);

  // Fetch the other clips in the background so switching is instant.
  window.addEventListener("load", () => {
    window.setTimeout(() => views.forEach(loadVideo), 600);
  });
})();
