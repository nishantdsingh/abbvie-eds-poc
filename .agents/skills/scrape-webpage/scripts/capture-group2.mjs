import { chromium } from 'playwright';

const OUT = '/Users/nissingh/MyData/Software/Abbvie/Local/Codebase/abbvie-nextgen-eds/import-work/screenshots/variations/';

// Safe wrapper: clips against actual page height to avoid out-of-bounds errors
async function safeClip(page, clip) {
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const y = Math.min(clip.y, Math.max(0, pageHeight - 10));
  const height = Math.min(clip.height, pageHeight - y);
  return { x: clip.x, y, width: clip.width, height: Math.max(1, height) };
}

async function shot(page, selector, file, clip) {
  try {
    if (selector) {
      const el = page.locator(selector).first();
      await el.waitFor({ timeout: 8000 });
      await el.screenshot({ path: OUT + file });
    } else {
      const safeC = await safeClip(page, clip);
      await page.screenshot({ path: OUT + file, clip: safeC });
    }
    console.log('✓', file);
  } catch {
    try {
      const fallbackClip = clip ? await safeClip(page, clip) : { x:0, y:0, width:1440, height:600 };
      await page.screenshot({ path: OUT + file, clip: fallbackClip });
      console.log('~ fallback', file);
    }
    catch(e) { console.log('✗', file, e.message); }
  }
}

// Safe direct screenshot helper (replaces bare page.screenshot calls with clips)
async function snapClip(page, file, clip) {
  try {
    const safeC = await safeClip(page, clip);
    await page.screenshot({ path: OUT + file, clip: safeC });
    console.log('✓', file);
  } catch(e) {
    console.log('✗', file, e.message);
  }
}

const browser = await chromium.launch({ headless: true });

// ── CARDS: CONDITION SELECTOR ──────────────────────────────────
// RINVOQ 9-condition grid
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.rinvoq.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 500));
  await p.waitForTimeout(1000);
  await snapClip(p, 'cards--condition-9up-rinvoq.png', { x:0, y:450, width:1440, height:600 });
  await p.close();
}

// VENCLEXTA 3-condition cards
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.venclexta.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await snapClip(p, 'cards--condition-3up-venclexta.png', { x:0, y:200, width:1440, height:400 });
  await p.close();
}

// VRAYLAR 2-condition cards
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.vraylar.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await snapClip(p, 'cards--condition-2up-vraylar.png', { x:0, y:200, width:1440, height:400 });
  await p.close();
}

// ── CARDS: FEATURE 3-UP ─────────────────────────────────────────
// HepC 3-card feature row
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.hepc.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 600));
  await p.waitForTimeout(1000);
  await shot(p, '[class*="hep-c-features"], [class*="hero-features"]', 'cards--feature-3up-hepc.png', { x:0, y:600, width:1440, height:380 });
  await p.close();
}

// LINZESS 3-column features
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.linzess.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 700));
  await p.waitForTimeout(1000);
  await snapClip(p, 'cards--feature-3up-linzess.png', { x:0, y:550, width:1440, height:500 });
  await p.close();
}

// VRAYLAR 3-card Savings/Provider/Guide
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.vraylar.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 800));
  await p.waitForTimeout(1000);
  await snapClip(p, 'cards--feature-3up-vraylar.png', { x:0, y:650, width:1440, height:450 });
  await p.close();
}

// ── CARDS: PATIENT STORY ─────────────────────────────────────────
// QULIPTA HCP before/after patient carousel
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.quliptahcp.com/patient-stories', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 400));
  await p.waitForTimeout(1000);
  await shot(p, '[class*="carousel-patient-stories"], [class*="owl-carousel"]', 'cards--patient-story-before-after.png', { x:0, y:350, width:1440, height:700 });
  await p.close();
}

// BOTOX 2-up patient story carousel
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.botox.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 1400));
  await p.waitForTimeout(1000);
  await shot(p, '.carousel--multi, [class*="carousel--multi"]', 'cards--patient-story-2up-botox.png', { x:0, y:1300, width:1440, height:500 });
  await p.close();
}

// ── CARDS: STATS ──────────────────────────────────────────────
// BOTOX trust bar (3-stat row)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.botox.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 750));
  await p.waitForTimeout(1000);
  await shot(p, '[class*="hero--stats"], [class*="hero__number"]', 'cards--stats-trust-bar-botox.png', { x:0, y:730, width:1440, height:300 });
  await p.close();
}

