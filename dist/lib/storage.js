"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadJSON = loadJSON;
exports.saveJSON = saveJSON;
var memoryStorage = new Map();
var hasLocalStorage = true;
function getItem(key) {
    var _a;
    if (hasLocalStorage) {
        try {
            return localStorage.getItem(key);
        }
        catch (e) {
            console.error('localStorage unavailable, using in-memory storage', e);
            hasLocalStorage = false;
        }
    }
    return (_a = memoryStorage.get(key)) !== null && _a !== void 0 ? _a : null;
}
function setItem(key, value) {
    if (hasLocalStorage) {
        try {
            localStorage.setItem(key, value);
            return;
        }
        catch (e) {
            console.error('localStorage unavailable, using in-memory storage', e);
            hasLocalStorage = false;
        }
    }
    memoryStorage.set(key, value);
}
function loadJSON(key, fallback) {
    try {
        var raw = getItem(key);
        if (raw) {
            return JSON.parse(raw);
        }
    }
    catch (e) {
        console.error("Failed to load ".concat(key), e);
    }
    return fallback;
}
function saveJSON(key, data) {
    try {
        setItem(key, JSON.stringify(data));
    }
    catch (e) {
        console.error("Failed to save ".concat(key), e);
    }
}
