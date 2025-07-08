// ==UserScript==
// @name         OpenAI Codex UI Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Adds a prompt suggestion dropdown above the input in ChatGPT Codex
// @match        https://chatgpt.com/codex
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/shadcn-ui/dist/index.css';
    document.head.appendChild(cssLink);

    // Customize your prompt suggestions here
    const suggestions = [
        "Suggest code improvements and bugfixes.",
        "Suggest test coverage improvement tasks.",
        "Update documentation according to the current features and functionality.",
        "Suggest code refactor tasks.",
        "Refactor this function to use async/await."
    ];

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
        wrapper.appendChild(dropdown);
        colDiv.insertBefore(wrapper, colDiv.firstChild);

        dropdown.addEventListener('change', () => {
            const value = dropdown.value;
            if (!value) return;

            promptDiv.focus();
            promptDiv.innerHTML = '';
            const p = document.createElement('p');
            p.innerText = value;
            promptDiv.appendChild(p);

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
            const promptDiv = document.querySelector('.ProseMirror#prompt-textarea');
            const colDiv = promptDiv?.closest('.flex-col.items-center');
            if (promptDiv && colDiv) {
                observer.disconnect();
                callback(promptDiv, colDiv);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Check immediately in case the element already exists
        const promptDiv = document.querySelector('.ProseMirror#prompt-textarea');
        const colDiv = promptDiv?.closest('.flex-col.items-center');
        if (promptDiv && colDiv) {
            observer.disconnect();
            callback(promptDiv, colDiv);
        }
    }

    waitForPromptInput((promptDiv, colDiv) => {
        injectDropdown(promptDiv, colDiv);

        const observer = new MutationObserver(() => {
            const pd = document.querySelector('.ProseMirror#prompt-textarea');
            const cd = pd?.closest('.flex-col.items-center');
            if (pd && cd && !document.getElementById('gpt-prompt-suggest-dropdown')) {
                injectDropdown(pd, cd);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
