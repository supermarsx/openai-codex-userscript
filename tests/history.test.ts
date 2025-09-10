import test from "node:test";
import assert from "node:assert";
import { JSDOM } from "jsdom";
import "fake-indexeddb/auto";
import { saveJSON } from "../src/lib/storage";
function loadHistory() {
  const path = require.resolve("../src/helpers/history");
  delete require.cache[path];
  return require(path) as typeof import("../src/helpers/history");
}

test(
  "addToHistory respects limit and trims input",
  { concurrency: false },
  async () => {
    const dom = new JSDOM("", { url: "https://example.com" });
    (globalThis as any).localStorage = dom.window.localStorage;

    await saveJSON("gpt-script-options", { historyLimit: 2 });

    const { addToHistory } = loadHistory();
    let list: string[] = [];
    list = await addToHistory(list, " first ");
    list = await addToHistory(list, "second");
    list = await addToHistory(list, "third");
    assert.deepStrictEqual(list, ["third", "second"]);
  },
);

test("addToHistory can be disabled", { concurrency: false }, async () => {
  const dom = new JSDOM("", { url: "https://example.com" });
  (globalThis as any).localStorage = dom.window.localStorage;

  await saveJSON("gpt-script-options", { disableHistory: true });

  const { addToHistory } = loadHistory();
  let list: string[] = [];
  list = await addToHistory(list, "test");
  assert.deepStrictEqual(list, []);
});
