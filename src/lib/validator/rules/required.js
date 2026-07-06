const {ERROR_CATEGORY} = require('../errors-const');

function createRequiredStep({ value }, path) {
  return (input) => {
    if (!value) return null;
    const {raw} = input;

    if (!raw || raw.trim() === '') {
      return {
        errors: [{
          code: 'REQUIRED',
          message: `${path} is required`,
          category: ERROR_CATEGORY.STRUCTURE,
          fixable: false,
          path
        }],
        stop: true
      };
    }

    return null;
  };
}

module.exports={createRequiredStep}
