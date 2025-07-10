// ==UserScript==
// @name         OpenAI Codex UI Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.12
// @description  Adds a prompt suggestion dropdown above the input in ChatGPT Codex and provides a settings modal
// @match        https://chatgpt.com/codex*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };

  // src/lib/storage.ts
  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error(`Failed to load ${key}`, e);
    }
    return fallback;
  }
  function saveJSON(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save ${key}`, e);
    }
  }

  // src/helpers/options.ts
  var DEFAULT_OPTIONS = {
    theme: null,
    hideHeader: false,
    hideDocs: false,
    hideLogoText: false,
    hideLogoImage: false,
    hideProfile: false,
    hideEnvironments: false,
    autoCheckUpdates: true
  };
  var STORAGE_KEY = "gpt-script-options";
  function loadOptions() {
    const opts = loadJSON(STORAGE_KEY, DEFAULT_OPTIONS);
    const anyOpts = opts;
    if ("dark" in anyOpts && !("theme" in anyOpts)) {
      anyOpts.theme = anyOpts.dark ? "dark" : "light";
    }
    return __spreadValues(__spreadValues({}, DEFAULT_OPTIONS), opts);
  }
  function saveOptions(opts) {
    saveJSON(STORAGE_KEY, opts);
  }

  // src/helpers/suggestions.ts
  var DEFAULT_SUGGESTIONS = [
    "Suggest code improvements and bugfixes.",
    "Suggest test coverage improvement tasks.",
    "Update documentation according to the current features and functionality.",
    "Suggest code refactor tasks.",
    "Refactor this function to use async/await."
  ];
  var STORAGE_KEY2 = "gpt-prompt-suggestions";
  function loadSuggestions() {
    return loadJSON(STORAGE_KEY2, DEFAULT_SUGGESTIONS.slice());
  }
  function saveSuggestions(list) {
    saveJSON(STORAGE_KEY2, list);
  }

  // src/helpers/history.ts
  var STORAGE_KEY3 = "gpt-prompt-history";
  var MAX_HISTORY = 50;
  function loadHistory() {
    return loadJSON(STORAGE_KEY3, []);
  }
  function saveHistory(list) {
    saveJSON(STORAGE_KEY3, list);
  }
  function addToHistory(list, text) {
    text = text.trim();
    if (!text) return list;
    list.unshift(text);
    if (list.length > MAX_HISTORY) list.length = MAX_HISTORY;
    saveHistory(list);
    return list;
  }

  // src/index.ts
  (function() {
    "use strict";
    const SCRIPT_VERSION = "1.12";
    const observers = [];
    let promptInputObserver = null;
    let dropdownObserver = null;
    let currentPromptDiv = null;
    let currentColDiv = null;
    window.addEventListener("beforeunload", () => {
      for (const o of observers) {
        o.disconnect();
      }
    });
    const varStyle = document.createElement("style");
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
.userscript-force-oled {
    --background: #000000;
    --foreground: #ffffff;
    --ring: #333333;
}
`;
    document.head.appendChild(varStyle);
    const settingsStyle = document.createElement("style");
    settingsStyle.textContent = `
#gpt-settings-gear {
    position: fixed;
    top: auto;
    right: 16px;
    bottom: 16px;
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
#gpt-settings-gear:hover {
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
#gpt-settings-modal button { border: 1px solid var(--ring); padding: 2px 6px; border-radius: 4px; }
#gpt-settings-modal ul { list-style: none; padding: 0; margin: 0 0 0.5rem 0; }
#gpt-settings-modal li { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
#gpt-history-modal { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; }
#gpt-history-modal.show { display: flex; }
#gpt-history-modal .modal-content { background: var(--background); color: var(--foreground); border: 1px solid var(--ring); border-radius: 0.5rem; padding: 1rem; max-width: 90%; width: 400px; }
#gpt-history-modal button { border: 1px solid var(--ring); padding: 2px 6px; border-radius: 4px; }
`;
    document.head.appendChild(settingsStyle);
    const fallbackStyle = document.createElement("style");
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
      const elements = Array.from(document.querySelectorAll("body *"));
      return elements.find((el) => el.textContent && el.textContent.includes(text)) || null;
    }
    function toggleHeader(hide) {
      const node = findByText("What are we coding next?");
      if (node) node.style.display = hide ? "none" : "";
    }
    function toggleDocs(hide) {
      const links = Array.from(document.querySelectorAll("a")).filter((a) => a.textContent && a.textContent.includes("Docs"));
      for (const link of links) {
        link.style.display = hide ? "none" : "";
      }
    }
    function toggleLogoText(hide) {
      const node = findByText("Codex");
      if (node) node.style.display = hide ? "none" : "";
    }
    function toggleLogoImage(hide) {
      const img = document.querySelector('img[alt*="Codex" i], svg[aria-label*="Codex" i]');
      if (img) img.style.display = hide ? "none" : "";
    }
    function toggleProfile(hide) {
      const node = document.querySelector('[aria-label*="Profile" i], [data-testid*="profile" i], [class*="profile" i], [class*="avatar" i]');
      if (node) node.style.display = hide ? "none" : "";
    }
    function toggleEnvironments(hide) {
      const buttons = Array.from(document.querySelectorAll("button")).filter((b) => b.textContent && b.textContent.toLowerCase().includes("environment"));
      for (const btn of buttons) {
        btn.style.display = hide ? "none" : "";
      }
    }
    function applyOptions() {
      const root = document.documentElement;
      root.classList.remove("userscript-force-light", "userscript-force-dark", "userscript-force-oled");
      const prefersDark = typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = options.theme || (prefersDark ? "dark" : "light");
      root.classList.add(`userscript-force-${theme}`);
      toggleHeader(options.hideHeader);
      toggleDocs(options.hideDocs);
      toggleLogoText(options.hideLogoText);
      toggleLogoImage(options.hideLogoImage);
      toggleProfile(options.hideProfile);
      toggleEnvironments(options.hideEnvironments);
    }
    async function checkForUpdates() {
      const url = "https://raw.githubusercontent.com/supermarsx/openai-codex-userscript/main/openai-codex.user.js";
      try {
        const txt = await new Promise((resolve, reject) => {
          if (typeof GM_xmlhttpRequest === "function") {
            GM_xmlhttpRequest({
              method: "GET",
              url,
              onload: (res) => resolve(res.responseText),
              onerror: () => reject(new Error("Network error"))
            });
          } else if (typeof fetch === "function") {
            fetch(url, { cache: "no-store" }).then((resp) => {
              if (!resp.ok) throw new Error("Network error");
              return resp.text();
            }).then(resolve).catch(reject);
          } else {
            reject(new Error("No fetch available"));
          }
        });
        const m = txt.match(/@version\s+(\S+)/);
        if (m) {
          const latest = m[1];
          if (latest !== SCRIPT_VERSION) {
            if (window.confirm(`Update available (v${latest}). Open download page?`)) {
              window.open("https://github.com/supermarsx/openai-codex-userscript/raw/refs/heads/main/openai-codex.user.js", "_blank");
            }
          } else {
            window.alert("No updates found.");
          }
        }
      } catch (e) {
        console.error("Failed to check for updates", e);
      }
    }
    const gear = document.createElement("div");
    gear.id = "gpt-settings-gear";
    gear.textContent = "\u2699\uFE0F";
    document.body.appendChild(gear);
    const modal = document.createElement("div");
    modal.id = "gpt-settings-modal";
    modal.innerHTML = `
    <div class="modal-content">
        <h2 class="mb-2 text-lg">Settings</h2>
        <div id="gpt-settings-suggestions"></div>
        <label>Theme:
            <select id="gpt-setting-theme">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="oled">OLED</option>
            </select>
        </label><br>
        <label><input type="checkbox" id="gpt-setting-header"> Hide header</label><br>
        <label><input type="checkbox" id="gpt-setting-docs"> Hide Docs link</label><br>
        <label><input type="checkbox" id="gpt-setting-logo-text"> Hide logo text</label><br>
        <label><input type="checkbox" id="gpt-setting-logo-image"> Hide logo image</label><br>
        <label><input type="checkbox" id="gpt-setting-profile"> Hide profile icon</label><br>
        <label><input type="checkbox" id="gpt-setting-environments"> Hide environments button</label><br>
        <label><input type="checkbox" id="gpt-setting-auto-updates"> Auto-check for updates</label><br>
        <button id="gpt-update-check">Check for Updates</button><br>
        <div class="mt-2 text-right"><button id="gpt-settings-close">Close</button></div>
    </div>`;
    document.body.appendChild(modal);
    const historyModal = document.createElement("div");
    historyModal.id = "gpt-history-modal";
    historyModal.innerHTML = `
    <div class="modal-content">
        <h2 class="mb-2 text-lg">Prompt History</h2>
        <div id="gpt-history-list"></div>
        <div class="mt-2 text-right"><button id="gpt-history-clear">Clear</button> <button id="gpt-history-close">Close</button></div>
    </div>`;
    document.body.appendChild(historyModal);
    function refreshDropdown() {
      var _a;
      if (currentPromptDiv && currentColDiv) {
        const existing = document.getElementById("gpt-prompt-suggest-dropdown");
        if (existing) (_a = existing.closest(".grid")) == null ? void 0 : _a.remove();
        injectDropdown(currentPromptDiv, currentColDiv);
      }
    }
    function renderSuggestions() {
      const wrap = modal.querySelector("#gpt-settings-suggestions");
      wrap.innerHTML = '<h3 class="mb-1">Prompt Suggestions</h3>';
      const ul = document.createElement("ul");
      suggestions.forEach((s, i) => {
        const li = document.createElement("li");
        const span = document.createElement("span");
        span.textContent = s;
        li.appendChild(span);
        const edit = document.createElement("button");
        edit.textContent = "Edit";
        const del = document.createElement("button");
        del.textContent = "Remove";
        edit.addEventListener("click", () => {
          const inp = window.prompt("Edit suggestion:", s);
          if (inp !== null) {
            suggestions[i] = inp.trim();
            saveSuggestions(suggestions);
            renderSuggestions();
            refreshDropdown();
          }
        });
        del.addEventListener("click", () => {
          suggestions.splice(i, 1);
          saveSuggestions(suggestions);
          renderSuggestions();
          refreshDropdown();
        });
        const btnWrap = document.createElement("span");
        btnWrap.appendChild(edit);
        btnWrap.appendChild(del);
        li.appendChild(btnWrap);
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
      const addBtn = document.createElement("button");
      addBtn.textContent = "Add";
      addBtn.addEventListener("click", () => {
        const inp = window.prompt("New suggestion:");
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
      const themeSelect = modal.querySelector("#gpt-setting-theme");
      const prefersDark = typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const systemTheme = prefersDark ? "dark" : "light";
      themeSelect.value = options.theme || systemTheme;
      modal.querySelector("#gpt-setting-header").checked = options.hideHeader;
      modal.querySelector("#gpt-setting-docs").checked = options.hideDocs;
      modal.querySelector("#gpt-setting-logo-text").checked = options.hideLogoText;
      modal.querySelector("#gpt-setting-logo-image").checked = options.hideLogoImage;
      modal.querySelector("#gpt-setting-profile").checked = options.hideProfile;
      modal.querySelector("#gpt-setting-environments").checked = options.hideEnvironments;
      modal.querySelector("#gpt-setting-auto-updates").checked = options.autoCheckUpdates;
      modal.classList.add("show");
    }
    function renderHistory() {
      const wrap = historyModal.querySelector("#gpt-history-list");
      wrap.innerHTML = "";
      const ul = document.createElement("ul");
      history.forEach((h, i) => {
        const li = document.createElement("li");
        const span = document.createElement("span");
        span.textContent = h;
        li.appendChild(span);
        const useBtn = document.createElement("button");
        useBtn.textContent = "Use";
        useBtn.addEventListener("click", () => {
          setPromptText(currentPromptDiv || findPromptInput(), h);
          historyModal.classList.remove("show");
        });
        li.appendChild(useBtn);
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
    }
    function openHistory() {
      renderHistory();
      historyModal.classList.add("show");
    }
    gear.addEventListener("click", openSettings);
    modal.querySelector("#gpt-settings-close").addEventListener("click", () => modal.classList.remove("show"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("show");
    });
    historyModal.querySelector("#gpt-history-close").addEventListener("click", () => historyModal.classList.remove("show"));
    historyModal.addEventListener("click", (e) => {
      if (e.target === historyModal) historyModal.classList.remove("show");
    });
    historyModal.querySelector("#gpt-history-clear").addEventListener("click", () => {
      history = [];
      saveHistory(history);
      renderHistory();
    });
    modal.querySelector("#gpt-setting-theme").addEventListener("change", (e) => {
      options.theme = e.target.value;
      saveOptions(options);
      applyOptions();
    });
    modal.querySelector("#gpt-setting-header").addEventListener("change", (e) => {
      options.hideHeader = e.target.checked;
      saveOptions(options);
      applyOptions();
    });
    modal.querySelector("#gpt-setting-docs").addEventListener("change", (e) => {
      options.hideDocs = e.target.checked;
      saveOptions(options);
      applyOptions();
    });
    modal.querySelector("#gpt-setting-logo-text").addEventListener("change", (e) => {
      options.hideLogoText = e.target.checked;
      saveOptions(options);
      applyOptions();
    });
    modal.querySelector("#gpt-setting-logo-image").addEventListener("change", (e) => {
      options.hideLogoImage = e.target.checked;
      saveOptions(options);
      applyOptions();
    });
    modal.querySelector("#gpt-setting-profile").addEventListener("change", (e) => {
      options.hideProfile = e.target.checked;
      saveOptions(options);
      applyOptions();
    });
    modal.querySelector("#gpt-setting-environments").addEventListener("change", (e) => {
      options.hideEnvironments = e.target.checked;
      saveOptions(options);
      applyOptions();
    });
    modal.querySelector("#gpt-setting-auto-updates").addEventListener("change", (e) => {
      options.autoCheckUpdates = e.target.checked;
      saveOptions(options);
    });
    modal.querySelector("#gpt-update-check").addEventListener("click", () => checkForUpdates());
    const pageObserver = new MutationObserver(() => {
      toggleHeader(options.hideHeader);
      toggleDocs(options.hideDocs);
      toggleLogoText(options.hideLogoText);
      toggleLogoImage(options.hideLogoImage);
      toggleProfile(options.hideProfile);
      toggleEnvironments(options.hideEnvironments);
    });
    observers.push(pageObserver);
    pageObserver.observe(document.body, { childList: true, subtree: true });
    applyOptions();
    if (options.autoCheckUpdates) {
      checkForUpdates();
    }
    function findArchiveButton() {
      return document.querySelector('[data-testid="archive-task"]') || Array.from(document.querySelectorAll("button")).find((b) => /archive/i.test(b.textContent));
    }
    function findSendButton() {
      return document.querySelector('[data-testid*="send" i]') || Array.from(document.querySelectorAll("button")).find((b) => {
        var _a;
        return /send/i.test(b.getAttribute("aria-label") || ((_a = b.dataset) == null ? void 0 : _a.testid) || b.textContent);
      });
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
      const el = document.querySelector('[data-testid="task-status"]') || document.querySelector(".task-status");
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
    function findPromptInput() {
      return document.querySelector("#prompt-textarea") || document.querySelector('[data-testid="prompt-textarea"]') || document.querySelector(".ProseMirror#prompt-textarea") || document.querySelector('.ProseMirror[data-testid="prompt-textarea"]') || document.querySelector(".ProseMirror");
    }
    function setPromptText(el, value) {
      if (!el) return;
      value = value || "";
      el.focus();
      if (el instanceof HTMLTextAreaElement) {
        el.value = value;
        el.setSelectionRange(value.length, value.length);
      } else {
        el.textContent = "";
        el.textContent = value;
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    function injectDropdown(promptDiv, colDiv) {
      if (document.getElementById("gpt-prompt-suggest-dropdown")) return;
      const dropdown = document.createElement("select");
      dropdown.id = "gpt-prompt-suggest-dropdown";
      dropdown.className = "flex h-8 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
      const defaultOpt = document.createElement("option");
      defaultOpt.value = "";
      defaultOpt.innerText = "\u{1F4A1} Insert a prompt suggestion...";
      dropdown.appendChild(defaultOpt);
      for (let s of suggestions) {
        const opt = document.createElement("option");
        opt.value = s;
        opt.innerText = s.length > 100 ? s.slice(0, 100) + "..." : s;
        dropdown.appendChild(opt);
      }
      const wrapper = document.createElement("div");
      wrapper.className = "grid w-full gap-1.5";
      const container = document.createElement("div");
      container.className = "flex w-full gap-2";
      container.appendChild(dropdown);
      const configBtn = document.createElement("button");
      configBtn.type = "button";
      configBtn.textContent = "\u2699\uFE0F";
      configBtn.title = "Settings";
      configBtn.className = "text-sm";
      container.appendChild(configBtn);
      const historyBtn = document.createElement("button");
      historyBtn.type = "button";
      historyBtn.textContent = "\u{1F558}";
      historyBtn.title = "History";
      historyBtn.className = "text-sm";
      container.appendChild(historyBtn);
      wrapper.appendChild(container);
      colDiv.insertBefore(wrapper, colDiv.firstChild);
      configBtn.addEventListener("click", () => openSettings());
      historyBtn.addEventListener("click", () => openHistory());
      dropdown.addEventListener("change", () => {
        const value = dropdown.value;
        if (!value) return;
        setPromptText(promptDiv, value);
        dropdown.selectedIndex = 0;
      });
    }
    function waitForPromptInput(callback) {
      if (promptInputObserver) {
        promptInputObserver.disconnect();
        const idx = observers.indexOf(promptInputObserver);
        if (idx !== -1) observers.splice(idx, 1);
      }
      const observer = new MutationObserver(() => {
        const promptDiv2 = findPromptInput();
        const colDiv2 = (promptDiv2 == null ? void 0 : promptDiv2.closest(".flex-col.items-center")) || (promptDiv2 == null ? void 0 : promptDiv2.parentElement);
        if (promptDiv2 && colDiv2) {
          observer.disconnect();
          const i = observers.indexOf(observer);
          if (i !== -1) observers.splice(i, 1);
          promptInputObserver = null;
          callback(promptDiv2, colDiv2);
        }
      });
      promptInputObserver = observer;
      observers.push(observer);
      observer.observe(document.body, { childList: true, subtree: true });
      const promptDiv = findPromptInput();
      const colDiv = (promptDiv == null ? void 0 : promptDiv.closest(".flex-col.items-center")) || (promptDiv == null ? void 0 : promptDiv.parentElement);
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
      promptDiv.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
          const text = promptDiv instanceof HTMLTextAreaElement ? promptDiv.value : promptDiv.textContent;
          history = addToHistory(history, text);
        }
      });
      const sendBtn = findSendButton();
      if (sendBtn) {
        sendBtn.addEventListener("click", () => {
          const text = promptDiv instanceof HTMLTextAreaElement ? promptDiv.value : promptDiv.textContent;
          history = addToHistory(history, text);
        });
      }
      const observer = new MutationObserver(() => {
        const pd = findPromptInput();
        const cd = (pd == null ? void 0 : pd.closest(".flex-col.items-center")) || (pd == null ? void 0 : pd.parentElement);
        if (pd && cd && !document.getElementById("gpt-prompt-suggest-dropdown")) {
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
})();
