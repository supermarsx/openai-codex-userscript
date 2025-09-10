const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf8"),
);
const version = pkg.version;

// Generate version file for the TypeScript sources to import
fs.writeFileSync(
  path.join(__dirname, "src", "version.ts"),
  `export const VERSION = '${version}';\n`,
);

esbuild.buildSync({
  entryPoints: [path.join(__dirname, "src", "index.ts")],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2017"],
  outfile: path.join(__dirname, "dist", "index.js"),
});

const header = fs
  .readFileSync(path.join(__dirname, "src", "header.ts"), "utf8")
  .replace(/__VERSION__/g, version);
const main = fs.readFileSync(path.join(__dirname, "dist", "index.js"), "utf8");
fs.writeFileSync(
  path.join(__dirname, "dist", "openai-codex.user.js"),
  header + "\n" + main,
);
