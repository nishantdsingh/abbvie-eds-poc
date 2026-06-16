import { applyCommonProps } from '../../scripts/utils.js';

// ─── Chart.js lazy loader ─────────────────────────────────────────────────────
const CHARTJS_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';
let chartJSPromise = null;

function loadChartJS() {
  if (window.Chart) return Promise.resolve(window.Chart);
  if (!chartJSPromise) {
    chartJSPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = CHARTJS_CDN;
      s.onload = () => resolve(window.Chart);
      s.onerror = reject;
      document.head.append(s);
    });
  }
  return chartJSPromise;
}

// ─── DOM helpers ─────────────────────────────────────────────────────────────

function cellText(row, idx = 0) {
  return row?.children[idx]?.textContent?.trim() || '';
}

function cellNumber(row, idx = 0) {
  const v = parseFloat(cellText(row, idx));
  return Number.isNaN(v) ? undefined : v;
}

// ─── Config reader ────────────────────────────────────────────────────────────
// Parent model fields render as the first N rows of the block (in field order).
// Tabs do not produce rows; only non-tab, non-classes fields do.
// Field order (non-tab): classes_type(→CSS), classes(→CSS),
//   chartTitle[0], legendTitle[1], yAxisLabel[2], xAxisLabel[3],
//   yAxisMin[4], yAxisMax[5], yAxisStep[6],
//   accessibilitySummary[7], analyticsInteractionId[8], anchorId[9]
const CFG = {
  CHART_TITLE: 0,
  LEGEND_TITLE: 1,
  Y_AXIS_LABEL: 2,
  X_AXIS_LABEL: 3,
  Y_AXIS_MIN: 4,
  Y_AXIS_MAX: 5,
  Y_AXIS_STEP: 6,
  A11Y_SUMMARY: 7,
  ANALYTICS_ID: 8,
  ANCHOR_ID: 9,
  COUNT: 10,
};

function readConfig(block) {
  const rows = [...block.children];
  const cfg = rows.slice(0, CFG.COUNT);
  return {
    chartTitle: cellText(cfg[CFG.CHART_TITLE]),
    legendTitle: cellText(cfg[CFG.LEGEND_TITLE]),
    yAxisLabel: cellText(cfg[CFG.Y_AXIS_LABEL]),
    xAxisLabel: cellText(cfg[CFG.X_AXIS_LABEL]),
    yAxisMin: cellNumber(cfg[CFG.Y_AXIS_MIN]),
    yAxisMax: cellNumber(cfg[CFG.Y_AXIS_MAX]),
    yAxisStep: cellNumber(cfg[CFG.Y_AXIS_STEP]),
    a11ySummary: cellText(cfg[CFG.A11Y_SUMMARY]) || 'View chart data as table',
    analyticsId: cellText(cfg[CFG.ANALYTICS_ID]),
    anchorId: cellText(cfg[CFG.ANCHOR_ID]),
    itemRows: rows.slice(CFG.COUNT),
  };
}

// ─── Data-point reader ────────────────────────────────────────────────────────
// chart-item field order: label[0], value[1], valueLabel[2], dataset[3], color[4]

function readItems(itemRows) {
  return itemRows.map((row) => ({
    label: cellText(row, 0),
    value: parseFloat(cellText(row, 1)) || 0,
    valueLabel: cellText(row, 2),
    dataset: cellText(row, 3) || '',
    color: cellText(row, 4),
  })).filter((d) => d.label);
}

// ─── Default palette ──────────────────────────────────────────────────────────
const PALETTE = [
  'var(--chart-color-0, #003087)',
  'var(--chart-color-1, #7bafd4)',
  'var(--chart-color-2, #00a651)',
  'var(--chart-color-3, #ffc107)',
  'var(--chart-color-4, #e91e63)',
  'var(--chart-color-5, #9c27b0)',
  'var(--chart-color-6, #ff5722)',
  'var(--chart-color-7, #00bcd4)',
];

function paletteColor(idx, override) {
  return override || PALETTE[idx % PALETTE.length];
}

// ─── Dataset grouper ──────────────────────────────────────────────────────────

