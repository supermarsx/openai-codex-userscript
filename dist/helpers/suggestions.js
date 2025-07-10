"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SUGGESTIONS = void 0;
exports.loadSuggestions = loadSuggestions;
exports.saveSuggestions = saveSuggestions;
const storage_1 = require("../lib/storage");
exports.DEFAULT_SUGGESTIONS = [
    'Suggest code improvements and bugfixes.',
    'Suggest test coverage improvement tasks.',
    'Update documentation according to the current features and functionality.',
    'Suggest code refactor tasks.',
    'Refactor this function to use async/await.'
];
const STORAGE_KEY = 'gpt-prompt-suggestions';
function loadSuggestions() {
    return (0, storage_1.loadJSON)(STORAGE_KEY, exports.DEFAULT_SUGGESTIONS.slice());
}
function saveSuggestions(list) {
    (0, storage_1.saveJSON)(STORAGE_KEY, list);
}
