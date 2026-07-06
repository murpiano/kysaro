const path = require("path");
const {_REPORT_KEY, _FILE_KEY_NAME, _DISPLAY_MODE} = require("../../const");
const createFileValidationModule = require("./file-validation");
const createJsonFileLoadModule = require("./json-file-load");
const createValidatorCreationModule = require("./validator-creation");


/**
 * Returns files from the specified group.
 *
 * @param {Array<Object>} files
 * @param {string} groupName
 * @returns {Array<Object>}
 */
function _normalizeGroupFiles(files, groupName) {
  return files.filter(file => file.group === groupName);
}


/**
 * Returns the state of an entity within a group.
 *
 * @param {Object} state
 * @param {string} groupName
 * @param {string} entity
 * @returns {Object}
 */
function _normalizeEntityState(state, groupName, entity) {
  return (state?.groups?.[groupName]?.[entity] || {});
}


/**
 * Generates markdown reports for all groups.
 *
 * @param {Object} state
 * @param {Array<Object>} files
 * @param {Object} normalizedOptions
 * @returns {void}
 */
function _createMdReport(state, files, normalizedOptions) {
  const {report} = normalizedOptions.result;

  if (!report?.enabled) {
    return;
  }

  const reportDir = report.dir;
  const groups = Object.keys(state.groups || {});

  groups.forEach(groupName => {
    const groupFiles = _normalizeGroupFiles(files, groupName);

    if (!groupFiles.length) {
      return;
    }

    const settings = _normalizeEntityState(state, groupName, _REPORT_KEY.SETTINGS);
    const schemas = _normalizeEntityState(state, groupName, _REPORT_KEY.SCHEMAS);
    const validators = _normalizeEntityState(state, groupName, _REPORT_KEY.VALIDATORS);
    const validations = _normalizeEntityState(state, groupName, _REPORT_KEY.VALIDATIONS);

    const reportPath = path.join(reportDir, `${groupName}.md`);
    const reportTitle = groupName;

    /*
    |----------------------------------------------------------------------
    | SETTINGS
    |----------------------------------------------------------------------
    */
    createJsonFileLoadModule._createJsonFileLoadSection({
      allSettings: settings,
      files: groupFiles,
      targetType: _FILE_KEY_NAME.FILE,
      reportPath,
      section: _REPORT_KEY.SETTINGS,
      displayMode: _DISPLAY_MODE.ALWAYS,
      reportTitle
    });

    /*
    |----------------------------------------------------------------------
    | SCHEMAS
    |----------------------------------------------------------------------
    */
    createJsonFileLoadModule._createJsonFileLoadSection({
      allSettings: schemas,
      files: groupFiles,
      targetType: _FILE_KEY_NAME.SCHEMA,
      reportPath,
      section: _REPORT_KEY.SCHEMAS,
      displayMode: _DISPLAY_MODE.ALWAYS,
      reportTitle
    });

    /*
    |----------------------------------------------------------------------
    | VALIDATORS
    |----------------------------------------------------------------------
    */
    createValidatorCreationModule._createValidatorCreationSection({
      validators,
      files: groupFiles,
      reportPath,
      section: _REPORT_KEY.VALIDATORS,
      displayMode: _DISPLAY_MODE.ALWAYS,
      reportTitle
    });

    /*
    |----------------------------------------------------------------------
    | VALIDATIONS
    |----------------------------------------------------------------------
    */
    createFileValidationModule._createFileValidationSection({
      validations,
      allSettings: settings,
      files: groupFiles,
      reportPath,
      section: _REPORT_KEY.VALIDATIONS,
      displayMode: _DISPLAY_MODE.ALWAYS,
      reportTitle
    });

  });

}


module.exports = {
  _createMdReport
};
