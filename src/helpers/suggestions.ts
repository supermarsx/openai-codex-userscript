import { loadJSON, saveJSON } from '../lib/storage';

export const DEFAULT_SUGGESTIONS = [
  'Suggest code improvements and bugfixes.',
  'Suggest test coverage improvement tasks.',
  'Update documentation according to the current features and functionality.',
  'Suggest code refactor tasks.',
  'Refactor this function to use async/await.'
];

const STORAGE_KEY = 'gpt-prompt-suggestions';

export function loadSuggestions(): string[] {
  return loadJSON<string[]>(STORAGE_KEY, DEFAULT_SUGGESTIONS.slice());
}

export function saveSuggestions(list: string[]): void {
  saveJSON(STORAGE_KEY, list);
}
