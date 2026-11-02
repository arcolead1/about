import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const { targets } = JSON.parse(readFileSync('data/minify.json', 'utf8'));
const bin = process.env.ESBUILD ? [process.env.ESBUILD] : ['npx', '--yes', 'esbuild@0.25.5'];
const stamp = (text) => createHash('sha256').update(text).digest('hex').slice(0, 12);

for (const { src, out } of targets) {
  const source = readFileSync(src, 'utf8');
  const run = spawnSync(bin[0], [...bin.slice(1), src, '--minify', '--legal-comments=none', '--log-level=warning'], { encoding: 'utf8' });
  if (run.status !== 0 || !run.stdout.trim()) {
    console.error(`minify failed: ${src}\n${run.stderr || run.error || ''}`);
    process.exit(1);
  }
  writeFileSync(out, `/*src:${stamp(source)}*/\n${run.stdout}`);
  console.log(`${src} ${source.length} -> ${out} ${run.stdout.length}`);
}
