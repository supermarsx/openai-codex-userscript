# openai-codex-userscript
OpenAI Codex userscript

OpenAI Codex UI Enhancer

**[[INSTALL USERSCRIPT]](https://github.com/supermarsx/openai-codex-userscript/raw/refs/heads/main/openai-codex.user.js)**

This script loads a small CSS theme from `shadcn.css` in this repository. If you host the script yourself, ensure that file is available at the same path.

The dropdown suggestions can be customised by clicking the gear icon next to the
list. A prompt will let you edit one suggestion per line. The updated entries are
saved under the `gpt-prompt-suggestions` key in your browser's
`localStorage`, so your changes persist across sessions.

## Dark mode styling

A lightweight stylesheet (`shadcn.css`) controls the look of the dropdown.
Theme variables for light and dark mode are injected so the interface adapts to
your system preference. The stylesheet is loaded with `crossOrigin="anonymous"`
and its `error` event acts as a basic integrity check; if loading fails a
minimal fallback style defined in the script is used instead.

The script locates the ChatGPT prompt input using a set of fallback selectors:
1. `#prompt-textarea`
2. `[data-testid="prompt-textarea"]`
3. The first `.ProseMirror` editor element

If the page structure changes, update the `findPromptInput` function in
`openai-codex.user.js` accordingly.

## Running tests

Automated tests run in Node using [jsdom](https://github.com/jsdom/jsdom).
Install dependencies first to ensure `jsdom` is available, then run the test script:

```bash
npm install
npm test
```

This executes `node test.js` and should print the results of the example DOM
manipulations.
