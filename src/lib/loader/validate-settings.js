const issueModule = require('../issue');
const {ISSUE_SEVERITY} = require('../../all/const/issue');
const {
  LOADER_ENTITY,
  LOADER_ISSUE_CODE,
  LOADER_INFO_MESSAGE,
  LOADER_RECOMMENDATION_MESSAGE
} = require('../../all/const/loader');

const Ajv2020 = require('ajv/dist/2020');
const ajv = new Ajv2020({allErrors: true});


/**
 * Creates AJV validator from schema.
 *
 * @param {string} name Settings name.
 * @param {Object|null} schema JSON schema.
 * @returns {{
 *   ok:boolean,
 *   data:Function|null,
 *   issues:Array,
 *   meta:Object
 * }}
 */
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
    result.issues.push(
      issueModule.createLoaderIssue({
        code: LOADER_ISSUE_CODE.SCHEMA_CORRUPTED,
        severity: ISSUE_SEVERITY.ERROR,
        meta: {
          name,
          entity: LOADER_ENTITY.SCHEMA,
          target: schema,
          info: LOADER_INFO_MESSAGE.CHECK_SCHEMA_STATUS,
          recommendation:
          LOADER_RECOMMENDATION_MESSAGE.ENSURE_SYNTAX
        }
      })
    );

    return result;
  }

  try {

    return {
      ...result,
      ok: true,
      data: ajv.compile(schema)
    };

  } catch (error) {

    result.issues.push(
      issueModule.createLoaderIssue({
        code: LOADER_ISSUE_CODE.SCHEMA_INVALID,
        severity: ISSUE_SEVERITY.ERROR,
        meta: {
          name,
          entity: LOADER_ENTITY.SCHEMA,
          target: schema,
          error,
          recommendation:
          LOADER_RECOMMENDATION_MESSAGE.RESTORE_SCHEMA
        }
      })
    );

    return result;
  }
}


/**
 * Validates settings against compiled validator.
 *
 * @param {string} name Settings name.
 * @param {Function|null} validator Compiled AJV validator.
 * @param {Object|null} currentSettings Settings object.
 * @returns {{
 *   ok:boolean,
 *   issues:Array
 * }}
 */
function _validateSettings(
  name,
  validator,
  currentSettings
) {

  const result = {
    ok: false,
    issues: []
  };

  if (!currentSettings) {

    result.issues.push(
      issueModule.createLoaderIssue({
        code: LOADER_ISSUE_CODE.SETTINGS_NOT_AVAILABLE,
        severity: ISSUE_SEVERITY.ERROR,
        meta: {
          name,
          entity: LOADER_ENTITY.SETTINGS,
          target: currentSettings,
          info: LOADER_INFO_MESSAGE.CHECK_SETTINGS_STATUS,
          recommendation:
          LOADER_RECOMMENDATION_MESSAGE.ENSURE_ERRORS
        }
      })
    );

    return result;
  }

  if (!validator) {

    result.issues.push(
      issueModule.createLoaderIssue({
        code: LOADER_ISSUE_CODE.VALIDATOR_NOT_AVAILABLE,
        severity: ISSUE_SEVERITY.ERROR,
        meta: {
          name,
          entity: LOADER_ENTITY.VALIDATOR,
          target: validator,
          info: LOADER_INFO_MESSAGE.CHECK_VALIDATOR_STATUS,
          recommendation:
          LOADER_RECOMMENDATION_MESSAGE.ENSURE_ERRORS
        }
      })
    );

    return result;
  }

  const settings = {...currentSettings};
  const isValid = validator(settings);
  result.ok = isValid;

  if (!isValid) {

    (validator.errors || []).forEach(error => {

      result.issues.push(
        issueModule.createLoaderValidationIssue({
          name,
          error
        })
      );

    });
  }

  return result;
}


module.exports = {
  _generateValidator,
  _validateSettings
};
