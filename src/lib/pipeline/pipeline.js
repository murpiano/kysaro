const {output, ERROR_CODE} = require("../output");
const {ignore, isIgnored} = require("../ignore");
const {applyGenerator} = require("../generator");
const {applyNormalizer} = require("../normalizer");
const {applyParser} = require("../parser");
const {applyValidator} = require("../validator/validator");
const {applyAnalyzer} = require("../analyzer");
const {applyFixer} = require("../fixer");
const {ISSUE_MESSAGE, ISSUE_CODE, ISSUE_SEVERITY, ISSUE_SOURCE, VALIDATE_STATUS} = require("../../all/const/issue");
const {createCommitContext} = require("../../all/commit-context/commit-context");
const {createConfiguration} = require("../../config");
const {resolveCommitType} = require("../../all/resolve-commit-type");
const {getSettings} = require("./settings");


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

function withEmptyError(result) {
  const emptyIssue = {
    message: ISSUE_MESSAGE.MESSAGE_IS_EMPTY,
    code: ISSUE_CODE.MESSAGE_IS_EMPTY,
    severity: ISSUE_SEVERITY.ERROR,
    source: ISSUE_SOURCE.PIPELINE
  };

  return ({
    ...result,
    issues: [...result.issues, emptyIssue]
  })
}

function markIgnored(result) {
  return ({
    ...result,
    ignored: true
  })
}


function pipeline(raw = '', manualCommitType = null, configuration = createConfiguration()) {
  const commitType = resolveCommitType(manualCommitType);
  const settings = getSettings(configuration, commitType);
  let result = createInitialResult(raw);
  // console.log('commitType:', commitType)
  // console.log('settings:', settings)
  const context = createCommitContext(settings);
  // console.log('context:', context)
  //
  //
  result = applyGenerator(result, context);
  // result = applyNormalizer(result, context);
  //
  // console.log(result)

  // if (isEmpty(result.final)) {
  //   return output(settings.main.output, withEmptyError(result))
  // }
  // result = applyParser(result);
  //
  // if (isIgnored(result, context)) {
  //   return output(settings.main.output, markIgnored(result));
  // }
  //
  // result = applyValidator(result, context);
  // // result = applyAnalyzer(result, context);
  // // result = applyFixer(result, context);
  //
  return output(settings.main.output, result);
}


module.exports = {pipeline};
