import test from "node:test";
import assert from "node:assert";
import { JSDOM } from "jsdom";
import "fake-indexeddb/auto";
import { saveJSON } from "../src/lib/storage";

// Ensure toggling header hides only h1 elements

test.skip("hides only h1 elements when header is toggled", async () => {
  const html = `<!doctype html><html><head></head><body>
    <h1 id="main">Title</h1>
    <div class="text-3xl" id="div">Not Header</div>
    <h2 id="secondary">Subtitle</h2>
  </body></html>`;
  const dom = new JSDOM(html, { url: "https://example.com" });
  (globalThis as any).window = dom.window;
  (globalThis as any).document = dom.window.document;
  (globalThis as any).localStorage = dom.window.localStorage;
  (globalThis as any).MutationObserver = dom.window.MutationObserver;

  await saveJSON("gpt-script-options", { hideHeader: true });

  await import("../src/index");
  await new Promise((r) => setTimeout(r, 10));

  const h1 = dom.window.document.getElementById("main") as HTMLElement;
  const div = dom.window.document.getElementById("div") as HTMLElement;
  const h2 = dom.window.document.getElementById("secondary") as HTMLElement;

  assert.strictEqual(h1.style.display, "none");
  assert.notStrictEqual(div.style.display, "none");
  assert.notStrictEqual(h2.style.display, "none");
});
