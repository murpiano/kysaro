const {ERROR_CATEGORY} = require('../errors-const');
const {FIX_TYPES} = require('../../../all/const/issue');
const {PART_NAMES} = require('../const');

function createFooterLineLengthStep({ value }, path) {
  return (tokens) => {
    const max = value?.max;
    if (max === undefined || !tokens) return null;

    const tooLong = tokens
    .map((token, i) => {
      const lines = token.value.split('\n');

      const hasTooLongLine = lines.some((line, index) => {
        if (index === 0) {
          return (`${token.key}: ${line}`).length > max;
        }

        return line.length > max;
      });

      return {
        token,
        i,
        isTooLong: hasTooLongLine
      };
    })
     .filter(item => item.isTooLong);

    if (tooLong.length === 0) return null;

    const tokenNumbers = tooLong.map(item => item.i);

    return {
      errors: [{
        code: 'FOOTER_LINES_TOO_LONG',
        message: `each line must be <= ${max} chars`,
        category: ERROR_CATEGORY.LENGTH,
        fixable: true,
        lines: tokenNumbers,
        fix: {
          type: FIX_TYPES.WRAP,
          target: PART_NAMES.FOOTER,
          payload: { max }
        },
        path
      }]
    };
  };
}

module.exports = {
  createFooterLineLengthStep
}
