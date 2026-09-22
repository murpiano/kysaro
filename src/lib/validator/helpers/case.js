const {CASE_TYPES} = require('../const');

/**
 * Case checks for identifiers: type, scope, footer token.
 * The whole value must match.
 */
const IDENTIFIER_CASE = {
  [CASE_TYPES.LOWER]: value => value === value.toLowerCase(),
  [CASE_TYPES.UPPER]: value => value === value.toUpperCase(),
  [CASE_TYPES.SENTENCE]: value => value === toSentence(value),
  [CASE_TYPES.KEBAB]: value => /^[\p{Ll}\d]+(-[\p{Ll}\d]+)*$/u.test(value),
  [CASE_TYPES.SNAKE]: value => /^[\p{Ll}\d]+(_[\p{Ll}\d]+)*$/u.test(value),
  [CASE_TYPES.CAMEL]: value => /^\p{Ll}[\p{L}\d]*$/u.test(value),
  [CASE_TYPES.PASCAL]: value => /^\p{Lu}[\p{L}\d]*$/u.test(value)
};

/**
 * Case checks for text: subject, footer value.
 * `lower` and `sentence` check the first letter only.
 */
const TEXT_CASE = {
  [CASE_TYPES.LOWER]: value => firstChar(value) === firstChar(value).toLowerCase(),
  [CASE_TYPES.SENTENCE]: value => firstChar(value) === firstChar(value).toUpperCase(),
  [CASE_TYPES.UPPER]: value => value === value.toUpperCase()
};

const IDENTIFIER_CONVERT = {
  [CASE_TYPES.LOWER]: value => value.toLowerCase(),
  [CASE_TYPES.UPPER]: value => value.toUpperCase(),
  [CASE_TYPES.SENTENCE]: value => toSentence(value)
};

const TEXT_CONVERT = {
  [CASE_TYPES.LOWER]: value => firstChar(value).toLowerCase() + value.slice(firstChar(value).length),
  [CASE_TYPES.SENTENCE]: value => firstChar(value).toUpperCase() + value.slice(firstChar(value).length),
  [CASE_TYPES.UPPER]: value => value.toUpperCase()
};

function firstChar(value) {
  return Array.from(value)[0] || '';
}

function toSentence(value) {
  const first = firstChar(value);

  return first.toUpperCase() + value.slice(first.length).toLowerCase();
}

/**
 * Checks a value against a case rule.
 *
 * @param {string} value
 * @param {string} caseType Case name from settings.
 * @param {Object} [options]
 * @param {boolean} [options.text=false] Use text rules instead of identifier rules.
 * @param {string|null} [options.sourceValue=null] Expected spelling for `match-source`.
 * @returns {{ok:boolean, expected:string|null}} `expected` is the fixed value when it can be derived.
 */
function checkCase(value, caseType, {text = false, sourceValue = null} = {}) {
  if (!caseType || caseType === CASE_TYPES.ANY || typeof value !== 'string' || value === '') {
    return {ok: true, expected: null};
  }

  if (caseType === CASE_TYPES.MATCH_SOURCE) {
    if (sourceValue === null || value === sourceValue) {
      return {ok: true, expected: null};
    }

    return {ok: false, expected: sourceValue};
  }

  const checks = text ? TEXT_CASE : IDENTIFIER_CASE;
  const converters = text ? TEXT_CONVERT : IDENTIFIER_CONVERT;
  const check = checks[caseType];

  if (!check || check(value)) {
    return {ok: true, expected: null};
  }

  const convert = converters[caseType];

  return {ok: false, expected: convert ? convert(value) : null};
}

module.exports = {
  checkCase
};
