const {FIX_TYPES} = require('../../../all/const/issue');
const {ERROR_CATEGORY} = require('../errors-const');
const {PART_NAMES} = require('../const');

function createBodyLineLengthStep({ value }, path) {
  return (lines) => {
    const max = value?.max;
    if (max === undefined || !lines) return null;

    const tooLong = lines.map((line, i) => ({
      line,
      i
    })).filter(item => item.line.length > max);

    if (tooLong.length === 0) return null;

    const lineNumbers = tooLong.map(item => item.i);

    return {
      errors: [{
        code: 'BODY_LINES_TOO_LONG',
        message: `each line must be <= ${max} chars`,
        category: ERROR_CATEGORY.LENGTH,
        fixable: true,
        lines: lineNumbers,
        fix: {
          type: FIX_TYPES.WRAP,
          target: PART_NAMES.BODY,
          payload: { max }
        },
        path
      }]
    };
  };
}

module.exports = {
  createBodyLineLengthStep
}
