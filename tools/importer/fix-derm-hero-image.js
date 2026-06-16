#!/usr/bin/env node
/*
 * Surgical content transform: rewrite ONLY the dermatology hero (half-split-cta)
 * image cell from a single multi-source <picture> to two separate single images
 * (desktop + mobile). EDS publish runs content through markdown, which keeps only
 * one image per figure — the multi-source picture collapses to the desktop image
 * at every breakpoint on EDS live. Two separate images both survive the round-trip,
 * and blocks/hero/hero.js mergeMobileImage() recombines them into a responsive
 * <picture> (<source min-width:985px> = desktop, <img> = mobile).
 *
 * Everything else in the file is left byte-for-byte unchanged.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.resolve(__dirname, '../../content/rinvoq-hcp/dermatology/index.plain.html');
const DESKTOP = '/content/dam/rinvoqhcpivy/images/dermatology/ad/dermatology_home_desktop.png';
const MOBILE = '/content/dam/rinvoqhcpivy/images/dermatology/ad/dermatology_home_mobile.png';

const src = fs.readFileSync(FILE, 'utf8');

// The current hero image cell: first row of .hero.half-split-cta — one <picture>
// with three <source media> elements. Match the whole first-row cell.
const OLD_CELL = '<div><div><picture><source media="(min-width: 985px)" srcset="/content/dam/rinvoqhcpivy/images/dermatology/ad/dermatology_home_desktop.png"><source media="(min-width: 601px) and (max-width: 984px)" srcset="/content/dam/rinvoqhcpivy/images/dermatology/ad/dermatology_home_mobile.png"><source media="(max-width: 600px)" srcset="/content/dam/rinvoqhcpivy/images/dermatology/ad/dermatology_home_mobile.png"><img src="/content/dam/rinvoqhcpivy/images/dermatology/ad/dermatology_home_desktop.png" alt="" height="542" width="2274" loading="lazy"></picture></div></div>\n    <div><div></div></div>';

// Replacement: two image rows (desktop first = the hero image row, mobile second =
// the mobileImage row that mergeMobileImage() consumes). Each is a plain single
// <img> so markdown preserves both.
const NEW_CELL = '<div><div><picture><img src="' + DESKTOP + '" alt="" height="542" width="2274" loading="lazy"></picture></div></div>\n    <div><div><picture><img src="' + MOBILE + '" alt="" height="542" width="2274" loading="lazy"></picture></div></div>';

if (!src.includes(OLD_CELL)) {
  console.error('ERROR: expected hero image cell markup not found — aborting (no changes written).');
  process.exit(1);
}

const out = src.replace(OLD_CELL, NEW_CELL);

if (out === src) {
  console.error('ERROR: replacement produced no change — aborting.');
  process.exit(1);
}

fs.writeFileSync(FILE, out, 'utf8');
console.log('OK: dermatology hero image cell rewritten to two separate images.');
console.log('  desktop row:', DESKTOP);
console.log('  mobile row :', MOBILE);
