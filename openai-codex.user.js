// ==UserScript==
// @name         OpenAI Codex UI Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Adds a prompt suggestion dropdown above the input in ChatGPT Codex
// @match        https://chatgpt.com/codex
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const observers = [];

    window.addEventListener('beforeunload', () => {
        for (const o of observers) {
            o.disconnect();
        }
    });
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/shadcn-ui/dist/index.css';
    document.head.appendChild(cssLink);

    const style = document.createElement('style');
    style.textContent = `
@media (prefers-color-scheme: dark) {
    #gpt-prompt-suggest-dropdown {
        background-color: #40414f;
        color: #ececf1;
        border-color: #565869;
    }
    #gpt-prompt-suggest-dropdown option {
        background-color: #40414f;
        color: #ececf1;
    }
}
`;
    document.head.appendChild(style);

    const DEFAULT_SUGGESTIONS = [
        "Suggest code improvements and bugfixes.",
        "Suggest test coverage improvement tasks.",
        "Update documentation according to the current features and functionality.",
        "Suggest code refactor tasks.",
        "Refactor this function to use async/await."
    ];

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

    function openConfig(promptDiv, colDiv) {
        const current = suggestions.join('\n');
        const input = window.prompt('Edit suggestions (one per line):', current);
        if (input === null) return;
        suggestions = input.split(/\n+/).map(s => s.trim()).filter(Boolean);
        saveSuggestions(suggestions);
        const existing = document.getElementById('gpt-prompt-suggest-dropdown');
        if (existing) {
            existing.parentElement.remove();
        }
        injectDropdown(promptDiv, colDiv);
    }

    let suggestions = loadSuggestions() || DEFAULT_SUGGESTIONS.slice();

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
        configBtn.title = 'Edit suggestions';
        configBtn.className = 'text-sm';
        container.appendChild(configBtn);

        wrapper.appendChild(container);
        colDiv.insertBefore(wrapper, colDiv.firstChild);

        configBtn.addEventListener('click', () => openConfig(promptDiv, colDiv));

        dropdown.addEventListener('change', () => {
            const value = dropdown.value;
            if (!value) return;

            promptDiv.focus();
            promptDiv.textContent = '';
            promptDiv.textContent = value;

            const range = document.createRange();
            range.selectNodeContents(promptDiv);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);

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
        injectDropdown(promptDiv, colDiv);

        const observer = new MutationObserver(() => {
            const pd = findPromptInput();
            const cd = pd?.closest('.flex-col.items-center');
            if (pd && cd && !document.getElementById('gpt-prompt-suggest-dropdown')) {
                injectDropdown(pd, cd);
            }
        });

        observers.push(observer);

        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
