#!/usr/bin/env node
/**
 * Scoped CSS build — compile only one block/brand pair's `_<block>.css`
 * source into the sibling `<block>.css` output, plus any theme variants
 * under that brand. Avoids `gulp createBrandCSS`'s broad sweep that
 * regenerates every brand/block combination in the repo.
 *
 * Usage: npm run scaffold:build:block -- --block-name <name> --brand-name <name>
 * Example: npm run scaffold:build:block -- --block-name footer --brand-name venclexta
 *
 * Mirrors the PostCSS pipeline in gulpfile.js (postcss-import + the project's
 * custom `postcss-dynamic-import` plugin).
 */
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const postcssImport = require('postcss-import');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const next = argv[i + 1];
    if (flag === '--block-name' && next) {
      args.block = next;
      i += 1;
    } else if (flag === '--brand-name' && next) {
      args.brand = next;
      i += 1;
    }
  }
  return args;
}

function usageAndExit(msg) {
  if (msg) console.error(`Error: ${msg}\n`);
  console.error('Usage: npm run scaffold:build:block -- --block-name <name> --brand-name <name>');
  console.error('Example: npm run scaffold:build:block -- --block-name footer --brand-name venclexta');
  process.exit(1);
}

/* PostCSS plugin matching the one in gulpfile.js — moves @dynamic-import to
   the top of the file as a regular @import so postcss-import resolves it. */
const dynamicImportPlugin = {
  postcssPlugin: 'postcss-dynamic-import',
  AtRule: {
    'dynamic-import': (node) => {
      if (!node.params || typeof node.params !== 'string' || node.params.length < 3) {
        return;
      }
      const regex = /@dynamic-import[\s\S]*@import/;
      const sourceCss = node?.parent?.source?.input?.css;
      if (sourceCss && regex.test(sourceCss)) {
        throw node.error('@import should be declared on top of the file');
      }
      node.parent.prepend(`@import ${node.params}`);
      node.remove();
    },
  },
};

async function compile(srcPath) {
  const content = fs.readFileSync(srcPath, 'utf-8');
  const result = await postcss([dynamicImportPlugin, postcssImport()])
    .process(content, { from: srcPath });
  const outPath = path.join(
    path.dirname(srcPath),
    path.basename(srcPath).replace(/^_/, ''),
  );
  fs.writeFileSync(outPath, result.css, 'utf-8');
  console.log(`✓ Built ${path.relative(process.cwd(), outPath)}`);
}

async function main() {
  const { block, brand } = parseArgs(process.argv.slice(2));
  if (!block) usageAndExit('--block-name is required');
  if (!brand) usageAndExit('--brand-name is required');

  const brandDir = path.join('blocks', block, brand);
  if (!fs.existsSync(brandDir)) {
    usageAndExit(`Brand directory does not exist: ${brandDir}`);
  }

  const sources = [];

  /* Brand-level source: blocks/<block>/<brand>/_<block>.css */
  const brandSrc = path.join(brandDir, `_${block}.css`);
  if (fs.existsSync(brandSrc)) sources.push(brandSrc);

  /* Theme-variant sources: blocks/<block>/<brand>/themes/<theme>/_<block>.css */
  const themesDir = path.join(brandDir, 'themes');
  if (fs.existsSync(themesDir)) {
    const themes = fs.readdirSync(themesDir)
      .filter((f) => fs.statSync(path.join(themesDir, f)).isDirectory());
    themes.forEach((theme) => {
      const themeSrc = path.join(themesDir, theme, `_${block}.css`);
      if (fs.existsSync(themeSrc)) sources.push(themeSrc);
    });
  }

  if (sources.length === 0) {
    usageAndExit(`No _${block}.css source found under ${brandDir}`);
  }

  for (const src of sources) {
    // eslint-disable-next-line no-await-in-loop
    await compile(src);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
