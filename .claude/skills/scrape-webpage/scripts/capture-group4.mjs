import { chromium } from 'playwright';

const OUT = '/Users/nissingh/MyData/Software/Abbvie/Local/Codebase/abbvie-nextgen-eds/import-work/screenshots/variations/';

async function elShot(page, selector, file, fallbackScroll, fallbackHeight=500) {
  try {
    const el = page.locator(selector).first();
    await el.waitFor({ timeout: 8000 });
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await el.screenshot({ path: OUT + file });
    console.log('✓', file);
  } catch {
    try {
      await page.evaluate(y => window.scrollTo(0, y), fallbackScroll || 0);
      await page.waitForTimeout(800);
      await page.screenshot({ path: OUT + file, clip: { x:0, y:0, width:1440, height:fallbackHeight } });
      console.log('~ fallback', file);
    } catch(e) { console.log('✗', file, e.message); }
  }
}

const browser = await chromium.launch({ headless: true });

// ── CAROUSEL VARIATIONS ───────────────────────────────────────

// Hero carousel (BOTOX — 6-image rotating)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.botox.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);
  await elShot(p, '.carousel--hero, [class*="carousel--hero"]', 'carousel--hero-6img-botox.png', 100, 600);
  await p.close();
}

// Patient stories carousel (QULIPTA HCP — 3-card before/after)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.quliptahcp.com/patient-stories', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await elShot(p, '.owl-carousel, [class*="owl-carousel"]', 'carousel--patient-stories-3card.png', 300, 700);
  await p.close();
}

// 2-up card carousel (BOTOX — patient testimonials)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.botox.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 1300));
  await p.waitForTimeout(1000);
  await elShot(p, '.carousel--multi, [class*="carousel--multi"]', 'carousel--cards-2up-botox.png', 1200, 550);
  await p.close();
}

// Media gallery carousel (RINVOQ AD — skin tone images)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.rinvoq.com/atopic-dermatitis/about-eczema/what-is-eczema', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 1500));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: OUT + 'carousel--media-gallery-rinvoq.png', clip: { x:0, y:0, width:1440, height:700 } });
  console.log('✓ carousel--media-gallery-rinvoq.png');
  await p.close();
}

// ── VIDEO VARIATIONS ─────────────────────────────────────────

// Video inline — LINZESS patient testimonials grid
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.linzess.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 2200));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: OUT + 'video--testimonials-grid-linzess.png', clip: { x:0, y:0, width:1440, height:700 } });
  console.log('✓ video--testimonials-grid-linzess.png');
  await p.close();
}

// Video MOA (VRAYLAR — mechanism of action)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.vraylar.com/amdd/why-vraylar', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 1500));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: OUT + 'video--moa-vraylar.png', clip: { x:0, y:0, width:1440, height:700 } });
  console.log('✓ video--moa-vraylar.png');
  await p.close();
}

// Video TV commercial gallery (VRAYLAR)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.vraylar.com/amdd/why-vraylar', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 4500));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: OUT + 'video--tv-spot-gallery-vraylar.png', clip: { x:0, y:0, width:1440, height:700 } });
  console.log('✓ video--tv-spot-gallery-vraylar.png');
  await p.close();
}

// Video inline (SKYRIZI ways-to-save)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.skyrizi.com/skyrizi-complete/gastro/ways-to-save', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 600));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: OUT + 'video--inline-skyrizi.png', clip: { x:0, y:0, width:1440, height:700 } });
  console.log('✓ video--inline-skyrizi.png');
  await p.close();
}

// ── STEPS VARIATIONS ─────────────────────────────────────────

// 4-step infusion savings flow (SKYRIZI)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.skyrizi.com/skyrizi-complete/gastro/ways-to-save', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 1200));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: OUT + 'steps--4step-infusion-skyrizi.png', clip: { x:0, y:0, width:1440, height:700 } });
  console.log('✓ steps--4step-infusion-skyrizi.png');
  await p.close();
}

// 3-step specialty pharmacy (SKYRIZI)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.skyrizi.com/skyrizi-complete/gastro/ways-to-save', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 1900));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: OUT + 'steps--3step-pharmacy-skyrizi.png', clip: { x:0, y:0, width:1440, height:700 } });
  console.log('✓ steps--3step-pharmacy-skyrizi.png');
  await p.close();
}

