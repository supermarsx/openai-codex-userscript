import test from "node:test";
import assert from "node:assert";
import { JSDOM } from "jsdom";
import "fake-indexeddb/auto";
import { parseRepoNames } from "../src/helpers/repos";

test(
  "parses repo names from environment select",
  { concurrency: false },
  () => {
    const html =
      '<select data-testid="environment-select"><option>foo/bar</option><option>foo/bar</option><option>bar/baz</option></select>';
    const dom = new JSDOM(html, { url: "https://example.com" });
    (globalThis as any).document = dom.window.document;
    const names = parseRepoNames();
    assert.deepStrictEqual(names, ["foo/bar", "bar/baz"]);
  },
);

test("parses repo names from repository list", { concurrency: false }, () => {
  const html =
    '<ul data-testid="repository-list"><li>foo/bar</li><li>foo/bar</li><li>bar/baz</li></ul>';
  const dom = new JSDOM(html, { url: "https://example.com" });
  (globalThis as any).document = dom.window.document;
  const names = parseRepoNames();
  assert.deepStrictEqual(names, ["foo/bar", "bar/baz"]);
});

test("parses repo names from text content", { concurrency: false }, () => {
  const html = "<div>foo/bar other text foo/bar again bar/baz</div>";
  const dom = new JSDOM(html, { url: "https://example.com" });
  (globalThis as any).document = dom.window.document;
  const names = parseRepoNames();
  assert.deepStrictEqual(names, ["foo/bar", "bar/baz"]);
});
