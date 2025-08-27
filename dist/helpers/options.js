"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_OPTIONS = void 0;
exports.loadOptions = loadOptions;
exports.saveOptions = saveOptions;
const storage_1 = require("../lib/storage");
exports.DEFAULT_OPTIONS = {
    theme: null,
    font: 'sans-serif',
    customFont: '',
    hideHeader: false,
    hideDocs: false,
    hideLogoText: false,
    hideLogoImage: false,
    hideProfile: false,
    hideSettings: false,
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
    versionSidebarHeight: null,
};
const STORAGE_KEY = 'gpt-script-options';
const OPTION_VALIDATORS = {
    theme: (v) => v === null || typeof v === 'string',
    font: (v) => v === 'serif' || v === 'sans-serif' || v === 'monospace' || v === 'custom',
    customFont: (v) => typeof v === 'string',
    hideHeader: (v) => typeof v === 'boolean',
    hideDocs: (v) => typeof v === 'boolean',
    hideLogoText: (v) => typeof v === 'boolean',
    hideLogoImage: (v) => typeof v === 'boolean',
    hideProfile: (v) => typeof v === 'boolean',
    hideSettings: (v) => typeof v === 'boolean',
    threeColumnMode: (v) => typeof v === 'boolean',
    autoCheckUpdates: (v) => typeof v === 'boolean',
    showRepoSidebar: (v) => typeof v === 'boolean',
    showVersionSidebar: (v) => typeof v === 'boolean',
    clearClosedBranches: (v) => typeof v === 'boolean',
    clearMergedBranches: (v) => typeof v === 'boolean',
    clearOpenBranches: (v) => typeof v === 'boolean',
    autoArchiveMerged: (v) => typeof v === 'boolean',
    autoArchiveClosed: (v) => typeof v === 'boolean',
    historyLimit: (v) => typeof v === 'number' && Number.isFinite(v),
    disableHistory: (v) => typeof v === 'boolean',
    repoSidebarX: (v) => (typeof v === 'number' && Number.isFinite(v)) || v === null,
    repoSidebarY: (v) => (typeof v === 'number' && Number.isFinite(v)) || v === null,
    repoSidebarWidth: (v) => (typeof v === 'number' && Number.isFinite(v)) || v === null,
    repoSidebarHeight: (v) => (typeof v === 'number' && Number.isFinite(v)) || v === null,
    versionSidebarX: (v) => (typeof v === 'number' && Number.isFinite(v)) || v === null,
    versionSidebarY: (v) => (typeof v === 'number' && Number.isFinite(v)) || v === null,
    versionSidebarWidth: (v) => (typeof v === 'number' && Number.isFinite(v)) || v === null,
    versionSidebarHeight: (v) => (typeof v === 'number' && Number.isFinite(v)) || v === null,
};
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
    const raw = (0, storage_1.loadJSON)(STORAGE_KEY, {});
    if ('dark' in raw && !('theme' in raw)) {
        raw.theme = raw.dark ? 'dark' : 'light';
    }
    if ('hideEnvironments' in raw && !('hideSettings' in raw)) {
        raw.hideSettings = raw.hideEnvironments;
        delete raw.hideEnvironments;
    }
    const opts = sanitizeOptions(raw);
    return Object.assign(Object.assign({}, exports.DEFAULT_OPTIONS), opts);
}
function saveOptions(opts) {
    (0, storage_1.saveJSON)(STORAGE_KEY, opts);
}
