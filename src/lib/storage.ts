const memoryStorage = new Map<string, string>();

function hasLocalStorage(): boolean {
  try {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    // Accessing localStorage may throw in some browsers when disabled
    localStorage.getItem('');
    return true;
  } catch {
    return false;
  }
}

function getItem(key: string): string | null {
  if (hasLocalStorage()) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('localStorage unavailable, using in-memory storage', e);
    }
  }
  return memoryStorage.get(key) ?? null;
}

function setItem(key: string, value: string): void {
  if (hasLocalStorage()) {
    try {
      localStorage.setItem(key, value);
      return;
    } catch (e) {
      console.error('localStorage unavailable, using in-memory storage', e);
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
