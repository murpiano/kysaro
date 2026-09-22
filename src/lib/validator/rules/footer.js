const {ISSUE_CATEGORY} = require('../../../all/const/issue');
const {DETERMINISTIC_FIX_TYPE} = require('../../../all/const/const');
const {isBreakingToken} = require('../../parser');
const {
  CASE_LABEL,
  CASE_TYPES,
  ON_UNKNOWN,
  PATH,
  VALIDATOR_ISSUE_CODE: CODE
} = require('../const');
const {checkCase} = require('../helpers/case');
const {createCollector} = require('../helpers/issue');
const {lookup, formatAllowed} = require('../helpers/source');
const {isRequired} = require('../helpers/when');

const FOOTER_PATH = [PATH.FOOTER];

const BREAKING_CHANGE = 'BREAKING CHANGE';

const lineNumber = (section, index) => section.start + index + 1;

/**
 * `BREAKING-CHANGE` is a synonym of `BREAKING CHANGE`.
 */
function lookupToken(key, allowed) {
  const found = lookup(key, allowed);

  if (found.known || !isBreakingToken(key)) {
    return found;
  }

  return lookup(BREAKING_CHANGE, allowed);
}

function validateCount(footer, settings, collect) {
  const count = footer.tokens.length;
  const {minItems, maxItems} = settings.multiple || {};

  if (typeof maxItems === 'number' && count > maxItems) {
    collect.issue({
      code: CODE.FOOTER_TOO_MANY,
      message: `Footer allows at most ${maxItems} token(s), found ${count}`,
      category: ISSUE_CATEGORY.STRUCTURE,
      path: FOOTER_PATH,
      meta: {count, max: maxItems}
    });
  }

  if (typeof minItems === 'number' && count < minItems) {
    collect.issue({
      code: CODE.FOOTER_TOO_FEW,
      message: `Footer needs at least ${minItems} token(s), found ${count}`,
      category: ISSUE_CATEGORY.STRUCTURE,
      path: FOOTER_PATH,
      meta: {count, min: minItems}
    });
  }

  if (settings.uniqueTokens) {
    const seen = new Set();

    footer.tokens.forEach(token => {
      const key = token.key.toLowerCase();

      if (seen.has(key)) {
        collect.issue({
          code: CODE.FOOTER_DUPLICATE_TOKEN,
          message: `Footer token "${token.key}" is repeated`,
          category: ISSUE_CATEGORY.STRUCTURE,
          path: FOOTER_PATH,
          meta: {token: token.key}
        });
      }

      seen.add(key);
    });
  }
}

function validateLines(footer, settings, collect) {
  const max = settings.maxLineLength;

  if (typeof max !== 'number') {
    return;
  }

  footer.lines.forEach((line, index) => {
    if (line.length <= max) {
      return;
    }

    const line1 = lineNumber(footer, index);

    collect.issue({
      code: CODE.FOOTER_LINE_TOO_LONG,
      message: `Footer line ${line1} is ${line.length} characters long, maximum is ${max}`,
      category: ISSUE_CATEGORY.LENGTH,
      path: FOOTER_PATH,
      meta: {line: line1, length: line.length, max}
    });
  });
}

function validateToken(token, settings = {}, allowed, collect) {
  const {known, match} = lookupToken(token.key, allowed);

  if (!known) {
    if (settings.onUnknown !== ON_UNKNOWN.IGNORE) {
      collect.issue({
        code: CODE.FOOTER_TOKEN_UNKNOWN,
        message: `Footer token "${token.key}" is not allowed. Allowed: ${formatAllowed(allowed)}`,
        category: ISSUE_CATEGORY.ENTITY,
        path: FOOTER_PATH,
        meta: {token: token.key, allowed}
      });
    }
    return;
  }

  const sourceValue = isBreakingToken(token.key) ? token.key : match;
  const {ok, expected} = checkCase(token.key, settings.case, {sourceValue});

  if (ok) {
    return;
  }

  collect.issue({
    code: CODE.FOOTER_TOKEN_CASE,
    message: settings.case === CASE_TYPES.MATCH_SOURCE
      ? `Footer token "${token.key}" must be written as "${expected}"`
      : `Footer token "${token.key}" must be in ${CASE_LABEL[settings.case] || settings.case}`,
    category: ISSUE_CATEGORY.FORMAT,
    path: FOOTER_PATH,
    meta: {token: token.key, case: settings.case, expected}
  });

  if (expected) {
    collect.fix({
      type: DETERMINISTIC_FIX_TYPE.REPLACE,
      path: FOOTER_PATH,
      from: token.key,
      to: expected,
      rule: CODE.FOOTER_TOKEN_CASE
    });
  }
}

function validateValue(token, settings = {}, collect) {
  const {value} = token;

  if (typeof settings.minLength === 'number' && value.length < settings.minLength) {
    collect.issue({
      code: CODE.FOOTER_VALUE_TOO_SHORT,
      message: `Footer token "${token.key}" value is ${value.length} characters long, minimum is ${settings.minLength}`,
      category: ISSUE_CATEGORY.LENGTH,
      path: FOOTER_PATH,
      meta: {token: token.key, length: value.length, min: settings.minLength}
    });
  }

  const {ok, expected} = checkCase(value, settings.case, {text: true});

  if (!ok) {
    collect.issue({
      code: CODE.FOOTER_VALUE_CASE,
      message: `Footer token "${token.key}" value must be in ${CASE_LABEL[settings.case] || settings.case}`,
      category: ISSUE_CATEGORY.FORMAT,
      path: FOOTER_PATH,
      meta: {token: token.key, case: settings.case, expected}
    });
  }
}

/**
 * Validates message footer.
 *
 * @param {Object} ast Parsed message.
 * @param {Object} settings `footer` block of commit settings.
 * @param {{tokens:string[]|null}} sources Allowed values.
 * @returns {{issues:Object[], deterministicFixes:Object[]}}
 */
function validateFooter(ast, settings = {}, sources = {}) {
  const collect = createCollector();
  const {footer} = ast;

  if (!footer.tokens.length) {
    if (isRequired(settings.required, ast)) {
      collect.issue({
        code: CODE.FOOTER_REQUIRED,
        message: 'Footer is required',
        category: ISSUE_CATEGORY.STRUCTURE,
        path: FOOTER_PATH
      });
    }

    return collect.result();
  }

  if (settings.blankLineBefore && footer.blankLineBefore === false) {
    collect.issue({
      code: CODE.FOOTER_LEADING_BLANK,
      message: 'Footer must be separated from the body by a blank line',
      category: ISSUE_CATEGORY.FORMAT,
      path: FOOTER_PATH,
      meta: {line: lineNumber(footer, 0)}
    });
  }

  validateCount(footer, settings, collect);
  validateLines(footer, settings, collect);

  footer.tokens.forEach(token => {
    validateToken(token, settings.token, sources.tokens ?? null, collect);
    validateValue(token, settings.value, collect);
  });

  return collect.result();
}

module.exports = {
  validateFooter
};
