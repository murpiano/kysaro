const Ajv                                    = require("ajv");
const ajv = new Ajv({allErrors: true});

const generateValidator = (key, schema) => {

  if (!schema) {
    return {
      ok: false,
      data: null,
      info: [],
      warnings: [],
      errors: [{
        message: `Internal error: schema "${key}" is corrupted or missing`,
        recommendation: "Ensure syntax errors in schema or reinstall the package: npm install bvtrots-dx@latest",
        meta: {isCritical: true, type: 'internal'}
      }],
    };
  }

  try {
    return {
      ok: true,
      data: ajv.compile(schema),
      info: [],
      warnings: [],
      errors: []
    };
  } catch (err) {
    return {
      ok: false,
      data: null,
      info: [],
      warnings: [],
      errors: [{
        message: `Internal error: invalid schema "${key}"`,
        details: err.message,
        recommendation: "Restore the original state of the schema or, if you haven't edited it, reinstall the package: npm install bvtrots-dx@latest",
        meta: {isCritical: true, type: 'internal'}
      }]
    };
  }
};

module.exports = {
  generateValidator
}
