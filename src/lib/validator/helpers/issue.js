const {ISSUE_SOURCE} = require('../../../all/const/issue');
const {FIX_KIND} = require('../../../all/const/const');

/**
 * Creates a validator issue. Severity is set later from `validator.severity`.
 *
 * @param {Object} params
 * @param {string} params.code
 * @param {string} params.message
 * @param {string} params.category
 * @param {string[]} params.path
 * @param {Object} [params.meta={}]
 * @returns {Object}
 */
function createIssue({code, message, category, path, meta = {}}) {
  return {
    code,
    message,
    severity: null,
    source: ISSUE_SOURCE.VALIDATOR,
    category,
    path,
    meta
  };
}

/**
 * Creates a deterministic fix candidate for the fixer stage.
 *
 * @param {Object} params
 * @param {string} params.type
 * @param {string[]} params.path
 * @param {string} params.from
 * @param {string} params.to
 * @param {string} params.rule Issue code that produced the fix.
 * @returns {Object}
 */
function createFix({type, path, from, to, rule}) {
  return {
    kind: FIX_KIND.DETERMINISTIC,
    type,
    path,
    from,
    to,
    rule
  };
}

/**
 * Collects issues and fixes of one section.
 *
 * @returns {{issue:Function, fix:Function, result:Function}}
 */
function createCollector() {
  const issues = [];
  const deterministicFixes = [];

  return {
    issue: params => issues.push(createIssue(params)),
    fix: params => deterministicFixes.push(createFix(params)),
    result: () => ({issues, deterministicFixes})
  };
}

module.exports = {
  createIssue,
  createFix,
  createCollector
};
