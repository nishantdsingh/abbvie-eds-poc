import { chromium } from 'playwright';

const OUT = '/Users/nissingh/MyData/Software/Abbvie/Local/Codebase/abbvie-nextgen-eds/import-work/screenshots/variations/';

async function scrollShot(page, scrollY, file, height = 500) {
  await page.evaluate(y => window.scrollTo(0, y), scrollY);
  await page.waitForTimeout(1200);
  const vp = await page.viewportSize();
  await page.screenshot({ path: OUT + file, clip: { x:0, y:0, width: vp.width, height: Math.min(height, 900) } });
  console.log('✓', file);
}

async function elShot(page, selector, file, fallbackScrollY, fallbackHeight = 400) {
  try {
    const el = page.locator(selector).first();
    await el.waitFor({ timeout: 8000 });
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await el.screenshot({ path: OUT + file });
    console.log('✓', file);
  } catch {
    try {
      await page.evaluate(y => window.scrollTo(0, y), fallbackScrollY);
      await page.waitForTimeout(800);
      const vp = await page.viewportSize();
      await page.screenshot({ path: OUT + file, clip: { x:0, y:0, width: vp.width, height: fallbackHeight } });
      console.log('~ fallback', file);
    } catch(e) { console.log('✗', file, e.message); }
  }
}

const browser = await chromium.launch({ headless: true });

// ── ISI VARIATIONS ────────────────────────────────────────────

// ISI Drawer minimized state (QULIPTA DTC)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.qulipta.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);
  // scroll to show bottom of page where drawer sits
  await p.evaluate(() => window.scrollTo(0, 1000));
  await p.waitForTimeout(1000);
  await elShot(p, '.abbv-safety-bar, [class*="safety-bar"]', 'isi--drawer-minimized-qulipta.png', 800, 200);
  await p.close();
}

// ISI Drawer (BOTOX)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.botox.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);
  await p.evaluate(() => window.scrollTo(0, 1000));
  await p.waitForTimeout(1000);
  await elShot(p, '.abbv-safety-bar, [class*="safety-bar"]', 'isi--drawer-minimized-botox.png', 800, 200);
  await p.close();
}

// ISI inline full (VENCLEXTA)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.venclexta.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => document.querySelector('#abbv_use_statement, [id*="use_statement"], [id*="safety"]')?.scrollIntoView());
  await p.waitForTimeout(1500);
  await p.screenshot({ path: OUT + 'isi--inline-venclexta.png', clip: { x:0, y:0, width:1440, height:700 } });
  console.log('✓ isi--inline-venclexta.png');
  await p.close();
}

// ISI inline (LINZESS)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.linzess.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => document.querySelector('#isi, [id*="isi"], [class*="abbv-inline"]')?.scrollIntoView());
  await p.waitForTimeout(1500);
  await p.screenshot({ path: OUT + 'isi--inline-linzess.png', clip: { x:0, y:0, width:1440, height:700 } });
  console.log('✓ isi--inline-linzess.png');
  await p.close();
}

// ISI warning-box RINVOQ (boxed warning)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.rinvoq.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => document.querySelector('[id*="safety"], [id*="use"], [class*="abbv-inline"]')?.scrollIntoView());
  await p.waitForTimeout(1500);
  await p.screenshot({ path: OUT + 'isi--warning-box-rinvoq.png', clip: { x:0, y:0, width:1440, height:600 } });
  console.log('✓ isi--warning-box-rinvoq.png');
  await p.close();
}

// ISI warning-box VRAYLAR (dual boxed warning)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.vraylar.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => document.querySelector('[id*="safety"], [id*="use"], [class*="isi"]')?.scrollIntoView());
  await p.waitForTimeout(1500);
  await p.screenshot({ path: OUT + 'isi--warning-box-dual-vraylar.png', clip: { x:0, y:0, width:1440, height:700 } });
  console.log('✓ isi--warning-box-dual-vraylar.png');
  await p.close();
}

// ── SUBNAV VARIATIONS ─────────────────────────────────────────

// Section navigation (QULIPTA HCP powerful-reductions)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.quliptahcp.com/powerful-reductions', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollTo(0, 500));
  await p.waitForTimeout(1000);
  await elShot(p, '[class*="section-navigation"], [class*="abbv-section-nav"]', 'subnav--section-navigation-qulipta.png', 100, 80);
  await p.close();
}

// Condition sub-nav (VENCLEXTA side effects page)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.venclexta.com/previously-untreated-cll/possible-side-effects', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.screenshot({ path: OUT + 'subnav--condition-venclexta.png', clip: { x:0, y:80, width:1440, height:110 } });
  console.log('✓ subnav--condition-venclexta.png');
  await p.close();
}

// Condition sub-nav (RINVOQ eczema page)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.rinvoq.com/atopic-dermatitis/about-eczema/what-is-eczema', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.screenshot({ path: OUT + 'subnav--condition-rinvoq.png', clip: { x:0, y:70, width:1440, height:110 } });
  console.log('✓ subnav--condition-rinvoq.png');
  await p.close();
}

// Page-sections anchor tabs (LINZESS why-linzess)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.linzess.com/why-linzess', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollTo(0, 400));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: OUT + 'subnav--page-sections-linzess.png', clip: { x:0, y:0, width:1440, height:130 } });
  console.log('✓ subnav--page-sections-linzess.png');
  await p.close();
}