function groupByDataset(items) {
  const map = new Map();
  items.forEach((item) => {
    const key = item.dataset || '__default__';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return [...map.entries()];
}

// ─── Chart.js config builder ──────────────────────────────────────────────────

function buildChartConfig(type, items, cfg, block) {
  const isPie = type === 'pie' || type === 'doughnut';
  const animate = block.classList.contains('animate');
  const showLegend = block.classList.contains('show-legend');

  if (isPie) {
    return {
      type,
      data: {
        labels: items.map((d) => d.label),
        datasets: [{
          data: items.map((d) => d.value),
          backgroundColor: items.map((d, i) => paletteColor(i, d.color)),
          borderColor: 'var(--chart-slice-border, #fff)',
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        animation: animate ? { duration: 800 } : false,
        plugins: {
          legend: { display: showLegend, position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const item = items[ctx.dataIndex];
                const display = item.valueLabel || item.value;
                return ` ${item.label}: ${display}`;
              },
            },
          },
        },
      },
    };
  }

  // Bar / Line — group items by dataset name for multi-series
  const groups = groupByDataset(items);
  const isMulti = groups.some(([name]) => name !== '__default__');
  const labels = isMulti
    ? [...new Set(items.map((d) => d.label))]
    : items.map((d) => d.label);

  const datasets = groups.map(([name, dsItems], i) => {
    const color = paletteColor(i, dsItems[0]?.color);
    const dataMap = new Map(dsItems.map((d) => [d.label, d]));
    return {
      label: name === '__default__' ? '' : name,
      data: labels.map((lbl) => dataMap.get(lbl)?.value ?? null),
      backgroundColor: type === 'line' ? `${color}33` : color,
      borderColor: color,
      borderWidth: 2,
      fill: false,
      tension: 0.35,
      pointRadius: type === 'line' ? 4 : 0,
      pointHoverRadius: type === 'line' ? 6 : 0,
    };
  });

  const isHorizontal = block.classList.contains('horizontal');

  return {
    type: type === 'bar' && isHorizontal ? 'bar' : type,
    data: { labels, datasets },
    options: {
      indexAxis: isHorizontal && type === 'bar' ? 'y' : 'x',
      responsive: true,
      animation: animate ? { duration: 800 } : false,
      plugins: {
        legend: {
          display: showLegend && isMulti,
          position: 'bottom',
          title: cfg.legendTitle
            ? { display: true, text: cfg.legendTitle, padding: { bottom: 6 } }
            : { display: false },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const dsItems = groups[ctx.datasetIndex]?.[1] || [];
              const item = dsItems.find((d) => d.label === labels[ctx.dataIndex]);
              const display = item?.valueLabel || ctx.raw;
              const prefix = ctx.dataset.label ? `${ctx.dataset.label}: ` : '';
              return ` ${prefix}${display}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: !!cfg.xAxisLabel,
            text: cfg.xAxisLabel,
          },
        },
        y: {
          title: {
            display: !!cfg.yAxisLabel,
            text: cfg.yAxisLabel,
          },
          min: cfg.yAxisMin,
          max: cfg.yAxisMax,
          ticks: cfg.yAxisStep ? { stepSize: cfg.yAxisStep } : undefined,
          beginAtZero: cfg.yAxisMin === undefined,
        },
      },
    },
  };
}

// ─── Accessibility table ──────────────────────────────────────────────────────

function buildA11yTable(type, items, cfg) {
  const isPie = type === 'pie' || type === 'doughnut';
  const details = document.createElement('details');
  details.className = 'chart-a11y';
  const summary = document.createElement('summary');
  summary.textContent = cfg.a11ySummary;
  details.append(summary);

  const table = document.createElement('table');

  if (isPie) {
    table.innerHTML = '<thead><tr><th scope="col">Category</th><th scope="col">Value</th></tr></thead>';
    const tbody = document.createElement('tbody');
    items.forEach((d) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${d.label}</td><td>${d.valueLabel || d.value}</td>`;
      tbody.append(tr);
    });
    table.append(tbody);
  } else {
    const groups = groupByDataset(items);
    const isMulti = groups.some(([name]) => name !== '__default__');
    const labels = isMulti
      ? [...new Set(items.map((d) => d.label))]
      : items.map((d) => d.label);

    if (isMulti) {
      const headerCells = `<th scope="col">Category</th>${groups.map(([name]) => `<th scope="col">${name}</th>`).join('')}`;
      table.innerHTML = `<thead><tr>${headerCells}</tr></thead>`;
      const tbody = document.createElement('tbody');
      labels.forEach((lbl) => {
        const tr = document.createElement('tr');
        const cells = groups.map(([, dsItems]) => {
          const match = dsItems.find((d) => d.label === lbl);
          return `<td>${match ? (match.valueLabel || match.value) : '–'}</td>`;
        }).join('');
        tr.innerHTML = `<td>${lbl}</td>${cells}`;
        tbody.append(tr);
      });
      table.append(tbody);
    } else {
      table.innerHTML = '<thead><tr><th scope="col">Category</th><th scope="col">Value</th></tr></thead>';
      const tbody = document.createElement('tbody');
      items.forEach((d) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${d.label}</td><td>${d.valueLabel || d.value}</td>`;
        tbody.append(tr);
      });
      table.append(tbody);
    }
  }

  details.append(table);
  return details;
}

// ─── GTM analytics ────────────────────────────────────────────────────────────

function setupAnalytics(canvas, cfg, type) {
  if (!cfg.analyticsId) return;
  const dl = () => { window.dataLayer = window.dataLayer || []; return window.dataLayer; };
  canvas.addEventListener('click', () => {
    dl().push({
      event: 'chart_interaction',
      chart_type: type,
      chart_id: cfg.analyticsId,
      chart_title: cfg.chartTitle,
    });
  });
}

// ─── Main decorate ────────────────────────────────────────────────────────────

export default async function decorate(block) {
  applyCommonProps(block);

  const type = ['line', 'pie', 'doughnut'].find((t) => block.classList.contains(t)) || 'bar';
  const cfg = readConfig(block);
  const items = readItems(cfg.itemRows);

  if (!items.length) return;

  if (cfg.anchorId) block.id = cfg.anchorId;

  // Build DOM shell
  const shell = document.createElement('div');
  shell.className = 'chart-shell';

  if (cfg.chartTitle) {
    const title = document.createElement('p');
    title.className = 'chart-title';
    title.textContent = cfg.chartTitle;
    shell.append(title);
  }

  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'chart-canvas-wrap';
  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', cfg.chartTitle || type);
  if (cfg.analyticsId) canvas.dataset.analyticsInteractionId = cfg.analyticsId;
  canvasWrap.append(canvas);
  shell.append(canvasWrap);
  shell.append(buildA11yTable(type, items, cfg));

  block.textContent = '';
  block.append(shell);

  // Initialise Chart.js when block enters viewport
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    observer.disconnect();
    loadChartJS().then(() => {
      // eslint-disable-next-line no-new
      new window.Chart(canvas, buildChartConfig(type, items, cfg, block));
      setupAnalytics(canvas, cfg, type);
    });
  });
  observer.observe(block);
}
