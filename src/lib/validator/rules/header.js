const {ISSUE_CATEGORY} = require('../../../all/const/issue');
const {DETERMINISTIC_FIX_TYPE} = require('../../../all/const/const');
const {buildHeader} = require('../../builder');
const {
  CASE_LABEL,
  CASE_TYPES,
  HEADER_FORMAT,
  ON_MULTIPLE,
  ON_UNKNOWN,
  PATH,
  SEPARATOR_SPACING,
  VALIDATOR_ISSUE_CODE: CODE
} = require('../const');
const {checkCase} = require('../helpers/case');
const {createCollector} = require('../helpers/issue');
const {lookup, formatAllowed} = require('../helpers/source');
const {isRequired} = require('../helpers/when');

const TYPE_PATH = [PATH.HEADER, PATH.TYPE];
const SCOPE_PATH = [PATH.HEADER, PATH.SCOPE];
const SUBJECT_PATH = [PATH.HEADER, PATH.SUBJECT];

const DEFAULT_SCOPE_SEPARATOR = ',';

const CASE_FIX_TYPE = {
  [CASE_TYPES.LOWER]: DETERMINISTIC_FIX_TYPE.LOWERCASE,
  [CASE_TYPES.UPPER]: DETERMINISTIC_FIX_TYPE.UPPERCASE,
  [CASE_TYPES.SENTENCE]: DETERMINISTIC_FIX_TYPE.SENTENCE_CASE,
  [CASE_TYPES.MATCH_SOURCE]: DETERMINISTIC_FIX_TYPE.REPLACE
};

function caseMessage(name, value, caseType, expected) {
  if (caseType === CASE_TYPES.MATCH_SOURCE) {
    return `${name} "${value}" must be written as "${expected}"`;
  }

  return `${name} "${value}" must be in ${CASE_LABEL[caseType] || caseType}`;
}

function validateFormat(header, settings, collect) {
  if (HEADER_FORMAT.test(header.raw)) {
    return;
  }

  collect.issue({
    code: CODE.HEADER_FORMAT,
    message: `Header must match "${settings.format || 'type(scope): subject'}"`,
    category: ISSUE_CATEGORY.FORMAT,
    path: [PATH.HEADER],
    meta: {expected: settings.format || null}
  });

  if (!header.type || !header.subject) {
    return;
  }

  const rebuilt = buildHeader(header);

  if (rebuilt !== header.raw && HEADER_FORMAT.test(rebuilt)) {
    collect.fix({
      type: DETERMINISTIC_FIX_TYPE.REPLACE,
      path: [PATH.HEADER],
      from: header.raw,
      to: rebuilt,
      rule: CODE.HEADER_FORMAT
    });
  }
}

function validateMaxLength(header, settings, collect) {
  const max = settings.maxLength;

  if (typeof max !== 'number' || header.raw.length <= max) {
    return;
  }

  collect.issue({
    code: CODE.HEADER_TOO_LONG,
    message: `Header is ${header.raw.length} characters long, maximum is ${max}`,
    category: ISSUE_CATEGORY.LENGTH,
    path: [PATH.HEADER],
    meta: {length: header.raw.length, max}
  });
}

function validateType(header, settings = {}, allowed, collect) {
  const {type} = header;

  if (!type) {
    collect.issue({
      code: CODE.TYPE_EMPTY,
      message: 'Type is missing',
      category: ISSUE_CATEGORY.STRUCTURE,
      path: TYPE_PATH
    });
    return;
  }

  const {known, match} = lookup(type, allowed);

  if (!known) {
    if (settings.onUnknown !== ON_UNKNOWN.IGNORE) {
      collect.issue({
        code: CODE.TYPE_UNKNOWN,
        message: `Type "${type}" is not allowed. Allowed: ${formatAllowed(allowed)}`,
        category: ISSUE_CATEGORY.ENTITY,
        path: TYPE_PATH,
        meta: {value: type, allowed}
      });
    }
    return;
  }

  const {ok, expected} = checkCase(type, settings.case, {sourceValue: match});

  if (ok) {
    return;
  }

  collect.issue({
    code: CODE.TYPE_CASE,
    message: caseMessage('Type', type, settings.case, expected),
    category: ISSUE_CATEGORY.FORMAT,
    path: TYPE_PATH,
    meta: {value: type, case: settings.case, expected}
  });

  if (expected) {
    collect.fix({
      type: CASE_FIX_TYPE[settings.case] || DETERMINISTIC_FIX_TYPE.REPLACE,
      path: TYPE_PATH,
      from: type,
      to: expected,
      rule: CODE.TYPE_CASE
    });
  }
}

