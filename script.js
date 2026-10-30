document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // 1. БЛИЖАЙШЕЕ СОБЫТИЕ НА ГЛАВНОЙ (index.html)
  // ==========================================
  const nextContainer = document.getElementById("next-event-container");

  if (nextContainer) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureEvents = allEvents
      .filter(ev => new Date(ev.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (futureEvents.length === 0) {
      nextContainer.parentElement.style.display = "none";
    } else {
      const next = futureEvents[0];
      const dateObj = new Date(next.date);
      const formattedDate = dateObj.toLocaleDateString('ru-RU', { 
        day: 'numeric', month: 'long', year: 'numeric' 
      });

      // Показываем строку "Где:", только если место указано
      const placeHtml = next.place ? `<p><strong>Где:</strong> ${next.place}</p>` : "";

      nextContainer.innerHTML = `
        <article class="event next">
          <h3>${next.title}</h3>
          <p><strong>Дата:</strong> ${formattedDate}, ${next.time}</p>
          ${placeHtml}
          <a href="${next.link}" target="_blank">${next.linkText}</a>
        </article>
      `;
    }
  }

  // ==========================================
  // 2. СПИСОК ВСЕХ МЕРОПРИЯТИЙ (events.html)
  // ==========================================
  const eventsListContainer = document.getElementById("events-list");

  if (eventsListContainer) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Копируем и сортируем по дате (от старых к новым)
    const sorted = [...allEvents].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Индекс ближайшего будущего события
    let nextIndex = sorted.findIndex(ev => new Date(ev.date) >= today);

    sorted.forEach((ev, i) => {
      const dateObj = new Date(ev.date);
      const formatted = dateObj.toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      const isPast = new Date(ev.date) < today;
      const isNext = i === nextIndex;

      const classes = "event" + (isPast ? " past" : "") + (isNext ? " next" : "");
      const placeHtml = ev.place ? `<p><strong>Где:</strong> ${ev.place}</p>` : "";

      eventsListContainer.innerHTML += `
        <article class="${classes}">
          <h3>${ev.title}</h3>
          <p><strong>Дата:</strong> ${formatted}, ${ev.time}</p>
          ${placeHtml}
          <a href="${ev.link}" target="_blank">${ev.linkText}</a>
        </article>
      `;
    });
  }

});