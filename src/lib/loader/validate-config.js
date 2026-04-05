/**
 * @file Configuration validation module.
 *
 * @description
 * Provides core validation logic:
 * - compiles JSON schemas into AJV validators
 * - validates configuration objects against validators
 * - formats validation errors for user-friendly output
 *
 * Designed as a pure, stateless module:
 * - does not depend on global configuration
 * - operates only on provided arguments
 *
 * Separates:
 * - internal errors (schema/validator issues)
 * - user errors (invalid configuration data)
 *
 * @dependencies
 * Uses AJV for JSON schema validation.
 *
 * @note
 * All functions are side-effect free and safe for unit testing.
 */

const Ajv                                    = require("ajv");
const ajv = new Ajv({allErrors: true});


/**
 * Compiles AJV validator from provided schema.
 *
 * @param {string} key - Configuration key (used for error context)
 * @param {Object|null} schema - JSON schema object
 *
 * @returns {{
 *   ok: boolean,
 *   data: Function|null|unknown,
 *   info: Array<string>,
 *   warnings: Array<Object>,
 *   errors: Array<Object>
 * }}
 *
 * @description
 * - Compiles schema into AJV validation function
 * - Handles:
 *   - missing schema
 *   - invalid schema (AJV compilation error)
 *
 * @behavior
 * - Returns ok:false if schema is missing or invalid
 * - Returns compiled validator in `data` if successful
 *
 * @errorTypes
 * - internal errors only (schema-related issues)
 *
 * @pure
 * Does not mutate input arguments or external state.
 */
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


/**
 * Converts AJV error object into human-readable message.
 *
 * @param {Object} err - AJV validation error object
 * @returns {string} Formatted error message
 *
 * @description
 * Maps AJV error keywords into simplified user-facing messages:
 * - required → missing property
 * - additionalProperties → unknown property
 * - type → expected type
 * - enum → allowed values
 *
 * Falls back to original AJV message if keyword is not handled.
 *
 * @pure
 * Stateless function.
 */
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


/**
 * Validates configuration object using compiled AJV validator.
 *
 * @param {string} key - Configuration key (used for error context)
 * @param {Function|null} validator - Compiled AJV validator function
 * @param {Object|null} currentConfig - Configuration object to validate
 *
 * @returns {{
 *   ok: boolean,
 *   info: Array<string>,
 *   warnings: Array<Object>,
 *   errors: Array<Object>
 * }}
 *
 * @description
 * - Safely clones configuration object
 * - Removes `$schema` field (not part of validation)
 * - Executes validator
 * - Maps AJV errors into user-friendly format
 *
 * @behavior
 * - Returns ok:false if validator is missing
 * - Returns ok:true if config passes validation
 * - Returns ok:false with formatted errors if validation fails
 *
 * @errorTypes
 * - validation errors (user-facing)
 * - internal error if validator is missing
 *
 * @note
 * Does NOT throw. All errors are returned in structured format.
 *
 * @pure
 * Does not mutate input arguments or external state.
 */
const validateConfig = (key, validator, currentConfig) => {
  const config = currentConfig ? {...currentConfig} : {};

  // Remove $schema field before validation (not part of actual config)
  delete config.$schema;

  const result = {ok: false, info: [], warnings: [], errors: []};

  // Validator is missing → internal failure
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

  // Map AJV errors to user-friendly format
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
