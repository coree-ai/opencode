#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const [pluginVersion] = process.argv.slice(2);
if (!pluginVersion) { console.error('Usage: update-npx-pin.mjs <plugin-version>'); process.exit(1); }

const coreeVersion = pluginVersion.replace(/-\d+$/, '');

function replacePins(file, pairs) {
  const content = fs.readFileSync(file, 'utf8');
  let updated = content;
  for (const [pattern, replacement] of pairs) {
    updated = updated.replace(pattern, replacement);
  }
  if (updated !== content) { fs.writeFileSync(file, updated); console.log(`  updated ${path.relative(REPO_ROOT, file)}`); }
  else { console.warn(`  warning: no replacement in ${path.relative(REPO_ROOT, file)}`); }
}

console.log(`npx pin -> ${coreeVersion}\n`);
replacePins(path.join(REPO_ROOT, 'opencode.md'), [
  [/@coree-ai\/coree@\d+\.\d+\.\d+/, `@coree-ai/coree@${coreeVersion}`],
]);
replacePins(path.join(REPO_ROOT, 'README.md'), [
  [/@coree-ai\/coree@\d+\.\d+\.\d+/, `@coree-ai/coree@${coreeVersion}`],
  [/coree version: @coree-ai\/coree@\d+\.\d+\.\d+/, `coree version: @coree-ai/coree@${coreeVersion}`],
]);
replacePins(path.join(REPO_ROOT, 'src/index.ts'), [
  [/COREE_VERSION = "\d+\.\d+\.\d+"/, `COREE_VERSION = "${coreeVersion}"`],
]);
