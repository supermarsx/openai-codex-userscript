import test from "node:test";
import assert from "node:assert";
import "fake-indexeddb/auto";
import { parseRepoNames } from "../src/helpers/repos";

test("parses names from comma-separated string", () => {
  const names = parseRepoNames("foo/bar, bar/baz, foo/bar");
  assert.deepStrictEqual(names, ["foo/bar", "bar/baz"]);
});

test("parses names from array of strings", () => {
  const names = parseRepoNames(["foo/bar", "bar/baz", "foo/bar"]);
  assert.deepStrictEqual(names, ["foo/bar", "bar/baz"]);
});
