const Ajv2020 = require('ajv/dist/2020');
const {ISSUE_SEVERITY} = require('../../all/const/issue');
const {
  LOADER_ENTITY,
  LOADER_ISSUE_CODE,
  LOADER_INFO_MESSAGE,
  LOADER_RECOMMENDATION_MESSAGE
} = require('../../all/const/loader');
const {createLoaderIssue, createLoaderValidationIssue} = require("../issue");

const ajv = new Ajv2020({
  allErrors: true
});


function _generateValidator(name, schema) {
  const result = {
    ok: false,
    data: null,
    issues: [],
    meta: {
      requestedPath: null,
      resolvedPath: null,
      source: null
    }
  };

  if (!schema) {
    result.issues.push(createLoaderIssue({
      code: LOADER_ISSUE_CODE.SCHEMA_CORRUPTED, severity: ISSUE_SEVERITY.ERROR, meta: {
        name,
        entity: LOADER_ENTITY.SCHEMA,
        target: schema,
        info: LOADER_INFO_MESSAGE.CHECK_SCHEMA_STATUS,
        recommendation: LOADER_RECOMMENDATION_MESSAGE.ENSURE_SYNTAX
      }
    }));

    return result;
  }

  try {
    return {
      ...result, ok: true, data: ajv.compile(schema)
    };

  } catch (error) {
    result.issues.push(createLoaderIssue({
      code: LOADER_ISSUE_CODE.SCHEMA_INVALID, severity: ISSUE_SEVERITY.ERROR, meta: {
        name,
        entity: LOADER_ENTITY.SCHEMA,
        target: schema,
        error,
        recommendation: LOADER_RECOMMENDATION_MESSAGE.RESTORE_SCHEMA
      }
    }));

    return result;
  }
}


function _validateSettings(name, validator, currentSettings) {
  const settings = currentSettings ? {...currentSettings} : {};
  const result = {
    ok: false,
    issues: []
  };

  if (!validator) {
    result.issues.push(createLoaderIssue({
      code: LOADER_ISSUE_CODE.VALIDATOR_NOT_AVAILABLE,
      severity: ISSUE_SEVERITY.ERROR,
      meta: {
        name,
        entity: LOADER_ENTITY.VALIDATOR,
        target: validator,
        info: LOADER_INFO_MESSAGE.CHECK_VALIDATOR_STATUS,
        recommendation: LOADER_RECOMMENDATION_MESSAGE.ENSURE_ERRORS
      }
    }));

    return result;
  }

  const isValid = validator(settings);
  result.ok = isValid;

  if (!isValid) {
    const errors = validator.errors || [];
    errors.forEach(error => {
      result.issues.push(createLoaderValidationIssue({
        name, error
      }));
    });
  }

  return result;
}


module.exports = {
  _generateValidator, _validateSettings
};
