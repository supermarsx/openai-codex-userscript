(function () {
    'use strict';
    const observers: MutationObserver[] = [];
    let promptInputObserver: MutationObserver | null = null;
    let dropdownObserver: MutationObserver | null = null;
    let currentPromptDiv: HTMLElement | null = null;
    let currentColDiv: HTMLElement | null = null;

    window.addEventListener('beforeunload', () => {
        for (const o of observers) {
            o.disconnect();
        }
    });

    const varStyle = document.createElement('style');
    varStyle.textContent = `
:root {
    --background: #ffffff;
    --foreground: #18181b;
    --ring: #d4d4d8;
}
@media (prefers-color-scheme: dark) {
    :root {
        --background: #40414f;
        --foreground: #ececf1;
        --ring: #565869;
    }
}
.userscript-force-light {
    --background: #ffffff;
    --foreground: #18181b;
    --ring: #d4d4d8;
}
.userscript-force-dark {
    --background: #40414f;
    --foreground: #ececf1;
    --ring: #565869;
}
`;
    document.head.appendChild(varStyle);

    const settingsStyle = document.createElement('style');
    settingsStyle.textContent = `
#gpt-settings-gear {
    position: fixed;
    top: 50%;
    right: 8px;
    z-index: 1000;
    background: var(--background);
    color: var(--foreground);
    border: 1px solid var(--ring);
    width: 32px;
    height: 32px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
#gpt-settings-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(0,0,0,0.5);
    display: none;
    align-items: center;
    justify-content: center;
}
#gpt-settings-modal.show { display: flex; }
#gpt-settings-modal .modal-content {
    background: var(--background);
    color: var(--foreground);
    border: 1px solid var(--ring);
    border-radius: 0.5rem;
    padding: 1rem;
    max-width: 90%;
    width: 400px;
}
#gpt-settings-modal button { border: 1px solid var(--ring); padding: 2px 6px; border-radius: 4px; }
#gpt-settings-modal ul { list-style: none; padding: 0; margin: 0 0 0.5rem 0; }
#gpt-settings-modal li { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
`;
    document.head.appendChild(settingsStyle);

    const fallbackStyle = document.createElement('style');
    fallbackStyle.textContent = `
#gpt-prompt-suggest-dropdown {
    background-color: var(--background);
    color: var(--foreground);
    border-color: var(--ring);
}
#gpt-prompt-suggest-dropdown option {
    background-color: var(--background);
    color: var(--foreground);
}
`;
    document.head.appendChild(fallbackStyle);

    suggestions = loadSuggestions() || DEFAULT_SUGGESTIONS.slice();
    options = loadOptions();



    function applyOptions() {
        document.documentElement.classList.toggle('userscript-force-dark', options.dark);
        document.documentElement.classList.toggle('userscript-force-light', !options.dark);
        toggleHeader(options.hideHeader);
        toggleDocs(options.hideDocs);
    }

    const gear = document.createElement('div');
    gear.id = 'gpt-settings-gear';
    gear.textContent = '⚙️';
    document.body.appendChild(gear);

    const modal = document.createElement('div');
    modal.id = 'gpt-settings-modal';
    modal.innerHTML = `
    <div class="modal-content">
        <h2 class="mb-2 text-lg">Settings</h2>
        <div id="gpt-settings-suggestions"></div>
        <label><input type="checkbox" id="gpt-setting-dark"> Dark theme</label><br>
        <label><input type="checkbox" id="gpt-setting-header"> Hide header</label><br>
        <label><input type="checkbox" id="gpt-setting-docs"> Hide Docs link</label><br>
        <div class="mt-2 text-right"><button id="gpt-settings-close">Close</button></div>
    </div>`;
    document.body.appendChild(modal);

    function refreshDropdown() {
        if (currentPromptDiv && currentColDiv) {
            const existing = document.getElementById('gpt-prompt-suggest-dropdown');
            if (existing) existing.closest('.grid')?.remove();
            injectDropdown(currentPromptDiv, currentColDiv);
        }
    }

    function renderSuggestions() {
        const wrap = modal.querySelector('#gpt-settings-suggestions');
        wrap.innerHTML = '<h3 class="mb-1">Prompt Suggestions</h3>';
        const ul = document.createElement('ul');
        suggestions.forEach((s, i) => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.textContent = s;
            li.appendChild(span);
            const edit = document.createElement('button');
            edit.textContent = 'Edit';
            const del = document.createElement('button');
            del.textContent = 'Remove';
            edit.addEventListener('click', () => {
                const inp = window.prompt('Edit suggestion:', s);
                if (inp !== null) {
                    suggestions[i] = inp.trim();
                    saveSuggestions(suggestions);
                    renderSuggestions();
                    refreshDropdown();
                }
            });
            del.addEventListener('click', () => {
                suggestions.splice(i, 1);
                saveSuggestions(suggestions);
                renderSuggestions();
                refreshDropdown();
            });
            const btnWrap = document.createElement('span');
            btnWrap.appendChild(edit);
            btnWrap.appendChild(del);
            li.appendChild(btnWrap);
            ul.appendChild(li);
        });
        wrap.appendChild(ul);
        const addBtn = document.createElement('button');
        addBtn.textContent = 'Add';
        addBtn.addEventListener('click', () => {
            const inp = window.prompt('New suggestion:');
            if (inp) {
                suggestions.push(inp.trim());
                saveSuggestions(suggestions);
                renderSuggestions();
                refreshDropdown();
            }
        });
        wrap.appendChild(addBtn);
    }

    function openSettings() {
        renderSuggestions();
        (modal.querySelector('#gpt-setting-dark') as HTMLInputElement).checked = options.dark;
        (modal.querySelector('#gpt-setting-header') as HTMLInputElement).checked = options.hideHeader;
        (modal.querySelector('#gpt-setting-docs') as HTMLInputElement).checked = options.hideDocs;
        modal.classList.add('show');
    }

    gear.addEventListener('click', openSettings);
    modal.querySelector('#gpt-settings-close').addEventListener('click', () => modal.classList.remove('show'));
    modal.querySelector('#gpt-setting-dark')!.addEventListener('change', (e) => {
        const input = e.target as HTMLInputElement;
        options.dark = input.checked;
        saveOptions(options);
        applyOptions();
    });
    modal.querySelector('#gpt-setting-header')!.addEventListener('change', (e) => {
        const input = e.target as HTMLInputElement;
        options.hideHeader = input.checked;
        saveOptions(options);
        applyOptions();
    });
    modal.querySelector('#gpt-setting-docs')!.addEventListener('change', (e) => {
        const input = e.target as HTMLInputElement;
        options.hideDocs = input.checked;
        saveOptions(options);
        applyOptions();
    });

    const pageObserver = new MutationObserver(() => {
        toggleHeader(options.hideHeader);
        toggleDocs(options.hideDocs);
    });
    observers.push(pageObserver);
    pageObserver.observe(document.body, { childList: true, subtree: true });

    applyOptions();

    // Automatically archive tasks based on status changes
    function findArchiveButton() {
        return (
            document.querySelector('[data-testid="archive-task"]') ||
            Array.from(document.querySelectorAll('button')).find(b => /archive/i.test(b.textContent))
        );
    }

    function autoArchiveOnMerged() {
        const btn = findArchiveButton() as HTMLElement | null;
        if (btn) btn.click();
    }

    function autoArchiveOnClosed() {
        const btn = findArchiveButton() as HTMLElement | null;
        if (btn) btn.click();
    }

    let lastTaskStatus = null;

    function detectTaskStatus() {
        const el =
            document.querySelector('[data-testid="task-status"]') ||
            document.querySelector('.task-status');
        if (!el) return;
        const status = el.textContent.trim();
        if (status && status !== lastTaskStatus) {
            lastTaskStatus = status;
            if (/merged/i.test(status)) {
                autoArchiveOnMerged();
            } else if (/closed/i.test(status)) {
                autoArchiveOnClosed();
            }
        }
    }

    const taskObserver = new MutationObserver(detectTaskStatus);
    observers.push(taskObserver);
    taskObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
    detectTaskStatus();

    // Returns the main prompt input using several fallbacks.
    // 1. Prefer an element with the id "prompt-textarea".
    // 2. If not found, try the data-testid attribute.
    // 3. As a final fallback, search for the ProseMirror editor element.


    // Wait until the main prompt input exists
    function waitForPromptInput(callback) {
        if (promptInputObserver) {
            promptInputObserver.disconnect();
            const idx = observers.indexOf(promptInputObserver);
            if (idx !== -1) observers.splice(idx, 1);
        }

        const observer = new MutationObserver(() => {
            const promptDiv = findPromptInput();
            const colDiv = promptDiv?.closest('.flex-col.items-center');
            if (promptDiv && colDiv) {
                observer.disconnect();
                const i = observers.indexOf(observer);
                if (i !== -1) observers.splice(i, 1);
                promptInputObserver = null;
                callback(promptDiv, colDiv);
            }
        });

        promptInputObserver = observer;
        observers.push(observer);

        observer.observe(document.body, { childList: true, subtree: true });

        // Check immediately in case the element already exists
        const promptDiv = findPromptInput();
        const colDiv = promptDiv?.closest('.flex-col.items-center');
        if (promptDiv && colDiv) {
            observer.disconnect();
            const i = observers.indexOf(observer);
            if (i !== -1) observers.splice(i, 1);
            promptInputObserver = null;
            callback(promptDiv, colDiv);
        }
    }

    waitForPromptInput((promptDiv, colDiv) => {
        currentPromptDiv = promptDiv;
        currentColDiv = colDiv;
        if (dropdownObserver) {
            dropdownObserver.disconnect();
            const idx = observers.indexOf(dropdownObserver);
            if (idx !== -1) observers.splice(idx, 1);
            dropdownObserver = null;
        }

        injectDropdown(promptDiv, colDiv);

        const observer = new MutationObserver(() => {
            const pd = findPromptInput();
            const cd = pd?.closest('.flex-col.items-center') as HTMLElement | null;
            if (pd && cd && !document.getElementById('gpt-prompt-suggest-dropdown')) {
                currentPromptDiv = pd as HTMLElement;
                currentColDiv = cd;
                injectDropdown(pd as HTMLElement, cd);
            }
        });

        dropdownObserver = observer;
        observers.push(observer);

        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
