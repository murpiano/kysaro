const fs = require('fs');
const { buildHeader } = require('../builder');
const { validatorReportPath } = require('../../config');
const { formatDisplayPath } = require('../../OLD/LOADER/report/utils');
const { getBodyParagraphs } = require("../validator/validate/body");

// --------------------------------
// CONFIG
// --------------------------------
const MAX_PREVIEW = 80;

// --------------------------------
// HELPERS
// --------------------------------
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
}

// 🔴 BEFORE (2/3 ... 1/3)
function sliceWithEllipsisByWords(str, max = MAX_PREVIEW) {
  if (!str) return ' '.repeat(max);

  str = String(str).replace(/\n/g, ' ').trim();
  if (str.length <= max) return str.padEnd(max, ' ');

  const ellipsis = '...';
  const maxContent = max - ellipsis.length;

  const leftLen = Math.ceil(maxContent * 0.66);
  const rightLen = maxContent - leftLen;

  const left = str.slice(0, leftLen).trimEnd();
  const right = str.slice(-rightLen).trimStart();

  return `${left}${ellipsis}${right}`.padEnd(max, ' ');
}

// 🟢 AFTER (многострочный)
function formatMultiline(text) {
  if (!text) return '';

  return String(text)
      .split('\n')
      .map(line => `<div class="change-after-line">${escapeHtml(line)}</div>`)
      .join('');
}

function getByPath(obj, pathArr) {
  return pathArr.reduce((acc, key) => acc?.[key], obj);
}

