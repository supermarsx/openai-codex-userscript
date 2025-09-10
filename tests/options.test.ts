import test from "node:test";
import assert from "node:assert";
import { JSDOM } from "jsdom";
import "fake-indexeddb/auto";
import { loadOptions, DEFAULT_OPTIONS } from "../src/helpers/options";
import { saveJSON } from "../src/lib/storage";

const STORAGE_KEY = "gpt-script-options";

test(
  "loadOptions applies defaults for missing fields",
  { concurrency: false },
  async () => {
    const dom = new JSDOM("", { url: "https://example.com" });
    (globalThis as any).localStorage = dom.window.localStorage;

    await saveJSON(STORAGE_KEY, { hideHeader: true });
    const opts = await loadOptions();

    assert.strictEqual(opts.hideHeader, true);
    assert.strictEqual(opts.font, DEFAULT_OPTIONS.font);
  },
);

test(
  "loadOptions discards invalid and unknown values",
  { concurrency: false },
  async () => {
    const dom = new JSDOM("", { url: "https://example.com" });
    (globalThis as any).localStorage = dom.window.localStorage;

    const bad = {
      hideHeader: "yes",
      font: "papyrus",
      historyLimit: "100",
      foo: "bar",
    };
    await saveJSON(STORAGE_KEY, bad);

    const opts: any = await loadOptions();
    assert.strictEqual(opts.hideHeader, DEFAULT_OPTIONS.hideHeader);
    assert.strictEqual(opts.font, DEFAULT_OPTIONS.font);
    assert.strictEqual(opts.historyLimit, DEFAULT_OPTIONS.historyLimit);
    assert.ok(!("foo" in opts));
  },
);

test(
  "loadOptions migrates hideEnvironments to hideSettings",
  { concurrency: false },
  async () => {
    const dom = new JSDOM("", { url: "https://example.com" });
    (globalThis as any).localStorage = dom.window.localStorage;

    await saveJSON(STORAGE_KEY, { hideEnvironments: true });

    const opts = await loadOptions();
    assert.strictEqual((opts as any).hideEnvironments, undefined);
    assert.strictEqual(opts.hideSettings, true);
  },
);
