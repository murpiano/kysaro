const { fixMessage } = require('../fixerwqqwqwqw');
const { buildMessage } = require('../builder');


const fix = (parsed, context, validate, initialErrors) => {

  if (initialErrors.errors.length === 0) {
    return {
      parsed,
      errors: [],
      appliedFixes: [],
      isValid: true
    };
  }

  const {
          ast: fixedAst,
          appliedFixes,
          errors: finalErrors
        } = fixMessage(parsed, context, validate);


  const commit = buildMessage(fixedAst);
  return {
    commit,
    ast: fixedAst,
    initialErrors: initialErrors.errors,
    errors: finalErrors,
    appliedFixes,
    isValid: finalErrors.length === 0
  };
}

module.exports = { fix };
