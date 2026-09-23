const {output} = require("../output");
const {isIgnored} = require("../ignore");
const {applyNormalizer} = require("../normalizer");
const {applyParser} = require("../parser");
const {applyValidator} = require("../validator");
const {ISSUE_MESSAGE, ISSUE_CODE, ISSUE_SEVERITY, ISSUE_SOURCE, ISSUE_CATEGORY} = require("../../all/const/issue");
const {createCommitContext} = require("../../all/commit-context/commit-context");
const {createConfiguration} = require("../../config");
const {resolveCommitType} = require("../../all/resolve-commit-type");
const {getSettings} = require("./settings");

/**
 * Output settings used when settings could not be loaded.
 */
const FALLBACK_OUTPUT = {invalid: 'return'};


function createInitialResult(raw) {
  return ({
    original: raw,
    generated: null,
    status: null,
    ignored: false,
    normalized: raw,
    parsed: null,
    issues: [],
    deterministicFixes: [],
    suggestedFixes: [],
    appliedFixes: [],
    insights: [],
    final: raw
  });
}

function isEmpty(raw) {
  return (!raw || raw.trim() === '');
}

function withIssue(result, issue) {
  return ({
    ...result,
    issues: [...result.issues, issue]
  });
}

function withEmptyError(result) {
  return withIssue(result, {
    code: ISSUE_CODE.MESSAGE_IS_EMPTY,
    message: ISSUE_MESSAGE.MESSAGE_IS_EMPTY,
    severity: ISSUE_SEVERITY.ERROR,
    source: ISSUE_SOURCE.PIPELINE,
    category: ISSUE_CATEGORY.STRUCTURE,
    path: [],
    meta: {}
  });
}

function withConfigurationError(result, loaderIssues) {
  return withIssue(result, {
    code: ISSUE_CODE.CONFIGURATION_ERROR,
    message: ISSUE_MESSAGE.CONFIGURATION_ERROR,
    severity: ISSUE_SEVERITY.ERROR,
    source: ISSUE_SOURCE.LOADER,
    category: ISSUE_CATEGORY.STRUCTURE,
    path: [],
    meta: {
      issues: loaderIssues.filter(issue => issue.severity === ISSUE_SEVERITY.ERROR)
    }
  });
}

function markIgnored(result) {
  return ({
    ...result,
    ignored: true
  });
}


/**
 * Runs a message through the pipeline:
 * normalizer → parser → ignore → validator → output.
 *
 * `generator`, `analyzer` and `fixer` are not connected yet.
 *
 * @param {string} [raw=''] Message to check.
 * @param {string|null} [manualCommitType=null] Message kind from `COMMIT_TYPE`; detected when `null`.
 * @param {Object} [configuration] Loader configuration, see `createConfiguration`.
 * @param {Object} [loaderOptions={}] Loader options (reports, CLI output).
 * @returns {Object} KysaroResult.
 * @throws {KysaroException} When `output.invalid` is `throw` and the message is invalid.
 */
function pipeline(raw = '', manualCommitType = null, configuration = createConfiguration(), loaderOptions = {}) {
  const commitType = resolveCommitType(manualCommitType);
  const {settings, issues: loaderIssues} = getSettings(configuration, loaderOptions);
  let result = createInitialResult(raw);

  if (!settings) {
    return output(FALLBACK_OUTPUT, withConfigurationError(result, loaderIssues));
  }

  const context = createCommitContext(settings, commitType);

  result = applyNormalizer(result, context);

  if (isEmpty(result.final)) {
    return output(settings.main.output, withEmptyError(result));
  }

  result = applyParser(result);

  if (isIgnored(result, context)) {
    return output(settings.main.output, markIgnored(result));
  }

  result = applyValidator(result, context);

  return output(settings.main.output, result);
}


module.exports = {pipeline};
