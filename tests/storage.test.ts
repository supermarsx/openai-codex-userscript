import test from "node:test";
import assert from "node:assert";
import "fake-indexeddb/auto";

function loadStorage() {
  const path = require.resolve("../src/lib/storage");
  delete require.cache[path];
  return require(path) as typeof import("../src/lib/storage");
}

const localStore: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (k: string) => (k in localStore ? localStore[k] : null),
  setItem: (k: string, v: string) => {
    localStore[k] = String(v);
  },
  removeItem: (k: string) => {
    delete localStore[k];
  },
} as any;

test("saveJSON and loadJSON round-trip", async () => {
  const { loadJSON, saveJSON } = loadStorage();
  await saveJSON("test-key", { a: 1 });
  const result = await loadJSON("test-key", { a: 0 });
  assert.deepStrictEqual(result, { a: 1 });
});

test("loadJSON returns fallback when missing", async () => {
  const { loadJSON } = loadStorage();
  const result = await loadJSON("missing", { b: 2 });
  assert.deepStrictEqual(result, { b: 2 });
});

test("loadJSON migrates from localStorage", async () => {
  const { loadJSON } = loadStorage();
  localStorage.setItem("legacy", JSON.stringify({ c: 3 }));
  const result = await loadJSON("legacy", { c: 0 });
  assert.deepStrictEqual(result, { c: 3 });
  assert.strictEqual(localStorage.getItem("legacy"), null);
  const second = await loadJSON("legacy", { c: 0 });
  assert.deepStrictEqual(second, { c: 3 });
});

test("loadJSON handles localStorage access errors", async () => {
  const { loadJSON } = loadStorage();
  const original = localStorage.getItem;
  localStorage.getItem = () => {
    throw new Error("denied");
  };
  const result = await loadJSON("blocked", { d: 4 });
  assert.deepStrictEqual(result, { d: 4 });
  localStorage.getItem = original;
});
