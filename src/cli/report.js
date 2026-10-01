const fs = require('fs');
const path = require('path');

const {COMMIT_TYPE, VALIDATE_STATUS} = require('../all/const/const');
const {ISSUE_CODE} = require('../all/const/issue');
const {DIRECTORY} = require('../config');
const {suggestHeader} = require('./format');

const REPORT_FILE = 'report.md';

/**
 * Where the checked message came from. Decides the fix instructions.
 */
const REPORT_MODE = {
  HOOK: 'hook',
  MESSAGE: 'message',
  RANGE: 'range',
  PULL_REQUEST: 'pull-request'
};

const STATUS_ICON = {
  [VALIDATE_STATUS.VALID]: '✔',
  [VALIDATE_STATUS.INVALID]: '✖',
  [VALIDATE_STATUS.IGNORED]: '➖'
};

const KIND_LABEL = {
  [COMMIT_TYPE.COMMIT]: 'commit',
  [COMMIT_TYPE.MERGE]: 'merge commit',
  [COMMIT_TYPE.REQUEST]: 'pull request'
};

const escapeCell = value => String(value ?? '').replace(/\|/gu, '\\|').replace(/\n/gu, ' ');

function issueLine(issue) {
  if (issue.meta?.line) {
    return issue.meta.line;
  }

  return issue.path?.[0] === 'header' ? 1 : '—';
}

function rulesFile(result, cwd) {
  if (!result.rules) {
    return '—';
  }

  const relative = path.join(...DIRECTORY.USER_SETTINGS, DIRECTORY.COMMITS, `${result.rules}.json`);

  return fs.existsSync(path.join(cwd, relative))
    ? `\`${relative.replace(/\\/gu, '/')}\``
    : `package default \`${result.rules}.json\``;
}

function suggestedMessage(result) {
  const header = suggestHeader(result);

  if (!header) {
    return null;
  }

  const lines = String(result.final || '').replace(/\n$/u, '').split('\n');

  return [header, ...lines.slice(1)].join('\n');
}

/**
 * Where a header part sits in the raw header line.
 *
 * @returns {{start:number, length:number}|null} `null` when the part is absent.
 */
function headerMarker(header, part) {
  if (part === 'type' && header.type) {
    return {start: 0, length: header.type.length};
  }

  if (part === 'scope' && header.scope) {
    const start = header.raw.indexOf(`(${header.scope})`);

    return start === -1 ? null : {start: start + 1, length: header.scope.length};
  }

  if (part === 'subject' && header.subject) {
    const start = header.raw.indexOf(': ');

    return start === -1 ? null : {start: start + 2, length: header.subject.length};
  }

  return null;
}

function markerLine(markers) {
  return markers.reduce((line, {start, length}) =>
    start < line.length ? line : line.padEnd(start, ' ') + '^'.repeat(Math.max(length, 1)), '');
}

/**
 * Message lines with a `^^^` line under the header parts that have problems.
 */
function messageLines(result, issues) {
  const lines = String(result.final || result.original || '').replace(/\n$/u, '').split('\n');
  const header = result.parsed?.ast?.header;

  if (!header?.raw) {
    return lines;
  }

  const markers = issues
    .filter(issue => issue.path?.[0] === 'header' && issue.path.length > 1)
    .map(issue => headerMarker(header, issue.path[1]))
    .filter(Boolean)
    .sort((first, second) => first.start - second.start);

  return markers.length ? [lines[0], markerLine(markers), ...lines.slice(1)] : lines;
}

