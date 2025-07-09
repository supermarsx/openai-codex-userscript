const { JSDOM } = require('jsdom');
const fs = require('fs');
const script = fs.readFileSync('./openai-codex.user.js', 'utf8');

async function runTest(html) {
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
  dom.window.eval(script);
  await new Promise(r => dom.window.setTimeout(r, 0));
  const dropdown = dom.window.document.getElementById('gpt-prompt-suggest-dropdown');
  const firstOption = dropdown.options[1].value;
  dropdown.value = firstOption;
  dropdown.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  return dom.window;
}

(async () => {
  const textareaHtml = `<div class="flex-col items-center"><textarea id="prompt-textarea"></textarea></div>`;
  const w1 = await runTest(textareaHtml);
  console.log('Textarea result:', w1.document.getElementById('prompt-textarea').value);

  const divHtml = `<div class="flex-col items-center"><div id="prompt-textarea" contenteditable="true"></div></div>`;
  const w2 = await runTest(divHtml);
  console.log('Contenteditable result:', w2.document.getElementById('prompt-textarea').textContent);
})();
