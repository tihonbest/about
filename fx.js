// fx.js — подключать ПОСЛЕ script.js
(() => {
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  const header = document.querySelector("header");
  const hero = document.querySelector(".hero");
  const map = document.querySelector(".map");
  const mapItems = $(".map-item");
  const images = $(".project-image img");

  // Герой управляется скроллом, поэтому обычное появление снизу ему не нужно
  document.querySelector(".hero-content")?.classList.remove("reveal");

  // Подзаголовки: слова загораются по мере прокрутки
  const scrubs = calm ? [] : $(".section-desc").map(el => {
    el.classList.remove("reveal");
    el.classList.add("scrub");
    el.innerHTML = el.textContent.trim().split(/\s+/)
      .map(w => `<span class="w">${w}</span>`).join(" ");
    return { el, words: $(".w", el) };
  });

  // Подсветка текущего раздела в меню
  const spyLinks = $(".nav-links a").filter(a => a.getAttribute("href").startsWith("#"));
  const spyTargets = spyLinks.map(a => document.querySelector(a.getAttribute("href")));

  let ticking = false;

  function update() {
    ticking = false;
    const y = scrollY;
    const h = innerHeight;

    header?.classList.toggle("is-scrolled", y > 40);

    if (hero && !calm) hero.style.setProperty("--hp", clamp(y / (h * 0.7)).toFixed(3));

    scrubs.forEach(({ el, words }) => {
      const top = el.getBoundingClientRect().top;
      const n = Math.round(clamp((h * 0.9 - top) / (h * 0.4)) * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < n));
    });

    if (map) {
      const r = map.getBoundingClientRect();
      const line = h * 0.6;
      map.style.setProperty("--fill", (calm ? 1 : clamp((line - r.top) / r.height)).toFixed(3));
      mapItems.forEach(it =>
        it.classList.toggle("passed", calm || it.getBoundingClientRect().top < line));
    }

    if (!calm) {
      images.forEach(img => {
        const r = img.parentElement.getBoundingClientRect();
        const p = clamp((r.top + r.height / 2) / h) - 0.5;
        img.style.setProperty("--py", (p * 28).toFixed(1));
      });
    }

    let current = null;
    spyTargets.forEach((t, i) => {
      if (t && t.getBoundingClientRect().top < h * 0.4) current = spyLinks[i];
    });
    spyLinks.forEach(a => a.classList.toggle("active", a === current));
  }

  addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener("resize", update);
  update();

  // ===== Ещё показухи =====
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Северное сияние за героем
  hero?.insertAdjacentHTML("afterbegin",
    '<div class="aurora" aria-hidden="true"><i class="blob b1"></i><i class="blob b2"></i><i class="blob b3"></i></div>');

  // Подпись в герое: буквы "собираются" из шума и меняют слова
  const label = document.querySelector(".hero-label");
  if (label && !calm) {
    const words = [label.textContent.trim(), "Веб-разработка", "Python", "Электроника"];
    const noise = "01#%&@+*";
    let n = 0;
    const scramble = to => {
      let f = 0;
      const id = setInterval(() => {
        const done = (f / 18) * to.length;
        label.textContent = [...to].map((c, k) =>
          (k < done || c === " ") ? c : noise[Math.random() * noise.length | 0]).join("");
        if (++f > 18) { clearInterval(id); label.textContent = to; }
      }, 35);
    };
    setInterval(() => scramble(words[n = (n + 1) % words.length]), 3500);
  }

  // Мышь: подсветка стекла, свечение за курсором, магнитные кнопки, наклон карточек
  const glow = fine && !calm ? Object.assign(document.createElement("div"), { className: "cursor-glow" }) : null;
  if (glow) document.body.append(glow);
  let tx = 0, ty = 0, gx = 0, gy = 0, magnet = null, tilt = null;

  if (fine) {
    document.addEventListener("pointermove", e => {
      const el = e.target;
      const g = el.closest?.(".glass");
      if (g) {
        const r = g.getBoundingClientRect();
        g.style.setProperty("--mx", (e.clientX - r.left) + "px");
        g.style.setProperty("--my", (e.clientY - r.top) + "px");
      }
      if (!glow) return;

      tx = e.clientX; ty = e.clientY;
      glow.classList.add("on");
      if (hero) {
        hero.style.setProperty("--ax", ((tx / innerWidth - 0.5) * 2).toFixed(3));
        hero.style.setProperty("--ay", ((ty / innerHeight - 0.5) * 2).toFixed(3));
      }

      const b = el.closest?.(".btn") || null;
      if (b !== magnet) { if (magnet) magnet.style.translate = ""; magnet = b; }
      if (b) {
        const r = b.getBoundingClientRect();
        b.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1)}px`;
      }

      const c = el.closest?.(".project, .achievement") || null;
      if (c !== tilt) { if (tilt) tilt.style.rotate = ""; tilt = c; }
      if (c) {
        const r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        c.style.rotate = `${-py.toFixed(3)} ${px.toFixed(3)} 0 ${(Math.hypot(px, py) * 12).toFixed(2)}deg`;
      }
    }, { passive: true });
  }

  // Один цикл кадров: свечение догоняет курсор, лента навыков ускоряется от скролла
  if (!calm) {
    const track = document.getElementById("skills-track");
    let last = scrollY, rate = 1;
    (function frame() {
      if (glow) {
        gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
        glow.style.transform = `translate(${gx - 250}px, ${gy - 250}px)`;
      }
      const v = Math.abs(scrollY - last);
      last = scrollY;
      rate += (1 + Math.min(v / 6, 5) - rate) * 0.08;
      if (track && (v || rate > 1.01)) track.getAnimations().forEach(a => (a.playbackRate = rate));
      requestAnimationFrame(frame);
    })();
  }
})();

// ===== Обратный отсчёт до ближайшего события =====
document.addEventListener("DOMContentLoaded", () => {
  const sec = document.getElementById("next-event");
  if (!sec) return;
  const card = sec.querySelector("#next-event-container .event");
  const title = card?.querySelector("h3")?.textContent;
  const ev = typeof allEvents !== "undefined" && allEvents.find(e => e.title === title);
  if (!card || !ev) { sec.style.display = "none"; return; }

  const target = new Date(`${ev.date}T${ev.time}`);
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const units = [["d", "дн"], ["h", "ч"], ["m", "мин"], ["s", "с"]];
  const box = document.createElement("div");
  box.className = "countdown";
  box.setAttribute("role", "timer");
  box.innerHTML = units.map(([k, l]) =>
    `<div class="cd-cell"><span class="cd-num" data-u="${k}">00</span><span class="cd-label">${l}</span></div>`).join("");
  card.querySelector(".btn").before(box);
  const nums = Object.fromEntries(units.map(([k]) => [k, box.querySelector(`[data-u="${k}"]`)]));

  const tick = () => {
    const s = Math.floor((target - Date.now()) / 1000);
    if (s <= 0) { box.innerHTML = '<p class="cd-done">Событие уже началось</p>'; clearInterval(timer); return; }
    const v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    for (const k in v) {
      const t = String(v[k]).padStart(2, "0");
      if (nums[k].textContent !== t) {
        nums[k].textContent = t;
        if (!calm) nums[k].animate(
          [{ transform: "translateY(-8px)", opacity: 0.3 }, { transform: "none", opacity: 1 }],
          { duration: 300, easing: "ease-out" });
      }
    }
  };
  const timer = setInterval(tick, 1000);
  tick();
});

// ===== Дипломы: превью в карточках и просмотр на весь экран =====
(() => {
  const cards = [...document.querySelectorAll(".achievement")];
  if (!cards.length) return;

  // Порядок как в index.html: НТО 2023, НТО 2024, призёр 2024, Талант НТО 2025
  const previews = [
    "images/diplomas/nto-2023.jpg",
    "images/diplomas/nto-2024.jpg",
    "images/diplomas/nto-2024-prize.jpg",
    "images/diplomas/talent-2025.jpg"
  ];
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Диплом");
  lb.innerHTML = '<button class="lb-close" type="button" aria-label="Закрыть">✕</button><img alt="">' +
    '<div class="lb-bar"><a class="btn" target="_blank" rel="noopener">Открыть PDF ↗</a></div>';
  document.body.append(lb);
  const big = lb.querySelector("img");
  const pdf = lb.querySelector(".lb-bar a");
  const closeBtn = lb.querySelector(".lb-close");
  let trigger = null;

  const close = () => {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    trigger?.focus({ preventScroll: true });
  };

  const open = (thumb, href, btn) => {
    trigger = btn;
    big.src = thumb.currentSrc || thumb.src;
    big.alt = thumb.alt;
    pdf.hidden = !href;
    if (href) pdf.href = href;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    closeBtn.focus({ preventScroll: true });
    if (calm) return;
    // Картинка "вылетает" из миниатюры
    const go = () => {
      const a = thumb.getBoundingClientRect(), b = big.getBoundingClientRect();
      if (!b.width) return;
      const dx = a.left + a.width / 2 - b.left - b.width / 2;
      const dy = a.top + a.height / 2 - b.top - b.height / 2;
      big.animate(
        [{ transform: `translate(${dx}px, ${dy}px) scale(${a.width / b.width})` }, { transform: "none" }],
        { duration: 450, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
    };
    big.complete ? go() : big.addEventListener("load", go, { once: true });
  };

  lb.addEventListener("click", e => { if (e.target === lb || e.target === big) close(); });
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && lb.classList.contains("open")) close(); });

  cards.forEach((card, i) => {
    if (!previews[i]) return;
    const name = card.querySelector("h3")?.textContent || "Диплом";
    const year = card.querySelector(".achievement-year")?.textContent || "";
    const link = card.querySelector("a.btn");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "diploma-thumb";
    btn.setAttribute("aria-label", `Открыть диплом: ${name}, ${year}`);
    const img = new Image();
    img.loading = "lazy";
    img.alt = `Диплом: ${name}, ${year}`;
    img.onerror = () => btn.remove();   // нет файла — карточка остаётся как была
    img.src = previews[i];
    btn.append(img);
    card.prepend(btn);
    btn.addEventListener("click", () => open(img, link?.href, btn));
  });
})();


// ===== Закреплённая сцена: прогресс прокрутки управляет разборкой 3D-объекта =====
(() => {
  const root = document.querySelector("#story");
  if (!root) return;
  const track = root.querySelector(".story-track");
  const steps = [...root.querySelectorAll(".story-step")];
  const bar = root.querySelector(".story-progress i");
  const counter = root.querySelector(".story-counter");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) { root.dataset.stage = "0"; return; }
  let queued = false;
  const render = () => {
    queued = false;
    const rect = track.getBoundingClientRect();
    const range = Math.max(1, track.offsetHeight - innerHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / range));
    const stage = Math.min(2, Math.floor(progress * 3));
    root.dataset.stage = String(stage);
    steps.forEach((step, i) => step.classList.toggle("is-active", i === stage));
    if (bar) bar.style.width = (progress * 100).toFixed(2) + "%";
    if (counter) counter.innerHTML = String(stage + 1).padStart(2,"0") + " <b>/</b> 03";
  };
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(render); } };
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", request);
  render();
})();