// VRAYLAR 1.5M patient milestone stat
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.vraylar.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 600));
  await p.waitForTimeout(1000);
  await snapClip(p, 'cards--stats-milestone-vraylar.png', { x:0, y:550, width:1440, height:250 });
  await p.close();
}

// LINZESS population stats (11.5M / 28.5M / 18M)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.linzess.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 1200));
  await p.waitForTimeout(1000);
  await snapClip(p, 'cards--stats-population-linzess.png', { x:0, y:1100, width:1440, height:350 });
  await p.close();
}

// QULIPTA HCP efficacy "54%" stat callout
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.quliptahcp.com/powerful-reductions', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 600));
  await p.waitForTimeout(1000);
  await snapClip(p, 'cards--stats-efficacy-qulipta.png', { x:0, y:500, width:1440, height:450 });
  await p.close();
}

// ── CARDS: SIDE EFFECTS GRID ──────────────────────────────────
// VENCLEXTA 10-icon side effects grid
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.venclexta.com/previously-untreated-cll/possible-side-effects', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 1800));
  await p.waitForTimeout(1000);
  await snapClip(p, 'cards--side-effects-10up-venclexta.png', { x:0, y:1700, width:1440, height:500 });
  await p.close();
}

// ── CARDS: SAVINGS CARD ───────────────────────────────────────
// QULIPTA savings card
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.qulipta.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 1600));
  await p.waitForTimeout(1000);
  await shot(p, '[class*="savings-card"]', 'cards--savings-card-qulipta.png', { x:0, y:1500, width:1440, height:500 });
  await p.close();
}

// LINZESS savings "$30/dose"
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.linzess.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 1800));
  await p.waitForTimeout(1000);
  await snapClip(p, 'cards--savings-card-linzess.png', { x:0, y:1700, width:1440, height:450 });
  await p.close();
}

// SKYRIZI Complete savings section
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.skyrizi.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 800));
  await p.waitForTimeout(1000);
  await snapClip(p, 'cards--savings-card-skyrizi.png', { x:0, y:700, width:1440, height:500 });
  await p.close();
}

// ── CARDS: SHADOW (BOTOX CONDITIONS) ─────────────────────────
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.botox.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 2400));
  await p.waitForTimeout(1000);
  await shot(p, '[class*="background-color__gray"], [class*="section--break"]', 'cards--shadow-conditions-botox.png', { x:0, y:2300, width:1440, height:600 });
  await p.close();
}

// ── CARDS: ICON TRANSMISSION GRID (HepC) ─────────────────────
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.hepc.com/how-hep-c-transmitted', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 600));
  await p.waitForTimeout(1000);
  await shot(p, '[class*="icon-grid"], [class*="hepc-icon"]', 'cards--icon-8up-transmission-hepc.png', { x:0, y:550, width:1440, height:700 });
  await p.close();
}

// ── CALLOUT VARIATIONS ────────────────────────────────────────
// Gradient temple callout (QULIPTA)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.qulipta.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 1100));
  await p.waitForTimeout(1000);
  await shot(p, '.callout-temple, [class*="callout-temple"]', 'callout--gradient-temple-qulipta.png', { x:0, y:1050, width:1440, height:500 });
  await p.close();
}

// Dark fact block (HepC)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.hepc.com/how-hep-c-transmitted', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 1400));
  await p.waitForTimeout(1000);
  await shot(p, '[class*="blue-breaker"]', 'callout--dark-fact-block-hepc.png', { x:0, y:1300, width:1440, height:400 });
  await p.close();
}

// Patient quote image-text (QULIPTA)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.qulipta.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 2400));
  await p.waitForTimeout(1000);
  await shot(p, '[class*="container-power"], [class*="container-copy-image"]', 'callout--patient-quote-image-text.png', { x:0, y:2300, width:1440, height:500 });
  await p.close();
}

// CTA band (HepC)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.hepc.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 1100));
  await p.waitForTimeout(1000);
  await shot(p, '[class*="cta-inline-container"]', 'callout--cta-band-hepc.png', { x:0, y:1000, width:1440, height:250 });
  await p.close();
}

// TLS warning box (VENCLEXTA)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.venclexta.com/previously-untreated-cll/possible-side-effects', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 600));
  await p.waitForTimeout(1000);
  await snapClip(p, 'callout--warning-tls-venclexta.png', { x:0, y:500, width:1440, height:500 });
  await p.close();
}

// BOTOX savings callout (2-col text+image)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.botox.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 900));
  await p.waitForTimeout(1000);
  await snapClip(p, 'callout--savings-2col-botox.png', { x:0, y:800, width:1440, height:450 });
  await p.close();
}

await browser.close();
console.log('Group 2 done');
