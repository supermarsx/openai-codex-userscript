// DOM helper functions

declare var suggestions: string[];
declare function openSettings(): void;

function toggleHeader(hide: boolean): void {
  const node = document.evaluate("//*[contains(text(),'What are we coding next?')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement | null;
  if (node) node.style.display = hide ? 'none' : '';
}

function toggleDocs(hide: boolean): void {
  const res = document.evaluate("//a[contains(.,'Docs')]", document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
  let el: HTMLElement | null;
  while ((el = res.iterateNext() as HTMLElement | null)) {
    el.style.display = hide ? 'none' : '';
  }
}

function findPromptInput(): HTMLElement | null {
  return (
    document.querySelector('#prompt-textarea') as HTMLElement | null ||
    document.querySelector('[data-testid="prompt-textarea"]') as HTMLElement | null ||
    document.querySelector('.ProseMirror#prompt-textarea') as HTMLElement | null ||
    document.querySelector('.ProseMirror[data-testid="prompt-textarea"]') as HTMLElement | null ||
    document.querySelector('.ProseMirror') as HTMLElement | null
  );
}

function injectDropdown(promptDiv: HTMLElement, colDiv: HTMLElement): void {
  if (document.getElementById('gpt-prompt-suggest-dropdown')) return;

  const dropdown = document.createElement('select');
  dropdown.id = 'gpt-prompt-suggest-dropdown';
  dropdown.className = 'flex h-8 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.innerText = '💡 Insert a prompt suggestion...';
  dropdown.appendChild(defaultOpt);

  for (let s of suggestions) {
    const opt = document.createElement('option');
    opt.value = s;
    opt.innerText = s.length > 100 ? s.slice(0, 100) + "..." : s;
    dropdown.appendChild(opt);
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'grid w-full gap-1.5';

  const container = document.createElement('div');
  container.className = 'flex w-full gap-2';
  container.appendChild(dropdown);

  const configBtn = document.createElement('button');
  configBtn.type = 'button';
  configBtn.textContent = '⚙️';
  configBtn.title = 'Settings';
  configBtn.className = 'text-sm';
  container.appendChild(configBtn);

  wrapper.appendChild(container);
  colDiv.insertBefore(wrapper, colDiv.firstChild);

  configBtn.addEventListener('click', () => openSettings());

  dropdown.addEventListener('change', () => {
    const value = dropdown.value;
    if (!value) return;

    promptDiv.focus();

    if (promptDiv instanceof HTMLTextAreaElement) {
      promptDiv.value = value;
      promptDiv.setSelectionRange(value.length, value.length);
    } else {
      promptDiv.textContent = '';
      promptDiv.textContent = value;

      const range = document.createRange();
      range.selectNodeContents(promptDiv);
      range.collapse(false);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    dropdown.selectedIndex = 0;
  });
}
