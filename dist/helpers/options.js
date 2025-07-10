"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_OPTIONS = void 0;
exports.loadOptions = loadOptions;
exports.saveOptions = saveOptions;
const storage_1 = require("../lib/storage");
exports.DEFAULT_OPTIONS = {
    theme: null,
    hideHeader: false,
    hideDocs: false,
    hideLogoText: false,
    hideLogoImage: false,
    hideProfile: false,
    hideEnvironments: false,
    autoCheckUpdates: true,
};
const STORAGE_KEY = 'gpt-script-options';
function loadOptions() {
    const opts = (0, storage_1.loadJSON)(STORAGE_KEY, exports.DEFAULT_OPTIONS);
    const anyOpts = opts;
    if ('dark' in anyOpts && !('theme' in anyOpts)) {
        anyOpts.theme = anyOpts.dark ? 'dark' : 'light';
    }
    return Object.assign(Object.assign({}, exports.DEFAULT_OPTIONS), opts);
}
function saveOptions(opts) {
    (0, storage_1.saveJSON)(STORAGE_KEY, opts);
}
