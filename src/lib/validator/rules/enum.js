const { ERROR_CODES, ERROR_MESSAGES, ERROR_CATEGORY } = require('../errors-const');
const {ISSUE_CODE, ISSUE_MESSAGE, ISSUE_SOURCE, ISSUE_CATEGORY} = require("../../../all/const/issue");

function createEnumStep({ value, enums }, path) {
  return (input) => {

    console.log(enums)
    const { type } = input;

    const result = {
      stop: false,
      issues: [],
      deterministicFixes: []
    };

    if (typeof type !== 'string') {

      result.issues.push({
        code: ISSUE_CODE.INVALID_TYPE,
        message: ISSUE_MESSAGE.INVALID_TYPE,
        severity: null,
        source: ISSUE_SOURCE.VALIDATOR,
        path,
        meta: {},
        category: ISSUE_CATEGORY.ENTITY
      });


      return ({
        ...result,
        stop: true
      });
    }

    if (!enums || enums.length === 0) return result;

    const isValid = enums.some(
      item => item.toLowerCase() === type.toLowerCase()
    );

    let allowed = null;
    if (enums) {
      allowed = enums;
    }

    if (!isValid) {


      result.issues.push({
        code: ISSUE_CODE.UNALLOWED_VALUE,
        message: ISSUE_MESSAGE.MUST_USE_ALLOWED,
        severity: null,
        source: ISSUE_SOURCE.VALIDATOR,
        path,
        meta: {validValue: allowed},
        category: ISSUE_CATEGORY.ENTITY
      });

      return ({
        ...result,
        stop: true
      });
    }

    return result;
  };
}

module.exports = { createEnumStep };
