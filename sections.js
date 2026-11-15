// Everything below the hero: residences, amenities, location, booking, footer.
(() => {
  "use strict";

  const site = window.SITE;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  /* ================= Residences ================= */

  const FLOORS = 62;
  const PODIUM_TOP = 5;   // floors 1 to 5 are the shared base
  const BRIDGE_FLOOR = 58;
  const PITCH = 9.6;      // distance from one floor to the next in the drawing
  const SLAB = 7.6;
  const GROUND = 624;
  const TOWER_X = [44, 130, 216];
  const TOWER_W = 60;
  const SVG_NS = "http://www.w3.org/2000/svg";

  const svg = $("towerSvg");
  const floorNodes = []; // [{ floor, nodes: [rect, ...] }]

  const svgEl = (name, attrs, className) => {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (className) node.setAttribute("class", className);
    svg.append(node);
    return node;
  };

  for (let floor = 1; floor <= FLOORS; floor++) {
    const y = GROUND - floor * PITCH;
    const nodes = [];
    if (floor <= PODIUM_TOP) {
      nodes.push(svgEl("rect", { x: 30, y, width: 260, height: SLAB, rx: 2 }, "fl podium"));
    } else {
      TOWER_X.forEach((x, t) => {
        // A slow wave in the slab width echoes the curved balconies.
        const w = TOWER_W + 3.2 * Math.sin(floor * 0.5 + t * 1.7);
        nodes.push(svgEl("rect", { x: x + (TOWER_W - w) / 2, y, width: w, height: SLAB, rx: 2 }, "fl"));
      });
    }
    floorNodes.push({ floor, nodes });
  }

  const bridgeY = GROUND - BRIDGE_FLOOR * PITCH;
  svgEl("rect", { x: 103, y: bridgeY, width: 28, height: SLAB, rx: 1.5 }, "bridge");
  svgEl("rect", { x: 189, y: bridgeY, width: 28, height: SLAB, rx: 1.5 }, "bridge");
  svgEl("line", { x1: 10, x2: 310, y1: GROUND + 2, y2: GROUND + 2 }, "ground");

  const resList = $("resList");
  const bandLabel = $("bandLabel");
  const residenceSelect = $("fResidence");
  const resItems = [];

  site.residences.forEach((r, i) => {
    const li = make("li", "res-item");
    const head = make("button", "res-head");
    head.type = "button";
    head.id = `res-head-${r.id}`;
    head.setAttribute("aria-controls", `res-body-${r.id}`);
    head.append(make("span", "res-name", r.name), make("span", "res-floors", `Floors ${r.floors[0]} to ${r.floors[1]}`));

    const body = make("div", "res-body");
    body.id = `res-body-${r.id}`;
    body.setAttribute("role", "region");
    body.setAttribute("aria-labelledby", head.id);
    const inner = make("div", "res-body-inner");

    const facts = make("dl", "res-facts");
    [["Interior", `${r.size} m²`], ["Bedrooms", r.beds], ["Bathrooms", r.baths]].forEach(([label, value]) => {
      const cell = make("div");
      cell.append(make("dt", "", label), make("dd", "", String(value)));
      facts.append(cell);
    });

    const ask = make("a", "text-link", "Ask about this residence");
    ask.href = "#book";
    ask.addEventListener("click", () => { residenceSelect.value = r.id; });

    inner.append(facts, make("p", "res-note", r.note), ask);
    body.append(inner);
    li.append(head, body);
    resList.append(li);

    head.addEventListener("click", () => selectResidence(i));
    resItems.push({ li, head, body });

    const option = make("option", "", r.name);
    option.value = r.id;
    residenceSelect.append(option);
  });

  function selectResidence(index) {
    const [lo, hi] = site.residences[index].floors;

    resItems.forEach(({ li, head, body }, i) => {
      const open = i === index;
      li.classList.toggle("is-open", open);
      head.setAttribute("aria-expanded", String(open));
      body.inert = !open;
    });

    // Light the floors from the bottom of the band upwards.
    floorNodes.forEach(({ floor, nodes }) => {
      const on = floor >= lo && floor <= hi;
      nodes.forEach((node) => {
        node.classList.toggle("on", on);
        node.style.setProperty("--d", on ? floor - lo : 0);
      });
    });

    const centreY = GROUND - ((lo + hi) / 2) * PITCH + SLAB / 2;
    bandLabel.style.top = `${(centreY / 640) * 100}%`;
    bandLabel.textContent = `Floors ${lo} to ${hi}`;
  }

  selectResidence(1);

  /* ================= Amenities ================= */

  const amenities = $("amenities");
  const amViewport = $("amViewport");
  const amTrack = $("amTrack");
  const amBar = $("amBar");
  const amCards = [];

  site.amenities.forEach((a) => {
    const li = make("li", "am-card");
    const figure = make("figure");
    const frame = make("div", "am-img");
    const img = make("img");
    img.src = `assets/gallery/${a.image}.jpg`;
    img.alt = "";
    img.loading = "lazy";
    frame.append(img);
    const caption = make("figcaption");
    caption.append(make("h3", "", a.name), make("p", "", a.text));
    figure.append(frame, caption);
    li.append(figure);
    amTrack.append(li);
    amCards.push({ li, img });
  });

  // Pinned sideways scroll on larger screens; a plain swipe strip otherwise.
  const pinQuery = window.matchMedia("(min-width: 761px) and (prefers-reduced-motion: no-preference)");
  let pinned = false;
  let amTravel = 0;

  function layoutAmenities() {
    pinned = pinQuery.matches;
    amenities.classList.toggle("is-strip", !pinned);
    if (!pinned) {
      amenities.style.height = "";
      amTrack.style.transform = "";
      amCards.forEach(({ img }) => img.style.removeProperty("--px"));
      return;
    }
    amTravel = Math.max(0, amTrack.scrollWidth - amViewport.clientWidth);
    amenities.style.height = `${window.innerHeight + amTravel}px`;
  }

  /* ================= Location ================= */

  const loc = site.location;
  const locTitle = $("locTitle");
  loc.title.forEach((text) => {
    const line = make("span", "line");
    line.append(make("span", "", text));
    locTitle.append(line);
  });
  $("locText").textContent = loc.text;
  $("locNote").textContent = loc.footnote;
  $("locImage").src = `assets/gallery/${loc.image}.jpg`;
  const locFrame = $("locFrame");

  const places = $("places");
  loc.places.forEach((p, i) => {
    const li = make("li");
    li.dataset.reveal = "";
    li.style.setProperty("--i", i);
    const minutes = make("span", "place-min");
    const number = make("b", "", String(p.minutes));
    number.dataset.count = p.minutes;
    minutes.append(number, document.createTextNode("min"));
    li.append(make("span", "place-name", p.name), minutes);
    places.append(li);
  });

  function countUp(node) {
    const target = Number(node.dataset.count);
    if (reducedMotion || !target) return;
    const start = performance.now();
    const duration = 900;
    const tick = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      node.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    };
    node.textContent = "0";
    requestAnimationFrame(tick);
  }

  /* ================= Contact details and form ================= */

  const telHref = `tel:${site.phone.replace(/[^+\d]/g, "")}`;
  const mailHref = `mailto:${site.bookingEmail}`;
  $("contactGallery").textContent = site.contact.gallery;
  $("contactHours").textContent = site.contact.hours;
  $("contactPhone").textContent = site.phone;
  $("contactPhone").href = telHref;
  $("footGallery").textContent = site.contact.gallery;
  $("footHours").textContent = site.contact.hours;
  $("footEmail").textContent = site.bookingEmail;
  $("footEmail").href = mailHref;
  $("footPhone").textContent = site.phone;
  $("footPhone").href = telHref;
  $("footerMark").textContent = site.brand;
  $("footBrand").textContent = site.brand[0] + site.brand.slice(1).toLowerCase();

  const form = $("bookForm");
  const status = $("formStatus");
  const required = [
    { input: $("fName"), error: $("fNameErr"), message: "Enter your name." },
    { input: $("fPhone"), error: $("fPhoneErr"), message: "Enter a phone number we can reach you on." },
  ];

  function validate() {
    let firstInvalid = null;
    required.forEach(({ input, error, message }) => {
      const missing = !input.value.trim();
      input.setAttribute("aria-invalid", String(missing));
      error.textContent = missing ? message : "";
      if (missing && !firstInvalid) firstInvalid = input;
    });
    return firstInvalid;
  }

  required.forEach(({ input, error }) => {
    input.addEventListener("input", () => {
      if (input.value.trim()) {
        input.setAttribute("aria-invalid", "false");
        error.textContent = "";
      }
    });
  });

  // There is no server behind this page, so the request is handed to the
  // visitor's own email app, already filled in.
  function buildRequest() {
    const data = new FormData(form);
    const residence = site.residences.find((r) => r.id === data.get("residence"));
    const lines = [
      `Name: ${data.get("name").trim()}`,
      `Phone: ${data.get("phone").trim()}`,
      `Residence: ${residence ? residence.name : "Not sure yet"}`,
    ];
    if (data.get("day")) lines.push(`Preferred day: ${data.get("day")}`);
    if (data.get("message").trim()) lines.push("", data.get("message").trim());
    const subject = `Viewing request: ${site.brand}`;
    return `${mailHref}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const firstInvalid = validate();
    if (firstInvalid) {
      status.textContent = "";
      firstInvalid.focus();
      return;
    }
    status.textContent = "Your email app should now open with the request filled in. Press send there to finish.";
    window.location.href = buildRequest();
  });

  /* ================= Entrances ================= */

  const revealTargets = [...document.querySelectorAll("[data-reveal], .sheet .display")];
  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        entry.target.querySelectorAll("[data-count]").forEach(countUp);
        revealer.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
    revealTargets.forEach((node) => revealer.observe(node));
  } else {
    revealTargets.forEach((node) => node.classList.add("is-in"));
  }

  /* ================= Header: menu and current section ================= */

  const topbar = $("topbar");
  const nav = $("nav");
  const menuBtn = $("menuBtn");
  const navLinks = [...nav.querySelectorAll("a")];

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Close" : "Menu";
    document.documentElement.style.overflow = open ? "hidden" : "";
  }

  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  navLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = navLinks.find((a) => a.getAttribute("href") === `#${entry.target.id}`);
        if (link) link.setAttribute("aria-current", String(entry.isIntersecting));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["residences", "amenities", "location", "book"].forEach((id) => spy.observe($(id)));
  }

  /* ================= Scroll-linked motion ================= */

  const hero = $("top");
  let heroCovered = false;
  let ticking = false;

  function update() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;

    // Hero: recedes and dims as the page slides over it.
    const hp = clamp(y / vh, 0, 1);
    if (!reducedMotion) hero.style.setProperty("--hp", hp.toFixed(3));
    topbar.classList.toggle("is-solid", y > vh * 0.82);
    const covered = hp >= 1;
    if (covered !== heroCovered) {
      heroCovered = covered;
      hero.classList.toggle("is-covered", covered);
      document.dispatchEvent(new CustomEvent("hero:visibility", { detail: { visible: !covered } }));
    }

    // Amenities: vertical scroll drives the track sideways.
    if (pinned) {
      const top = amenities.getBoundingClientRect().top;
      const p = amTravel ? clamp(-top / amTravel, 0, 1) : 0;
      amTrack.style.transform = `translate3d(${(-p * amTravel).toFixed(1)}px, 0, 0)`;
      amBar.style.transform = `scaleX(${p.toFixed(4)})`;
      const mid = window.innerWidth / 2;
      amCards.forEach(({ li, img }) => {
        const box = li.getBoundingClientRect();
        if (box.right < -200 || box.left > window.innerWidth + 200) return;
        const offset = clamp((box.left + box.width / 2 - mid) / window.innerWidth, -1, 1);
        img.style.setProperty("--px", `${(offset * -6).toFixed(2)}%`);
      });
    }

    // Location image: opens up as it enters the screen.
    if (!reducedMotion) {
      const box = locFrame.getBoundingClientRect();
      const lp = clamp((vh - box.top) / (vh * 0.85), 0, 1);
      locFrame.style.setProperty("--lp", lp.toFixed(3));
    }
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function relayout() {
    layoutAmenities();
    update();
  }

  /* ================= Smooth scrolling ================= */

  // A mouse wheel moves the page in abrupt steps. Instead of jumping, the page
  // glides towards where the wheel asked it to go. Touch, keyboard and the
  // scrollbar keep their normal behaviour.
  const HEADER_OFFSET = 64;
  const glide = { target: window.scrollY, current: window.scrollY, applied: window.scrollY, running: false, last: 0 };
  const glideEnabled = !reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

  // True when the wheel is over something that should scroll by itself (a long text box).
  function scrollsInside(node, dy) {
    for (let n = node; n && n.nodeType === 1 && n !== document.body; n = n.parentElement) {
      if (n.scrollHeight <= n.clientHeight + 1) continue;
      if (!/(auto|scroll)/.test(getComputedStyle(n).overflowY)) continue;
      if (dy > 0 ? n.scrollTop + n.clientHeight < n.scrollHeight - 1 : n.scrollTop > 0) return true;
    }
    return false;
  }

  function glideTo(y) {
    if (!glide.running) {
      glide.current = glide.applied = window.scrollY;
      glide.last = performance.now();
      glide.running = true;
      requestAnimationFrame(glideStep);
    }
    glide.target = clamp(y, 0, maxScroll());
  }

  function glideStep(now) {
    // Something else moved the page (scrollbar, keyboard): let it win.
    if (Math.abs(window.scrollY - glide.applied) > 2) {
      glide.running = false;
      return;
    }
    const dt = Math.min(now - glide.last, 50);
    glide.last = now;
    const diff = glide.target - glide.current;
    if (Math.abs(diff) < 0.5) {
      window.scrollTo(0, glide.target);
      glide.running = false;
      return;
    }
    glide.current += diff * (1 - Math.pow(0.88, dt / 16.67));
    window.scrollTo(0, glide.current);
    glide.applied = window.scrollY;
    requestAnimationFrame(glideStep);
  }

  if (glideEnabled) {
    window.addEventListener("wheel", (event) => {
      if (event.ctrlKey || event.defaultPrevented || nav.classList.contains("is-open")) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (scrollsInside(event.target, event.deltaY)) return;
      event.preventDefault();
      let dy = event.deltaY;
      if (event.deltaMode === 1) dy *= 40;
      else if (event.deltaMode === 2) dy *= window.innerHeight;
      glideTo((glide.running ? glide.target : window.scrollY) + dy);
    }, { passive: false });
  }

  // Links to a section travel there with the same glide.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href").slice(1);
      const section = id && document.getElementById(id);
      if (!section) return;
      event.preventDefault();
      const top = id === "top" ? 0 : section.getBoundingClientRect().top + window.scrollY - (id === "residences" ? 0 : HEADER_OFFSET);
      if (glideEnabled) glideTo(top);
      else window.scrollTo({ top: clamp(top, 0, maxScroll()), behavior: reducedMotion ? "auto" : "smooth" });
      history.replaceState(null, "", `#${id}`);
      if (!section.hasAttribute("tabindex")) section.setAttribute("tabindex", "-1");
      section.focus({ preventScroll: true });
    });
  });

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", relayout);
  window.addEventListener("load", relayout);
  pinQuery.addEventListener("change", relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  relayout();
})();
