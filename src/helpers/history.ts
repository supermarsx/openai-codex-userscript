import { loadJSON, saveJSON } from '../lib/storage';
import { loadOptions } from './options';

const STORAGE_KEY = 'gpt-prompt-history';

export function loadHistory(): string[] {
  return loadJSON<string[]>(STORAGE_KEY, []);
}

export function saveHistory(list: string[]): void {
  saveJSON(STORAGE_KEY, list);
}

export function addToHistory(list: string[], text: string): string[] {
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
