const {_createLoaderIssue} = require("./create-loader-issue");
const {LOADER_SCHEMA_VALIDATION_ERROR_KEYWORD, LOADER_ISSUE_CODE, LOADER_ENTITY} = require("../../../all/const/loader");
const {ISSUE_SEVERITY} = require("../../../all/const/issue");
const {normalizeInstancePath} = require("../../../all/helpers/path");
const {toSentenceCase} = require("../../../all/helpers/text");

function _createLoaderValidationIssue({name, error}) {
  switch (error.keyword) {

    case LOADER_SCHEMA_VALIDATION_ERROR_KEYWORD.REQUIRED:
      return _createLoaderIssue({
        code: LOADER_ISSUE_CODE.SETTINGS_REQUIRED_PROPERTY, severity: ISSUE_SEVERITY.ERROR, meta: {
          name,
          entity: LOADER_ENTITY.VALIDATION,
          info: toSentenceCase(error.message),
          // args: [error.params.type],       // already contained in the info
          internalPath: normalizeInstancePath(error.instancePath, error.params.missingProperty),
        }
      });

    case LOADER_SCHEMA_VALIDATION_ERROR_KEYWORD.ADDITIONAL_PROPERTIES:
      return _createLoaderIssue({
        code: LOADER_ISSUE_CODE.SETTINGS_UNKNOWN_PROPERTY, severity: ISSUE_SEVERITY.ERROR, meta: {
          name,
          entity: LOADER_ENTITY.VALIDATION,
          info: toSentenceCase(error.message),
          args: [error.params.additionalProperty],
          internalPath: normalizeInstancePath(error.instancePath, error.params.additionalProperty),
        }
      });

    case LOADER_SCHEMA_VALIDATION_ERROR_KEYWORD.TYPE:
      return _createLoaderIssue({
        code: LOADER_ISSUE_CODE.SETTINGS_UNALLOWED_TYPE, severity: ISSUE_SEVERITY.ERROR, meta: {
          name,
          entity: LOADER_ENTITY.VALIDATION,
          info: toSentenceCase(error.message),
          // args: [error.params.type],       // already contained in the info
          internalPath: normalizeInstancePath(error.instancePath),
        }
      });

    case LOADER_SCHEMA_VALIDATION_ERROR_KEYWORD.ENUM:
      return _createLoaderIssue({
        code: LOADER_ISSUE_CODE.SETTINGS_UNALLOWED_VALUES,
        severity: ISSUE_SEVERITY.ERROR,
        meta: {
          name,
          entity: LOADER_ENTITY.VALIDATION,
          info: toSentenceCase(error.message),
          args: error.params.allowedValues.map(value => `'${value}'`),
          internalPath: normalizeInstancePath(error.instancePath),
        }
      });

    default:
      return _createLoaderIssue({
        code: LOADER_ISSUE_CODE.SETTINGS_VALIDATION_ERROR,
        severity: ISSUE_SEVERITY.ERROR,
        meta: {
          name,
          entity: LOADER_ENTITY.VALIDATION,
          info: error.message,
          internalPath: normalizeInstancePath(error.instancePath)
        }
      });
  }
}


module.exports = {
  _createLoaderValidationIssue
};
