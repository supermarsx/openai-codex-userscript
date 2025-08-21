import test from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import { loadOptions, DEFAULT_OPTIONS } from '../src/helpers/options';

const STORAGE_KEY = 'gpt-script-options';

test('loadOptions applies defaults for missing fields', { concurrency: false }, () => {
  const dom = new JSDOM('', { url: 'https://example.com' });
  (globalThis as any).localStorage = dom.window.localStorage;

  dom.window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ hideHeader: true }));
  const opts = loadOptions();

  assert.strictEqual(opts.hideHeader, true);
  assert.strictEqual(opts.font, DEFAULT_OPTIONS.font);
});

test('loadOptions discards invalid and unknown values', { concurrency: false }, () => {
  const dom = new JSDOM('', { url: 'https://example.com' });
  (globalThis as any).localStorage = dom.window.localStorage;

  const bad = { hideHeader: 'yes', font: 'papyrus', historyLimit: '100', foo: 'bar' };
  dom.window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bad));

  const opts: any = loadOptions();
  assert.strictEqual(opts.hideHeader, DEFAULT_OPTIONS.hideHeader);
  assert.strictEqual(opts.font, DEFAULT_OPTIONS.font);
  assert.strictEqual(opts.historyLimit, DEFAULT_OPTIONS.historyLimit);
  assert.ok(!('foo' in opts));
});