function formatPath(pathArr) {
  return Array.isArray(pathArr) ? pathArr.join('.') : String(pathArr);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --------------------------------
// 🔥 PROBLEMS
// --------------------------------
function normalizeProblemPath(pathArr) {
  if (!Array.isArray(pathArr)) return '';

  const [section, ...rest] = pathArr;

  // header.type → type
  if (section === 'header' && rest.length) {
    return rest.join('.');
  }

  // footer/body → не дублируем (уже есть в заголовке)
  if (section === 'footer' || section === 'body') {
    return '';
  }

  return pathArr.join('.');
}

function formatProblem(err) {
  let parts = [];

  // ----------------------------
  // TOKENS
  // ----------------------------
  if (err.tokens) {
    const numsArr = err.tokens.map(i => i + 1);
    const nums = numsArr.join(',');

    const isSingle = numsArr.length === 1;

    const isValue =
        err.fix?.target === 'token-value' ||
        err.target === 'token-value';

    const isKey =
        err.fix?.target === 'token.key';

    if (isValue) {
      parts.push(`token value${isSingle ? '' : 's'} ${nums}`);
    } else if (isKey) {
      parts.push(`token key${isSingle ? '' : 's'} ${nums}`);
    } else {
      parts.push(`token${isSingle ? '' : 's'} ${nums}`);
    }
  }

      // ----------------------------
      // LINES
  // ----------------------------
  else if (err.lines) {
    const numsArr = err.lines.map(i => i + 1);
    const nums = numsArr.join(',');

    const isSingle = numsArr.length === 1;

    parts.push(`line${isSingle ? '' : 's'} ${nums}`);
  }

      // ----------------------------
      // PARAGRAPHS
  // ----------------------------
  else if (err.paragraphs) {
    const numsArr = err.paragraphs.map(i => i + 1);
    const nums = numsArr.join(',');

    const isSingle = numsArr.length === 1;

    parts.push(`paragraph${isSingle ? '' : 's'} ${nums}`);
  }

      // ----------------------------
      // FALLBACK (🔥 исправлено)
  // ----------------------------
  else {
    const normalized = normalizeProblemPath(err.path);
    if (normalized) {
      parts.push(normalized);
    }
  }

  if(parts.length === 0) parts.push(formatPath(err.path));

  const fullPath = parts.join(' ');


  return `<div class="problem-row">
  <span class="problem-path">${fullPath}</span>
  <span class="problem-message">${err.message}</span>
</div>`;
}

// --------------------------------
// 🔥 BODY PARAGRAPHS
// --------------------------------
function formatBodyParagraphs(originalAst, finalAst) {
  const beforeParagraphs = getBodyParagraphs(originalAst.body);
  const afterParagraphs  = getBodyParagraphs(finalAst.body);

  const maxLen = Math.max(beforeParagraphs.length, afterParagraphs.length);

  const rows = [];

  for (let i = 0; i < maxLen; i++) {
    const before = beforeParagraphs[i]?.raw || '';
    const after  = afterParagraphs[i]?.raw || '';

    if (!before && !after) continue;
    if (before === after) continue;

    rows.push(`<div class="change-row change-row-wrap">
<span class="change-label">paragraph ${i + 1}</span>
  <span class="change-values-wrap">
    <span class="change-before-block">${escapeHtml(sliceWithEllipsisByWords(before))}</span>
    <span class="change-arrow-block">→</span>
    <div class="change-after-block">
      ${formatMultiline(after)}
    </div>
  </span>
</div>`);
  }

  return rows.join('\n');
}

// --------------------------------
// 🔥 FOOTER TOKENS (главное)
// --------------------------------
function formatFooterChanges(originalAst, finalAst) {
  const beforeTokens = originalAst.footer?.tokens || [];
  const afterTokens  = finalAst.footer?.tokens || [];

  const rows = [];

  for (let i = 0; i < Math.max(beforeTokens.length, afterTokens.length); i++) {
    const before = beforeTokens[i];
    const after  = afterTokens[i];

    if (!before || !after) continue;

    const beforeStr = `${before.key}: ${before.value}`;
    const afterStr  = `${after.key}: ${after.value}`;

    if (beforeStr === afterStr) continue;

    rows.push(`<div class="change-row change-row-wrap">
<span class="change-label">token ${i + 1}</span>
  <span class="change-values-wrap">
    <span class="change-before-block">${escapeHtml(sliceWithEllipsisByWords(beforeStr))}</span>
    <span class="change-arrow-block">→</span>
    <div class="change-after-block">
      ${formatMultiline(afterStr)}
    </div>
  </span>
</div>`);
  }

  return rows.join('\n');
}

// --------------------------------
// 🔥 SIMPLE CHANGE (без footer)
// --------------------------------
function formatSimpleChange(fix, originalAst, finalAst) {
  if (fix.path[0] === 'footer') return null;

  let before = getByPath(originalAst, fix.path);
  let after  = getByPath(finalAst, fix.path);

  // --------------------------------
  // SPECIAL CASES
  // --------------------------------
  if (fix.path[0] === 'header' && fix.path.length === 1) {
    before = buildHeader(before);
    after  = buildHeader(after);
  }

  if (fix.path[0] === 'body' && fix.path.length === 1) {
    before = before?.lines?.join(' ') || '';
    after  = after?.lines?.join(' ') || '';
  }

  if (Array.isArray(before)) before = before.join(' ');
  if (Array.isArray(after))  after  = after.join(' ');

  if (before === after) return null;

  // --------------------------------
  // LABEL FIX
  // --------------------------------
  let label = formatPath(fix.path);

  if (fix.path[0] === 'header') {
    label = fix.path.slice(1).join('.') || 'header';
  }

  // --------------------------------
  // PREVIEW
  // --------------------------------
  const beforePreview = sliceWithEllipsisByWords(String(before));
  const afterPreview  = sliceWithEllipsisByWords(String(after));

  return `<div class="change-row">
  <span class="change-label">${label}</span>
  <span class="change-values">
    <span class="change-before-block">${escapeHtml(beforePreview)}</span>
    <span class="change-arrow">→</span>
    <span class="change-after">${escapeHtml(afterPreview)}</span>
  </span>
</div>`;
}

// --------------------------------
// MAIN
// --------------------------------
function generateReport(data) {
  const {
    raw,
    fixed,
    errors,
    appliedFixes,
    originalAst,
    finalAst,
    reportType = 'Standard Commit'
  } = data;

  const updateTime = new Date().toLocaleString();

  const headerLine =
      `## 🛠 bvtrots-dx: ${reportType} Report ` +
      `<span style="color: #6a737d; font-size: 12px; font-weight: bold;">` +
      `&nbsp;Last update:&nbsp;${updateTime}</span>`;

  // ----------------------------
  // PROBLEMS
  // ----------------------------
  const problems = Object.entries(groupBySection(errors)).map(
      ([section, items]) => {
        const rows = items.map(formatProblem).join('\n');
        return `#### ${capitalize(section)}\n\n${rows}`;
      }
  ).join('\n\n');

  // ----------------------------
  // CHANGES
  // ----------------------------
  const grouped = groupBySection(appliedFixes);

  const changes = Object.entries(grouped).map(
      ([section, items]) => {

        if (section === 'body') {
          const rows = formatBodyParagraphs(originalAst, finalAst);
          if (!rows) return null;
          return `#### Body\n\n${rows}`;
        }

        if (section === 'footer') {
          const rows = formatFooterChanges(originalAst, finalAst);
          if (!rows) return null;
          return `#### Footer\n\n${rows}`;
        }

        const rows = items.map(fix =>
            formatSimpleChange(fix, originalAst, finalAst)
        ).filter(Boolean).join('\n');

        if (!rows) return null;

        return `#### ${capitalize(section)}\n\n${rows}`;
      }
  ).filter(Boolean).join('\n\n');

  // ----------------------------
  // STYLES
  // ----------------------------
  const styles = `
<style>
  .change-row {
    display: flex;
    margin: 4px 0;
    font-family: monospace;
    font-size: 13px;
  }

  .change-row-wrap {
    align-items: flex-start;
  }

  .change-label {
    width: 160px;
    color: #6a737d;
    flex-shrink: 0;
  }

  .change-values-wrap {
    display: flex;
    align-items: flex-start;
  }

  .change-before-block {
    color: #d73a49;
    white-space: pre;
    width: 80ch;
    display: inline-block;
  }

  .change-arrow-block {
    margin: 0 8px;
  }
  
  .change-after {
  color: #28a745;
  white-space: pre;
}

  .change-after-block {
    color: #28a745;
  }

  .change-after-line {
    white-space: pre;
  }

  .problem-row {
    display: flex;
    margin: 4px 0;
    font-family: monospace;
    font-size: 13px;
  }

  .problem-path {
    width: 160px;
    color: #6a737d;
  }
</style>`;

  // ----------------------------
  // CONTENT
  // ----------------------------
  const content = `
${styles}

${headerLine}

---

### 🧾 Original

\`\`\`
${raw}
\`\`\`

---

### ❌ Problems

${problems || 'No problems'}

---

### 🔧 Changes

${changes || 'No changes'}

---

### 💡 Result

<span style="color:#d73a49;">✖ Before:</span>
\`\`\`
${raw}
\`\`\`

<span style="color:#28a745;">✔ After:</span>
\`\`\`
${fixed}
\`\`\`
`;

  fs.mkdirSync('.bvtrots-dx', { recursive: true });
  fs.writeFileSync(validatorReportPath, content.trim());

  return formatDisplayPath(validatorReportPath);
}

// --------------------------------
// utils
// --------------------------------
function groupBySection(items) {
  const map = {};
  items.forEach(item => {
    const section = item.path[0] || 'other';
    if (!map[section]) map[section] = [];
    map[section].push(item);
  });
  return map;
}

module.exports = { generateReport };
