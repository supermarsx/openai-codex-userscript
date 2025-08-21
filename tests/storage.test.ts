import test from 'node:test';
import assert from 'node:assert';
import { loadJSON, saveJSON } from '../src/lib/storage';

test('falls back to memory storage when localStorage disabled', { concurrency: false }, () => {
  const error = new Error('denied');
  (globalThis as any).localStorage = {
    getItem() { throw error; },
    setItem() { throw error; }
  };

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

  const result = loadJSON('missing', { b: 2 });
  assert.deepStrictEqual(result, { b: 2 });
});
