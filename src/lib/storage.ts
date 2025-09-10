const DB_NAME = "openai-codex-enhancer";
const STORE = "keyval";
let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE);
      };
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });
  }
  return dbPromise;
}

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
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
        const lsValue =
          typeof localStorage !== "undefined"
            ? localStorage.getItem(key)
            : null;
        if (lsValue !== null) {
          try {
            const parsed = JSON.parse(lsValue) as T;
            await saveJSON(key, parsed);
            if (typeof localStorage !== "undefined") {
              localStorage.removeItem(key);
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
    return fallback;
  }
}

export async function saveJSON(key: string, data: any): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const req = store.put(JSON.stringify(data), key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error(`Failed to save ${key}`, e);
  }
}
