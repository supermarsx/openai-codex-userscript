import { loadJSON, saveJSON } from "../lib/storage";
import { loadOptions } from "./options";

const STORAGE_KEY = "gpt-prompt-history";

export async function loadHistory(): Promise<string[]> {
  return await loadJSON<string[]>(STORAGE_KEY, []);
}

export async function saveHistory(list: string[]): Promise<void> {
  await saveJSON(STORAGE_KEY, list);
}

export async function addToHistory(
  list: string[],
  text: string,
): Promise<string[]> {
  const opts = await loadOptions();
  if (opts.disableHistory) return list;
  const limit = opts.historyLimit || 50;
  text = text.trim();
  if (!text) return list;
  list.unshift(text);
  if (list.length > limit) list.length = limit;
  await saveHistory(list);
  return list;
}
