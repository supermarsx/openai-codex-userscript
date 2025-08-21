const memoryStorage = new Map<string, string>();

let hasLocalStorage = true;

function getItem(key: string): string | null {
  if (hasLocalStorage) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('localStorage unavailable, using in-memory storage', e);
      hasLocalStorage = false;
    }
  }
  return memoryStorage.get(key) ?? null;
}

function setItem(key: string, value: string): void {
  if (hasLocalStorage) {
    try {
      localStorage.setItem(key, value);
      return;
    } catch (e) {
      console.error('localStorage unavailable, using in-memory storage', e);
      hasLocalStorage = false;
    }
  }
  memoryStorage.set(key, value);
}

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = getItem(key);
    if (raw) {
      return JSON.parse(raw) as T;
    }
  } catch (e) {
    console.error(`Failed to load ${key}`, e);
  }
  return fallback;
}

export function saveJSON(key: string, data: any): void {
  try {
    setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key}`, e);
  }
}
