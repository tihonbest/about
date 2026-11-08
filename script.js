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
    const progress = height > 0 ? (scrollTop / height) * 100 : 0;
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
            <a href="${next.link}" target="_blank" rel="noopener noreferrer" class="btn">${next.linkText}</a>
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
            <a href="${ev.link}" target="_blank" rel="noopener noreferrer" class="btn">${ev.linkText}</a>
          </article>
        `;
      });
      // Запускаем анимацию для новых карточек
      document.querySelectorAll(".event.reveal").forEach(el => observer.observe(el));
    }
  }

  // ==========================================
  // 3. AI EVENTS — отдельный список из data_ai.js
  // ==========================================
  const aiContainer = document.getElementById("ai-events-list");
  if (aiContainer) {
    const aiItems = Array.isArray(window.aiEvents) ? [...window.aiEvents] : [];
    aiItems.sort((a, b) => (Number(b.priority) || 0) - (Number(a.priority) || 0)
      || (Number(b.prestigeScore) || 0) - (Number(a.prestigeScore) || 0)
      || (Number(b.relevanceScore) || 0) - (Number(a.relevanceScore) || 0)
      || String(a.date || "9999-12-31").localeCompare(String(b.date || "9999-12-31")));

    if (!aiItems.length) {
      const empty = document.createElement("p");
      empty.className = "section-desc";
      empty.textContent = "Подборка пока формируется. Здесь появятся проверенные олимпиады и конкурсы.";
      aiContainer.appendChild(empty);
    }

    aiItems.forEach((ev, index) => {
      const card = document.createElement("article");
      card.className = "event glass ai-event" + (index === 0 ? " ai-top" : "");
      const title = document.createElement("h3");
      title.textContent = ev.title || "Мероприятие без названия";
      card.appendChild(title);
      const addLine = (label, value) => {
        if (value === undefined || value === null || value === "") return;
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = label + ": ";
        p.append(strong, document.createTextNode(String(value)));
        card.appendChild(p);
      };
      addLine("Организатор", ev.organizer);
      addLine("Дата", ev.date);
      addLine("Регистрация", ev.registrationStatus);
      addLine("Сроки регистрации", ev.registrationDates);
      addLine("Уровень", ev.level);
      addLine("Классы", ev.eligibility);
      addLine("Формат", ev.format);
      addLine("Преимущества", ev.benefits);
      addLine("Престижность", ev.prestigeScore ? ev.prestigeScore + "/5" : "не оценена");
      addLine("Соответствие интересам", ev.relevanceScore ? ev.relevanceScore + "/5" : "не оценено");
      addLine("Приоритет", ev.priority);
      addLine("Проверено", ev.lastVerified);
      if (typeof ev.link === "string" && /^https:\/\//i.test(ev.link)) {
        const link = document.createElement("a");
        link.className = "btn";
        link.href = ev.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Официальная страница";
        card.appendChild(link);
      }
      aiContainer.appendChild(card);
    });
  }

  const aiUpdated = document.getElementById("ai-updated");
  if (aiUpdated) {
    const raw = window.aiEventsLastUpdated;
    if (raw) {
      const parsed = new Date(raw);
      aiUpdated.textContent = "Последнее обновление AI Events: " +
        (Number.isNaN(parsed.getTime()) ? String(raw) : parsed.toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" }));
    }
  }
});
  // ==========================================
  // БЕГУЩАЯ СТРОКА 
  // ==========================================
  const track = document.getElementById("skills-track");
  
  if (track) {
    const originalContent = track.innerHTML;
    const originalCount = track.children.length;
    let animationDuration = 0;

    function initMarquee() {
      // 1. Сбрасываем стили, чтобы замерить чистую ширину
      track.style.animation = 'none';
      track.innerHTML = originalContent;

      // 2. Клонируем карточки, пока не заполним 2 экрана
      while (track.scrollWidth < window.innerWidth * 2) {
        track.innerHTML += originalContent;
      }

      // 3. Вычисляем ширину ОДНОГО набора
      const totalSets = track.children.length / originalCount;
      const singleSetWidth = track.scrollWidth / totalSets;

      // 4. Задаем скорость (80 пикселей в секунду)
      const speed = 80; 
      animationDuration = singleSetWidth / speed;

      // 5. Применяем переменную и запускаем анимацию
      track.style.setProperty('--scroll-width', `-${singleSetWidth}px`);
      track.style.animation = `scrollMarquee ${animationDuration}s linear infinite`;
    }

    // Запускаем при загрузке
    initMarquee();

    // Перезапускаем при изменении размера окна (с небольшой задержкой, чтобы не спамило)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initMarquee, 200);
    });
  }