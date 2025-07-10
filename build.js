const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

esbuild.buildSync({
  entryPoints: [path.join(__dirname, 'src', 'index.ts')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2017'],
  outfile: path.join(__dirname, 'dist', 'index.js'),
});

const header = fs.readFileSync(path.join(__dirname, 'src', 'header.js'), 'utf8');
const main = fs.readFileSync(path.join(__dirname, 'dist', 'index.js'), 'utf8');
fs.writeFileSync(path.join(__dirname, 'openai-codex.user.js'), header + '\n' + main);
