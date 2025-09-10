/**
 * Creates a button element with optional class and id.
 */
export function createButton(
  text: string,
  className = "btn relative btn-secondary btn-small",
  id?: string,
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.className = className;
  btn.textContent = text;
  if (id) btn.id = id;
  return btn;
}

/**
 * Creates a generic action button used in the UI.
 */
export function createActionBtn(
  id: string,
  icon: string,
  label: string,
): HTMLDivElement {
  const div = document.createElement("div");
  div.id = id;
  div.className = "gpt-action-btn";
  div.textContent = icon;
  div.setAttribute("data-label", label);
  return div;
}

/**
 * Creates a select element with provided options.
 */
export function createSelect(
  id: string,
  options: Array<[string, string]>,
): HTMLSelectElement {
  const select = document.createElement("select");
  select.id = id;
  options.forEach(([value, label]) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    select.appendChild(opt);
  });
  return select;
}

/**
 * Creates a checkbox input wrapped in a label.
 */
export function createCheckbox(
  id: string,
  labelText: string,
): HTMLLabelElement {
  const label = document.createElement("label");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = id;
  label.appendChild(input);
  label.append(" " + labelText);
  return label;
}

/**
 * Makes a sidebar draggable and resizable, storing its position in options.
 */
export function makeSidebarInteractive(
  el: HTMLElement,
  prefix: string,
  options: Record<string, any>,
  saveOptions: (opts: any) => void,
  observers: any[],
): void {
  const header = el.querySelector("div");
  let dragging = false;
  let startX = 0,
    startY = 0,
    startLeft = 0,
    startTop = 0;

  function savePos() {
    const rect = el.getBoundingClientRect();
    options[prefix + "X"] = rect.left;
    options[prefix + "Y"] = rect.top;
    options[prefix + "Width"] = rect.width;
    options[prefix + "Height"] = rect.height;
    saveOptions(options);
  }

  if (header) {
    header.addEventListener("mousedown", (e) => {
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = el.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      document.addEventListener("mousemove", onDrag);
      document.addEventListener("mouseup", stopDrag);
      e.preventDefault();
    });
  }

  function onDrag(e: MouseEvent) {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    el.style.left = startLeft + dx + "px";
    el.style.top = startTop + dy + "px";
  }

  function stopDrag() {
    if (!dragging) return;
    dragging = false;
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", stopDrag);
    savePos();
  }

  el.addEventListener("mouseup", () => savePos());

  if (typeof ResizeObserver === "function") {
    const ro = new ResizeObserver(() => {
      function onResizeEnd() {
        savePos();
        el.removeEventListener("mouseup", onResizeEnd);
        el.removeEventListener("mouseleave", onResizeEnd);
      }
      el.addEventListener("mouseup", onResizeEnd);
      el.addEventListener("mouseleave", onResizeEnd);
    });
    ro.observe(el);
    observers.push(ro);
  }
}

/**
 * Ensures the sidebar stays within the viewport bounds.
 */
export function ensureSidebarInBounds(
  el: HTMLElement,
  prefix: string,
  options: Record<string, any>,
  saveOptions: (opts: any) => void,
): void {
  const rect = el.getBoundingClientRect();
  const margin = 10;
  let left = rect.left;
  let top = rect.top;
  const maxX = window.innerWidth - rect.width - margin;
  const maxY = window.innerHeight - rect.height - margin;
  let changed = false;
  if (left < margin) {
    left = margin;
    changed = true;
  }
  if (left > maxX) {
    left = maxX;
    changed = true;
  }
  if (top < margin) {
    top = margin;
    changed = true;
  }
  if (top > maxY) {
    top = maxY;
    changed = true;
  }
  if (changed) {
    el.style.left = left + "px";
    el.style.top = top + "px";
    options[prefix + "X"] = left;
    options[prefix + "Y"] = top;
    saveOptions(options);
  }
}
