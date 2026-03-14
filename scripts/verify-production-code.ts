import * as fs from 'node:fs';
import * as path from 'node:path';

const root = process.cwd();
const packagesDir = path.join(root, 'packages');

const PROD_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs']);
const DISALLOWED = [
  /\bmock(ed|ing)?\b/i,
  /\bstub(s|bed|bing)?\b/i,
  /\bfake(d)?\b/i,
  /\bdummy\b/i
];

function isTestFile(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase();
  const base = path.basename(normalized);
  return (
    normalized.includes('/tests/') ||
    normalized.includes('/__tests__/') ||
    base.includes('.test.') ||
    base.includes('.spec.') ||
    base.includes('test-') ||
    base.startsWith('test')
  );
}

function isRuntimeSource(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  if (!normalized.includes('/src/')) return false;
  if (isTestFile(filePath)) return false;
  const ext = path.extname(filePath).toLowerCase();
  return PROD_EXTENSIONS.has(ext);
}

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const out: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'dist' || entry.name === 'node_modules') continue;
      out.push(...walk(fullPath));
      continue;
    }
    out.push(fullPath);
  }
  return out;
}

function main() {
  const files = walk(packagesDir).filter(isRuntimeSource);
  const violations: Array<{ file: string; keyword: string }> = [];

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const pattern of DISALLOWED) {
      if (pattern.test(text)) {
        violations.push({
          file: path.relative(root, file).replace(/\\/g, '/'),
          keyword: pattern.toString()
        });
      }
    }
  }

  if (violations.length > 0) {
    console.error('Production-code verification failed. Disallowed placeholder terms found:');
    for (const violation of violations) {
      console.error(`- ${violation.file} (${violation.keyword})`);
    }
    process.exit(1);
  }

  console.log('Production-code verification passed: no mock/stub/fake/dummy markers in runtime source.');
}

main();
