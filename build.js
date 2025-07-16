const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const version = pkg.version;

const indexTs = fs.readFileSync(path.join(__dirname, 'src', 'index.ts'), 'utf8').replace(/__VERSION__/g, version);

esbuild.buildSync({
  stdin: {
    contents: indexTs,
    resolveDir: path.join(__dirname, 'src'),
    sourcefile: 'index.ts',
  },
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2017'],
  outfile: path.join(__dirname, 'dist', 'index.js'),
});

const header = fs.readFileSync(path.join(__dirname, 'src', 'header.js'), 'utf8').replace(/__VERSION__/g, version);
const main = fs.readFileSync(path.join(__dirname, 'dist', 'index.js'), 'utf8');
fs.writeFileSync(path.join(__dirname, 'openai-codex.user.js'), header + '\n' + main);
