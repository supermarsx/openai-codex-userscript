(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
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
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/lib/storage.ts
  function getItem(key) {
    var _a;
    if (hasLocalStorage) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.error("localStorage unavailable, using in-memory storage", e);
        hasLocalStorage = false;
      }
    }
    return (_a = memoryStorage.get(key)) != null ? _a : null;
  }
  function setItem(key, value) {
    if (hasLocalStorage) {
      try {
        localStorage.setItem(key, value);
        return;
      } catch (e) {
        console.error("localStorage unavailable, using in-memory storage", e);
        hasLocalStorage = false;
      }
    }
    memoryStorage.set(key, value);
  }
  function loadJSON(key, fallback) {
    try {
      const raw = getItem(key);
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
      setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save ${key}`, e);
    }
  }
  var memoryStorage, hasLocalStorage;
  var init_storage = __esm({
    "src/lib/storage.ts"() {
      memoryStorage = /* @__PURE__ */ new Map();
      hasLocalStorage = true;
    }
  });

  // src/helpers/options.ts
  function sanitizeOptions(raw) {
    const result = {};
    for (const key in OPTION_VALIDATORS) {
      const value = raw[key];
      if (OPTION_VALIDATORS[key](value)) {
        result[key] = value;
      }
    }
    return result;
  }
  function loadOptions() {
    const raw = loadJSON(STORAGE_KEY, {});
    if ("dark" in raw && !("theme" in raw)) {
      raw.theme = raw.dark ? "dark" : "light";
    }
    const opts = sanitizeOptions(raw);
    return __spreadValues(__spreadValues({}, DEFAULT_OPTIONS), opts);
  }
  function saveOptions(opts) {
    saveJSON(STORAGE_KEY, opts);
  }
  var DEFAULT_OPTIONS, STORAGE_KEY, OPTION_VALIDATORS;
  var init_options = __esm({
    "src/helpers/options.ts"() {
      init_storage();
      DEFAULT_OPTIONS = {
        theme: null,
        font: "sans-serif",
        customFont: "",
        hideHeader: false,
        hideDocs: false,
        hideLogoText: false,
        hideLogoImage: false,
        hideProfile: false,
        hideEnvironments: false,
        threeColumnMode: false,
        autoCheckUpdates: false,
        showRepoSidebar: true,
        showVersionSidebar: true,
        clearClosedBranches: false,
        clearMergedBranches: false,
        clearOpenBranches: false,
        autoArchiveMerged: false,
        autoArchiveClosed: false,
        historyLimit: 50,
        disableHistory: false,
        repoSidebarX: null,
        repoSidebarY: null,
        repoSidebarWidth: null,
        repoSidebarHeight: null,
        versionSidebarX: null,
        versionSidebarY: null,
        versionSidebarWidth: null,
        versionSidebarHeight: null
      };
      STORAGE_KEY = "gpt-script-options";
      OPTION_VALIDATORS = {
        theme: (v) => v === null || typeof v === "string",
        font: (v) => v === "serif" || v === "sans-serif" || v === "monospace" || v === "custom",
        customFont: (v) => typeof v === "string",
        hideHeader: (v) => typeof v === "boolean",
        hideDocs: (v) => typeof v === "boolean",
        hideLogoText: (v) => typeof v === "boolean",
        hideLogoImage: (v) => typeof v === "boolean",
        hideProfile: (v) => typeof v === "boolean",
        hideEnvironments: (v) => typeof v === "boolean",
        threeColumnMode: (v) => typeof v === "boolean",
        autoCheckUpdates: (v) => typeof v === "boolean",
        showRepoSidebar: (v) => typeof v === "boolean",
        showVersionSidebar: (v) => typeof v === "boolean",
        clearClosedBranches: (v) => typeof v === "boolean",
        clearMergedBranches: (v) => typeof v === "boolean",
        clearOpenBranches: (v) => typeof v === "boolean",
        autoArchiveMerged: (v) => typeof v === "boolean",
        autoArchiveClosed: (v) => typeof v === "boolean",
        historyLimit: (v) => typeof v === "number" && Number.isFinite(v),
        disableHistory: (v) => typeof v === "boolean",
        repoSidebarX: (v) => typeof v === "number" && Number.isFinite(v) || v === null,
        repoSidebarY: (v) => typeof v === "number" && Number.isFinite(v) || v === null,
        repoSidebarWidth: (v) => typeof v === "number" && Number.isFinite(v) || v === null,
        repoSidebarHeight: (v) => typeof v === "number" && Number.isFinite(v) || v === null,
        versionSidebarX: (v) => typeof v === "number" && Number.isFinite(v) || v === null,
        versionSidebarY: (v) => typeof v === "number" && Number.isFinite(v) || v === null,
        versionSidebarWidth: (v) => typeof v === "number" && Number.isFinite(v) || v === null,
        versionSidebarHeight: (v) => typeof v === "number" && Number.isFinite(v) || v === null
      };
    }
  });

  // src/helpers/suggestions.ts
  function loadSuggestions() {
    return loadJSON(STORAGE_KEY2, DEFAULT_SUGGESTIONS.slice());
  }
  function saveSuggestions(list) {
    saveJSON(STORAGE_KEY2, list);
  }
  var DEFAULT_SUGGESTIONS, STORAGE_KEY2;
  var init_suggestions = __esm({
    "src/helpers/suggestions.ts"() {
      init_storage();
      DEFAULT_SUGGESTIONS = [
        "Suggest code improvements and bugfixes.",
        "Suggest test coverage improvement tasks.",
        "Update documentation according to the current features and functionality.",
        "Suggest code refactor tasks.",
        "Refactor this function to use async/await."
      ];
      STORAGE_KEY2 = "gpt-prompt-suggestions";
    }
  });

  // src/helpers/history.ts
  function loadHistory() {
    return loadJSON(STORAGE_KEY3, []);
  }
  function saveHistory(list) {
    saveJSON(STORAGE_KEY3, list);
  }
  function addToHistory(list, text) {
    const opts = loadOptions();
    if (opts.disableHistory) return list;
    const limit = opts.historyLimit || 50;
    text = text.trim();
    if (!text) return list;
    list.unshift(text);
    if (list.length > limit) list.length = limit;
    saveHistory(list);
    return list;
  }
  var STORAGE_KEY3;
  var init_history = __esm({
    "src/helpers/history.ts"() {
      init_storage();
      init_options();
      STORAGE_KEY3 = "gpt-prompt-history";
    }
  });

  // src/helpers/repos.ts
  function parseRepoNames(list) {
    const set = /* @__PURE__ */ new Set();
    if (Array.isArray(list)) {
      list.forEach((name) => {
        name = name.trim();
        if (name) set.add(name);
      });
    } else if (typeof list === "string") {
      list.split(/[\,\n]+/).forEach((name) => {
        name = name.trim();
        if (name) set.add(name);
      });
    }
    const env = document.querySelector(
      '[data-testid="environment-select"], [data-testid="environment-dropdown"], select[id*=environment], select[name*=environment]'
    );
    if (env) {
      env.querySelectorAll("option").forEach((opt) => {
        var _a;
        const t = (_a = opt.textContent) == null ? void 0 : _a.trim();
        if (t) set.add(t);
      });
    }
    const sidebar = document.querySelector(
      '[data-testid="repository-list"], [data-testid="repo-sidebar"], nav[aria-label*="Repos" i]'
    );
    if (sidebar) {
      sidebar.querySelectorAll("a, li").forEach((el) => {
        var _a;
        const t = (_a = el.textContent) == null ? void 0 : _a.trim();
        if (t) set.add(t);
      });
    }
    if (set.size === 0) {
      const text = document.body.textContent || "";
      const regex = /[\w.-]+\/[\w.-]+/g;
      let m;
      while (m = regex.exec(text)) set.add(m[0]);
    }
    return Array.from(set);
  }
  var init_repos = __esm({
    "src/helpers/repos.ts"() {
    }
  });

  // src/version.ts
  var VERSION;
  var init_version = __esm({
    "src/version.ts"() {
      VERSION = "1.0.39";
    }
  });

  // src/index.ts
  var require_index = __commonJS({
    "src/index.ts"() {
      init_options();
      init_suggestions();
      init_history();
      init_repos();
      init_version();
      (function() {
        "use strict";
        const SCRIPT_VERSION = VERSION;
        const observers = [];
        let promptInputObserver = null;
        let dropdownObserver = null;
        let currentPromptDiv = null;
        let currentColDiv = null;
        const THEME_TOKENS = {
          light: {
            "--brand-purple": "#824dff"
          },
          dark: {
            "--brand-purple": "#b78af2"
          },
          oled: {
            "--brand-purple": "#b78af2"
          }
        };
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
        const settingsStyle = document.createElement("style");
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
        const columnStyle = document.createElement("style");
        columnStyle.id = "gpt-three-column-style";
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
        let historyQuery = "";
        function findByText(text) {
          const elements = Array.from(document.querySelectorAll("body *"));
          return elements.find((el) => el.textContent && el.textContent.includes(text)) || null;
        }
        function toggleHeader(hide) {
          const targetTexts = ["What are we coding next?", "What should we code next?"];
          let node = document.querySelector("h1.mb-4.pt-4.text-2xl");
          if (!node || !targetTexts.some((t) => {
            var _a;
            return (_a = node.textContent) == null ? void 0 : _a.includes(t);
          })) {
            node = findByText("What should we code next?");
          }
          if (node && targetTexts.some((t) => {
            var _a;
            return (_a = node.textContent) == null ? void 0 : _a.includes(t);
          })) {
            node.style.display = hide ? "none" : "";
          }
        }
        function toggleDocs(hide) {
          const links = Array.from(document.querySelectorAll("a")).filter((a) => a.textContent && a.textContent.includes("Docs"));
          for (const link of links) {
            link.style.display = hide ? "none" : "";
          }
        }
        function toggleLogoText(hide) {
          const link = document.querySelector('a[href="/codex"]');
          const textSvg = link == null ? void 0 : link.querySelector("svg + svg");
          if (textSvg) textSvg.style.display = hide ? "none" : "";
        }
        function toggleLogoImage(hide) {
          const link = document.querySelector('a[href="/codex"]');
          const img = link == null ? void 0 : link.querySelector("svg");
          if (img) img.style.display = hide ? "none" : "";
        }
        function toggleProfile(hide) {
          const node = document.querySelector('[aria-label*="Profile" i], [data-testid*="profile" i], [class*="profile" i], [class*="avatar" i]');
          if (node) node.style.display = hide ? "none" : "";
        }
        function toggleEnvironments(hide) {
          const link = document.querySelector('a[href="/codex/settings/environments"]');
          if (link) link.style.display = hide ? "none" : "";
        }
        function makeSidebarInteractive(el, prefix) {
          const header = el.querySelector("div");
          let dragging = false;
          let startX = 0, startY = 0, startLeft = 0, startTop = 0;
          function savePos() {
            const rect = el.getBoundingClientRect();
            options[prefix + "X"] = rect.left;
            options[prefix + "Y"] = rect.top;
            options[prefix + "Width"] = rect.width;
            options[prefix + "Height"] = rect.height;
            saveOptions(options);
          }
          if (header) {
            header.addEventListener("mousedown", (e) => {
              dragging = true;
              startX = e.clientX;
              startY = e.clientY;
              const rect = el.getBoundingClientRect();
              startLeft = rect.left;
              startTop = rect.top;
              document.addEventListener("mousemove", onDrag);
              document.addEventListener("mouseup", stopDrag);
              e.preventDefault();
            });
          }
          function onDrag(e) {
            if (!dragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            el.style.left = startLeft + dx + "px";
            el.style.top = startTop + dy + "px";
          }
          function stopDrag() {
            if (!dragging) return;
            dragging = false;
            document.removeEventListener("mousemove", onDrag);
            document.removeEventListener("mouseup", stopDrag);
            savePos();
          }
          el.addEventListener("mouseup", () => savePos());
          if (typeof ResizeObserver === "function") {
            const ro = new ResizeObserver(() => {
              function onResizeEnd() {
                savePos();
                el.removeEventListener("mouseup", onResizeEnd);
                el.removeEventListener("mouseleave", onResizeEnd);
              }
              el.addEventListener("mouseup", onResizeEnd);
              el.addEventListener("mouseleave", onResizeEnd);
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
          if (left < margin) {
            left = margin;
            changed = true;
          }
          if (left > maxX) {
            left = maxX;
            changed = true;
          }
          if (top < margin) {
            top = margin;
            changed = true;
          }
          if (top > maxY) {
            top = maxY;
            changed = true;
          }
          if (changed) {
            el.style.left = left + "px";
            el.style.top = top + "px";
            options[prefix + "X"] = left;
            options[prefix + "Y"] = top;
            saveOptions(options);
          }
        }
        function toggleRepoSidebar(show) {
          const el = document.getElementById("gpt-repo-sidebar");
          if (el) {
            el.classList.toggle("hidden", !show);
            if (show) ensureSidebarInBounds(el, "repoSidebar");
          }
        }
        function toggleVersionSidebar(show) {
          const el = document.getElementById("gpt-version-sidebar");
          if (el) {
            el.classList.toggle("hidden", !show);
            if (show) ensureSidebarInBounds(el, "versionSidebar");
          }
        }
        function applyOptions() {
          const root = document.documentElement;
          root.classList.remove("userscript-force-light", "userscript-force-dark", "userscript-force-oled", "light", "dark");
          const prefersDark = typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches;
          const theme = options.theme || (prefersDark ? "dark" : "light");
          root.classList.add(`userscript-force-${theme}`);
          root.classList.add(theme);
          root.dataset.theme = theme;
          root.style.colorScheme = theme;
          const tokens = THEME_TOKENS[theme];
          if (tokens) {
            Object.entries(tokens).forEach(([k, v]) => root.style.setProperty(k, v));
          }
          switch (options.font) {
            case "serif":
              root.style.fontFamily = "serif";
              break;
            case "monospace":
              root.style.fontFamily = "monospace";
              break;
            case "custom":
              root.style.fontFamily = options.customFont || "inherit";
              break;
            default:
              root.style.fontFamily = "sans-serif";
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
          const repoEl = document.getElementById("gpt-repo-sidebar");
          if (repoEl) {
            if (options.repoSidebarX !== null) repoEl.style.left = options.repoSidebarX + "px";
            if (options.repoSidebarY !== null) repoEl.style.top = options.repoSidebarY + "px";
            if (options.repoSidebarWidth !== null) repoEl.style.width = options.repoSidebarWidth + "px";
            if (options.repoSidebarHeight !== null) repoEl.style.height = options.repoSidebarHeight + "px";
            ensureSidebarInBounds(repoEl, "repoSidebar");
          }
          const verEl = document.getElementById("gpt-version-sidebar");
          if (verEl) {
            if (options.versionSidebarX !== null) verEl.style.left = options.versionSidebarX + "px";
            if (options.versionSidebarY !== null) verEl.style.top = options.versionSidebarY + "px";
            if (options.versionSidebarWidth !== null) verEl.style.width = options.versionSidebarWidth + "px";
            if (options.versionSidebarHeight !== null) verEl.style.height = options.versionSidebarHeight + "px";
            ensureSidebarInBounds(verEl, "versionSidebar");
          }
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
        const actionBar = document.createElement("div");
        actionBar.id = "gpt-action-bar";
        document.body.appendChild(actionBar);
        const historyBtn = document.createElement("div");
        historyBtn.id = "gpt-history-btn";
        historyBtn.className = "gpt-action-btn";
        historyBtn.textContent = "\u{1F4DC}";
        historyBtn.setAttribute("data-label", "History");
        actionBar.appendChild(historyBtn);
        const repoBtn = document.createElement("div");
        repoBtn.id = "gpt-repo-btn";
        repoBtn.className = "gpt-action-btn";
        repoBtn.textContent = "\u{1F4C1}";
        repoBtn.setAttribute("data-label", "Repos");
        actionBar.appendChild(repoBtn);
        const versionBtn = document.createElement("div");
        versionBtn.id = "gpt-version-btn";
        versionBtn.className = "gpt-action-btn";
        versionBtn.textContent = "\u{1F516}";
        versionBtn.setAttribute("data-label", "Versions");
        actionBar.appendChild(versionBtn);
        const settingsBtn = document.createElement("div");
        settingsBtn.id = "gpt-settings-btn";
        settingsBtn.className = "gpt-action-btn";
        settingsBtn.textContent = "\u2699\uFE0F";
        settingsBtn.setAttribute("data-label", "Settings");
        actionBar.appendChild(settingsBtn);
        const modal = document.createElement("div");
        modal.id = "gpt-settings-modal";
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
            <label><input type="checkbox" id="gpt-setting-environments"> Hide environments button</label><br>
            <label><input type="checkbox" id="gpt-setting-three-column"> 3 column layout</label>
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
        <button id="gpt-update-check" class="btn btn-primary btn-small">Check for Updates</button>
        <button id="gpt-reset-defaults" class="btn btn-secondary btn-small">Reset Defaults</button>
        <button id="gpt-reset-windows" class="btn btn-secondary btn-small">Reset Windows</button><br>
        <div class="mt-2 text-right"><button id="gpt-settings-close" class="btn btn-secondary btn-small">Close</button></div>
    </div>`;
        document.body.appendChild(modal);
        const historyModal = document.createElement("div");
        historyModal.id = "gpt-history-modal";
        historyModal.innerHTML = `
    <div class="modal-content">
        <h2 class="mb-2 text-lg">Prompt History</h2>
        <input type="text" id="gpt-history-search" class="w-full mb-2" placeholder="Search...">
        <div id="gpt-history-list"></div>
        <div class="mt-2 text-right"><button id="gpt-history-clear" class="btn btn-secondary btn-small">Clear</button> <button id="gpt-history-close" class="btn btn-secondary btn-small">Close</button></div>
    </div>`;
        document.body.appendChild(historyModal);
        const historyPreview = document.createElement("div");
        historyPreview.id = "gpt-history-preview";
        historyPreview.innerHTML = `
    <div class="modal-content">
        <pre id="gpt-preview-text" class="whitespace-pre-wrap"></pre>
        <div class="mt-2 text-right"><button id="gpt-preview-use" class="btn btn-primary btn-small">Use</button> <button id="gpt-preview-cancel" class="btn btn-secondary btn-small">Cancel</button></div>
    </div>`;
        document.body.appendChild(historyPreview);
        const previewTextEl = historyPreview.querySelector("#gpt-preview-text");
        const previewUseBtn = historyPreview.querySelector("#gpt-preview-use");
        const previewCancelBtn = historyPreview.querySelector("#gpt-preview-cancel");
        function openHistoryPreview(text) {
          if (previewTextEl) previewTextEl.textContent = text;
          historyPreview.classList.add("show");
        }
        previewCancelBtn == null ? void 0 : previewCancelBtn.addEventListener("click", () => historyPreview.classList.remove("show"));
        previewUseBtn == null ? void 0 : previewUseBtn.addEventListener("click", () => {
          const text = (previewTextEl == null ? void 0 : previewTextEl.textContent) || "";
          setPromptText2(currentPromptDiv || findPromptInput2(), text);
          historyPreview.classList.remove("show");
        });
        historyPreview.addEventListener("click", (e) => {
          if (e.target === historyPreview) historyPreview.classList.remove("show");
        });
        const repoSidebar = document.createElement("div");
        repoSidebar.id = "gpt-repo-sidebar";
        repoSidebar.innerHTML = '<div class="flex justify-between items-center"><h3 class="m-0">Repositories</h3><button id="gpt-repo-hide" class="btn relative btn-secondary btn-small">\xD7</button></div><ul id="gpt-repo-list"></ul>';
        document.body.appendChild(repoSidebar);
        makeSidebarInteractive(repoSidebar, "repoSidebar");
        repoSidebar.querySelector("#gpt-repo-hide").addEventListener("click", () => {
          toggleRepoSidebar(false);
          options.showRepoSidebar = false;
          saveOptions(options);
        });
        const versionSidebar = document.createElement("div");
        versionSidebar.id = "gpt-version-sidebar";
        versionSidebar.innerHTML = '<div class="flex justify-between items-center"><h3 class="m-0">Versions</h3><button id="gpt-version-hide" class="btn relative btn-secondary btn-small">\xD7</button></div><ul id="gpt-version-list"></ul><div id="gpt-branch-actions"><button class="btn relative btn-secondary btn-small" id="gpt-clear-open">Clear Open</button> <button class="btn relative btn-secondary btn-small" id="gpt-clear-merged">Clear Merged</button> <button class="btn relative btn-secondary btn-small" id="gpt-clear-closed">Clear Closed</button> <button class="btn relative btn-secondary btn-small" id="gpt-clear-all">Clear All</button></div>';
        document.body.appendChild(versionSidebar);
        makeSidebarInteractive(versionSidebar, "versionSidebar");
        versionSidebar.querySelector("#gpt-version-hide").addEventListener("click", () => {
          toggleVersionSidebar(false);
          options.showVersionSidebar = false;
          saveOptions(options);
        });
        let repos = [];
        function renderRepos(source) {
          const list = repoSidebar.querySelector("#gpt-repo-list");
          if (!list) return;
          repos = parseRepoNames(source);
          list.innerHTML = "";
          repos.forEach((name) => {
            const li = document.createElement("li");
            li.textContent = name + " ";
            [5, 10, 20].forEach((n) => {
              const btn = document.createElement("button");
              btn.className = "btn relative btn-secondary btn-small";
              btn.textContent = String(n);
              btn.addEventListener("click", () => renderVersions(name, n));
              li.appendChild(btn);
            });
            list.appendChild(li);
          });
        }
        function renderVersions(repo, count) {
          const list = versionSidebar.querySelector("#gpt-version-list");
          if (!list) return;
          list.innerHTML = "";
          for (let i = 1; i <= count; i++) {
            const li = document.createElement("li");
            li.textContent = repo + " v" + i;
            li.dataset.status = ["Open", "Closed", "Merged"][i % 3];
            list.appendChild(li);
          }
          if (options.clearClosedBranches) clearBranches("Closed");
          if (options.clearMergedBranches) clearBranches("Merged");
          if (options.clearOpenBranches) clearBranches("Open");
        }
        function clearBranches(status) {
          const items = Array.from(versionSidebar.querySelectorAll("#gpt-version-list li"));
          items.forEach((it) => {
            if (status === "All" || it.dataset.status === status) it.remove();
          });
        }
        function bulkArchive(status) {
          const buttons = Array.from(document.querySelectorAll('button,[role="button"]')).filter((btn) => {
            var _a;
            const label = (btn.textContent || "") + " " + (btn.getAttribute("aria-label") || "");
            if (!/archive/i.test(label)) return false;
            const span = btn.querySelector("[data-state]");
            let s = ((_a = span == null ? void 0 : span.dataset.state) == null ? void 0 : _a.toLowerCase()) || "";
            if (!s) {
              if (/merged/i.test(label)) s = "merged";
              else if (/closed/i.test(label)) s = "closed";
              else if (/open/i.test(label)) s = "open";
            }
            return status === "All" || s === status.toLowerCase();
          });
          if (buttons.length === 0) return;
          const overlay = document.createElement("div");
          overlay.id = "gpt-archive-progress";
          overlay.style.position = "fixed";
          overlay.style.inset = "0";
          overlay.style.zIndex = "1000";
          overlay.style.background = "rgba(0,0,0,0.5)";
          overlay.style.display = "flex";
          overlay.style.alignItems = "center";
          overlay.style.justifyContent = "center";
          overlay.innerHTML = `<div style="background: var(--background); color: var(--foreground); padding: 1rem; border-radius: 0.5rem; width: 200px;">
            <div style="height:6px;background:var(--ring);border-radius:3px;overflow:hidden;">
                <div id="gpt-progress-bar" style="width:0;height:100%;background:var(--brand-purple);transition:width 0.2s;"></div>
            </div>
            <div id="gpt-progress-text" style="margin-top:4px;font-size:12px;text-align:center;">0/${buttons.length}</div>
        </div>`;
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
            overlay.querySelector("#gpt-progress-bar").style.width = pct + "%";
            overlay.querySelector("#gpt-progress-text").textContent = `${i}/${buttons.length}`;
            setTimeout(next, 750);
          }
          next();
        }
        renderRepos();
        versionSidebar.querySelector("#gpt-clear-open").addEventListener("click", () => {
          bulkArchive("open");
          clearBranches("Open");
        });
        versionSidebar.querySelector("#gpt-clear-merged").addEventListener("click", () => {
          bulkArchive("merged");
          clearBranches("Merged");
        });
        versionSidebar.querySelector("#gpt-clear-closed").addEventListener("click", () => {
          bulkArchive("closed");
          clearBranches("Closed");
        });
        versionSidebar.querySelector("#gpt-clear-all").addEventListener("click", () => {
          if (window.confirm("Clear all branches?")) {
            bulkArchive("All");
            clearBranches("All");
          }
        });
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
          const table = document.createElement("table");
          table.className = "w-full text-sm";
          const thead = document.createElement("thead");
          const headerRow = document.createElement("tr");
          const textHead = document.createElement("th");
          textHead.textContent = "Suggestion";
          textHead.className = "text-left";
          const actionsHead = document.createElement("th");
          actionsHead.textContent = "Actions";
          headerRow.appendChild(textHead);
          headerRow.appendChild(actionsHead);
          thead.appendChild(headerRow);
          table.appendChild(thead);
          const tbody = document.createElement("tbody");
          suggestions.forEach((s, i) => {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.textContent = s;
            const actions = document.createElement("td");
            const edit = document.createElement("button");
            edit.className = "btn relative btn-secondary btn-small";
            edit.textContent = "Edit";
            const del = document.createElement("button");
            del.className = "btn relative btn-secondary btn-small";
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
            actions.appendChild(edit);
            actions.appendChild(del);
            row.appendChild(cell);
            row.appendChild(actions);
            tbody.appendChild(row);
          });
          table.appendChild(tbody);
          wrap.appendChild(table);
          const addBtn = document.createElement("button");
          addBtn.className = "btn relative btn-secondary btn-small";
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
          const exportBtn = document.createElement("button");
          exportBtn.className = "btn relative btn-secondary btn-small";
          exportBtn.textContent = "Export";
          exportBtn.addEventListener("click", () => {
            try {
              const blob = new Blob([JSON.stringify(suggestions, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "suggestions.json";
              document.body.appendChild(a);
              a.click();
              URL.revokeObjectURL(url);
              a.remove();
            } catch (e) {
              console.error("Failed to export suggestions", e);
              window.alert("Failed to export suggestions");
            }
          });
          wrap.appendChild(exportBtn);
          const importBtn = document.createElement("button");
          importBtn.className = "btn relative btn-secondary btn-small";
          importBtn.textContent = "Import";
          importBtn.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "application/json";
            input.addEventListener("change", () => {
              var _a;
              const file = (_a = input.files) == null ? void 0 : _a[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const data = JSON.parse(String(reader.result));
                  if (Array.isArray(data)) {
                    const list = Array.from(
                      new Set(
                        data.map((d) => String(d).trim()).filter((s) => s.length > 0)
                      )
                    );
                    if (list.length > 0) {
                      suggestions = list;
                      saveSuggestions(suggestions);
                      renderSuggestions();
                      refreshDropdown();
                    } else {
                      window.alert("Invalid suggestions file");
                    }
                  } else {
                    window.alert("Invalid suggestions file");
                  }
                } catch (err) {
                  console.error("Failed to import suggestions", err);
                  window.alert("Failed to import suggestions");
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
          const versionEl = modal.querySelector("#gpt-settings-version");
          if (versionEl) versionEl.textContent = `Version ${SCRIPT_VERSION}`;
          const themeSelect = modal.querySelector("#gpt-setting-theme");
          const prefersDark = typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches;
          const systemTheme = prefersDark ? "dark" : "light";
          themeSelect.value = options.theme || systemTheme;
          const fontSelect = modal.querySelector("#gpt-setting-font");
          const customFontInput = modal.querySelector("#gpt-setting-custom-font");
          fontSelect.value = options.font;
          if (customFontInput) customFontInput.value = options.customFont;
          modal.querySelector("#gpt-setting-header").checked = options.hideHeader;
          modal.querySelector("#gpt-setting-docs").checked = options.hideDocs;
          modal.querySelector("#gpt-setting-logo-text").checked = options.hideLogoText;
          modal.querySelector("#gpt-setting-logo-image").checked = options.hideLogoImage;
          modal.querySelector("#gpt-setting-profile").checked = options.hideProfile;
          modal.querySelector("#gpt-setting-environments").checked = options.hideEnvironments;
          modal.querySelector("#gpt-setting-three-column").checked = options.threeColumnMode;
          modal.querySelector("#gpt-setting-auto-updates").checked = options.autoCheckUpdates;
          modal.querySelector("#gpt-setting-disable-history").checked = options.disableHistory;
          modal.querySelector("#gpt-setting-history-limit").value = String(options.historyLimit);
          modal.querySelector("#gpt-setting-show-repos").checked = options.showRepoSidebar;
          modal.querySelector("#gpt-setting-show-versions").checked = options.showVersionSidebar;
          modal.querySelector("#gpt-setting-clear-closed").checked = options.clearClosedBranches;
          modal.querySelector("#gpt-setting-clear-merged").checked = options.clearMergedBranches;
          modal.querySelector("#gpt-setting-clear-open").checked = options.clearOpenBranches;
          modal.querySelector("#gpt-setting-auto-archive-merged").checked = options.autoArchiveMerged;
          modal.querySelector("#gpt-setting-auto-archive-closed").checked = options.autoArchiveClosed;
          modal.classList.add("show");
        }
        function filterHistory(list, query) {
          const q = (query || "").toLowerCase();
          return list.reduce((acc, h, i) => {
            if (!q || h.toLowerCase().includes(q)) acc.push([h, i]);
            return acc;
          }, []);
        }
        function renderHistory() {
          const wrap = historyModal.querySelector("#gpt-history-list");
          wrap.innerHTML = "";
          const ul = document.createElement("ul");
          const items = filterHistory(history, historyQuery);
          items.forEach(([h, i]) => {
            const li = document.createElement("li");
            const span = document.createElement("span");
            const first = h.split(/\r?\n/)[0];
            span.textContent = first.length > 30 ? first.slice(0, 30) + "\u2026" : first;
            li.appendChild(span);
            const useBtn = document.createElement("button");
            useBtn.className = "btn relative btn-secondary btn-small";
            useBtn.textContent = "Use";
            useBtn.addEventListener("click", () => {
              openHistoryPreview(h);
            });
            li.appendChild(useBtn);
            const restoreBtn = document.createElement("button");
            restoreBtn.className = "btn relative btn-secondary btn-small";
            restoreBtn.textContent = "Restore";
            restoreBtn.addEventListener("click", () => {
              setPromptText2(currentPromptDiv || findPromptInput2(), h);
            });
            li.appendChild(restoreBtn);
            const delBtn = document.createElement("button");
            delBtn.className = "btn relative btn-secondary btn-small";
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", () => {
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
          const input = historyModal.querySelector("#gpt-history-search");
          if (input) input.value = historyQuery;
          renderHistory();
          historyModal.classList.add("show");
        }
        historyBtn.addEventListener("click", openHistory);
        repoBtn.addEventListener("click", () => {
          const el = document.getElementById("gpt-repo-sidebar");
          const show = !el || el.classList.contains("hidden");
          toggleRepoSidebar(show);
          options.showRepoSidebar = show;
          saveOptions(options);
        });
        versionBtn.addEventListener("click", () => {
          const el = document.getElementById("gpt-version-sidebar");
          const show = !el || el.classList.contains("hidden");
          toggleVersionSidebar(show);
          options.showVersionSidebar = show;
          saveOptions(options);
        });
        settingsBtn.addEventListener("click", openSettings);
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
        const historySearchInput = historyModal.querySelector("#gpt-history-search");
        historySearchInput == null ? void 0 : historySearchInput.addEventListener("input", () => {
          historyQuery = historySearchInput.value;
          renderHistory();
        });
        modal.querySelector("#gpt-setting-theme").addEventListener("change", (e) => {
          options.theme = e.target.value;
          saveOptions(options);
          applyOptions();
        });
        modal.querySelector("#gpt-setting-font").addEventListener("change", (e) => {
          options.font = e.target.value;
          saveOptions(options);
          applyOptions();
        });
        modal.querySelector("#gpt-setting-custom-font").addEventListener("input", (e) => {
          options.customFont = e.target.value;
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
        modal.querySelector("#gpt-setting-three-column").addEventListener("change", (e) => {
          options.threeColumnMode = e.target.checked;
          saveOptions(options);
          applyOptions();
        });
        modal.querySelector("#gpt-setting-auto-updates").addEventListener("change", (e) => {
          options.autoCheckUpdates = e.target.checked;
          saveOptions(options);
        });
        modal.querySelector("#gpt-setting-disable-history").addEventListener("change", (e) => {
          options.disableHistory = e.target.checked;
          saveOptions(options);
        });
        modal.querySelector("#gpt-setting-history-limit").addEventListener("change", (e) => {
          options.historyLimit = parseInt(e.target.value, 10) || 1;
          saveOptions(options);
        });
        modal.querySelector("#gpt-setting-show-repos").addEventListener("change", (e) => {
          options.showRepoSidebar = e.target.checked;
          saveOptions(options);
          applyOptions();
        });
        modal.querySelector("#gpt-setting-show-versions").addEventListener("change", (e) => {
          options.showVersionSidebar = e.target.checked;
          saveOptions(options);
          applyOptions();
        });
        modal.querySelector("#gpt-setting-clear-closed").addEventListener("change", (e) => {
          options.clearClosedBranches = e.target.checked;
          saveOptions(options);
        });
        modal.querySelector("#gpt-setting-clear-merged").addEventListener("change", (e) => {
          options.clearMergedBranches = e.target.checked;
          saveOptions(options);
        });
        modal.querySelector("#gpt-setting-clear-open").addEventListener("change", (e) => {
          options.clearOpenBranches = e.target.checked;
          saveOptions(options);
        });
        modal.querySelector("#gpt-setting-auto-archive-merged").addEventListener("change", (e) => {
          options.autoArchiveMerged = e.target.checked;
          saveOptions(options);
        });
        modal.querySelector("#gpt-setting-auto-archive-closed").addEventListener("change", (e) => {
          options.autoArchiveClosed = e.target.checked;
          saveOptions(options);
        });
        modal.querySelector("#gpt-update-check").addEventListener("click", () => checkForUpdates());
        modal.querySelector("#gpt-reset-defaults").addEventListener("click", () => {
          options = __spreadValues({}, DEFAULT_OPTIONS);
          saveOptions(options);
          applyOptions();
          openSettings();
        });
        modal.querySelector("#gpt-reset-windows").addEventListener("click", () => {
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
        function findArchiveButton() {
          return document.querySelector('[data-testid="archive-task"]') || Array.from(document.querySelectorAll('button,[role="button"]')).find((b) => {
            const label = (b.textContent || "") + " " + (b.getAttribute("aria-label") || "");
            return /archive/i.test(label);
          });
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
        function findPromptInput2() {
          return document.querySelector("#prompt-textarea") || document.querySelector('[data-testid="prompt-textarea"]') || document.querySelector(".ProseMirror#prompt-textarea") || document.querySelector('.ProseMirror[data-testid="prompt-textarea"]') || document.querySelector(".ProseMirror");
        }
        function setPromptText2(el, value) {
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
          wrapper.appendChild(container);
          colDiv.insertBefore(wrapper, colDiv.firstChild);
          dropdown.addEventListener("change", () => {
            const value = dropdown.value;
            if (!value) return;
            setPromptText2(promptDiv, value);
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
            const promptDiv2 = findPromptInput2();
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
          const promptDiv = findPromptInput2();
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
            const pd = findPromptInput2();
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
    }
  });
  require_index();
})();