function validateScopeSpacing(scope, separator, spacing, collect) {
  if (!spacing || spacing === SEPARATOR_SPACING.ALLOW) {
    return;
  }

  const parts = scope.split(separator).slice(1);
  const isValid = spacing === SEPARATOR_SPACING.REQUIRE
    ? parts.every(part => /^ \S/u.test(part))
    : parts.every(part => !/^\s/u.test(part));

  if (isValid) {
    return;
  }

  collect.issue({
    code: CODE.SCOPE_SEPARATOR_SPACING,
    message: spacing === SEPARATOR_SPACING.REQUIRE
      ? `Scopes must be separated by "${separator} "`
      : `Scopes must be separated by "${separator}" without spaces`,
    category: ISSUE_CATEGORY.FORMAT,
    path: SCOPE_PATH,
    meta: {value: scope, separator, spacing}
  });
}

/**
 * Splits raw scope into items according to `multiple` and `onMultiple`.
 *
 * @returns {string[]|null} Items to check one by one, or `null` to stop.
 */
function resolveScopeItems(scope, settings, collect) {
  const multiple = settings.multiple || {};
  const separator = multiple.separator || DEFAULT_SCOPE_SEPARATOR;
  const trimItems = multiple.trimItems !== false;
  const maxItems = typeof multiple.maxItems === 'number' ? multiple.maxItems : Infinity;
  const minItems = typeof multiple.minItems === 'number' ? multiple.minItems : 1;

  let items = scope.split(separator);

  if (trimItems) {
    items = items.map(item => item.trim());
  }

  if (items.length > maxItems) {
    if (settings.onMultiple === ON_MULTIPLE.FIRST) {
      return [items[0]];
    }

    if (settings.onMultiple !== ON_MULTIPLE.ERROR) {
      return [trimItems ? scope.trim() : scope];
    }

    collect.issue({
      code: CODE.SCOPE_TOO_MANY,
      message: `Header allows at most ${maxItems} scope(s), found ${items.length}`,
      category: ISSUE_CATEGORY.STRUCTURE,
      path: SCOPE_PATH,
      meta: {value: scope, count: items.length, max: maxItems}
    });
    return null;
  }

  if (items.length < minItems) {
    collect.issue({
      code: CODE.SCOPE_TOO_FEW,
      message: `Header needs at least ${minItems} scope(s), found ${items.length}`,
      category: ISSUE_CATEGORY.STRUCTURE,
      path: SCOPE_PATH,
      meta: {value: scope, count: items.length, min: minItems}
    });
  }

  if (items.length > 1) {
    validateScopeSpacing(scope, separator, multiple.separatorSpacing, collect);
  }

  if (multiple.disallowEmpty !== false && items.length > 1 && items.some(item => item.trim() === '')) {
    collect.issue({
      code: CODE.SCOPE_EMPTY_ITEM,
      message: `Scope list "${scope}" contains an empty value`,
      category: ISSUE_CATEGORY.FORMAT,
      path: SCOPE_PATH,
      meta: {value: scope}
    });
  }

  if (multiple.unique) {
    const seen = new Set();
    const duplicates = items.filter(item => {
      const key = item.toLowerCase();
      const isDuplicate = seen.has(key);
      seen.add(key);
      return isDuplicate;
    });

    if (duplicates.length) {
      collect.issue({
        code: CODE.SCOPE_DUPLICATE,
        message: `Scope "${duplicates[0]}" is repeated`,
        category: ISSUE_CATEGORY.FORMAT,
        path: SCOPE_PATH,
        meta: {value: scope, duplicates}
      });
    }
  }

  return items.filter(item => item.trim() !== '');
}

function validateScopeItem(item, settings, allowed, collect) {
  const {known, match} = lookup(item, allowed);

  if (!known) {
    if (settings.onUnknown !== ON_UNKNOWN.IGNORE) {
      collect.issue({
        code: CODE.SCOPE_UNKNOWN,
        message: `Scope "${item}" is not allowed. Allowed: ${formatAllowed(allowed)}`,
        category: ISSUE_CATEGORY.ENTITY,
        path: SCOPE_PATH,
        meta: {value: item, allowed}
      });
    }
    return;
  }

  const {ok, expected} = checkCase(item, settings.case, {sourceValue: match});

  if (ok) {
    return;
  }

  collect.issue({
    code: CODE.SCOPE_CASE,
    message: caseMessage('Scope', item, settings.case, expected),
    category: ISSUE_CATEGORY.FORMAT,
    path: SCOPE_PATH,
    meta: {value: item, case: settings.case, expected}
  });

  if (expected) {
    collect.fix({
      type: CASE_FIX_TYPE[settings.case] || DETERMINISTIC_FIX_TYPE.REPLACE,
      path: SCOPE_PATH,
      from: item,
      to: expected,
      rule: CODE.SCOPE_CASE
    });
  }
}

