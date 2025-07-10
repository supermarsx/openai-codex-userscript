# Repo Guidelines

- Run `npm run build` before committing changes. This command must output `openai-codex.user.js` in the repo root.
- Ensure `npm test` passes.
- Bump the `version` in `package.json` and the userscript header (`src/header.js`) with every pull request.
