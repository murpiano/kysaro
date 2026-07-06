const {ISSUE_CODE, ISSUE_MESSAGE, ISSUE_SOURCE, ISSUE_CATEGORY} = require('../../../all/const/issue');
const {RULE_NAME} = require("../const");
const {DETERMINISTIC_FIX_TYPE, FIX_KIND} = require("../../../all/const/const");

function createFormatStep({ value }, path) {
  return (input) => {
    const { raw, builtHeader } = input;

    const result = {
      stop: false,
      issues: [],
      deterministicFixes: []
    };

    if (typeof raw !== 'string') {
      return result;
    }

    const isValid =
        /^[^\s()]+(\([^\s()]+\))?: .+$/.test(raw);

    if (isValid) {
      return result;
    }

    result.issues.push({
      code: ISSUE_CODE.INVALID_FORMAT,
      message: `${ISSUE_MESSAGE.INVALID_FORMAT} ${value ? `"${value}"` : ''}`,
      severity: null,
      source: ISSUE_SOURCE.VALIDATOR,
      path,
      meta: {},
      category: ISSUE_CATEGORY.FORMAT
    });

    const recovered =
        builtHeader &&
        builtHeader !== raw &&
        /^[^\s()]+(\([^\s()]+\))?: .+$/.test(builtHeader);

    if (!recovered) {
      return {
        ...result,
        stop: true
      };
    }

    result.deterministicFixes.push({
      kind: FIX_KIND.DETERMINISTIC,
      type: DETERMINISTIC_FIX_TYPE.REPLACE,
      path,
      from: raw,
      to: builtHeader,
      rule: RULE_NAME.FORMAT
    });

    return result;
  };
}

module.exports = { createFormatStep };
