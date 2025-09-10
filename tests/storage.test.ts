import test from "node:test";
import assert from "node:assert";
import "fake-indexeddb/auto";

function loadStorage() {
  const path = require.resolve("../src/lib/storage");
  delete require.cache[path];
  return require(path) as typeof import("../src/lib/storage");
}

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
