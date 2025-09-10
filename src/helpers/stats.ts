export interface TaskStats {
  open: number;
  merged: number;
  closed: number;
  inProgress: number;
  fourX: number;
}

export function getTaskStats(): TaskStats {
  const rows = Array.from(document.querySelectorAll('.task-row-container')) as HTMLElement[];
  const open = rows.filter(row => row.querySelector('button')?.textContent.trim() === 'Open').length;
  const merged = rows.filter(row => row.querySelector('button')?.textContent.trim() === 'Merged').length;
  const closed = rows.filter(row => row.querySelector('button')?.textContent.trim() === 'Closed').length;
  const inProgress = rows.filter(row => row.querySelector('circle')).length;
  const fourX = rows.filter(container =>
    Array.from(container.querySelectorAll('span')).some(span => span.textContent.trim() === '4')
  ).length;
  return { open, merged, closed, inProgress, fourX };
}
