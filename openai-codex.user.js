// ==UserScript==
// @name         OpenAI Codex UI Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Adds a prompt suggestion dropdown above the input in ChatGPT Codex and provides a settings modal
// @match        https://chatgpt.com/codex*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const observers = [];
    let currentPromptDiv = null;
    let currentColDiv = null;

    window.addEventListener('beforeunload', () => {
        for (const o of observers) {
            o.disconnect();
        }
    });
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = "https://github.com/supermarsx/openai-codex-userscript/raw/refs/heads/main/shadcn.css";
    cssLink.crossOrigin = 'anonymous';
    document.head.appendChild(cssLink);

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
    cssLink.addEventListener('error', () => {
        document.head.appendChild(fallbackStyle);
    });

    const DEFAULT_SUGGESTIONS = [
        "Suggest code improvements and bugfixes.",
        "Suggest test coverage improvement tasks.",
        "Update documentation according to the current features and functionality.",
        "Suggest code refactor tasks.",
        "Refactor this function to use async/await."
    ];

    const DEFAULT_OPTIONS = {
        dark: false,
        hideHeader: false,
        hideDocs: false,
    };

    function loadOptions() {
        try {
            const raw = localStorage.getItem('gpt-script-options');
            if (raw) {
                const data = JSON.parse(raw);
                return { ...DEFAULT_OPTIONS, ...data };
            }
        } catch (e) {
            console.error('Failed to load options', e);
        }
        return { ...DEFAULT_OPTIONS };
    }

    function saveOptions(obj) {
        try {
            localStorage.setItem('gpt-script-options', JSON.stringify(obj));
        } catch (e) {
            console.error('Failed to save options', e);
        }
    }

    function loadSuggestions() {
        try {
            const raw = localStorage.getItem('gpt-prompt-suggestions');
            if (raw) {
                const data = JSON.parse(raw);
                if (Array.isArray(data)) {
                    return data;
                }
            }
        } catch (e) {
            console.error('Failed to load suggestions', e);
        }
        return null;
    }

    function saveSuggestions(list) {
        try {
            localStorage.setItem('gpt-prompt-suggestions', JSON.stringify(list));
        } catch (e) {
            console.error('Failed to save suggestions', e);
        }
    }

    let suggestions = loadSuggestions() || DEFAULT_SUGGESTIONS.slice();
    let options = loadOptions();

    function toggleHeader(hide) {
        const node = document.evaluate("//*[contains(text(),'What are we coding next?')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (node) node.style.display = hide ? 'none' : '';
    }

    function toggleDocs(hide) {
        const res = document.evaluate("//a[contains(.,'Docs')]", document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        let el;
        while ((el = res.iterateNext())) {
            el.style.display = hide ? 'none' : '';
        }
    }

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
        modal.querySelector('#gpt-setting-dark').checked = options.dark;
        modal.querySelector('#gpt-setting-header').checked = options.hideHeader;
        modal.querySelector('#gpt-setting-docs').checked = options.hideDocs;
        modal.classList.add('show');
    }

    gear.addEventListener('click', openSettings);
    modal.querySelector('#gpt-settings-close').addEventListener('click', () => modal.classList.remove('show'));
    modal.querySelector('#gpt-setting-dark').addEventListener('change', (e) => { options.dark = e.target.checked; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-header').addEventListener('change', (e) => { options.hideHeader = e.target.checked; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-docs').addEventListener('change', (e) => { options.hideDocs = e.target.checked; saveOptions(options); applyOptions(); });

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
        const btn = findArchiveButton();
        if (btn) btn.click();
    }

    function autoArchiveOnClosed() {
        const btn = findArchiveButton();
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
    function findPromptInput() {
        return (
            document.querySelector('#prompt-textarea') ||
            document.querySelector('[data-testid="prompt-textarea"]') ||
            document.querySelector('.ProseMirror#prompt-textarea') ||
            document.querySelector('.ProseMirror[data-testid="prompt-textarea"]') ||
            document.querySelector('.ProseMirror')
        );
    }

    // Creates and injects the dropdown element
    function injectDropdown(promptDiv, colDiv) {
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

        const wrapper = document.createElement("div");
        wrapper.className = "grid w-full gap-1.5";

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
                sel.removeAllRanges();
                sel.addRange(range);
            }

            dropdown.selectedIndex = 0;
        });
    }

    // Wait until the main prompt input exists
    function waitForPromptInput(callback) {
        const observer = new MutationObserver(() => {
            const promptDiv = findPromptInput();
            const colDiv = promptDiv?.closest('.flex-col.items-center');
            if (promptDiv && colDiv) {
                observer.disconnect();
                callback(promptDiv, colDiv);
            }
        });

        observers.push(observer);

        observer.observe(document.body, { childList: true, subtree: true });

        // Check immediately in case the element already exists
        const promptDiv = findPromptInput();
        const colDiv = promptDiv?.closest('.flex-col.items-center');
        if (promptDiv && colDiv) {
            observer.disconnect();
            callback(promptDiv, colDiv);
        }
    }

    waitForPromptInput((promptDiv, colDiv) => {
        currentPromptDiv = promptDiv;
        currentColDiv = colDiv;
        injectDropdown(promptDiv, colDiv);

        const observer = new MutationObserver(() => {
            const pd = findPromptInput();
            const cd = pd?.closest('.flex-col.items-center');
            if (pd && cd && !document.getElementById('gpt-prompt-suggest-dropdown')) {
                currentPromptDiv = pd;
                currentColDiv = cd;
                injectDropdown(pd, cd);
            }
        });

        observers.push(observer);

        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
