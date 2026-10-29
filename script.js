document.addEventListener("DOMContentLoaded", () => {

  const events = document.querySelectorAll(".event");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nextEvent = null;
  let nextDate = null;

  events.forEach(event => {
    const dateStr = event.dataset.date;
    if (!dateStr) return;

    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      event.classList.add("past");
    } else {
      if (nextDate === null || eventDate < nextDate) {
        nextDate = eventDate;
        nextEvent = event;
      }
    }
  });

  if (nextEvent) {
    nextEvent.classList.add("next");
  }
});