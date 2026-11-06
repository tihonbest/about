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
