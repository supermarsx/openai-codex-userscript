const DB_NAME = "openai-codex-enhancer";
const STORE = "keyval";
let dbPromise: Promise<IDBDatabase> | null = null;
let memoryOnly = false;
const memoryStore = new Map<string, any>();

function getDB(): Promise<IDBDatabase> {
  if (memoryOnly) {
    return Promise.reject(new Error("IndexedDB unavailable"));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
          req.result.createObjectStore(STORE);
        };
        req.onerror = () => {
          memoryOnly = true;
          reject(req.error);
        };
        req.onsuccess = () => resolve(req.result);
      } catch (e) {
        memoryOnly = true;
        reject(e);
      }
    });
  }
  return dbPromise;
}

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  if (!memoryOnly) {
    try {
      const db = await getDB();
      return await new Promise<T>((resolve) => {
        const tx = db.transaction(STORE, "readonly");
        const store = tx.objectStore(STORE);
        const req = store.get(key);
        req.onsuccess = async () => {
          const value = req.result as string | undefined;
          if (value !== undefined) {
            try {
              resolve(JSON.parse(value) as T);
              return;
            } catch {
              // fall through to fallback below
            }
          }
          let lsValue: string | null = null;
          if (typeof localStorage !== "undefined") {
            try {
              lsValue = localStorage.getItem(key);
            } catch {
              lsValue = null;
            }
          }
          if (lsValue !== null) {
            try {
              const parsed = JSON.parse(lsValue) as T;
              await saveJSON(key, parsed);
              if (typeof localStorage !== "undefined") {
                try {
                  localStorage.removeItem(key);
                } catch {}
              }
              resolve(parsed);
            } catch {
              resolve(fallback);
            }
          } else {
            resolve(fallback);
          }
        };
        req.onerror = () => resolve(fallback);
      });
    } catch (e) {
      console.error(`Failed to load ${key}`, e);
      memoryOnly = true;
    }
  }

  if (memoryStore.has(key)) {
    return memoryStore.get(key) as T;
  }

  let lsValue: string | null = null;
  if (typeof localStorage !== "undefined") {
    try {
      lsValue = localStorage.getItem(key);
    } catch {
      lsValue = null;
    }
  }
  if (lsValue !== null) {
    try {
      const parsed = JSON.parse(lsValue) as T;
      memoryStore.set(key, parsed);
      if (typeof localStorage !== "undefined") {
        try {
          localStorage.removeItem(key);
        } catch {}
      }
      return parsed;
    } catch {
      return fallback;
    }
  }

  return fallback;
}

export async function saveJSON(key: string, data: any): Promise<void> {
  if (!memoryOnly) {
    try {
      const db = await getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        const store = tx.objectStore(STORE);
        const req = store.put(JSON.stringify(data), key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      return;
    } catch (e) {
      console.error(`Failed to save ${key}`, e);
      memoryOnly = true;
    }
  }
  memoryStore.set(key, data);
}
