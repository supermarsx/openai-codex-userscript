import { loadJSON, saveJSON } from '../lib/storage';

const STORAGE_KEY = 'gpt-prompt-history';
const MAX_HISTORY = 50;

export function loadHistory(): string[] {
  return loadJSON<string[]>(STORAGE_KEY, []);
}

export function saveHistory(list: string[]): void {
  saveJSON(STORAGE_KEY, list);
}

export function addToHistory(list: string[], text: string): string[] {
  text = text.trim();
  if (!text) return list;
  list.unshift(text);
  if (list.length > MAX_HISTORY) list.length = MAX_HISTORY;
  saveHistory(list);
  return list;
}
