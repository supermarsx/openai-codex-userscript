# openai-codex-userscript

OpenAI Codex Super UI Userscript

**[[INSTALL USERSCRIPT]](https://github.com/supermarsx/openai-codex-userscript/raw/refs/heads/main/openai-codex.user.js)**
Install Violentmonkey from https://violentmonkey.github.io/get-it/ to run the userscript.


This script reuses Codex's own theme variables so no extra network request is needed.

The dropdown suggestions can be customised by clicking the gear icon next to the
list. A prompt will let you edit one suggestion per line. The updated entries are
saved under the `gpt-prompt-suggestions` key in your browser's
`localStorage`, so your changes persist across sessions.

## Settings modal

A floating gear icon is added to the side of the page. Clicking it opens a modal
where you can manage your prompt suggestions and toggle various UI options:

* Switch between Light, Dark and OLED themes.
* Hide the “What are we coding next?” header.
* Hide the “Docs” navigation link.
* Hide the "Environments" button.

The chosen settings are stored in `localStorage` so they apply whenever the
script runs. Tasks that end up in a merged or closed state are automatically
archived.

## Theme styling

Theme variables for Light and Dark mode are injected from Codex's own CSS so the interface adapts to your system preference. An additional OLED style is provided with deeper blacks. A minimal fallback style keeps the dropdown readable.
The script locates the ChatGPT prompt input using a set of fallback selectors:
1. `#prompt-textarea`
2. `[data-testid="prompt-textarea"]`
3. The first `.ProseMirror` editor element

If the page structure changes, update the `findPromptInput` function in
`openai-codex.user.js` accordingly.

## Installation

Install the development dependencies with `npm`:

```bash
npm install
```

## Running tests

Automated tests run in Node using [jsdom](https://github.com/jsdom/jsdom).
Install dependencies first to ensure `jsdom` is available, then run the test script:

```bash
npm install
npm test
```

This executes `node test.js` and should print the results of the example DOM
manipulations.

## Development setup

Always run `npm install` before executing `npm test`. The tests depend on the
`jsdom` package, which is listed under `devDependencies` in `package.json`.
