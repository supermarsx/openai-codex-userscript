export interface TaskStats {
  open: number;
  merged: number;
  closed: number;
  inProgress: number;
  fourX: number;
  total: number;
}

/**
 * Collects task statistics from the DOM.
 */
export function getTaskStats(): TaskStats {
  const rows = Array.from(
    document.querySelectorAll(".task-row-container"),
  ) as HTMLElement[];
  const open = rows.filter(
    (row) => row.querySelector("button")?.textContent.trim() === "Open",
  ).length;
  const merged = rows.filter(
    (row) => row.querySelector("button")?.textContent.trim() === "Merged",
  ).length;
  const closed = rows.filter(
    (row) => row.querySelector("button")?.textContent.trim() === "Closed",
  ).length;
  const inProgress = rows.filter(
    (row) =>
      row.querySelector("circle") ||
      row.querySelector('[aria-label*="Cancel task" i]'),
  ).length;
  const fourX = rows.filter((container) =>
    Array.from(container.querySelectorAll("span")).some(
      (span) => span.textContent.trim() === "4",
    ),
  ).length;
  const total = rows.length;
  return { open, merged, closed, inProgress, fourX, total };
}

/**
 * Renders task statistics into a list element.
 */
export function renderStats(list: HTMLElement): void {
  const { open, merged, closed, inProgress, fourX, total } = getTaskStats();
  list.innerHTML = `
            <li>Total Tasks: ${total}</li>
            <li>Open PRs: ${open}</li>
            <li>Merged PRs: ${merged}</li>
            <li>Closed PRs: ${closed}</li>
            <li>Being Worked On: ${inProgress}</li>
            <li>4x Run Tasks: ${fourX}</li>
            <li id="gpt-stats-updated">Last updated: ${new Date().toLocaleString()}</li>
        `;
}
