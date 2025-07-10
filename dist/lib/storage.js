"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadJSON = loadJSON;
exports.saveJSON = saveJSON;
function loadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            return JSON.parse(raw);
        }
    }
    catch (e) {
        console.error(`Failed to load ${key}`, e);
    }
    return fallback;
}
function saveJSON(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    }
    catch (e) {
        console.error(`Failed to save ${key}`, e);
    }
}
