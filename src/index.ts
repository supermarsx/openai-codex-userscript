// @ts-nocheck
import { loadOptions, saveOptions, DEFAULT_OPTIONS } from "./helpers/options";
import { loadSuggestions, saveSuggestions, DEFAULT_SUGGESTIONS } from "./helpers/suggestions";
import { loadHistory, saveHistory, addToHistory } from "./helpers/history";
import { findPromptInput, setPromptText } from "./helpers/dom";
import { parseRepoNames } from "./helpers/repos";
import { VERSION } from "./version";
(function () {

    'use strict';
    const SCRIPT_VERSION = VERSION;
    const observers = [];
    let promptInputObserver = null;
    let dropdownObserver = null;
    let currentPromptDiv = null;
    let currentColDiv = null;

    function createButton(text, className = 'btn relative btn-secondary btn-small', id) {
        const btn = document.createElement('button');
        btn.className = className;
        btn.textContent = text;
        if (id) btn.id = id;
        return btn;
    }

    function createActionBtn(id, icon, label) {
        const div = document.createElement('div');
        div.id = id;
        div.className = 'gpt-action-btn';
        div.textContent = icon;
        div.setAttribute('data-label', label);
        return div;
    }

    function createSelect(id, options) {
        const select = document.createElement('select');
        select.id = id;
        options.forEach(([value, label]) => {
            const opt = document.createElement('option');
            opt.value = value;
            opt.textContent = label;
            select.appendChild(opt);
        });
        return select;
    }

    function createCheckbox(id, labelText) {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = id;
        label.appendChild(input);
        label.append(' ' + labelText);
        return label;
    }

    function createSettingGroup(title, children) {
        const group = document.createElement('div');
        group.className = 'settings-group';
        const h3 = document.createElement('h3');
        h3.textContent = title;
        group.appendChild(h3);
        children.forEach(c => group.appendChild(c));
        return group;
    }

    const THEME_TOKENS = {
        light: {
            '--brand-purple': '#824dff',
        },
        dark: {
            '--brand-purple': '#b78af2',
        },
        oled: {
            '--brand-purple': '#b78af2',
        },
    };

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
    --brand-purple: #824dff;
}
@media (prefers-color-scheme: dark) {
    :root {
        --background: #40414f;
        --foreground: #ececf1;
        --ring: #565869;
        --brand-purple: #b78af2;
    }
}
.userscript-force-light {
    --background: #ffffff;
    --foreground: #18181b;
    --ring: #d4d4d8;
    --brand-purple: #824dff;
}
.userscript-force-dark {
    --background: #40414f;
    --foreground: #ececf1;
    --ring: #565869;
    --brand-purple: #b78af2;
}
.userscript-force-oled {
    --background: #000000;
    --foreground: #ffffff;
    --ring: #333333;
    --brand-purple: #b78af2;
}
`;
    document.head.appendChild(varStyle);

    const settingsStyle = document.createElement('style');
    settingsStyle.textContent = `
#gpt-action-bar {
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 1000;
    display: flex;
    gap: 8px;
}
#gpt-action-bar .gpt-action-btn {
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
    position: relative;
}
#gpt-action-bar .gpt-action-btn:hover {
    background: var(--ring);
    color: var(--background);
}
#gpt-action-bar .gpt-action-btn::after {
    content: attr(data-label);
    position: absolute;
    bottom: 120%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--background);
    color: var(--foreground);
    border: 1px solid var(--ring);
    border-radius: 4px;
    padding: 2px 4px;
    font-size: 10px;
    white-space: nowrap;
    display: none;
    pointer-events: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
