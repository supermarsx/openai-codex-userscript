export function findPromptInput(): HTMLElement | null {
  return (
    document.querySelector('#prompt-textarea') ||
    document.querySelector('[data-testid="prompt-textarea"]') ||
    document.querySelector('.ProseMirror#prompt-textarea') ||
    document.querySelector('.ProseMirror[data-testid="prompt-textarea"]') ||
    document.querySelector('.ProseMirror')
  ) as HTMLElement | null;
}

export function setPromptText(el: HTMLElement | null, value: string): void {
  if (!el) return;
  value = value || '';
  el.focus();
  if (el instanceof HTMLTextAreaElement) {
    el.value = value;
    el.setSelectionRange(value.length, value.length);
  } else {
    el.textContent = '';
    el.textContent = value;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}
