const {ERROR_CATEGORY} = require('../errors-const');
const {FIX_TYPES} = require('../../../all/const/issue');
const {PART_NAMES} = require('../const');

function createFooterFormatStep({ value }, path) {
  return (footer) => {
    const errors = [];
    const {raw} = footer;

    if (raw.trim() === '') return null;

    const lines = raw.split('\n');

      const invalidFormatLines = lines.map((line, i) => ({ line, i })).filter(item=> {
        if (!item.line.includes(':')) return true;
        const [token, val] = item.line.split(':');
        if (!token.trim() || !val.trim()) return true;
        return false;
      });

      const invalidLines = invalidFormatLines.map(item=>item.i + 1).join(',');

      if (invalidLines.length === 0) return null;


      return {
        errors: [{
          code: 'INVALID_FOOTER_FORMAT',
          message: 'each line must match "token: value"',
          category: ERROR_CATEGORY.FORMAT,
          fixable: false,
          lines:invalidLines,
          path
        }]
      };


    return errors.length ? { errors } : null;
  };
}

module.exports ={
  createFooterFormatStep
}