#gpt-action-bar .gpt-action-btn:hover::after {
    display: block;
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
    max-height: 80vh;
    overflow-y: auto;
}
#gpt-settings-modal button {
    border: 1px solid var(--ring);
    padding: 2px 6px;
    border-radius: 4px;
}
.btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 500;
    border: 1px solid var(--ring);
    background: var(--background);
    color: var(--foreground);
    transition: background-color 0.2s, color 0.2s;
}
.btn:hover,
.btn:focus-visible {
    background: var(--ring);
    color: var(--background);
}
.btn-small {
    height: 1.5rem;
    padding: 0 0.5rem;
    font-size: 0.75rem;
}
.btn-primary {
    background: #10a37f;
    border-color: #10a37f;
    color: #fff;
}
.btn-primary:hover,
.btn-primary:focus-visible {
    background: #0f9a76;
    color: #fff;
}
.btn-secondary {
    background: var(--background);
    color: var(--foreground);
}
.btn-secondary:hover,
.btn-secondary:focus-visible {
    background: var(--ring);
    color: var(--background);
}
#gpt-settings-modal ul { list-style: none; padding: 0; margin: 0 0 0.5rem 0; }
#gpt-settings-modal li { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
#gpt-settings-modal .settings-group { margin-bottom: 0.75rem; }
#gpt-settings-modal .settings-group h3 { margin: 0 0 0.25rem 0; font-size: 1rem; }
#gpt-history-modal { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; }
#gpt-history-modal.show { display: flex; }
#gpt-history-modal .modal-content { background: var(--background); color: var(--foreground); border: 1px solid var(--ring); border-radius: 0.5rem; padding: 1rem; max-width: 90%; width: 400px; max-height: 80vh; overflow-y: auto; }
#gpt-history-modal button { border: 1px solid var(--ring); padding: 2px 6px; border-radius: 4px; }
#gpt-history-search {
    border: 1px solid var(--ring);
    background: var(--background);
    color: var(--foreground);
    border-radius: 4px;
    padding: 2px 4px;
    width: 100%;
}
#gpt-history-preview { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; }
#gpt-history-preview.show { display: flex; }
#gpt-history-preview .modal-content { background: var(--background); color: var(--foreground); border: 1px solid var(--ring); border-radius: 0.5rem; padding: 1rem; max-width: 90%; width: 400px; max-height: 80vh; overflow-y: auto; }
#gpt-history-preview button { border: 1px solid var(--ring); padding: 2px 6px; border-radius: 4px; }
#gpt-repo-sidebar, #gpt-version-sidebar { position: fixed; inset-block-start: 10%; max-height: 80vh; width: 180px; background: var(--background); color: var(--foreground); border: 1px solid var(--ring); overflow-y: auto; z-index: 999; padding: 0.5rem; border-radius: 0.25rem; box-shadow: 0 2px 6px rgba(0,0,0,0.2); resize: both; }
#gpt-repo-sidebar { inset-inline-start: 10px; }
#gpt-version-sidebar { inset-inline-end: 10px; }
#gpt-repo-sidebar.hidden, #gpt-version-sidebar.hidden { display: none; }
#gpt-repo-sidebar > div:first-child, #gpt-version-sidebar > div:first-child { cursor: move; }
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

    const columnStyle = document.createElement('style');
    columnStyle.id = 'gpt-three-column-style';
    columnStyle.textContent = `
div.h-full > div > div.justify-center:nth-child(2) {
  display: block !important;
  width: 100vw !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 2rem 3vw !important;
  box-sizing: border-box !important;

  column-count: 3;
  column-gap: 2.5rem;
  height: auto !important;
}

div.justify-center:nth-child(2) > * {
  width: auto !important;
  display: block !important;
  left: 0 !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

div.mx-auto {
    width: 100vw;
}

div.h-full > div > div.z-50 {
    width: 33vw;
    align-items: center !important;
    margin: auto;
}

div.justify-center:nth-child(2) {
  max-width: none !important;
  margin: 0 !important;
}

body, html {
  overflow: visible !important;
  width: 100vw !important;
}`;
    let suggestions = loadSuggestions() || DEFAULT_SUGGESTIONS.slice();
    let options = loadOptions();
    let history = loadHistory();
    let historyQuery = '';




    function findByText(text) {
        const elements = Array.from(document.querySelectorAll('body *'));
        return elements.find(el => el.textContent && el.textContent.includes(text)) || null;
    }

    function toggleHeader(hide) {
        const targetTexts = ['What are we coding next?', 'What should we code next?'];
        let node = document.querySelector('h1.mb-4.pt-4.text-2xl');
        if (!node || !targetTexts.some(t => node.textContent?.includes(t))) {
            node = findByText('What should we code next?');
        }
        if (node && targetTexts.some(t => node.textContent?.includes(t))) {
            node.style.display = hide ? 'none' : '';
        }
    }

    function toggleDocs(hide) {
        const links = Array.from(document.querySelectorAll('a'))
            .filter(a => a.textContent && a.textContent.includes('Docs'));
        for (const link of links) {
            link.style.display = hide ? 'none' : '';
        }
    }

    function toggleLogoText(hide) {
        const link = document.querySelector('a[href="/codex"]');
        const textSvg = link?.querySelector('svg + svg');
        if (textSvg) textSvg.style.display = hide ? 'none' : '';
    }

    function toggleLogoImage(hide) {
        const link = document.querySelector('a[href="/codex"]');
        const img = link?.querySelector('svg');
        if (img) img.style.display = hide ? 'none' : '';
    }

    function toggleProfile(hide) {
        const node = document.querySelector('[aria-label*="Profile" i], [data-testid*="profile" i], [class*="profile" i], [class*="avatar" i]');
        if (node) node.style.display = hide ? 'none' : '';
    }

    function toggleEnvironments(hide) {
        const link = document.querySelector('a[href="/codex/settings/environments"]');
        if (link) link.style.display = hide ? 'none' : '';
    }

    function makeSidebarInteractive(el, prefix) {
        const header = el.querySelector('div');
        let dragging = false;
        let startX = 0, startY = 0, startLeft = 0, startTop = 0;

        function savePos() {
            const rect = el.getBoundingClientRect();
            options[prefix + 'X'] = rect.left;
            options[prefix + 'Y'] = rect.top;
            options[prefix + 'Width'] = rect.width;
            options[prefix + 'Height'] = rect.height;
            saveOptions(options);
        }

        if (header) {
            header.addEventListener('mousedown', (e) => {
                dragging = true;
                startX = e.clientX;
                startY = e.clientY;
                const rect = el.getBoundingClientRect();
                startLeft = rect.left;
                startTop = rect.top;
                document.addEventListener('mousemove', onDrag);
                document.addEventListener('mouseup', stopDrag);
                e.preventDefault();
            });
        }

        function onDrag(e) {
            if (!dragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            el.style.left = startLeft + dx + 'px';
            el.style.top = startTop + dy + 'px';
        }

        function stopDrag() {
            if (!dragging) return;
            dragging = false;
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', stopDrag);
            savePos();
        }

        el.addEventListener('mouseup', () => savePos());

        if (typeof ResizeObserver === 'function') {
            const ro = new ResizeObserver(() => {
                function onResizeEnd() {
                    savePos();
                    el.removeEventListener('mouseup', onResizeEnd);
                    el.removeEventListener('mouseleave', onResizeEnd);
                }
                el.addEventListener('mouseup', onResizeEnd);
                el.addEventListener('mouseleave', onResizeEnd);
            });
            ro.observe(el);
            observers.push(ro);
        }
    }

    function ensureSidebarInBounds(el, prefix) {
        const rect = el.getBoundingClientRect();
        const margin = 10;
        let left = rect.left;
        let top = rect.top;
        const maxX = window.innerWidth - rect.width - margin;
        const maxY = window.innerHeight - rect.height - margin;
        let changed = false;
        if (left < margin) { left = margin; changed = true; }
        if (left > maxX) { left = maxX; changed = true; }
        if (top < margin) { top = margin; changed = true; }
        if (top > maxY) { top = maxY; changed = true; }
        if (changed) {
            el.style.left = left + 'px';
            el.style.top = top + 'px';
            options[prefix + 'X'] = left;
            options[prefix + 'Y'] = top;
            saveOptions(options);
        }
    }

    function toggleRepoSidebar(show) {
        const el = document.getElementById('gpt-repo-sidebar');
        if (el) {
            el.classList.toggle('hidden', !show);
            if (show) ensureSidebarInBounds(el, 'repoSidebar');
        }
        
    }

    function toggleVersionSidebar(show) {
        const el = document.getElementById('gpt-version-sidebar');
        if (el) {
            el.classList.toggle('hidden', !show);
            if (show) ensureSidebarInBounds(el, 'versionSidebar');
        }

    }

    function applyOptions() {
        const root = document.documentElement;
        root.classList.remove('userscript-force-light', 'userscript-force-dark', 'userscript-force-oled', 'light', 'dark');
        const prefersDark = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = options.theme || (prefersDark ? 'dark' : 'light');
        root.classList.add(`userscript-force-${theme}`);
        root.classList.add(theme);
        root.dataset.theme = theme;
        root.style.colorScheme = theme;
        const tokens = THEME_TOKENS[theme];
        if (tokens) {
            Object.entries(tokens).forEach(([k, v]) => root.style.setProperty(k, v));
        }
        switch (options.font) {
            case 'serif':
                root.style.fontFamily = 'serif';
                break;
            case 'monospace':
                root.style.fontFamily = 'monospace';
                break;
            case 'custom':
                root.style.fontFamily = options.customFont || 'inherit';
                break;
            default:
                root.style.fontFamily = 'sans-serif';
        }
        toggleHeader(options.hideHeader);
        toggleDocs(options.hideDocs);
        toggleLogoText(options.hideLogoText);
        toggleLogoImage(options.hideLogoImage);
        toggleProfile(options.hideProfile);
        toggleEnvironments(options.hideEnvironments);
        toggleRepoSidebar(options.showRepoSidebar);
        toggleVersionSidebar(options.showVersionSidebar);

        if (options.threeColumnMode) {
            if (!document.head.contains(columnStyle)) document.head.appendChild(columnStyle);
        } else {
            if (columnStyle.parentNode) columnStyle.parentNode.removeChild(columnStyle);
        }

        const repoEl = document.getElementById('gpt-repo-sidebar');
        if (repoEl) {
            if (options.repoSidebarX !== null) repoEl.style.left = options.repoSidebarX + 'px';
            if (options.repoSidebarY !== null) repoEl.style.top = options.repoSidebarY + 'px';
            if (options.repoSidebarWidth !== null) repoEl.style.width = options.repoSidebarWidth + 'px';
            if (options.repoSidebarHeight !== null) repoEl.style.height = options.repoSidebarHeight + 'px';
            ensureSidebarInBounds(repoEl, 'repoSidebar');
        }
        const verEl = document.getElementById('gpt-version-sidebar');
        if (verEl) {
            if (options.versionSidebarX !== null) verEl.style.left = options.versionSidebarX + 'px';
            if (options.versionSidebarY !== null) verEl.style.top = options.versionSidebarY + 'px';
            if (options.versionSidebarWidth !== null) verEl.style.width = options.versionSidebarWidth + 'px';
            if (options.versionSidebarHeight !== null) verEl.style.height = options.versionSidebarHeight + 'px';
            ensureSidebarInBounds(verEl, 'versionSidebar');
        }
    }

    async function checkForUpdates() {
        const url = 'https://raw.githubusercontent.com/supermarsx/openai-codex-userscript/main/openai-codex.user.js';
        try {
            const txt = await new Promise((resolve, reject) => {
                if (typeof GM_xmlhttpRequest === 'function') {
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url,
                        onload: (res) => resolve(res.responseText),
                        onerror: () => reject(new Error('Network error')),
                    });
                } else if (typeof fetch === 'function') {
                    fetch(url, { cache: 'no-store' }).then(resp => {
                        if (!resp.ok) throw new Error('Network error');
                        return resp.text();
                    }).then(resolve).catch(reject);
                } else {
                    reject(new Error('No fetch available'));
                }
            });
            const m = txt.match(/@version\s+(\S+)/);
            if (m) {
                const latest = m[1];
                if (latest !== SCRIPT_VERSION) {
                    if (window.confirm(`Update available (v${latest}). Open download page?`)) {
                        window.open('https://github.com/supermarsx/openai-codex-userscript/raw/refs/heads/main/openai-codex.user.js', '_blank');
                    }
                } else {
                    window.alert('No updates found.');
                }
            }
        } catch (e) {
            console.error('Failed to check for updates', e);
        }
    }

    const actionBar = document.createElement('div');
    actionBar.id = 'gpt-action-bar';
    document.body.appendChild(actionBar);

    const historyBtn = createActionBtn('gpt-history-btn', '📜', 'History');
    actionBar.appendChild(historyBtn);

    const repoBtn = createActionBtn('gpt-repo-btn', '📁', 'Repos');
    actionBar.appendChild(repoBtn);

    const versionBtn = createActionBtn('gpt-version-btn', '🔖', 'Versions');
    actionBar.appendChild(versionBtn);

    const settingsBtn = createActionBtn('gpt-settings-btn', '⚙️', 'Settings');
    actionBar.appendChild(settingsBtn);

    const modal = document.createElement('div');
    modal.id = 'gpt-settings-modal';
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    const modalTitle = document.createElement('h2');
    modalTitle.className = 'mb-2 text-lg';
    modalTitle.textContent = 'Settings';
    modalContent.appendChild(modalTitle);
    const versionDiv = document.createElement('div');
    versionDiv.id = 'gpt-settings-version';
    versionDiv.className = 'mb-2 text-sm';
    modalContent.appendChild(versionDiv);
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.id = 'gpt-settings-suggestions';
    modalContent.appendChild(suggestionsDiv);
    const themeSelect = createSelect('gpt-setting-theme', [['light', 'Light'], ['dark', 'Dark'], ['oled', 'OLED']]);
    const themeLabel = document.createElement('label');
    themeLabel.appendChild(themeSelect);
    modalContent.appendChild(createSettingGroup('Theme', [themeLabel]));
    const fontSelect = createSelect('gpt-setting-font', [['sans-serif', 'Sans-serif'], ['serif', 'Serif'], ['monospace', 'Monospace'], ['custom', 'Custom']]);
    const fontLabel = document.createElement('label');
    fontLabel.appendChild(fontSelect);
    const customFontInput = document.createElement('input');
    customFontInput.type = 'text';
    customFontInput.id = 'gpt-setting-custom-font';
    customFontInput.placeholder = 'Custom font';
    customFontInput.className = 'mt-1';
    modalContent.appendChild(createSettingGroup('Font', [fontLabel, customFontInput]));
    const interfaceGroup = createSettingGroup('Interface', [
        createCheckbox('gpt-setting-header', 'Hide header'), document.createElement('br'),
        createCheckbox('gpt-setting-docs', 'Hide Docs link'), document.createElement('br'),
        createCheckbox('gpt-setting-logo-text', 'Hide logo text'), document.createElement('br'),
        createCheckbox('gpt-setting-logo-image', 'Hide logo image'), document.createElement('br'),
        createCheckbox('gpt-setting-profile', 'Hide profile icon'), document.createElement('br'),
        createCheckbox('gpt-setting-environments', 'Hide environments button'), document.createElement('br'),
        createCheckbox('gpt-setting-three-column', '3 column layout')
    ]);
    modalContent.appendChild(interfaceGroup);
    const sidebarsGroup = createSettingGroup('Sidebars', [
        createCheckbox('gpt-setting-show-repos', 'Show repo sidebar'), document.createElement('br'),
        createCheckbox('gpt-setting-show-versions', 'Show version sidebar')
    ]);
    modalContent.appendChild(sidebarsGroup);
    const branchesGroup = createSettingGroup('Branches', [
        createCheckbox('gpt-setting-clear-closed', 'Auto-clear closed branches'), document.createElement('br'),
        createCheckbox('gpt-setting-clear-merged', 'Auto-clear merged branches'), document.createElement('br'),
        createCheckbox('gpt-setting-clear-open', 'Auto-clear open branches'), document.createElement('br'),
        createCheckbox('gpt-setting-auto-archive-merged', 'Auto-archive merged tasks'), document.createElement('br'),
        createCheckbox('gpt-setting-auto-archive-closed', 'Auto-archive closed tasks')
    ]);
    modalContent.appendChild(branchesGroup);
    const otherGroup = createSettingGroup('Other', [
        createCheckbox('gpt-setting-auto-updates', 'Auto-check for updates'), document.createElement('br'),
        createCheckbox('gpt-setting-disable-history', 'Disable prompt history'), document.createElement('br'),
        (() => {
            const l = document.createElement('label');
            l.textContent = 'History limit ';
            const inp = document.createElement('input');
            inp.type = 'number';
            inp.id = 'gpt-setting-history-limit';
            inp.min = '1';
            inp.style.width = '4rem';
            l.appendChild(inp);
            return l;
        })()
    ]);
    modalContent.appendChild(otherGroup);
    modalContent.appendChild(createButton('Check for Updates', 'btn btn-primary btn-small', 'gpt-update-check'));
    modalContent.appendChild(createButton('Reset Defaults', 'btn btn-secondary btn-small', 'gpt-reset-defaults'));
    modalContent.appendChild(createButton('Reset Windows', 'btn btn-secondary btn-small', 'gpt-reset-windows'));
    modalContent.appendChild(document.createElement('br'));
    const closeWrap = document.createElement('div');
    closeWrap.className = 'mt-2 text-right';
    closeWrap.appendChild(createButton('Close', 'btn btn-secondary btn-small', 'gpt-settings-close'));
    modalContent.appendChild(closeWrap);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    const historyModal = document.createElement('div');
    historyModal.id = 'gpt-history-modal';
    const histContent = document.createElement('div');
    histContent.className = 'modal-content';
    const histTitle = document.createElement('h2');
    histTitle.className = 'mb-2 text-lg';
    histTitle.textContent = 'Prompt History';
    histContent.appendChild(histTitle);
    const histSearch = document.createElement('input');
    histSearch.type = 'text';
    histSearch.id = 'gpt-history-search';
    histSearch.className = 'w-full mb-2';
    histSearch.placeholder = 'Search...';
    histContent.appendChild(histSearch);
    const histList = document.createElement('div');
    histList.id = 'gpt-history-list';
    histContent.appendChild(histList);
    const histActions = document.createElement('div');
    histActions.className = 'mt-2 text-right';
    histActions.appendChild(createButton('Clear', 'btn btn-secondary btn-small', 'gpt-history-clear'));
    histActions.appendChild(createButton('Close', 'btn btn-secondary btn-small', 'gpt-history-close'));
    histContent.appendChild(histActions);
    historyModal.appendChild(histContent);
    document.body.appendChild(historyModal);

    const historyPreview = document.createElement('div');
    historyPreview.id = 'gpt-history-preview';
    const previewContent = document.createElement('div');
    previewContent.className = 'modal-content';
    const previewPre = document.createElement('pre');
    previewPre.id = 'gpt-preview-text';
    previewPre.className = 'whitespace-pre-wrap';
    previewContent.appendChild(previewPre);
    const previewActions = document.createElement('div');
    previewActions.className = 'mt-2 text-right';
    previewActions.appendChild(createButton('Use', 'btn btn-primary btn-small', 'gpt-preview-use'));
    previewActions.appendChild(createButton('Cancel', 'btn btn-secondary btn-small', 'gpt-preview-cancel'));
    previewContent.appendChild(previewActions);
    historyPreview.appendChild(previewContent);
    document.body.appendChild(historyPreview);

    const previewTextEl = historyPreview.querySelector('#gpt-preview-text');
    const previewUseBtn = historyPreview.querySelector('#gpt-preview-use');
    const previewCancelBtn = historyPreview.querySelector('#gpt-preview-cancel');

    function openHistoryPreview(text) {
        if (previewTextEl) previewTextEl.textContent = text;
        historyPreview.classList.add('show');
    }

    previewCancelBtn?.addEventListener('click', () => historyPreview.classList.remove('show'));
    previewUseBtn?.addEventListener('click', () => {
        const text = previewTextEl?.textContent || '';
        setPromptText(currentPromptDiv || findPromptInput(), text);
        historyPreview.classList.remove('show');
    });
    historyPreview.addEventListener('click', (e) => { if (e.target === historyPreview) historyPreview.classList.remove('show'); });

    const repoSidebar = document.createElement('div');
    repoSidebar.id = 'gpt-repo-sidebar';
    const repoHeader = document.createElement('div');
    repoHeader.className = 'flex justify-between items-center';
    const repoTitle = document.createElement('h3');
    repoTitle.className = 'm-0';
    repoTitle.textContent = 'Repositories';
    repoHeader.appendChild(repoTitle);
    repoHeader.appendChild(createButton('×', 'btn relative btn-secondary btn-small', 'gpt-repo-hide'));
    repoSidebar.appendChild(repoHeader);
    const repoList = document.createElement('ul');
    repoList.id = 'gpt-repo-list';
    repoSidebar.appendChild(repoList);
    document.body.appendChild(repoSidebar);
    makeSidebarInteractive(repoSidebar, 'repoSidebar');
    repoSidebar.querySelector('#gpt-repo-hide').addEventListener('click', () => {
        toggleRepoSidebar(false);
        options.showRepoSidebar = false;
        saveOptions(options);
    });

    const versionSidebar = document.createElement('div');
    versionSidebar.id = 'gpt-version-sidebar';
    const versionHeader = document.createElement('div');
    versionHeader.className = 'flex justify-between items-center';
    const versionTitle = document.createElement('h3');
    versionTitle.className = 'm-0';
    versionTitle.textContent = 'Versions';
    versionHeader.appendChild(versionTitle);
    versionHeader.appendChild(createButton('×', 'btn relative btn-secondary btn-small', 'gpt-version-hide'));
    versionSidebar.appendChild(versionHeader);
    const versionList = document.createElement('ul');
    versionList.id = 'gpt-version-list';
    versionSidebar.appendChild(versionList);
    const branchActions = document.createElement('div');
    branchActions.id = 'gpt-branch-actions';
    branchActions.appendChild(createButton('Clear Open', 'btn relative btn-secondary btn-small', 'gpt-clear-open'));
    branchActions.appendChild(createButton('Clear Merged', 'btn relative btn-secondary btn-small', 'gpt-clear-merged'));
    branchActions.appendChild(createButton('Clear Closed', 'btn relative btn-secondary btn-small', 'gpt-clear-closed'));
    branchActions.appendChild(createButton('Clear All', 'btn relative btn-secondary btn-small', 'gpt-clear-all'));
    versionSidebar.appendChild(branchActions);
    document.body.appendChild(versionSidebar);
    makeSidebarInteractive(versionSidebar, 'versionSidebar');
    versionSidebar.querySelector('#gpt-version-hide').addEventListener('click', () => {
        toggleVersionSidebar(false);
        options.showVersionSidebar = false;
        saveOptions(options);
    });


    let repos = [];

    function renderRepos(source) {
        const list = repoSidebar.querySelector('#gpt-repo-list');
        if (!list) return;
        repos = parseRepoNames(source);
        list.textContent = '';
        repos.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name + ' ';
            [5, 10, 20].forEach(n => {
                const btn = createButton(String(n));
                btn.addEventListener('click', () => renderVersions(name, n));
                li.appendChild(btn);
            });
            list.appendChild(li);
        });
    }

    function renderVersions(repo, count) {
        const list = versionSidebar.querySelector('#gpt-version-list');
        if (!list) return;
        list.textContent = '';
        for (let i = 1; i <= count; i++) {
            const li = document.createElement('li');
            li.textContent = repo + ' v' + i;
            li.dataset.status = ['Open', 'Closed', 'Merged'][i % 3];
            list.appendChild(li);
        }
        if (options.clearClosedBranches) clearBranches('Closed');
        if (options.clearMergedBranches) clearBranches('Merged');
        if (options.clearOpenBranches) clearBranches('Open');
    }

    function clearBranches(status) {
        const items = Array.from(versionSidebar.querySelectorAll('#gpt-version-list li'));
        items.forEach(it => {
            if (status === 'All' || it.dataset.status === status) it.remove();
        });
    }

    function bulkArchive(status) {
        const buttons = Array.from(document.querySelectorAll('button,[role="button"]')).filter(btn => {
            const label = (btn.textContent || '') + ' ' + (btn.getAttribute('aria-label') || '');
            if (!/archive/i.test(label)) return false;
            const span = btn.querySelector('[data-state]');
            let s = span?.dataset.state?.toLowerCase() || '';
            if (!s) {
                if (/merged/i.test(label)) s = 'merged';
                else if (/closed/i.test(label)) s = 'closed';
                else if (/open/i.test(label)) s = 'open';
            }
            return status === 'All' || s === status.toLowerCase();
        });
        if (buttons.length === 0) return;
        const overlay = document.createElement('div');
        overlay.id = 'gpt-archive-progress';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.zIndex = '1000';
        overlay.style.background = 'rgba(0,0,0,0.5)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        const overlayBox = document.createElement('div');
        overlayBox.style.background = 'var(--background)';
        overlayBox.style.color = 'var(--foreground)';
        overlayBox.style.padding = '1rem';
        overlayBox.style.borderRadius = '0.5rem';
        overlayBox.style.width = '200px';
        const barOuter = document.createElement('div');
        barOuter.style.height = '6px';
        barOuter.style.background = 'var(--ring)';
        barOuter.style.borderRadius = '3px';
        barOuter.style.overflow = 'hidden';
        const progressBar = document.createElement('div');
        progressBar.id = 'gpt-progress-bar';
        progressBar.style.width = '0';
        progressBar.style.height = '100%';
        progressBar.style.background = 'var(--brand-purple)';
        progressBar.style.transition = 'width 0.2s';
        barOuter.appendChild(progressBar);
        overlayBox.appendChild(barOuter);
        const progressText = document.createElement('div');
        progressText.id = 'gpt-progress-text';
        progressText.style.marginTop = '4px';
        progressText.style.fontSize = '12px';
        progressText.style.textAlign = 'center';
        progressText.textContent = `0/${buttons.length}`;
        overlayBox.appendChild(progressText);
        overlay.appendChild(overlayBox);
        document.body.appendChild(overlay);
        let i = 0;
        function next() {
            if (i >= buttons.length) {
                setTimeout(() => overlay.remove(), 500);
                return;
            }
            buttons[i].click();
            i++;
            const pct = Math.round(i / buttons.length * 100);
            overlay.querySelector('#gpt-progress-bar').style.width = pct + '%';
            overlay.querySelector('#gpt-progress-text').textContent = `${i}/${buttons.length}`;
            setTimeout(next, 750);
        }
        next();
    }

    renderRepos();

    versionSidebar.querySelector('#gpt-clear-open').addEventListener('click', () => {
        bulkArchive('open');
        clearBranches('Open');
    });
    versionSidebar.querySelector('#gpt-clear-merged').addEventListener('click', () => {
        bulkArchive('merged');
        clearBranches('Merged');
    });
    versionSidebar.querySelector('#gpt-clear-closed').addEventListener('click', () => {
        bulkArchive('closed');
        clearBranches('Closed');
    });
    versionSidebar.querySelector('#gpt-clear-all').addEventListener('click', () => {
        if (window.confirm('Clear all branches?')) {
            bulkArchive('All');
            clearBranches('All');
        }
    });

    function refreshDropdown() {
        if (currentPromptDiv && currentColDiv) {
            const existing = document.getElementById('gpt-prompt-suggest-dropdown');
            if (existing) existing.closest('.grid')?.remove();
            injectDropdown(currentPromptDiv, currentColDiv);
        }
    }

    function renderSuggestions() {
        const wrap = modal.querySelector('#gpt-settings-suggestions');
        wrap.textContent = '';
        const h3 = document.createElement('h3');
        h3.className = 'mb-1';
        h3.textContent = 'Prompt Suggestions';
        wrap.appendChild(h3);
        const table = document.createElement('table');
        table.className = 'w-full text-sm';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const textHead = document.createElement('th');
        textHead.textContent = 'Suggestion';
        textHead.className = 'text-left';
        const actionsHead = document.createElement('th');
        actionsHead.textContent = 'Actions';
        headerRow.appendChild(textHead);
        headerRow.appendChild(actionsHead);
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        suggestions.forEach((s, i) => {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.textContent = s;
            const actions = document.createElement('td');
            const edit = createButton('Edit');
            const del = createButton('Remove');
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
            actions.appendChild(edit);
            actions.appendChild(del);
            row.appendChild(cell);
            row.appendChild(actions);
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        wrap.appendChild(table);
        const addBtn = createButton('Add');
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

        const exportBtn = createButton('Export');
        exportBtn.addEventListener('click', () => {
            try {
                const blob = new Blob([JSON.stringify(suggestions, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'suggestions.json';
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                a.remove();
            } catch (e) {
                console.error('Failed to export suggestions', e);
                window.alert('Failed to export suggestions');
            }
        });
        wrap.appendChild(exportBtn);

        const importBtn = createButton('Import');
        importBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.addEventListener('change', () => {
                const file = input.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const data = JSON.parse(String(reader.result));
                        if (Array.isArray(data)) {
                            const list = Array.from(
                                new Set(
                                    data
                                        .map(d => String(d).trim())
                                        .filter(s => s.length > 0)
                                )
                            );
                            if (list.length > 0) {
                                suggestions = list;
                                saveSuggestions(suggestions);
                                renderSuggestions();
                                refreshDropdown();
                            } else {
                                window.alert('Invalid suggestions file');
                            }
                        } else {
                            window.alert('Invalid suggestions file');
                        }
                    } catch (err) {
                        console.error('Failed to import suggestions', err);
                        window.alert('Failed to import suggestions');
                    }
                };
                reader.readAsText(file);
            });
            input.click();
        });
        wrap.appendChild(importBtn);
    }

    function openSettings() {
        renderSuggestions();
        const versionEl = modal.querySelector('#gpt-settings-version');
        if (versionEl) versionEl.textContent = `Version ${SCRIPT_VERSION}`;
        const themeSelect = modal.querySelector('#gpt-setting-theme');
        const prefersDark = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemTheme = prefersDark ? 'dark' : 'light';
        themeSelect.value = options.theme || systemTheme;
        const fontSelect = modal.querySelector('#gpt-setting-font');
        const customFontInput = modal.querySelector('#gpt-setting-custom-font');
        fontSelect.value = options.font;
        if (customFontInput) customFontInput.value = options.customFont;
        modal.querySelector('#gpt-setting-header').checked = options.hideHeader;
        modal.querySelector('#gpt-setting-docs').checked = options.hideDocs;
        modal.querySelector('#gpt-setting-logo-text').checked = options.hideLogoText;
        modal.querySelector('#gpt-setting-logo-image').checked = options.hideLogoImage;
        modal.querySelector('#gpt-setting-profile').checked = options.hideProfile;
        modal.querySelector('#gpt-setting-environments').checked = options.hideEnvironments;
        modal.querySelector('#gpt-setting-three-column').checked = options.threeColumnMode;
        modal.querySelector('#gpt-setting-auto-updates').checked = options.autoCheckUpdates;
        modal.querySelector('#gpt-setting-disable-history').checked = options.disableHistory;
        modal.querySelector('#gpt-setting-history-limit').value = String(options.historyLimit);
        modal.querySelector('#gpt-setting-show-repos').checked = options.showRepoSidebar;
        modal.querySelector('#gpt-setting-show-versions').checked = options.showVersionSidebar;
        modal.querySelector('#gpt-setting-clear-closed').checked = options.clearClosedBranches;
        modal.querySelector('#gpt-setting-clear-merged').checked = options.clearMergedBranches;
        modal.querySelector('#gpt-setting-clear-open').checked = options.clearOpenBranches;
        modal.querySelector('#gpt-setting-auto-archive-merged').checked = options.autoArchiveMerged;
        modal.querySelector('#gpt-setting-auto-archive-closed').checked = options.autoArchiveClosed;
        modal.classList.add('show');
    }

    function filterHistory(list, query) {
        const q = (query || '').toLowerCase();
        return list.reduce((acc, h, i) => {
            if (!q || h.toLowerCase().includes(q)) acc.push([h, i]);
            return acc;
        }, []);
    }

    function renderHistory() {
        const wrap = historyModal.querySelector('#gpt-history-list');
        wrap.textContent = '';
        const ul = document.createElement('ul');
        const items = filterHistory(history, historyQuery);
        items.forEach(([h, i]) => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            const first = h.split(/\r?\n/)[0];
            span.textContent = first.length > 30 ? first.slice(0, 30) + '…' : first;
            li.appendChild(span);

            const useBtn = createButton('Use');
            useBtn.addEventListener('click', () => {
                openHistoryPreview(h);
            });
            li.appendChild(useBtn);

            const restoreBtn = createButton('Restore');
            restoreBtn.addEventListener('click', () => {
                setPromptText(currentPromptDiv || findPromptInput(), h);
            });
            li.appendChild(restoreBtn);

            const delBtn = createButton('Delete');
            delBtn.addEventListener('click', () => {
                history.splice(i, 1);
                saveHistory(history);
                renderHistory();
            });
            li.appendChild(delBtn);

            ul.appendChild(li);
        });
        wrap.appendChild(ul);
    }

    function openHistory() {
        const input = historyModal.querySelector('#gpt-history-search');
        if (input) input.value = historyQuery;
        renderHistory();
        historyModal.classList.add('show');
    }

    historyBtn.addEventListener('click', openHistory);
    repoBtn.addEventListener('click', () => {
        const el = document.getElementById('gpt-repo-sidebar');
        const show = !el || el.classList.contains('hidden');
        toggleRepoSidebar(show);
        options.showRepoSidebar = show;
        saveOptions(options);
    });
    versionBtn.addEventListener('click', () => {
        const el = document.getElementById('gpt-version-sidebar');
        const show = !el || el.classList.contains('hidden');
        toggleVersionSidebar(show);
        options.showVersionSidebar = show;
        saveOptions(options);
    });
    settingsBtn.addEventListener('click', openSettings);
    modal.querySelector('#gpt-settings-close').addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
    historyModal.querySelector('#gpt-history-close').addEventListener('click', () => historyModal.classList.remove('show'));
    historyModal.addEventListener('click', (e) => { if (e.target === historyModal) historyModal.classList.remove('show'); });
    historyModal.querySelector('#gpt-history-clear').addEventListener('click', () => { history = []; saveHistory(history); renderHistory(); });
    const historySearchInput = historyModal.querySelector('#gpt-history-search');
    historySearchInput?.addEventListener('input', () => {
        historyQuery = historySearchInput.value;
        renderHistory();
    });
    modal.querySelector('#gpt-setting-theme').addEventListener('change', (e) => { options.theme = e.target.value; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-font').addEventListener('change', (e) => { options.font = e.target.value; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-custom-font').addEventListener('input', (e) => { options.customFont = e.target.value; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-header').addEventListener('change', (e) => { options.hideHeader = e.target.checked; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-docs').addEventListener('change', (e) => { options.hideDocs = e.target.checked; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-logo-text').addEventListener('change', (e) => { options.hideLogoText = e.target.checked; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-logo-image').addEventListener('change', (e) => { options.hideLogoImage = e.target.checked; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-profile').addEventListener('change', (e) => { options.hideProfile = e.target.checked; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-environments').addEventListener('change', (e) => { options.hideEnvironments = e.target.checked; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-three-column').addEventListener('change', (e) => { options.threeColumnMode = e.target.checked; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-auto-updates').addEventListener('change', (e) => { options.autoCheckUpdates = e.target.checked; saveOptions(options); });
    modal.querySelector('#gpt-setting-disable-history').addEventListener('change', (e) => { options.disableHistory = e.target.checked; saveOptions(options); });
    modal.querySelector('#gpt-setting-history-limit').addEventListener('change', (e) => { options.historyLimit = parseInt(e.target.value, 10) || 1; saveOptions(options); });
    modal.querySelector('#gpt-setting-show-repos').addEventListener('change', (e) => { options.showRepoSidebar = e.target.checked; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-show-versions').addEventListener('change', (e) => { options.showVersionSidebar = e.target.checked; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-clear-closed').addEventListener('change', (e) => { options.clearClosedBranches = e.target.checked; saveOptions(options); });
    modal.querySelector('#gpt-setting-clear-merged').addEventListener('change', (e) => { options.clearMergedBranches = e.target.checked; saveOptions(options); });
    modal.querySelector('#gpt-setting-clear-open').addEventListener('change', (e) => { options.clearOpenBranches = e.target.checked; saveOptions(options); });
    modal.querySelector('#gpt-setting-auto-archive-merged').addEventListener('change', (e) => { options.autoArchiveMerged = e.target.checked; saveOptions(options); });
    modal.querySelector('#gpt-setting-auto-archive-closed').addEventListener('change', (e) => { options.autoArchiveClosed = e.target.checked; saveOptions(options); });
    modal.querySelector('#gpt-update-check').addEventListener('click', () => checkForUpdates());
    modal.querySelector('#gpt-reset-defaults').addEventListener('click', () => {
        options = { ...DEFAULT_OPTIONS };
        saveOptions(options);
        applyOptions();
        openSettings();
    });
    modal.querySelector('#gpt-reset-windows').addEventListener('click', () => {
        options.repoSidebarX = options.repoSidebarY = options.repoSidebarWidth = options.repoSidebarHeight = null;
        options.versionSidebarX = options.versionSidebarY = options.versionSidebarWidth = options.versionSidebarHeight = null;
        saveOptions(options);
        applyOptions();
    });

    const pageObserver = new MutationObserver(() => {
        toggleHeader(options.hideHeader);
        toggleDocs(options.hideDocs);
        toggleLogoText(options.hideLogoText);
        toggleLogoImage(options.hideLogoImage);
        toggleProfile(options.hideProfile);
        toggleEnvironments(options.hideEnvironments);
        toggleRepoSidebar(options.showRepoSidebar);
        toggleVersionSidebar(options.showVersionSidebar);
    });
    observers.push(pageObserver);
    pageObserver.observe(document.body, { childList: true, subtree: true });

    applyOptions();
    if (options.autoCheckUpdates) {
        checkForUpdates();
    }

    // Automatically archive tasks based on status changes
    function findArchiveButton() {
        return (
            document.querySelector('[data-testid="archive-task"]') ||
            Array.from(document.querySelectorAll('button,[role="button"]')).find(b => {
                const label = (b.textContent || '') + ' ' + (b.getAttribute('aria-label') || '');
                return /archive/i.test(label);
            })
        );
    }

    function findSendButton() {
        return (
            document.querySelector('[data-testid*="send" i]') ||
            Array.from(document.querySelectorAll('button')).find(b => /send/i.test(b.getAttribute('aria-label') || b.dataset?.testid || b.textContent))
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
                if (options.autoArchiveMerged) autoArchiveOnMerged();
            } else if (/closed/i.test(status)) {
                if (options.autoArchiveClosed) autoArchiveOnClosed();
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

    function setPromptText(el, value) {
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
            sel.removeAllRanges();
            sel.addRange(range);
        }
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

        wrapper.appendChild(container);

        const inputContainer = promptDiv.parentElement;
        if (inputContainer) {
            inputContainer.insertBefore(wrapper, promptDiv);
        }

        // OpenAI Codex UI now includes a built-in history button. We no longer
        // need to inject our custom one, so these lines were removed.


        dropdown.addEventListener('change', () => {
            const value = dropdown.value;
            if (!value) return;

            setPromptText(promptDiv, value);
            dropdown.selectedIndex = 0;
        });
    }

    // Wait until the main prompt input exists
    function waitForPromptInput(callback) {
        if (promptInputObserver) {
            promptInputObserver.disconnect();
            const idx = observers.indexOf(promptInputObserver);
            if (idx !== -1) observers.splice(idx, 1);
        }

        const observer = new MutationObserver(() => {
            const promptDiv = findPromptInput();
            const colDiv = (promptDiv?.closest('.flex-col.items-center') || promptDiv?.parentElement);
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
        const colDiv = (promptDiv?.closest('.flex-col.items-center') || promptDiv?.parentElement);
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

        promptDiv.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
                const text = promptDiv instanceof HTMLTextAreaElement ? promptDiv.value : promptDiv.textContent;
                history = addToHistory(history, text);
            }
        });

        const sendBtn = findSendButton();
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                const text = promptDiv instanceof HTMLTextAreaElement ? promptDiv.value : promptDiv.textContent;
                history = addToHistory(history, text);
            });
        }

        const observer = new MutationObserver(() => {
            const pd = findPromptInput();
            const cd = (pd?.closest('.flex-col.items-center') || pd?.parentElement);
            if (pd && cd && !document.getElementById('gpt-prompt-suggest-dropdown')) {
                currentPromptDiv = pd;
                currentColDiv = cd;
                injectDropdown(pd, cd);
            }
        });

        dropdownObserver = observer;
        observers.push(observer);

        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
