document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // 1. АНИМАЦИИ ПОЯВЛЕНИЯ И ПРОГРЕСС-БАР
  // ==========================================
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / height) * 100;
    const progressBar = document.getElementById("progress");
    if (progressBar) progressBar.style.width = progress + "%";
  });

  // ==========================================
  // 2. ЛОГИКА МЕРОПРИЯТИЙ (если есть data.js)
  // ==========================================
  if (typeof allEvents !== "undefined") {
    
    // А) Ближайшее событие на главной
    const nextContainer = document.getElementById("next-event-container");
    if (nextContainer) {
      const today = new Date(); today.setHours(0,0,0,0);
      const futureEvents = allEvents.filter(ev => new Date(ev.date) >= today).sort((a, b) => new Date(a.date) - new Date(b.date));

      if (futureEvents.length === 0) {
        nextContainer.parentElement.style.display = "none";
      } else {
        const next = futureEvents[0];
        const dateObj = new Date(next.date);
        const formattedDate = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        nextContainer.innerHTML = `
          <article class="event glass next reveal">
            <h3>${next.title}</h3>
            <p><strong>Дата:</strong> ${formattedDate}, ${next.time}</p>
            <a href="${next.link}" target="_blank" class="btn">${next.linkText}</a>
          </article>
        `;
        // Принудительно показываем добавленную карточку
        setTimeout(() => nextContainer.querySelector('.event').classList.add('visible'), 100);
      }
    }

    // Б) Полный список на events.html
    const eventsListContainer = document.getElementById("events-list");
    if (eventsListContainer) {
      const today = new Date(); today.setHours(0,0,0,0);
      const sorted = [...allEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
      let nextIndex = sorted.findIndex(ev => new Date(ev.date) >= today);

      sorted.forEach((ev, i) => {
        const dateObj = new Date(ev.date);
        const formatted = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        const isPast = new Date(ev.date) < today;
        const isNext = i === nextIndex;
        const classes = "event glass reveal" + (isPast ? " past" : "") + (isNext ? " next" : "");

        eventsListContainer.innerHTML += `
          <article class="${classes}">
            <h3>${ev.title}</h3>
            <p><strong>Дата:</strong> ${formatted}, ${ev.time}</p>
            ${ev.place ? `<p><strong>Где:</strong> ${ev.place}</p>` : ""}
            <a href="${ev.link}" target="_blank" class="btn">${ev.linkText}</a>
          </article>
        `;
      });
      // Запускаем анимацию для новых карточек
      document.querySelectorAll(".event.reveal").forEach(el => observer.observe(el));
    }
  }
});