// ── TABS VARIATIONS ──────────────────────────────────────────

// Tabs efficacy (QULIPTA HCP powerful-reductions)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.quliptahcp.com/powerful-reductions', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 1200));
  await p.waitForTimeout(1000);
  await elShot(p, '.abbv-tabs, [class*="abbv-tabs"]', 'tabs--efficacy-qulipta.png', 1100, 600);
  await p.close();
}

// Tabs insurance type (SKYRIZI ways-to-save)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.skyrizi.com/skyrizi-complete/gastro/ways-to-save', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 3000));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: OUT + 'tabs--insurance-skyrizi.png', clip: { x:0, y:0, width:1440, height:700 } });
  console.log('✓ tabs--insurance-skyrizi.png');
  await p.close();
}

// Tabs indication switcher (VRAYLAR why-vraylar)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.vraylar.com/amdd/why-vraylar', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.screenshot({ path: OUT + 'tabs--indication-vraylar.png', clip: { x:0, y:70, width:1440, height:120 } });
  console.log('✓ tabs--indication-vraylar.png');
  await p.close();
}

// ── ACCORDION VARIATIONS ──────────────────────────────────────

// References accordion (QULIPTA HCP)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.quliptahcp.com/patient-stories', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => document.querySelector('[class*="accordion-references"]')?.scrollIntoView());
  await p.waitForTimeout(1200);
  await elShot(p, '[class*="accordion-references"]', 'accordion--references-qulipta.png', 3000, 200);
  await p.close();
}

// Study design accordion (QULIPTA HCP)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.quliptahcp.com/powerful-reductions', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => document.querySelector('[class*="accordion-design"]')?.scrollIntoView());
  await p.waitForTimeout(1200);
  await elShot(p, '[class*="accordion-design"]', 'accordion--study-design-qulipta.png', 1000, 200);
  await p.close();
}

// FAQ accordion (SKYRIZI)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.skyrizi.com/skyrizi-complete/gastro/ways-to-save', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 4000));
  await p.waitForTimeout(1200);
  await p.screenshot({ path: OUT + 'accordion--faq-skyrizi.png', clip: { x:0, y:0, width:1440, height:700 } });
  console.log('✓ accordion--faq-skyrizi.png');
  await p.close();
}

// Myth-fact accordion (VRAYLAR)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.vraylar.com/amdd/why-vraylar', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 4000));
  await p.waitForTimeout(1200);
  await p.screenshot({ path: OUT + 'accordion--myth-fact-vraylar.png', clip: { x:0, y:0, width:1440, height:600 } });
  console.log('✓ accordion--myth-fact-vraylar.png');
  await p.close();
}

// Legal T&C accordion (SKYRIZI)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.skyrizi.com/skyrizi-complete/gastro/ways-to-save', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 2000));
  await p.waitForTimeout(1200);
  await p.screenshot({ path: OUT + 'accordion--legal-tc-skyrizi.png', clip: { x:0, y:0, width:1440, height:500 } });
  console.log('✓ accordion--legal-tc-skyrizi.png');
  await p.close();
}

// ── QUIZ VARIATIONS ──────────────────────────────────────────

// Branching poll hero (HepC)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.hepc.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await elShot(p, '[class*="abbv-info-tree"], [class*="info-tree"], [class*="hepc-qa"]', 'quiz--branching-poll-hepc.png', 200, 500);
  await p.close();
}

// Info tree (QULIPTA DTC)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.qulipta.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => document.querySelector('[class*="info-tree"], [class*="infotree"]')?.scrollIntoView());
  await p.waitForTimeout(1200);
  await elShot(p, '[class*="info-tree"], [class*="infotree"]', 'quiz--infotree-qulipta.png', 1200, 600);
  await p.close();
}

// Symptom quiz (RINVOQ eczema)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.rinvoq.com/atopic-dermatitis/about-eczema/what-is-eczema', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollBy(0, 600));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: OUT + 'quiz--symptom-assessment-rinvoq.png', clip: { x:0, y:0, width:1440, height:700 } });
  console.log('✓ quiz--symptom-assessment-rinvoq.png');
  await p.close();
}

// ── CHART VARIATIONS ─────────────────────────────────────────

// Donut pie chart (QULIPTA HCP)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.quliptahcp.com/powerful-reductions', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => document.querySelector('[class*="interactive-chart"], [class*="abbv-chart"]')?.scrollIntoView());
  await p.waitForTimeout(2000);
  await elShot(p, '[class*="interactive-chart"]', 'chart--donut-pie-qulipta.png', 2000, 500);
  await p.close();
}

// Solid pie chart (HepC)
{
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('https://www.hepc.com/how-hep-c-transmitted', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => document.querySelector('[class*="interactive-chart"], [class*="abbv-chart"], [class*="hep-c-pie"]')?.scrollIntoView());
  await p.waitForTimeout(2000);
  await elShot(p, '[class*="hep-c-pie"], [class*="interactive-chart"]', 'chart--pie-solid-hepc.png', 2000, 500);
  await p.close();
}

await browser.close();
console.log('Group 3 done');
