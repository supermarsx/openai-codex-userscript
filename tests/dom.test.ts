import test from "node:test";
import assert from "node:assert";
import { JSDOM } from "jsdom";
import "fake-indexeddb/auto";

test.skip(
  "renders settings modal and sidebars",
  { concurrency: false },
  async () => {
    const dom = new JSDOM(
      "<!doctype html><html><head></head><body></body></html>",
      { url: "https://example.com" },
    );
    (globalThis as any).window = dom.window;
    (globalThis as any).document = dom.window.document;
    (globalThis as any).localStorage = dom.window.localStorage;
    (globalThis as any).MutationObserver = dom.window.MutationObserver;
    await import("../src/index");
    await new Promise((r) => setTimeout(r, 10));
    const modalTitle = dom.window.document.querySelector(
      "#gpt-settings-modal .modal-content h2",
    );
    assert.strictEqual(modalTitle?.textContent, "Settings");
    const repoHeader = dom.window.document.querySelector(
      "#gpt-repo-sidebar h3",
    );
    assert.strictEqual(repoHeader?.textContent, "Repositories");
    const versionHeader = dom.window.document.querySelector(
      "#gpt-version-sidebar h3",
    );
    assert.strictEqual(versionHeader?.textContent, "Versions");
  },
);
