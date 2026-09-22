const {validateHeader} = require('./rules/header');
const {validateBody} = require('./rules/body');
const {validateFooter} = require('./rules/footer');
const {validateBreakingChange} = require('./rules/breaking-change');

/**
 * Validates parsed message against commit settings.
 *
 * @param {Object} ast Parsed message.
 * @param {Object} commitSettings Settings of the current message kind (`commit.json`).
 * @param {{types?:string[]|null, scopes?:string[]|null, tokens?:string[]|null}} [sources={}]
 *   Allowed values. `null` means any value is allowed.
 * @returns {{issues:Object[], deterministicFixes:Object[]}}
 */
function validateMessage(ast, commitSettings = {}, sources = {}) {
  const sections = [
    validateHeader(ast, commitSettings.header, sources),
    validateBody(ast, commitSettings.body),
    validateFooter(ast, commitSettings.footer, sources),
    validateBreakingChange(ast, commitSettings.breakingChange)
  ];

  return {
    issues: sections.flatMap(section => section.issues),
    deterministicFixes: sections.flatMap(section => section.deterministicFixes)
  };
}

/**
 * Pipeline stage: adds validator issues and fix candidates to the result.
 *
 * @param {Object} result Pipeline result with `parsed` set.
 * @param {Object} context Commit context.
 * @returns {Object}
 */
function applyValidator(result, context) {
  const rules = context.settings.main.validator || {};

  if (rules.enabled === false || !result.parsed) {
    return result;
  }

  const {issues, deterministicFixes} = validateMessage(
    result.parsed.ast,
    context.settings.commitSettings,
    context.sources
  );

  return {
    ...result,

    issues: [
      ...result.issues,
      ...issues.map(issue => ({...issue, severity: rules.severity || 'error'}))
    ],

    deterministicFixes: [
      ...result.deterministicFixes,
      ...deterministicFixes
    ]
  };
}

module.exports = {
  validateMessage,
  applyValidator
};
