/* Каталог проектов. Данные отделены от разметки — новые карточки добавляются в массив ниже. */
window.portfolioProjects = [
  {
    id: "wordglass",
    title: "Wordglass",
    icon: "📚",
    description: "Тренажёр английских слов: карточки, проверка знаний и отслеживание прогресса.",
    url: "https://tihonbest.github.io/Wordglass/",
    github: "https://github.com/tihonbest/Wordglass",
    category: ["web", "programming", "education"],
    technologies: ["HTML", "CSS", "JavaScript", "PWA"],
    status: "Завершён",
    statusType: "done",
    year: 2026,
    preview: true
  },
  {
    id: "planner",
    title: "Индикатор сложности расписания",
    icon: "📝",
    description: "Школьный веб-планер, который помогает оценить учебную нагрузку на каждый день и распределить дела в течение недели.",
    url: "https://tihonbest.github.io/planner/",
    github: "https://github.com/tihonbest/planner",
    category: ["web", "programming", "education"],
    technologies: ["HTML", "CSS", "JavaScript", "LocalStorage"],
    status: "Развивается",
    statusType: "development",
    year: 2026,
    preview: true
  },
  {
    id: "markit",
    title: "MarkIt — калькулятор оценок",
    icon: "📈",
    description: "Веб-калькулятор для расчёта среднего балла и прогноза итоговых оценок по предметам.",
    url: "https://tihonbest.github.io/markit/",
    github: "https://github.com/tihonbest/markit",
    category: ["web", "programming", "education"],
    technologies: ["HTML", "CSS", "JavaScript"],
    status: "Завершён",
    statusType: "done",
    year: 2026,
    preview: true
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;

  const search = document.getElementById("project-search");
  const sort = document.getElementById("project-sort");
  const filters = document.getElementById("project-filters");
  const count = document.getElementById("project-count");
  const empty = document.getElementById("projects-empty");
  const reset = document.getElementById("project-reset");
  let activeCategory = "all";

  const safeExternalUrl = value => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "https:" ? parsed.href : "";
    } catch (_) { return ""; }
  };

  function render() {
    const query = search.value.trim().toLocaleLowerCase("ru");
    let items = window.portfolioProjects.filter(project => {
      const searchable = [project.title, project.description, ...(project.technologies || [])].join(" ").toLocaleLowerCase("ru");
      const matchesQuery = !query || searchable.includes(query);
      const matchesCategory = activeCategory === "all" || project.category.includes(activeCategory);
      return matchesQuery && matchesCategory;
    });

    if (sort.value === "newest") items.sort((a,b) => b.year - a.year || a.title.localeCompare(b.title, "ru"));
    if (sort.value === "oldest") items.sort((a,b) => a.year - b.year || a.title.localeCompare(b.title, "ru"));
    if (sort.value === "name") items.sort((a,b) => a.title.localeCompare(b.title, "ru"));

    grid.replaceChildren();
    items.forEach(project => {
      const card = document.createElement("article");
      card.className = "project project-card glass";

      const preview = document.createElement("div");
      preview.className = "project-preview";
      const label = document.createElement("span");
      label.className = "preview-label";
      label.textContent = "LIVE PREVIEW";
      preview.appendChild(label);

      const projectUrl = safeExternalUrl(project.url);
      if (project.preview && projectUrl) {
        const frame = document.createElement("iframe");
        frame.src = projectUrl;
        frame.title = "Предпросмотр проекта: " + project.title;
        frame.loading = "lazy";
        frame.referrerPolicy = "strict-origin-when-cross-origin";
        frame.setAttribute("sandbox", "allow-scripts allow-forms allow-same-origin allow-popups");
        frame.allow = "fullscreen";
        preview.appendChild(frame);
      } else {
        const fallback = document.createElement("div");
        fallback.className = "preview-fallback";
        fallback.textContent = "Предпросмотр недоступен";
        preview.appendChild(fallback);
      }
      card.appendChild(preview);

      const content = document.createElement("div");
      content.className = "project-content";
      const status = document.createElement("span");
      status.className = "project-status" + (project.statusType === "development" ? " development" : "");
      status.textContent = project.status;
      content.appendChild(status);

      const title = document.createElement("h3");
      title.textContent = project.icon + " " + project.title;
      content.appendChild(title);

      const description = document.createElement("p");
      description.textContent = project.description;
      content.appendChild(description);

      const tags = document.createElement("div");
      tags.className = "tags";
      (project.technologies || []).forEach(technology => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = technology;
        tags.appendChild(tag);
      });
      content.appendChild(tags);

      const actions = document.createElement("div");
      actions.className = "project-actions";
      if (projectUrl) {
        const open = document.createElement("a");
        open.className = "btn";
        open.href = projectUrl;
        open.target = "_blank";
        open.rel = "noopener noreferrer";
        open.textContent = "Открыть проект ↗";
        actions.appendChild(open);
      }
      const githubUrl = safeExternalUrl(project.github);
      if (githubUrl) {
        const source = document.createElement("a");
        source.className = "btn secondary";
        source.href = githubUrl;
        source.target = "_blank";
        source.rel = "noopener noreferrer";
        source.textContent = "Исходный код";
        actions.appendChild(source);
      }
      content.appendChild(actions);
      card.appendChild(content);
      grid.appendChild(card);
    });

    count.textContent = "Показано проектов: " + items.length + " из " + window.portfolioProjects.length;
    empty.hidden = items.length !== 0;
  }

  filters.addEventListener("click", event => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    filters.querySelectorAll(".filter-chip").forEach(chip => {
      const selected = chip === button;
      chip.classList.toggle("active", selected);
      chip.setAttribute("aria-pressed", String(selected));
    });
    render();
  });

  search.addEventListener("input", render);
  sort.addEventListener("change", render);
  reset.addEventListener("click", () => {
    search.value = "";
    sort.value = "newest";
    activeCategory = "all";
    filters.querySelectorAll(".filter-chip").forEach(chip => {
      const selected = chip.dataset.category === "all";
      chip.classList.toggle("active", selected);
      chip.setAttribute("aria-pressed", String(selected));
    });
    render();
  });

  render();
});
