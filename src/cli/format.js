const chalk = require('chalk');
const {buildHeader} = require('../lib/builder');
const {DETERMINISTIC_FIX_TYPE} = require('../all/const/const');
const {VALIDATE_STATUS} = require('../all/const/const');
const {ISSUE_SEVERITY} = require('../all/const/issue');

const NAME = '[kysaro]';

const ICON = {
  [ISSUE_SEVERITY.ERROR]: chalk.red('✖'),
  [ISSUE_SEVERITY.WARNING]: chalk.yellow('⚠')
};

const SUBJECT_TRANSFORM = {
  [DETERMINISTIC_FIX_TYPE.SENTENCE_CASE]: value => value.charAt(0).toUpperCase() + value.slice(1),
  [DETERMINISTIC_FIX_TYPE.LOWERCASE]: value => value.charAt(0).toLowerCase() + value.slice(1),
  [DETERMINISTIC_FIX_TYPE.UPPERCASE]: value => value.toUpperCase(),
  [DETERMINISTIC_FIX_TYPE.REMOVE]: value => value.replace(/\.+$/u, '')
};

const pathKey = path => (path || []).join('.');

/**
 * Applies header fix candidates to show a suggested header.
 *
 * @param {Object} result KysaroResult.
 * @returns {string|null} `null` when there is nothing to suggest.
 */
function suggestHeader(result) {
  const header = result.parsed?.ast?.header;

  if (!header || !header.type || !header.subject) {
    return null;
  }

  const next = {...header};

  result.deterministicFixes.forEach(fix => {
    const key = pathKey(fix.path);

    if (key === 'header.type') {
      next.type = fix.to;
    } else if (key === 'header.scope' && next.scope !== null) {
      next.scope = next.scope.split(fix.from).join(fix.to);
    } else if (key === 'header.subject') {
      const transform = SUBJECT_TRANSFORM[fix.type];
      next.subject = transform ? transform(next.subject) : fix.to;
    }
  });

  const suggested = buildHeader(next);

  return suggested === header.raw ? null : suggested;
}

function formatIssue(issue) {
  const location = pathKey(issue.path);
  const icon = ICON[issue.severity] || ICON[ISSUE_SEVERITY.WARNING];

  return `  ${icon} ${issue.message}${location ? chalk.gray(`  ${location}`) : ''}`;
}

/**
 * Formats a check result for the terminal.
 *
 * Valid and ignored messages without issues print nothing.
 *
 * @param {Object} result KysaroResult.
 * @returns {string}
 */
function formatResult(result) {
  const issues = result.issues.filter(issue => issue.severity);

  if (result.status === VALIDATE_STATUS.IGNORED || !issues.length) {
    return '';
  }

  const isInvalid = result.status === VALIDATE_STATUS.INVALID;
  const header = String(result.final || '').split('\n')[0];
  const lines = [];

  lines.push(isInvalid
    ? chalk.red.bold(`${NAME} ✖ Commit message is invalid`)
    : chalk.yellow.bold(`${NAME} ⚠ Commit message has warnings`));

  if (header) {
    lines.push('', `  ${chalk.white(header)}`);
  }

  lines.push('', ...issues.map(formatIssue));

  const suggested = suggestHeader(result);

  if (suggested) {
    lines.push('', `  ${chalk.green('Suggested header:')} ${suggested}`);
  }

  if (isInvalid) {
    lines.push('', chalk.gray('  Rules: https://github.com/murpiano/kysaro#rules'));
  }

  return lines.join('\n') + '\n';
}

module.exports = {
  formatResult,
  suggestHeader
};
