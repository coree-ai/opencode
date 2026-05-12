import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');

function replaceInFile(p, oldStr, newStr) {
  const content = fs.readFileSync(p, 'utf8');
  const newContent = content.replaceAll(oldStr, newStr);
  fs.writeFileSync(p, newContent);
}

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: node scripts/bump-version.mjs <new-version>');
  process.exit(1);
}

const newVersion = args[0];

// Derive current version from README (look for @coree-ai/coree@ reference)
const readmePath = path.join(REPO_ROOT, 'README.md');
const readmeContent = fs.readFileSync(readmePath, 'utf8');
const match = readmeContent.match(/@coree-ai\/coree@(\d+\.\d+\.\d+)/);
if (!match) {
  console.error('Could not find current version in README.md');
  process.exit(1);
}
const currentVersion = match[1];

replaceInFile(readmePath, currentVersion, newVersion);
replaceInFile(path.join(REPO_ROOT, 'opencode.md'), currentVersion, newVersion);

console.log(`Bumped opencode integration from ${currentVersion} to ${newVersion}`);
console.log(`Updated MCP server reference to @coree-ai/coree@${newVersion}`);
