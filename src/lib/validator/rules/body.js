const {ISSUE_CATEGORY} = require('../../../all/const/issue');
const {PATH, VALIDATOR_ISSUE_CODE: CODE} = require('../const');
const {createCollector} = require('../helpers/issue');
const {isRequired} = require('../helpers/when');

const BODY_PATH = [PATH.BODY];

/**
 * Converts index inside the section into a 1-based message line number.
 */
const lineNumber = (section, index) => section.start + index + 1;

function validateLines(body, settings, collect) {
  const max = settings.maxLineLength;
  let emptyRun = 0;

  body.lines.forEach((line, index) => {
    const line1 = lineNumber(body, index);

    if (typeof max === 'number' && line.length > max) {
      collect.issue({
        code: CODE.BODY_LINE_TOO_LONG,
        message: `Body line ${line1} is ${line.length} characters long, maximum is ${max}`,
        category: ISSUE_CATEGORY.LENGTH,
        path: BODY_PATH,
        meta: {line: line1, length: line.length, max}
      });
    }

    if (settings.trim && line !== '' && line !== line.trimEnd()) {
      collect.issue({
        code: CODE.BODY_WHITESPACE,
        message: `Body line ${line1} ends with whitespace`,
        category: ISSUE_CATEGORY.FORMAT,
        path: BODY_PATH,
        meta: {line: line1}
      });
    }

    emptyRun = line.trim() === '' ? emptyRun + 1 : 0;

    if (typeof settings.maxConsecutiveEmptyLines === 'number' && emptyRun === settings.maxConsecutiveEmptyLines + 1) {
      collect.issue({
        code: CODE.BODY_EMPTY_LINES,
        message: `Body has more than ${settings.maxConsecutiveEmptyLines} empty line(s) in a row at line ${line1}`,
        category: ISSUE_CATEGORY.FORMAT,
        path: BODY_PATH,
        meta: {line: line1, max: settings.maxConsecutiveEmptyLines}
      });
    }
  });
}

/**
 * Validates message body.
 *
 * @param {Object} ast Parsed message.
 * @param {Object} settings `body` block of commit settings.
 * @returns {{issues:Object[], deterministicFixes:Object[]}}
 */
function validateBody(ast, settings = {}) {
  const collect = createCollector();
  const {body} = ast;

  if (!body.lines.length) {
    if (isRequired(settings.required, ast)) {
      collect.issue({
        code: CODE.BODY_REQUIRED,
        message: 'Body is required',
        category: ISSUE_CATEGORY.STRUCTURE,
        path: BODY_PATH
      });
    }

    return collect.result();
  }

  if (settings.blankLineBefore && body.blankLineBefore === false) {
    collect.issue({
      code: CODE.BODY_LEADING_BLANK,
      message: 'Body must be separated from the header by a blank line',
      category: ISSUE_CATEGORY.FORMAT,
      path: BODY_PATH,
      meta: {line: lineNumber(body, 0)}
    });
  }

  validateLines(body, settings, collect);

  return collect.result();
}

module.exports = {
  validateBody
};
