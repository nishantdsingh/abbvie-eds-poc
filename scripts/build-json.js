#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Builds component-models.json, component-filters.json, and component-definition.json
 * by resolving all "..." spread references in the models/ source files.
 *
 * Spread syntax: { "...": "<glob>#/<key>" }
 * - glob supports one level of * wildcard
 * - #/<key> selects a top-level array from the resolved JSON
 */

const { readFileSync, writeFileSync, readdirSync } = require('fs');
const { resolve, dirname } = require('path');

const ROOT = resolve(__dirname, '..');

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, ''));
}

function matchGlob(pattern, baseDir) {
  const parts = pattern.split('/');
  let paths = [baseDir];
  parts.forEach((segment) => {
    if (!segment.includes('*')) {
      paths = paths.map((p) => resolve(p, segment));
      return;
    }
    const regex = new RegExp(`^${segment.replace('*', '.*')}$`);
    paths = paths.flatMap((p) => {
      try {
        return readdirSync(p)
          .filter((name) => regex.test(name))
          .map((name) => resolve(p, name));
      } catch {
        return [];
      }
    });
  });
  return paths.sort();
}

function resolveSpread(spreadRef, baseDir) {
  const [globPart, keyPart] = spreadRef.split('#/');
  const files = matchGlob(globPart, baseDir);
  return files.flatMap((file) => {
    const data = readJson(file);
    const items = keyPart ? data[keyPart] : data;
    return Array.isArray(items) ? items : [items].filter((i) => i !== undefined);
  });
}

function resolveValue(value, baseDir) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (item && typeof item === 'object' && '...' in item) {
        return resolveSpread(item['...'], baseDir);
      }
      return [resolveValue(item, baseDir)];
    });
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, resolveValue(v, baseDir)]),
    );
  }
  return value;
}

function build(srcFile, outFile) {
  const srcPath = resolve(ROOT, 'models', srcFile);
  const outPath = resolve(ROOT, outFile);
  const src = readJson(srcPath);
  const resolved = resolveValue(src, dirname(srcPath));
  writeFileSync(outPath, `${JSON.stringify(resolved, null, 2)}\n`, 'utf-8');
  process.stdout.write(`built: ${outFile}\n`);
}

build('_component-models.json', 'component-models.json');
build('_component-filters.json', 'component-filters.json');
build('_component-definition.json', 'component-definition.json');