function fixInstructions(entry, mode) {
  const {result, sha} = entry;

  if (result.issues.some(issue => issue.code === ISSUE_CODE.COMMIT_NOT_SQUASHED)) {
    return ['Squash the commit into the one it fixes: `git rebase -i --autosquash <base>`, then push with `--force-with-lease`.'];
  }

  if (mode === REPORT_MODE.PULL_REQUEST) {
    return ['Edit the pull request title or description on GitHub. The check runs again after the edit.'];
  }

  if (mode === REPORT_MODE.RANGE) {
    return [
      'Last commit: `git commit --amend`, then push with `--force-with-lease`.',
      `Earlier commit: \`git rebase -i ${sha ? sha.slice(0, 7) : '<sha>'}~1\`, mark the commit as \`reword\`, then push with \`--force-with-lease\`.`
    ];
  }

  if (mode === REPORT_MODE.HOOK) {
    if (result.kind === COMMIT_TYPE.MERGE) {
      return [
        'Finish the merge with a valid message: `git commit -e`.',
        'To avoid merge commits from `git pull`, use `git pull --rebase` or `git config pull.rebase true`.'
      ];
    }

    return ['Git kept the message in `.git/COMMIT_EDITMSG`. Fix it and commit again: `git commit -e -F .git/COMMIT_EDITMSG`.'];
  }

  return ['Fix the message and check it again.'];
}

function entrySection(entry, mode, cwd) {
  const {label, result} = entry;
  const issues = result.issues.filter(issue => issue.severity);
  const lines = [
    `## ${STATUS_ICON[result.status] || '⚠'} ${label} — ${result.status}`,
    '',
    '```text',
    ...messageLines(result, issues),
    '```'
  ];

  if (issues.length) {
    lines.push(
      '',
      '| Line | Section | Problem | Code |',
      '|---|---|---|---|',
      ...issues.map(issue =>
        `| ${issueLine(issue)} | ${escapeCell((issue.path || []).join('.') || '—')} | ${escapeCell(issue.message)} | \`${issue.code}\` |`)
    );
  }

  const suggested = suggestedMessage(result);

  if (suggested) {
    lines.push('', '### Write it like this', '', '```text', suggested, '```');
  }

  if (result.status === VALIDATE_STATUS.INVALID) {
    lines.push('', '### How to fix', '', ...fixInstructions(entry, entry.mode || mode).map(line => `- ${line}`));
  }

  lines.push(
    '',
    '---',
    '',
    `Kind: ${KIND_LABEL[result.kind] || '—'} · Rules: ${rulesFile(result, cwd)}`
  );

  return lines.join('\n');
}

/**
 * Builds the Markdown report of a check.
 *
 * A check of one message goes straight to that message; a check of many
 * starts with the count of invalid ones.
 *
 * @param {{label:string, result:Object, sha?:string, mode?:string}[]} entries Checked messages.
 *   `mode` of an entry overrides `params.mode`.
 * @param {Object} params
 * @param {string} params.mode Value of `REPORT_MODE`.
 * @param {string} params.cwd Project root.
 * @returns {string}
 */
function buildReport(entries, {mode, cwd}) {
  const invalid = entries.filter(({result}) => result.status === VALIDATE_STATUS.INVALID);
  const withIssues = entries.filter(({result}) => result.issues.some(issue => issue.severity));
  const status = invalid.length ? VALIDATE_STATUS.INVALID : VALIDATE_STATUS.VALID;
  const lines = ['# Kysaro report'];

  if (entries.length > 1) {
    lines.push('', `${STATUS_ICON[status]} ${invalid.length
      ? `${invalid.length} of ${entries.length} message(s) are invalid`
      : `${entries.length} message(s) checked, no errors`}`);
  } else if (!withIssues.length) {
    lines.push('', `${STATUS_ICON[status]} ${entries[0]?.label || 'Commit message'} — ${status}`);
  }

  withIssues.forEach(entry => {
    lines.push('', entrySection(entry, mode, cwd));
  });

  lines.push('', 'All rules: https://github.com/murpiano/kysaro#rules', '');

  return lines.join('\n');
}

/**
 * Writes the report to `.kysaro/report.md` when `.kysaro` exists and
 * appends it to the GitHub Actions job summary when available.
 *
 * @returns {string|null} Path of the written report file.
 */
function writeReport(markdown, {cwd, env = {}}) {
  let reportPath = null;
  const reportDir = path.join(cwd, DIRECTORY.USER);

  if (fs.existsSync(reportDir)) {
    reportPath = path.join(reportDir, REPORT_FILE);
    fs.writeFileSync(reportPath, markdown);
  }

  if (env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(env.GITHUB_STEP_SUMMARY, markdown + '\n');
  }

  return reportPath;
}

module.exports = {
  buildReport,
  writeReport,
  REPORT_MODE,
  REPORT_FILE
};
