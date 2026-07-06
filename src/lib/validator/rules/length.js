const { ERROR_CATEGORY } = require('../errors-const');
const {FIX_TYPES} = require('../../../all/const/issue');

function createLengthStep({ value, target }, path) {
  return (input) => {

    const { max, min } = value;

    const errors = [];

    if (typeof input !== 'string') return null;

    // -----------------------
    // MAX
    // -----------------------
    if (max && input.length > max) {
      errors.push({
                    code: 'TOO_LONG',
                    message: `must be <= ${max} chars`,
                    category: ERROR_CATEGORY.LENGTH,
                    fixable: true,
                    fix: {
                      type: FIX_TYPES.SLICE,
                      target,
                      payload: max
                    },
                    path
                  });
    }

    if (min && input.length < min) {
      errors.push({
                    code: 'TOO_SHORT',
                    message: `must be >= ${min} chars`,
                    category: ERROR_CATEGORY.LENGTH,
                    fixable: false,
                    path
                  });
    }

    if (errors.length === 0) return null;

    return { errors };
  };
}

module.exports = { createLengthStep };
