// @ts-nocheck
import { loadOptions, saveOptions } from "./helpers/options";
import { loadSuggestions, saveSuggestions, DEFAULT_SUGGESTIONS } from "./helpers/suggestions";
import { loadHistory, saveHistory, addToHistory } from "./helpers/history";
import { findPromptInput, setPromptText } from "./helpers/dom";
(function () {

    'use strict';
    const SCRIPT_VERSION = '1.26';
    const observers = [];
    let promptInputObserver = null;
    let dropdownObserver = null;
    let currentPromptDiv = null;
    let currentColDiv = null;
    let repoRestoreBtn = null;
    let versionRestoreBtn = null;

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
}
#gpt-action-bar .gpt-action-btn:hover {
    background: var(--ring);
    color: var(--background);
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
#gpt-history-modal .modal-content { background: var(--background); color: var(--foreground); border: 1px solid var(--ring); border-radius: 0.5rem; padding: 1rem; max-width: 90%; width: 400px; }
#gpt-history-modal button { border: 1px solid var(--ring); padding: 2px 6px; border-radius: 4px; }
#gpt-repo-sidebar, #gpt-version-sidebar { position: fixed; inset-block-start: 10%; max-height: 80vh; width: 180px; background: var(--background); color: var(--foreground); border: 1px solid var(--ring); overflow-y: auto; z-index: 999; padding: 0.5rem; border-radius: 0.25rem; box-shadow: 0 2px 6px rgba(0,0,0,0.2); resize: both; }
#gpt-repo-sidebar { inset-inline-start: 10px; }
#gpt-version-sidebar { inset-inline-end: 10px; }
#gpt-repo-sidebar.hidden, #gpt-version-sidebar.hidden { display: none; }
#gpt-repo-handle, #gpt-version-handle { position: fixed; top: 50%; z-index: 998; background: var(--ring); color: var(--background); padding: 4px; cursor: pointer; user-select: none; }
#gpt-repo-sidebar > div:first-child, #gpt-version-sidebar > div:first-child { cursor: move; }
#gpt-repo-handle { left: 0; border-radius: 0 4px 4px 0; transform: translate(0,-50%); }
#gpt-version-handle { right: 0; border-radius: 4px 0 0 4px; transform: translate(0,-50%); }
#gpt-repo-handle.hidden, #gpt-version-handle.hidden { display: none; }
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
    let suggestions = loadSuggestions() || DEFAULT_SUGGESTIONS.slice();
    let options = loadOptions();
    let history = loadHistory();




    function findByText(text) {
        const elements = Array.from(document.querySelectorAll('body *'));
        return elements.find(el => el.textContent && el.textContent.includes(text)) || null;
    }

    function toggleHeader(hide) {
        const node = document.querySelector('h1.mb-4.pt-4.text-2xl');
        if (node && node.textContent?.includes('What are we coding next?')) {
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
    }

    function toggleRepoSidebar(show) {
        const el = document.getElementById('gpt-repo-sidebar');
        const handle = document.getElementById('gpt-repo-handle');
        const actionBar = document.querySelector('[data-testid="composer-trailing-actions"]');
        if (el) el.classList.toggle('hidden', !show);
        if (handle) handle.classList.toggle('hidden', show);
        if (show) {
            if (repoRestoreBtn) repoRestoreBtn.remove();
        } else if (actionBar && !repoRestoreBtn) {
            repoRestoreBtn = document.createElement('button');
            repoRestoreBtn.id = 'gpt-repo-restore';
            repoRestoreBtn.type = 'button';
            repoRestoreBtn.textContent = 'Repos';
            repoRestoreBtn.className = 'btn relative btn-secondary btn-small';
            repoRestoreBtn.addEventListener('click', () => {
                toggleRepoSidebar(true);
                options.showRepoSidebar = true;
                saveOptions(options);
            });
            actionBar.appendChild(repoRestoreBtn);
        }
    }

    function toggleVersionSidebar(show) {
        const el = document.getElementById('gpt-version-sidebar');
        const handle = document.getElementById('gpt-version-handle');
        const actionBar = document.querySelector('[data-testid="composer-trailing-actions"]');
        if (el) el.classList.toggle('hidden', !show);
        if (handle) handle.classList.toggle('hidden', show);
        if (show) {
            if (versionRestoreBtn) versionRestoreBtn.remove();
        } else if (actionBar && !versionRestoreBtn) {
            versionRestoreBtn = document.createElement('button');
            versionRestoreBtn.id = 'gpt-version-restore';
            versionRestoreBtn.type = 'button';
            versionRestoreBtn.textContent = 'Versions';
            versionRestoreBtn.className = 'btn relative btn-secondary btn-small';
            versionRestoreBtn.addEventListener('click', () => {
                toggleVersionSidebar(true);
                options.showVersionSidebar = true;
                saveOptions(options);
            });
            actionBar.appendChild(versionRestoreBtn);
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

        const repoEl = document.getElementById('gpt-repo-sidebar');
        if (repoEl) {
            if (options.repoSidebarX !== null) repoEl.style.left = options.repoSidebarX + 'px';
            if (options.repoSidebarY !== null) repoEl.style.top = options.repoSidebarY + 'px';
            if (options.repoSidebarWidth !== null) repoEl.style.width = options.repoSidebarWidth + 'px';
            if (options.repoSidebarHeight !== null) repoEl.style.height = options.repoSidebarHeight + 'px';
        }
        const verEl = document.getElementById('gpt-version-sidebar');
        if (verEl) {
            if (options.versionSidebarX !== null) verEl.style.left = options.versionSidebarX + 'px';
            if (options.versionSidebarY !== null) verEl.style.top = options.versionSidebarY + 'px';
            if (options.versionSidebarWidth !== null) verEl.style.width = options.versionSidebarWidth + 'px';
            if (options.versionSidebarHeight !== null) verEl.style.height = options.versionSidebarHeight + 'px';
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

    const historyBtn = document.createElement('div');
    historyBtn.id = 'gpt-history-btn';
    historyBtn.className = 'gpt-action-btn';
    historyBtn.textContent = '📜';
    actionBar.appendChild(historyBtn);

    const repoBtn = document.createElement('div');
    repoBtn.id = 'gpt-repo-btn';
    repoBtn.className = 'gpt-action-btn';
    repoBtn.textContent = 'Repos';
    actionBar.appendChild(repoBtn);

    const versionBtn = document.createElement('div');
    versionBtn.id = 'gpt-version-btn';
    versionBtn.className = 'gpt-action-btn';
    versionBtn.textContent = 'Versions';
    actionBar.appendChild(versionBtn);

    const settingsBtn = document.createElement('div');
    settingsBtn.id = 'gpt-settings-btn';
    settingsBtn.className = 'gpt-action-btn';
    settingsBtn.textContent = '⚙️';
    actionBar.appendChild(settingsBtn);

    const modal = document.createElement('div');
    modal.id = 'gpt-settings-modal';
    modal.innerHTML = `
    <div class="modal-content">
        <h2 class="mb-2 text-lg">Settings</h2>
        <div id="gpt-settings-version" class="mb-2 text-sm"></div>
        <div id="gpt-settings-suggestions"></div>
        <div class="settings-group">
            <h3>Theme</h3>
            <label>
                <select id="gpt-setting-theme">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="oled">OLED</option>
                </select>
            </label>
        </div>
        <div class="settings-group">
            <h3>Font</h3>
            <label>
                <select id="gpt-setting-font">
                    <option value="sans-serif">Sans-serif</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace</option>
                    <option value="custom">Custom</option>
                </select>
            </label>
            <input type="text" id="gpt-setting-custom-font" placeholder="Custom font" class="mt-1">
        </div>
        <div class="settings-group">
            <h3>Interface</h3>
            <label><input type="checkbox" id="gpt-setting-header"> Hide header</label><br>
            <label><input type="checkbox" id="gpt-setting-docs"> Hide Docs link</label><br>
            <label><input type="checkbox" id="gpt-setting-logo-text"> Hide logo text</label><br>
            <label><input type="checkbox" id="gpt-setting-logo-image"> Hide logo image</label><br>
            <label><input type="checkbox" id="gpt-setting-profile"> Hide profile icon</label><br>
            <label><input type="checkbox" id="gpt-setting-environments"> Hide environments button</label>
        </div>
        <div class="settings-group">
            <h3>Sidebars</h3>
            <label><input type="checkbox" id="gpt-setting-show-repos"> Show repo sidebar</label><br>
            <label><input type="checkbox" id="gpt-setting-show-versions"> Show version sidebar</label>
        </div>
        <div class="settings-group">
            <h3>Branches</h3>
            <label><input type="checkbox" id="gpt-setting-clear-closed"> Auto-clear closed branches</label><br>
            <label><input type="checkbox" id="gpt-setting-clear-merged"> Auto-clear merged branches</label><br>
            <label><input type="checkbox" id="gpt-setting-clear-open"> Auto-clear open branches</label><br>
            <label><input type="checkbox" id="gpt-setting-auto-archive-merged"> Auto-archive merged tasks</label><br>
            <label><input type="checkbox" id="gpt-setting-auto-archive-closed"> Auto-archive closed tasks</label>
        </div>
        <div class="settings-group">
            <h3>Other</h3>
            <label><input type="checkbox" id="gpt-setting-auto-updates"> Auto-check for updates</label><br>
            <label><input type="checkbox" id="gpt-setting-disable-history"> Disable prompt history</label><br>
            <label>History limit <input type="number" id="gpt-setting-history-limit" min="1" style="width:4rem"></label>
        </div>
        <button id="gpt-update-check" class="btn btn-primary btn-small">Check for Updates</button><br>
        <div class="mt-2 text-right"><button id="gpt-settings-close" class="btn btn-secondary btn-small">Close</button></div>
    </div>`;
    document.body.appendChild(modal);

    const historyModal = document.createElement('div');
    historyModal.id = 'gpt-history-modal';
    historyModal.innerHTML = `
    <div class="modal-content">
        <h2 class="mb-2 text-lg">Prompt History</h2>
        <div id="gpt-history-list"></div>
        <div class="mt-2 text-right"><button id="gpt-history-clear" class="btn btn-secondary btn-small">Clear</button> <button id="gpt-history-close" class="btn btn-secondary btn-small">Close</button></div>
    </div>`;
    document.body.appendChild(historyModal);

    const repoSidebar = document.createElement('div');
    repoSidebar.id = 'gpt-repo-sidebar';
    repoSidebar.innerHTML = '<div class="flex justify-between items-center"><h3 class="m-0">Repositories</h3><button id="gpt-repo-hide" class="btn relative btn-secondary btn-small">×</button></div><ul id="gpt-repo-list"></ul>';
    document.body.appendChild(repoSidebar);
    makeSidebarInteractive(repoSidebar, 'repoSidebar');
    repoSidebar.querySelector('#gpt-repo-hide').addEventListener('click', () => {
        toggleRepoSidebar(false);
        options.showRepoSidebar = false;
        saveOptions(options);
    });

    const versionSidebar = document.createElement('div');
    versionSidebar.id = 'gpt-version-sidebar';
    versionSidebar.innerHTML = '<div class="flex justify-between items-center"><h3 class="m-0">Versions</h3><button id="gpt-version-hide" class="btn relative btn-secondary btn-small">×</button></div><ul id="gpt-version-list"></ul><div id="gpt-branch-actions"><button class="btn relative btn-secondary btn-small" id="gpt-clear-open">Clear Open</button> <button class="btn relative btn-secondary btn-small" id="gpt-clear-merged">Clear Merged</button> <button class="btn relative btn-secondary btn-small" id="gpt-clear-closed">Clear Closed</button> <button class="btn relative btn-secondary btn-small" id="gpt-clear-all">Clear All</button></div>';
    document.body.appendChild(versionSidebar);
    makeSidebarInteractive(versionSidebar, 'versionSidebar');
    versionSidebar.querySelector('#gpt-version-hide').addEventListener('click', () => {
        toggleVersionSidebar(false);
        options.showVersionSidebar = false;
        saveOptions(options);
    });

    const repoHandle = document.createElement('div');
    repoHandle.id = 'gpt-repo-handle';
    repoHandle.textContent = 'Repos';
    document.body.appendChild(repoHandle);
    repoHandle.addEventListener('click', () => {
        toggleRepoSidebar(true);
        options.showRepoSidebar = true;
        saveOptions(options);
    });

    const versionHandle = document.createElement('div');
    versionHandle.id = 'gpt-version-handle';
    versionHandle.textContent = 'Versions';
    document.body.appendChild(versionHandle);
    versionHandle.addEventListener('click', () => {
        toggleVersionSidebar(true);
        options.showVersionSidebar = true;
        saveOptions(options);
    });

    let repos = [];

    function parseRepoNames() {
        const set = new Set();
        const sidebar = document.querySelector('[data-testid="repository-list"], [data-testid="repo-sidebar"], nav[aria-label*="Repos" i]');
        if (sidebar) {
            sidebar.querySelectorAll('a, li').forEach(el => {
                const t = el.textContent?.trim();
                if (t) set.add(t);
            });
        }
        if (set.size === 0) {
            const text = document.body.textContent || '';
            const regex = /[\w.-]+\/[\w.-]+/g;
            let m;
            while ((m = regex.exec(text))) set.add(m[0]);
        }
        repos = Array.from(set);
    }

    function renderRepos() {
        const list = repoSidebar.querySelector('#gpt-repo-list');
        if (!list) return;
        if (repos.length === 0) parseRepoNames();
        list.innerHTML = '';
        repos.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name + ' ';
            [5, 10, 20].forEach(n => {
                const btn = document.createElement('button');
                btn.className = 'btn relative btn-secondary btn-small';
                btn.textContent = String(n);
                btn.addEventListener('click', () => renderVersions(name, n));
                li.appendChild(btn);
            });
            list.appendChild(li);
        });
    }

    function renderVersions(repo, count) {
        const list = versionSidebar.querySelector('#gpt-version-list');
        if (!list) return;
        list.innerHTML = '';
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

    parseRepoNames();
    renderRepos();

    versionSidebar.querySelector('#gpt-clear-open').addEventListener('click', () => clearBranches('Open'));
    versionSidebar.querySelector('#gpt-clear-merged').addEventListener('click', () => clearBranches('Merged'));
    versionSidebar.querySelector('#gpt-clear-closed').addEventListener('click', () => clearBranches('Closed'));
    versionSidebar.querySelector('#gpt-clear-all').addEventListener('click', () => {
        if (window.confirm('Clear all branches?')) clearBranches('All');
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
        wrap.innerHTML = '<h3 class="mb-1">Prompt Suggestions</h3>';
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
            const edit = document.createElement('button');
            edit.className = 'btn relative btn-secondary btn-small';
            edit.textContent = 'Edit';
            const del = document.createElement('button');
            del.className = 'btn relative btn-secondary btn-small';
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
            actions.appendChild(edit);
            actions.appendChild(del);
            row.appendChild(cell);
            row.appendChild(actions);
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        wrap.appendChild(table);
        const addBtn = document.createElement('button');
        addBtn.className = 'btn relative btn-secondary btn-small';
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

    function renderHistory() {
        const wrap = historyModal.querySelector('#gpt-history-list');
        wrap.innerHTML = '';
        const ul = document.createElement('ul');
        history.forEach((h, i) => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.textContent = h.split(/\r?\n/)[0];
            li.appendChild(span);

            const useBtn = document.createElement('button');
            useBtn.className = 'btn relative btn-secondary btn-small';
            useBtn.textContent = 'Use';
            useBtn.addEventListener('click', () => {
                setPromptText(currentPromptDiv || findPromptInput(), h);
                historyModal.classList.remove('show');
            });
            li.appendChild(useBtn);

            const restoreBtn = document.createElement('button');
            restoreBtn.className = 'btn relative btn-secondary btn-small';
            restoreBtn.textContent = 'Restore';
            restoreBtn.addEventListener('click', () => {
                setPromptText(currentPromptDiv || findPromptInput(), h);
            });
            li.appendChild(restoreBtn);

            const delBtn = document.createElement('button');
            delBtn.className = 'btn relative btn-secondary btn-small';
            delBtn.textContent = 'Delete';
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
        renderHistory();
        historyModal.classList.add('show');
    }

    historyBtn.addEventListener('click', openHistory);
    repoBtn.addEventListener('click', () => {
        toggleRepoSidebar(true);
        options.showRepoSidebar = true;
        saveOptions(options);
    });
    versionBtn.addEventListener('click', () => {
        toggleVersionSidebar(true);
        options.showVersionSidebar = true;
        saveOptions(options);
    });
    settingsBtn.addEventListener('click', openSettings);
    modal.querySelector('#gpt-settings-close').addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
    historyModal.querySelector('#gpt-history-close').addEventListener('click', () => historyModal.classList.remove('show'));
    historyModal.addEventListener('click', (e) => { if (e.target === historyModal) historyModal.classList.remove('show'); });
    historyModal.querySelector('#gpt-history-clear').addEventListener('click', () => { history = []; saveHistory(history); renderHistory(); });
    modal.querySelector('#gpt-setting-theme').addEventListener('change', (e) => { options.theme = e.target.value; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-font').addEventListener('change', (e) => { options.font = e.target.value; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-custom-font').addEventListener('input', (e) => { options.customFont = e.target.value; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-header').addEventListener('change', (e) => { options.hideHeader = e.target.checked; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-docs').addEventListener('change', (e) => { options.hideDocs = e.target.checked; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-logo-text').addEventListener('change', (e) => { options.hideLogoText = e.target.checked; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-logo-image').addEventListener('change', (e) => { options.hideLogoImage = e.target.checked; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-profile').addEventListener('change', (e) => { options.hideProfile = e.target.checked; saveOptions(options); applyOptions(); });
    modal.querySelector('#gpt-setting-environments').addEventListener('change', (e) => { options.hideEnvironments = e.target.checked; saveOptions(options); applyOptions(); });
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
            Array.from(document.querySelectorAll('button')).find(b => /archive/i.test(b.textContent))
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
        colDiv.insertBefore(wrapper, colDiv.firstChild);

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
