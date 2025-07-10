"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadHistory = loadHistory;
exports.saveHistory = saveHistory;
exports.addToHistory = addToHistory;
const storage_1 = require("../lib/storage");
const STORAGE_KEY = 'gpt-prompt-history';
const MAX_HISTORY = 50;
function loadHistory() {
    return (0, storage_1.loadJSON)(STORAGE_KEY, []);
}
function saveHistory(list) {
    (0, storage_1.saveJSON)(STORAGE_KEY, list);
}
function addToHistory(list, text) {
    text = text.trim();
    if (!text)
        return list;
    list.unshift(text);
    if (list.length > MAX_HISTORY)
        list.length = MAX_HISTORY;
    saveHistory(list);
    return list;
}
