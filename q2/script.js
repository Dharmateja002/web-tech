const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");

let draggedCard = null;
let placeholder = null;

function setStatus(text) {
  statusEl.textContent = text;
}

function createPlaceholder() {
  const el = document.createElement("div");
  el.className = "placeholder";
  return el;
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".card:not(.is-dragging)")];
  let closest = { offset: Number.NEGATIVE_INFINITY, element: null };

  for (const child of draggableElements) {
    const box = child.getBoundingClientRect();
    const offset = y - (box.top + box.height / 2);
    if (offset < 0 && offset > closest.offset) {
      closest = { offset, element: child };
    }
  }
  return closest.element;
}

function wireCard(card) {
  card.addEventListener("dragstart", (e) => {
    draggedCard = card;
    card.classList.add("is-dragging");
    placeholder = createPlaceholder();
    e.dataTransfer.effectAllowed = "move";
    // Required for Firefox
    e.dataTransfer.setData("text/plain", card.dataset.id || "card");
    setStatus(`Dragging: "${card.textContent.trim()}"`);
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("is-dragging");
    draggedCard = null;
    placeholder?.remove();
    placeholder = null;
    document.querySelectorAll(".dropzone").forEach((dz) => dz.classList.remove("is-over"));
    setStatus("Drop completed.");
  });
}

function wireDropzone(zone) {
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!draggedCard) return;

    const afterEl = getDragAfterElement(zone, e.clientY);
    if (!placeholder) placeholder = createPlaceholder();

    if (afterEl == null) {
      zone.appendChild(placeholder);
    } else {
      zone.insertBefore(placeholder, afterEl);
    }
  });

  zone.addEventListener("dragenter", (e) => {
    e.preventDefault();
    zone.classList.add("is-over");
  });

  zone.addEventListener("dragleave", (e) => {
    // Avoid flicker when moving between children
    const rect = zone.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    const stillInside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    if (!stillInside) zone.classList.remove("is-over");
  });

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("is-over");
    if (!draggedCard) return;

    if (placeholder && placeholder.parentElement === zone) {
      zone.insertBefore(draggedCard, placeholder);
    } else {
      zone.appendChild(draggedCard);
    }
    placeholder?.remove();
    placeholder = null;
    setStatus(`Dropped: "${draggedCard.textContent.trim()}"`);
  });
}

function init() {
  document.querySelectorAll(".card").forEach(wireCard);
  document.querySelectorAll("[data-dropzone]").forEach(wireDropzone);
  setStatus("Ready.");
}

function resetSample() {
  const todo = document.querySelector('[data-col="todo"] [data-dropzone]');
  const doing = document.querySelector('[data-col="doing"] [data-dropzone]');
  const done = document.querySelector('[data-col="done"] [data-dropzone]');

  todo.innerHTML = "";
  doing.innerHTML = "";
  done.innerHTML = "";

  const mk = (id, text) => {
    const el = document.createElement("article");
    el.className = "card";
    el.draggable = true;
    el.dataset.id = id;
    el.textContent = text;
    wireCard(el);
    return el;
  };

  todo.append(mk("1", "WT Lab assignment"), mk("2", "Finish calculator UI"), mk("3", "Solve Sudoku"));
  doing.append(mk("4", "Drag & Drop demo"));
  done.append(mk("5", "Pattern (Q1)"));

  setStatus("Reset done.");
}

resetBtn.addEventListener("click", resetSample);
init();

