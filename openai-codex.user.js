// ==UserScript==
// @name         OpenAI Codex UI Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.1
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

    // Wait until the main prompt input exists
    function waitForPromptInput(callback) {
        const interval = setInterval(() => {
            // Look for the codex prompt editable div
            const promptDiv = document.querySelector('.ProseMirror#prompt-textarea');
            // Place dropdown above the parent .flex-col.items-center
            const colDiv = promptDiv?.closest('.flex-col.items-center');
            if (promptDiv && colDiv) {
                clearInterval(interval);
                callback(promptDiv, colDiv);
            }
        }, 350);
    }

    waitForPromptInput((promptDiv, colDiv) => {
        // Avoid duplicate dropdowns
        if (document.getElementById('gpt-prompt-suggest-dropdown')) return;

        // Create dropdown
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

        // First option is the "hint" option
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.innerText = '💡 Insert a prompt suggestion...';
        dropdown.appendChild(defaultOpt);

        // Add suggestions
        for (let s of suggestions) {
            const opt = document.createElement('option');
            opt.value = s;
            opt.innerText = s.length > 100 ? s.slice(0, 100) + "..." : s;
            dropdown.appendChild(opt);
        }

        // Insert above the input
        colDiv.insertBefore(dropdown, colDiv.firstChild);

        // On selection, fill prompt
        dropdown.addEventListener('change', e => {
            const value = dropdown.value;
            if (!value) return;
            // Clear the prompt (simulate input)
            // ProseMirror is contenteditable, so set innerText or innerHTML
            promptDiv.focus();
            // Remove any children, insert a new <p> node with the text
            promptDiv.innerHTML = '';
            const p = document.createElement('p');
            p.innerText = value;
            promptDiv.appendChild(p);

            // Put caret at end (simulate typing)
            // Select all and collapse to end
            const range = document.createRange();
            range.selectNodeContents(promptDiv);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);

            // Optional: close dropdown
            dropdown.selectedIndex = 0;
        });
    });
})();