// ── VIOLATOR VARIATIONS (QULIPTA HCP) ────────────────────────

// Orange violator (episodic migraine section header)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.quliptahcp.com/powerful-reductions', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollTo(0, 350));
  await p.waitForTimeout(1000);
  await elShot(p, '[class*="violator-title--orange"]:not([class*="dark"])', 'violator--orange.png', 300, 150);
  await p.close();
}

// Ochre violator (chronic migraine section)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.quliptahcp.com/powerful-reductions', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 2500));
  await p.waitForTimeout(1000);
  await elShot(p, '[class*="violator-title--ochre"]', 'violator--ochre.png', 2400, 150);
  await p.close();
}

// Pewter-blue content panel (before/after cards — patient-stories)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.quliptahcp.com/patient-stories', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 600));
  await p.waitForTimeout(1000);
  await elShot(p, '[class*="pewter-blue"]', 'violator--pewter-blue.png', 600, 500);
  await p.close();
}

// ── PROVIDER FINDER ──────────────────────────────────────────

{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.botox.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => document.querySelector('[class*="find-a-provider"], [class*="fap-physician"]')?.scrollIntoView());
  await p.waitForTimeout(2000);
  await elShot(p, '[class*="find-a-provider"], [class*="abbv-find-a-provider"]', 'provider-finder--botox.png', 1800, 600);
  await p.close();
}

// ── MECHANISM OF ACTION ───────────────────────────────────────

// Icon-text MOA (LINZESS — pill + gut icons)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.linzess.com/why-linzess', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 1200));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: OUT + 'moa--icon-text-linzess.png', clip: { x:0, y:0, width:1440, height:700 } });
  console.log('✓ moa--icon-text-linzess.png');
  await p.close();
}

// ── COMPARISON TABLE ──────────────────────────────────────────

// Drug-class compatibility (VRAYLAR — SSRI/SNRI/NDRI)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.vraylar.com/amdd/why-vraylar', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 2800));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: OUT + 'comparison-table--drug-classes-vraylar.png', clip: { x:0, y:0, width:1440, height:700 } });
  console.log('✓ comparison-table--drug-classes-vraylar.png');
  await p.close();
}

// ── APP DOWNLOAD ─────────────────────────────────────────────

{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.skyrizi.com/skyrizi-complete/gastro/ways-to-save', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 2600));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: OUT + 'app-download--skyrizi.png', clip: { x:0, y:0, width:1440, height:700 } });
  console.log('✓ app-download--skyrizi.png');
  await p.close();
}

// ── TREATMENT TIMELINE ────────────────────────────────────────

{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.linzess.com/why-linzess', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 2000));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: OUT + 'treatment-timeline--linzess.png', clip: { x:0, y:0, width:1440, height:700 } });
  console.log('✓ treatment-timeline--linzess.png');
  await p.close();
}

// ── PATIENT SUPPORT BLOCKS ────────────────────────────────────

// Nurse ambassador (SKYRIZI)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.skyrizi.com/skyrizi-complete/gastro/ways-to-save', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 3300));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: OUT + 'patient-support--nurse-ambassador-skyrizi.png', clip: { x:0, y:0, width:1440, height:600 } });
  console.log('✓ patient-support--nurse-ambassador-skyrizi.png');
  await p.close();
}

// ── BREADCRUMB ────────────────────────────────────────────────

{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.hepc.com/how-hep-c-transmitted', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollTo(0, 350));
  await p.waitForTimeout(1000);
  await elShot(p, '[class*="breadcrumb"]', 'breadcrumb--hepc.png', 350, 60);
  await p.close();
}

// ── NEXT-PREV NAV ────────────────────────────────────────────

{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.hepc.com/how-hep-c-transmitted', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => document.querySelector('[class*="hep-c-next-page"], [class*="next-page"]')?.scrollIntoView());
  await p.waitForTimeout(1200);
  await elShot(p, '[class*="hep-c-next-page"]', 'next-prev-nav--hepc.png', 3000, 150);
  await p.close();
}

await browser.close();
console.log('Group 4 done');
