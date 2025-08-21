import test from 'node:test';
import assert from 'node:assert';

function loadStorage() {
  const path = require.resolve('../src/lib/storage');
  delete require.cache[path];
  return require(path) as typeof import('../src/lib/storage');
}

test('falls back to memory storage when localStorage disabled', { concurrency: false }, () => {
  const error = new Error('denied');
  (globalThis as any).localStorage = {
    getItem() { throw error; },
    setItem() { throw error; }
  };

  const { loadJSON, saveJSON } = loadStorage();
  saveJSON('test-key', { a: 1 });
  const result = loadJSON('test-key', { a: 0 });
  assert.deepStrictEqual(result, { a: 1 });
});

test('loadJSON returns fallback with disabled localStorage', { concurrency: false }, () => {
  const error = new Error('denied');
  (globalThis as any).localStorage = {
    getItem() { throw error; },
    setItem() { throw error; }
  };

  const { loadJSON } = loadStorage();
  const result = loadJSON('missing', { b: 2 });
  assert.deepStrictEqual(result, { b: 2 });
});

test('falls back to memory storage when localStorage undefined', { concurrency: false }, () => {
  delete (globalThis as any).localStorage;

  const { loadJSON, saveJSON } = loadStorage();
  saveJSON('none', { c: 3 });
  const result = loadJSON('none', { c: 0 });
  assert.deepStrictEqual(result, { c: 3 });
});
