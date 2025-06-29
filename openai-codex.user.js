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
        dropdown.style.margin = '8px 0 12px 0';
        dropdown.style.padding = '5px 16px';
        dropdown.style.fontSize = '1rem';
        dropdown.style.borderRadius = '8px';
        dropdown.style.border = '1px solid #888';
        dropdown.style.background = 'var(--background, #181818)';
        dropdown.style.color = '#fff';
        dropdown.style.outline = 'none';
        dropdown.style.maxWidth = '100%';

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

        colDiv.insertBefore(dropdown, colDiv.firstChild);

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
        const interval = setInterval(() => {
            const promptDiv = document.querySelector('.ProseMirror#prompt-textarea');
            const colDiv = promptDiv?.closest('.flex-col.items-center');
            if (promptDiv && colDiv) {
                clearInterval(interval);
                callback(promptDiv, colDiv);
            }
        }, 350);
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
