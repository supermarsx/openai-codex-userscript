import test from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import { getTaskStats } from '../src/helpers/stats';

test('computes task stats correctly', { concurrency: false }, () => {
  const html = `
    <div class="task-row-container"><button>Open</button></div>
    <div class="task-row-container"><button>Merged</button></div>
    <div class="task-row-container"><button>Closed</button></div>
    <div class="task-row-container"><circle></circle></div>
    <div class="task-row-container"><span>4</span></div>
  `;
  const dom = new JSDOM(html);
  (globalThis as any).document = dom.window.document;
  const stats = getTaskStats();
  assert.deepStrictEqual(stats, { open: 1, merged: 1, closed: 1, inProgress: 1, fourX: 1 });
});
