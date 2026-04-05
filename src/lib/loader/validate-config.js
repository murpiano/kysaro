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


const formatValidationError = (err) => {
  switch (err.keyword) {
    case 'required':
      return `Missing property: '${err.params.missingProperty}'`;

    case 'additionalProperties':
      return `Unknown property: '${err.params.additionalProperty}'`;

    case 'type':
      return `Expected type: '${err.params.type}'`;

    case 'enum':
      return `Allowed values: [${err.params.allowedValues.map(v => `'${v}'`).join(', ')}]`;

    default:
      return err.message || 'Validation error';
  }
};


const validateConfig = (key, validator, currentConfig) => {
  const config = currentConfig ? {...currentConfig} : {};
  delete config.$schema;

  const result = {ok: false, info: [], warnings: [], errors: []};

  if (!validator) {
    result.ok = false;
    result.errors.push({
       message: `Internal error: validator is not available.`,
       recommendation: `Check the "${key}" validator status in the validators block in the report or reinstall the package: npm install bvtrots-dx@latest`,
       meta: {isCritical: true}
      });
    return result;
  }

  const isValid = validator(config);
  result.ok     = isValid;

  if (!isValid) {
    const errors = validator.errors || [];
    result.errors = errors.map(err => ({
      message: formatValidationError(err),
      recommendation: `Ensure syntax errors in file or reinstall the package: npm install bvtrots-dx@latest`,
      path: err.instancePath || 'root',
      meta: {isCritical: true, type: 'validation'}
    })) || [];
  }

  return result;
};

module.exports = {
  generateValidator,
  formatValidationError,
  validateConfig
}