function validateScope(ast, settings = {}, allowed, collect) {
  const {scope} = ast.header;
  const isMissing = scope === null || scope.trim() === '';

  if (isMissing) {
    if (isRequired(settings.required, ast)) {
      collect.issue({
        code: CODE.SCOPE_REQUIRED,
        message: 'Scope is required',
        category: ISSUE_CATEGORY.STRUCTURE,
        path: SCOPE_PATH
      });
      return;
    }

    if (scope !== null && settings.allowEmpty === false) {
      collect.issue({
        code: CODE.SCOPE_EMPTY,
        message: 'Scope must not be empty. Remove "()" or add a scope',
        category: ISSUE_CATEGORY.FORMAT,
        path: SCOPE_PATH
      });
    }
    return;
  }

  const items = resolveScopeItems(scope, settings, collect);

  if (!items) {
    return;
  }

  items.forEach(item => validateScopeItem(item, settings, allowed, collect));
}

function validateSubject(header, settings = {}, collect) {
  const {subject} = header;

  if (!subject) {
    collect.issue({
      code: CODE.SUBJECT_EMPTY,
      message: 'Subject is missing',
      category: ISSUE_CATEGORY.STRUCTURE,
      path: SUBJECT_PATH
    });
    return;
  }

  if (typeof settings.minLength === 'number' && subject.length < settings.minLength) {
    collect.issue({
      code: CODE.SUBJECT_TOO_SHORT,
      message: `Subject is ${subject.length} characters long, minimum is ${settings.minLength}`,
      category: ISSUE_CATEGORY.LENGTH,
      path: SUBJECT_PATH,
      meta: {length: subject.length, min: settings.minLength}
    });
  }

  const {ok, expected} = checkCase(subject, settings.case, {text: true});

  if (!ok) {
    collect.issue({
      code: CODE.SUBJECT_CASE,
      message: settings.case === CASE_TYPES.SENTENCE
        ? 'Subject must start with an uppercase letter'
        : settings.case === CASE_TYPES.LOWER
          ? 'Subject must start with a lowercase letter'
          : `Subject must be in ${CASE_LABEL[settings.case] || settings.case}`,
      category: ISSUE_CATEGORY.FORMAT,
      path: SUBJECT_PATH,
      meta: {case: settings.case, expected}
    });

    if (expected) {
      collect.fix({
        type: CASE_FIX_TYPE[settings.case] || DETERMINISTIC_FIX_TYPE.REPLACE,
        path: SUBJECT_PATH,
        from: subject,
        to: expected,
        rule: CODE.SUBJECT_CASE
      });
    }
  }

  if (settings.disallowTrailingPeriod && subject.endsWith('.')) {
    collect.issue({
      code: CODE.SUBJECT_TRAILING_PERIOD,
      message: 'Subject must not end with a period',
      category: ISSUE_CATEGORY.SEMANTIC,
      path: SUBJECT_PATH
    });

    collect.fix({
      type: DETERMINISTIC_FIX_TYPE.REMOVE,
      path: SUBJECT_PATH,
      from: subject,
      to: subject.replace(/\.+$/u, ''),
      rule: CODE.SUBJECT_TRAILING_PERIOD
    });
  }

  if (settings.trim && /\s$/u.test(header.raw)) {
    collect.issue({
      code: CODE.SUBJECT_WHITESPACE,
      message: 'Subject must not end with whitespace',
      category: ISSUE_CATEGORY.FORMAT,
      path: SUBJECT_PATH
    });
  }
}

/**
 * Validates message header.
 *
 * @param {Object} ast Parsed message.
 * @param {Object} settings `header` block of commit settings.
 * @param {{types:string[]|null, scopes:string[]|null}} sources Allowed values.
 * @returns {{issues:Object[], deterministicFixes:Object[]}}
 */
function validateHeader(ast, settings = {}, sources = {}) {
  const collect = createCollector();
  const {header} = ast;

  validateFormat(header, settings, collect);
  validateMaxLength(header, settings, collect);

  if (header.type !== null || header.scope !== null) {
    validateType(header, settings.type, sources.types ?? null, collect);
    validateScope(ast, settings.scope, sources.scopes ?? null, collect);
    validateSubject(header, settings.subject, collect);
  }

  return collect.result();
}

module.exports = {
  validateHeader
};
