/* Lightweight 3D interactions. No frameworks or external libraries. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  const hero = document.querySelector(".hero .container");
  const content = document.querySelector(".hero-content");
  if (hero && content && !document.querySelector(".hero-scene")) {
    const scene = document.createElement("div");
    scene.className = "hero-scene";
    scene.setAttribute("aria-hidden", "true");
    scene.innerHTML = `
      <div class="scene-grid"></div>
      <div class="scene-core">
        <div class="core-sphere"></div>
        <div class="core-ring ring-a"></div>
        <div class="core-ring ring-b"></div>
        <div class="core-ring ring-c"></div>
      </div>
      <i class="scene-orbit orbit-a"></i><i class="scene-orbit orbit-b"></i>
      <div class="scene-caption">Ideas into reality</div>`;
    hero.append(scene);

    const meta = document.createElement("div");
    meta.className = "hero-meta";
    meta.innerHTML = "<span>Web development</span><span>Python & C++</span><span>Electronics</span>";
    content.append(meta);
  }

  // Soft 3D card tilt and localized light, only for mouse/trackpad.
  if (finePointer && !reduce) {
    document.querySelectorAll(".project, .achievement").forEach(card => {
      let rect;
      card.addEventListener("pointermove", event => {
        rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty("--card-x", (x * 100) + "%");
        card.style.setProperty("--card-y", (y * 100) + "%");
        card.style.transform = `perspective(900px) rotateX(${(0.5-y)*3}deg) rotateY(${(x-0.5)*4}deg) translateY(-3px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });

    const scene = document.querySelector(".hero-scene");
    if (scene) {
      let frame = 0;
      scene.addEventListener("pointermove", event => {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const r = scene.getBoundingClientRect();
          const x = (event.clientX - r.left) / r.width - .5;
          const y = (event.clientY - r.top) / r.height - .5;
          scene.style.transform = `perspective(1100px) rotateX(${-y*7}deg) rotateY(${x*9}deg)`;
        });
      });
      scene.addEventListener("pointerleave", () => {
        scene.style.transform = "";
      });
    }
  }

  // Give project cards a subtle staggered entrance without replacing existing reveal logic.
  document.querySelectorAll("#projects-grid .project").forEach((card, index) => {
    card.style.transitionDelay = (index * 75) + "ms";
  });
})();
